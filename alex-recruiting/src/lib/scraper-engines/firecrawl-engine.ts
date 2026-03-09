/**
 * Firecrawl Scraping Engine
 *
 * Unified Firecrawl SDK wrapper for scraping URLs, coaching staff pages,
 * roster pages, and articles. Part of the scraper CLI engine suite.
 *
 * All public functions return null on failure (never throw).
 */

import { FirecrawlClient } from "@mendable/firecrawl-js";

// ─── Exported Types ──────────────────────────────────────────────────────────

export interface ScrapeResult {
  url: string;
  markdown: string;
  title: string;
  wordCount: number;
  source: "firecrawl";
  scrapedAt: string;
}

export interface ParsedCoach {
  name: string;
  title: string;
  email: string | null;
  xHandle: string | null;
}

export interface ParsedRosterPlayer {
  name: string;
  position: string;
  classYear: string;
  height: string;
  weight: string;
}

// ─── Lazy Singleton Client ───────────────────────────────────────────────────

let _client: FirecrawlClient | null = null;

function getClient(): FirecrawlClient {
  if (!_client) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error(
        "FIRECRAWL_API_KEY is not set. Please set the environment variable."
      );
    }
    _client = new FirecrawlClient({ apiKey });
  }
  return _client;
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const X_HANDLE_PATTERN = /@[A-Za-z0-9_]{1,15}/;

const COACH_TITLE_PATTERNS = [
  /offensive\s+line\b/i,
  /\bol\b\s+coach/i,
  /o[\s-]?line/i,
  /recruiting\s+coordinator/i,
  /head\s+coach/i,
  /offensive\s+coordinator/i,
  /run\s+game\s+coordinator/i,
  /assistant\s+head\s+coach/i,
  /associate\s+head\s+coach/i,
];

function isPriorityTitle(value: string): boolean {
  return COACH_TITLE_PATTERNS.some((p) => p.test(value));
}

function cleanText(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // strip markdown links
    .replace(/[*_`>#]/g, "")                  // strip markdown formatting
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeCoachName(value: string): boolean {
  const cleaned = cleanText(value);
  if (!cleaned || cleaned.length < 5) return false;
  // Exclude class-year labels and generic column headers
  if (
    /\b(freshman|sophomore|junior|senior|redshirt|graduate|returning)\b/i.test(
      cleaned
    )
  ) {
    return false;
  }
  if (isPriorityTitle(cleaned)) return false;
  if (
    /^(name|title|staff|coaching staff|image|phone|instagram|twitter|email|extension)$/i.test(
      cleaned
    )
  ) {
    return false;
  }
  return /^[A-Z][A-Za-z.''-]+(?:\s+[A-Z][A-Za-z.''-]+){1,3}$/.test(cleaned);
}

function looksLikeCoachTitle(value: string): boolean {
  const cleaned = cleanText(value);
  if (!cleaned) return false;
  if (!isPriorityTitle(cleaned)) return false;
  // "offensive lineman" is a player, not a coach
  if (/\boffensive\s+lineman\b/i.test(cleaned)) return false;
  return true;
}

/**
 * Parse coaches from pipe-separated table rows (markdown tables).
 */
function parseCoachesFromTable(lines: string[]): ParsedCoach[] {
  const coaches: ParsedCoach[] = [];
  const seen = new Set<string>();

  const tableLines = lines.filter(
    (line) => line.startsWith("|") && line.split("|").length >= 4
  );

  for (const line of tableLines) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map(cleanText)
      .filter(Boolean);

    // Skip separator rows (e.g., |---|---|)
    if (cells.every((cell) => /^:?-{2,}:?$/.test(cell))) continue;
    // Skip header rows
    if (
      /^name$/i.test(cells[0]) &&
      cells.some((cell) => /^title$/i.test(cell))
    ) {
      continue;
    }

    const titleIdx = cells.findIndex(looksLikeCoachTitle);
    if (titleIdx === -1) continue;

    const nameIdx = cells.findIndex(
      (cell, idx) => idx !== titleIdx && looksLikeCoachName(cell)
    );
    if (nameIdx === -1) continue;

    const name = cells[nameIdx];
    const title = cells[titleIdx];
    const dedupeKey = `${name.toLowerCase()}::${title.toLowerCase()}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const combined = cells.join(" | ");
    const emailMatch = combined.match(EMAIL_PATTERN);
    const handleMatch = combined.match(X_HANDLE_PATTERN);
    // Avoid confusing an email local part with an X handle
    const detectedHandle = handleMatch?.[0] ?? null;
    const safeHandle =
      detectedHandle && emailMatch?.[0]?.includes(detectedHandle)
        ? null
        : detectedHandle;

    coaches.push({
      name,
      title,
      email: emailMatch?.[0] ?? null,
      xHandle: safeHandle,
    });
  }

  return coaches;
}

/**
 * Parse coaches from line-by-line (non-table) format.
 *
 * Looks for title patterns on the current or next line and extracts coach
 * names from adjacent lines.
 */
function parseCoachesFromLines(lines: string[]): ParsedCoach[] {
  const coaches: ParsedCoach[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
    const prevLine = i > 0 ? lines[i - 1] : "";

    // Check if current line or next line contains a priority title
    let matchedTitle: string | null = null;
    for (const pattern of COACH_TITLE_PATTERNS) {
      if (pattern.test(line)) {
        matchedTitle = cleanText(line.replace(/^[#*\s]+/, "").replace(/[*#]+$/, ""));
        break;
      }
      if (pattern.test(nextLine)) {
        matchedTitle = cleanText(
          nextLine.replace(/^[#*\s]+/, "").replace(/[*#]+$/, "")
        );
        break;
      }
    }

    if (!matchedTitle || !looksLikeCoachTitle(matchedTitle)) continue;

    // Try to extract a coach name from the current line, previous line, or
    // the title line itself (e.g., "John Smith - Head Coach")
    let coachName: string | null = null;

    const namePattern =
      /^[#*\s]*([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;

    // Name on the same line separated by dash/pipe
    const dashSplit = line.split(/\s*[-–—|]\s*/);
    if (dashSplit.length >= 2) {
      const nameCandidate = dashSplit[0].replace(/^[#*\s]+/, "").trim();
      const nameMatch = nameCandidate.match(namePattern);
      if (nameMatch) {
        coachName = cleanText(nameMatch[1]);
      }
    }

    // Name on the previous line
    if (!coachName && prevLine) {
      const prevMatch = prevLine.match(namePattern);
      if (prevMatch) {
        coachName = cleanText(prevMatch[1]);
      }
    }

    // Name on the current line (the line IS the name)
    if (!coachName) {
      const currentMatch = line.match(namePattern);
      if (
        currentMatch &&
        !COACH_TITLE_PATTERNS.some((p) => p.test(currentMatch[1]))
      ) {
        coachName = cleanText(currentMatch[1]);
      }
    }

    if (!coachName) continue;

    const dedupeKey = `${coachName.toLowerCase()}::${matchedTitle.toLowerCase()}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    // Look for email and X handle in surrounding lines (+-3 lines)
    let email: string | null = null;
    let xHandle: string | null = null;
    for (
      let j = Math.max(0, i - 2);
      j < Math.min(lines.length, i + 4);
      j++
    ) {
      const emailMatch = lines[j].match(EMAIL_PATTERN);
      if (emailMatch && !email) {
        email = emailMatch[0];
      }
      const handleMatch = lines[j].match(X_HANDLE_PATTERN);
      if (
        handleMatch &&
        !xHandle &&
        !lines[j].includes("@gmail") &&
        !lines[j].includes("@yahoo")
      ) {
        xHandle = handleMatch[0];
      }
    }

    coaches.push({
      name: coachName,
      title: matchedTitle,
      email,
      xHandle,
    });
  }

  return coaches;
}

/**
 * Parse OL roster players from markdown content.
 *
 * Looks for OL|OT|OG|C position markers in pipe/comma/tab-separated lines.
 */
function parseRosterPlayers(markdown: string): ParsedRosterPlayer[] {
  const players: ParsedRosterPlayer[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    // Match OL position markers as standalone tokens
    if (!/\b(OL|OT|OG|C)\b/.test(line)) continue;

    const parts = line.split(/[|,\t]+/).map((p) => p.trim());
    if (parts.length < 3) continue;

    players.push({
      name: parts[0]?.replace(/^[#*\s]+/, "").trim() || "Unknown",
      position: parts.find((p) => /^(OL|OT|OG|C)$/.test(p)) || "OL",
      classYear: parts.find((p) => /^(Fr|So|Jr|Sr|RS)/.test(p)) || "",
      height: parts.find((p) => /^\d+-\d+$/.test(p)) || "",
      weight: parts.find((p) => /^\d{3}$/.test(p)) || "",
    });
  }

  return players;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Scrape any URL and return markdown content via Firecrawl SDK.
 * Returns null on failure.
 */
export async function scrapeUrl(url: string): Promise<ScrapeResult | null> {
  try {
    const client = getClient();
    const result = await client.scrape(url, { formats: ["markdown"] });

    const markdown = result.markdown || "";
    const title = result.metadata?.title || result.metadata?.ogTitle || "";
    const wordCount = markdown
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

    return {
      url,
      markdown,
      title,
      wordCount,
      source: "firecrawl",
      scrapedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Scrape a coaching staff page and extract coach data.
 * Returns null on failure.
 */
export async function scrapeCoachingStaffPage(
  staffUrl: string
): Promise<{ scrape: ScrapeResult; coaches: ParsedCoach[] } | null> {
  try {
    const scrape = await scrapeUrl(staffUrl);
    if (!scrape) return null;

    const lines = scrape.markdown
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // Parse from both table and line-by-line formats, then deduplicate
    const tableCoaches = parseCoachesFromTable(lines);
    const lineCoaches = parseCoachesFromLines(lines);

    const merged: ParsedCoach[] = [...tableCoaches];
    const seen = new Set(
      tableCoaches.map(
        (c) => `${c.name.toLowerCase()}::${c.title.toLowerCase()}`
      )
    );
    for (const coach of lineCoaches) {
      const key = `${coach.name.toLowerCase()}::${coach.title.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(coach);
    }

    return { scrape, coaches: merged };
  } catch {
    return null;
  }
}

/**
 * Scrape a roster page and extract OL players.
 * Returns null on failure.
 */
export async function scrapeRosterPage(
  rosterUrl: string
): Promise<{ scrape: ScrapeResult; players: ParsedRosterPlayer[] } | null> {
  try {
    const scrape = await scrapeUrl(rosterUrl);
    if (!scrape) return null;

    const players = parseRosterPlayers(scrape.markdown);

    return { scrape, players };
  } catch {
    return null;
  }
}

/**
 * Scrape an article URL. Alias for scrapeUrl.
 * Returns null on failure.
 */
export async function scrapeArticle(
  url: string
): Promise<ScrapeResult | null> {
  return scrapeUrl(url);
}
