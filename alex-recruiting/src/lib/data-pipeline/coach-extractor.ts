/**
 * Coach Extractor
 *
 * Takes raw markdown/HTML from a school's staff page and extracts OL and DL
 * coaches with their position titles and X/Twitter handles.
 *
 * Handles various staff page formats:
 *   - Markdown tables (Sidearm/SIDEARM sites)
 *   - Bullet/list layouts
 *   - Card-based layouts (name followed by title on next line)
 *   - Heading + paragraph combos
 *
 * Used by the scrape-coaches API route for the mega-scraper pipeline.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExtractedCoach {
  name: string;
  title: string;
  positionType: "OL" | "DL";
  xHandle: string | null;
  email: string | null;
}

export interface ExtractionResult {
  olCoach: ExtractedCoach | null;
  dlCoach: ExtractedCoach | null;
  allMatches: ExtractedCoach[];
  rawLineCount: number;
}

// ─── Title pattern definitions ────────────────────────────────────────────────

const OL_TITLE_PATTERNS: RegExp[] = [
  /offensive\s+line\b/i,
  /o[\s-]?line\b/i,
  /\bol\s+coach/i,
  /\bol\b.*\bcoach/i,
  /run\s+game\s+coordinator/i,
  /offensive\s+line\s*\/\s*run\s+game/i,
  /assistant.*offensive\s+line/i,
  /co-offensive\s+line/i,
];

const DL_TITLE_PATTERNS: RegExp[] = [
  /defensive\s+line\b/i,
  /d[\s-]?line\b/i,
  /\bdl\s+coach/i,
  /\bdl\b.*\bcoach/i,
  /defensive\s+line\s*\/\s*edge/i,
  /assistant.*defensive\s+line/i,
  /co-defensive\s+line/i,
  /defensive\s+ends/i,
  /defensive\s+tackles/i,
];

// ─── Utility patterns ─────────────────────────────────────────────────────────

const X_HANDLE_INLINE_PATTERN = /@([A-Za-z0-9_]{1,15})\b/g;
const X_URL_PATTERN =
  /(?:twitter\.com|x\.com)\/(?:@)?([A-Za-z0-9_]{1,15})\b/gi;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Common X handles that are NOT coach handles (false positives)
const BLOCKED_HANDLES = new Set([
  "gmail",
  "yahoo",
  "outlook",
  "hotmail",
  "aol",
  "icloud",
  "edu",
  "com",
  "org",
  "net",
  "football",
  "coach",
  "athletics",
  "ncaa",
  "sports",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanText(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // strip markdown links, keep text
    .replace(/[*_`>#]/g, "") // strip markdown formatting
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isOLTitle(text: string): boolean {
  const cleaned = cleanText(text);
  // Exclude false positives like "offensive lineman"
  if (/\boffensive\s+lineman\b/i.test(cleaned)) return false;
  return OL_TITLE_PATTERNS.some((p) => p.test(cleaned));
}

function isDLTitle(text: string): boolean {
  const cleaned = cleanText(text);
  if (/\bdefensive\s+lineman\b/i.test(cleaned)) return false;
  return DL_TITLE_PATTERNS.some((p) => p.test(cleaned));
}

function looksLikeName(text: string): boolean {
  const cleaned = cleanText(text);
  if (!cleaned || cleaned.length < 4 || cleaned.length > 50) return false;

  // Reject common non-name patterns
  if (
    /\b(freshman|sophomore|junior|senior|redshirt|graduate|returning)\b/i.test(
      cleaned
    )
  )
    return false;
  if (
    /^(name|title|staff|coaching staff|image|phone|instagram|twitter|email|extension|bio|biography)$/i.test(
      cleaned
    )
  )
    return false;
  if (isOLTitle(cleaned) || isDLTitle(cleaned)) return false;

  // Must look like a proper name: capitalized words
  return /^[A-Z][A-Za-z.''"-]+(?:\s+[A-Z][A-Za-z.''"-]+){0,4}$/.test(
    cleaned
  );
}

function extractXHandle(text: string): string | null {
  // First try X/Twitter URLs
  const urlMatches = [...text.matchAll(X_URL_PATTERN)];
  for (const m of urlMatches) {
    const handle = m[1];
    if (!BLOCKED_HANDLES.has(handle.toLowerCase())) {
      return `@${handle}`;
    }
  }

  // Then try inline @handles
  const inlineMatches = [...text.matchAll(X_HANDLE_INLINE_PATTERN)];
  for (const m of inlineMatches) {
    const handle = m[1];
    // Filter out email-like false positives
    if (BLOCKED_HANDLES.has(handle.toLowerCase())) continue;
    // Skip if it appears to be part of an email address
    const idx = text.indexOf(m[0]);
    if (idx > 0 && text[idx - 1] !== " " && text[idx - 1] !== "\n") continue;
    return `@${handle}`;
  }

  return null;
}

function extractEmail(text: string): string | null {
  const matches = text.match(EMAIL_PATTERN);
  return matches?.[0] ?? null;
}

// ─── Extraction strategies ────────────────────────────────────────────────────

/**
 * Strategy 1: Markdown table rows
 * Looks for table rows like: | Name | Title | email | @handle |
 */
function extractFromTables(
  lines: string[]
): ExtractedCoach[] {
  const results: ExtractedCoach[] = [];
  const tableRows = lines.filter((l) => l.includes("|") && l.trim().startsWith("|"));

  for (const row of tableRows) {
    const cells = row
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);

    if (cells.length < 2) continue;
    // Skip separator rows
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
    // Skip header rows
    if (
      cells.some((c) => /^name$/i.test(c)) &&
      cells.some((c) => /^title$/i.test(c))
    )
      continue;

    const fullRow = cells.join(" ");
    const olMatch = cells.some((c) => isOLTitle(c)) || isOLTitle(fullRow);
    const dlMatch = cells.some((c) => isDLTitle(c)) || isDLTitle(fullRow);

    if (!olMatch && !dlMatch) continue;

    const nameCell = cells.find((c) => looksLikeName(c));
    const titleCell = cells.find(
      (c) => isOLTitle(c) || isDLTitle(c)
    );

    if (!nameCell || !titleCell) continue;

    results.push({
      name: cleanText(nameCell),
      title: cleanText(titleCell),
      positionType: olMatch ? "OL" : "DL",
      xHandle: extractXHandle(fullRow),
      email: extractEmail(fullRow),
    });
  }

  return results;
}

/**
 * Strategy 2: Adjacent line pairs (card layout)
 * Name on one line, title on the next (or vice versa)
 */
function extractFromAdjacentLines(
  lines: string[]
): ExtractedCoach[] {
  const results: ExtractedCoach[] = [];
  const cleanedLines = lines.map((l) => l.trim()).filter(Boolean);

  for (let i = 0; i < cleanedLines.length; i++) {
    const current = cleanedLines[i];
    const next = cleanedLines[i + 1] || "";
    const prev = i > 0 ? cleanedLines[i - 1] : "";
    // Look 2 lines ahead/behind for context (some pages have blank lines or images between)
    const next2 = cleanedLines[i + 2] || "";
    const prev2 = i > 1 ? cleanedLines[i - 2] : "";

    const currentIsOL = isOLTitle(current);
    const currentIsDL = isDLTitle(current);

    if (currentIsOL || currentIsDL) {
      const posType = currentIsOL ? "OL" : "DL";
      const context = [prev2, prev, current, next, next2].join(" ");

      // Name could be on the previous or next line
      let name: string | null = null;
      if (looksLikeName(prev)) name = cleanText(prev);
      else if (looksLikeName(next)) name = cleanText(next);
      else if (looksLikeName(prev2)) name = cleanText(prev2);
      else if (looksLikeName(next2)) name = cleanText(next2);

      if (name) {
        results.push({
          name,
          title: cleanText(current),
          positionType: posType,
          xHandle: extractXHandle(context),
          email: extractEmail(context),
        });
      }
    }
  }

  return results;
}

/**
 * Strategy 3: Single-line patterns
 * "Coach Name - Offensive Line Coach" or "Name, Defensive Line"
 */
function extractFromSingleLines(
  lines: string[]
): ExtractedCoach[] {
  const results: ExtractedCoach[] = [];

  for (const line of lines) {
    const cleaned = cleanText(line);
    if (!cleaned) continue;

    const olMatch = isOLTitle(cleaned);
    const dlMatch = isDLTitle(cleaned);
    if (!olMatch && !dlMatch) continue;

    // Try splitting by common separators: " - ", " | ", " , ", " : "
    const separators = [/\s*[-|]\s*/, /\s*,\s*/, /\s*:\s*/];

    for (const sep of separators) {
      const parts = cleaned.split(sep).filter(Boolean);
      if (parts.length < 2) continue;

      const namePart = parts.find((p) => looksLikeName(p));
      const titlePart = parts.find(
        (p) => isOLTitle(p) || isDLTitle(p)
      );

      if (namePart && titlePart) {
        results.push({
          name: cleanText(namePart),
          title: cleanText(titlePart),
          positionType: olMatch ? "OL" : "DL",
          xHandle: extractXHandle(line),
          email: extractEmail(line),
        });
        break; // Only match once per line
      }
    }
  }

  return results;
}

/**
 * Strategy 4: Heading-based extraction
 * ### Coach Name
 * Offensive Line Coach
 */
function extractFromHeadings(
  lines: string[]
): ExtractedCoach[] {
  const results: ExtractedCoach[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
    if (!headingMatch) continue;

    const headingText = headingMatch[1];
    // Check the next few lines for a title
    const contextLines = lines.slice(i + 1, i + 5);
    const titleLine = contextLines.find(
      (l) => isOLTitle(l) || isDLTitle(l)
    );

    if (!titleLine) continue;

    const olMatch = isOLTitle(titleLine);
    const dlMatch = isDLTitle(titleLine);
    if (!olMatch && !dlMatch) continue;

    const name = cleanText(headingText);
    if (!looksLikeName(name)) continue;

    const contextBlock = [line, ...contextLines].join(" ");

    results.push({
      name,
      title: cleanText(titleLine),
      positionType: olMatch ? "OL" : "DL",
      xHandle: extractXHandle(contextBlock),
      email: extractEmail(contextBlock),
    });
  }

  return results;
}

// ─── Main extraction function ─────────────────────────────────────────────────

/**
 * Extract OL and DL coaches from raw markdown/HTML content of a staff page.
 *
 * Runs multiple extraction strategies in order and deduplicates results.
 * Returns the best OL and DL coach found, plus all matches.
 */
export function extractCoaches(rawContent: string): ExtractionResult {
  const lines = rawContent.split("\n");

  // Run all strategies
  const fromTables = extractFromTables(lines);
  const fromAdjacent = extractFromAdjacentLines(lines);
  const fromSingle = extractFromSingleLines(lines);
  const fromHeadings = extractFromHeadings(lines);

  // Combine and deduplicate (prefer earlier strategies as more reliable)
  const seen = new Set<string>();
  const allMatches: ExtractedCoach[] = [];

  for (const coach of [
    ...fromTables,
    ...fromHeadings,
    ...fromAdjacent,
    ...fromSingle,
  ]) {
    const key = `${coach.name.toLowerCase()}::${coach.positionType}`;
    if (seen.has(key)) continue;
    seen.add(key);
    allMatches.push(coach);
  }

  // Pick the best OL and DL coach (first match from prioritized strategies)
  const olCoach = allMatches.find((c) => c.positionType === "OL") ?? null;
  const dlCoach = allMatches.find((c) => c.positionType === "DL") ?? null;

  return {
    olCoach,
    dlCoach,
    allMatches,
    rawLineCount: lines.length,
  };
}

/**
 * Attempt to find X/Twitter handles by searching the full page content
 * for patterns near a coach's name. Useful as a second pass when the
 * initial extraction did not find a handle.
 */
export function findHandleNearName(
  rawContent: string,
  coachName: string
): string | null {
  if (!coachName) return null;

  const nameParts = coachName.toLowerCase().split(/\s+/);
  const lastName = nameParts[nameParts.length - 1];
  const lines = rawContent.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (!line.includes(lastName)) continue;

    // Check a window of lines around the name mention
    const windowStart = Math.max(0, i - 3);
    const windowEnd = Math.min(lines.length, i + 4);
    const window = lines.slice(windowStart, windowEnd).join(" ");

    const handle = extractXHandle(window);
    if (handle) return handle;
  }

  return null;
}
