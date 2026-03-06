// Hudl Profile Scraper
// Uses Jina AI (r.jina.ai) for URL-to-markdown conversion of public Hudl profiles.
// Falls back to Firecrawl for JS-heavy pages that Jina can't handle.

import type { HudlProfile, HudlHighlight, ScrapeJob } from "../types/recruiting-intelligence";

const JINA_READER_BASE = "https://r.jina.ai";

interface JinaOptions {
  apiKey?: string;
  timeout?: number;
}

// Scrape a Hudl profile page and extract structured athlete data
export async function scrapeHudlProfile(
  profileUrl: string,
  options: JinaOptions = {}
): Promise<HudlProfile> {
  const markdown = await fetchHudlMarkdown(profileUrl, options);
  return parseHudlMarkdown(markdown, profileUrl);
}

// Fetch Hudl page as markdown via Jina Reader
async function fetchHudlMarkdown(
  profileUrl: string,
  options: JinaOptions = {}
): Promise<string> {
  const url = `${JINA_READER_BASE}/${profileUrl}`;
  const headers: Record<string, string> = {
    Accept: "text/markdown",
  };

  if (options.apiKey) {
    headers["Authorization"] = `Bearer ${options.apiKey}`;
  }

  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(options.timeout || 30000),
  });

  if (!response.ok) {
    throw new Error(`Jina Reader failed for ${profileUrl}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

// Parse Hudl profile markdown into structured data
export function parseHudlMarkdown(markdown: string, profileUrl: string): HudlProfile {
  const profileIdMatch = profileUrl.match(/\/profile\/(\d+)/);
  const profileId = profileIdMatch?.[1] || "";

  return {
    profileId,
    profileUrl,
    athleteName: extractField(markdown, "name") || extractNameFromUrl(profileUrl),
    position: extractPosition(markdown),
    positionDetails: extractPositionDetails(markdown),
    height: extractField(markdown, "height") || extractMeasurable(markdown, "height"),
    weight: extractField(markdown, "weight") || extractMeasurable(markdown, "weight"),
    gradYear: extractGradYear(markdown),
    highSchool: extractField(markdown, "school") || extractField(markdown, "high school") || "",
    city: extractField(markdown, "city") || "",
    state: extractField(markdown, "state") || "",
    jerseyNumber: extractJerseyNumber(markdown),

    gpa: extractField(markdown, "gpa"),
    satScore: extractNumericField(markdown, "sat"),
    actScore: extractNumericField(markdown, "act"),

    highlightReels: extractHighlights(markdown),
    gameFilmCount: countGameFilm(markdown),
    totalPlaysTagged: extractNumericField(markdown, "plays") || 0,

    recruitingOptIn: markdown.toLowerCase().includes("recruiting") || markdown.toLowerCase().includes("contact"),
    contactEmail: extractEmail(markdown),
    contactPhone: extractPhone(markdown),
    bio: extractBio(markdown),

    profileViews: extractNumericField(markdown, "views"),

    scrapedAt: Date.now(),
    scrapeSource: "jina",
    rawMarkdown: markdown,
  };
}

// ============ EXTRACTION HELPERS ============

function extractNameFromUrl(url: string): string {
  const slugMatch = url.match(/\/profile\/\d+\/(.+)/);
  if (!slugMatch) return "";
  return slugMatch[1]
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function extractField(markdown: string, field: string): string | null {
  // Look for patterns like "Height: 6'4"" or "**Height** 6'4""
  const patterns = [
    new RegExp(`${field}[:\\s]*[|]*\\s*([^\\n|]+)`, "i"),
    new RegExp(`\\*\\*${field}\\*\\*[:\\s]*([^\\n]+)`, "i"),
    new RegExp(`#+ ${field}[:\\s]*([^\\n]+)`, "i"),
  ];

  for (const pattern of patterns) {
    const match = markdown.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function extractPosition(markdown: string): string {
  const posPatterns = [
    /position[:\s]*[|]*\s*(OL|OT|OG|C|QB|RB|WR|TE|DE|DT|LB|CB|S|K|P|ATH)[^a-z]/i,
    /\b(Offensive Line(?:man)?|Offensive Tackle|Offensive Guard|Center|Quarterback|Running Back|Wide Receiver|Tight End|Defensive End|Defensive Tackle|Linebacker|Cornerback|Safety)\b/i,
  ];

  for (const pattern of posPatterns) {
    const match = markdown.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

function extractPositionDetails(markdown: string): string[] {
  const positions: string[] = [];
  const posAbbrevs = ["OT", "OG", "C", "OL", "DT", "DE", "LB", "CB", "S", "WR", "RB", "QB", "TE", "K", "P", "ATH"];

  for (const pos of posAbbrevs) {
    const regex = new RegExp(`\\b${pos}\\b`, "g");
    if (regex.test(markdown)) {
      positions.push(pos);
    }
  }
  return [...new Set(positions)];
}

function extractMeasurable(markdown: string, type: "height" | "weight"): string {
  if (type === "height") {
    const match = markdown.match(/\b(\d['′]\s*\d{1,2}["″]?)\b/) || markdown.match(/\b(\d-\d{1,2})\b/);
    return match?.[1] || "";
  }
  if (type === "weight") {
    const match = markdown.match(/\b(\d{2,3})\s*(lbs?|pounds)\b/i) || markdown.match(/weight[:\s]*(\d{2,3})/i);
    return match ? `${match[1]} lbs` : "";
  }
  return "";
}

function extractGradYear(markdown: string): number {
  // Look for class year patterns
  const patterns = [
    /class\s*(?:of)?\s*['']?(\d{4})/i,
    /grad(?:uation)?\s*(?:year)?[:\s]*(\d{4})/i,
    /[''](\d{2})\b/,
    /\b(20\d{2})\b/,
  ];

  for (const pattern of patterns) {
    const match = markdown.match(pattern);
    if (match?.[1]) {
      const year = match[1].length === 2 ? 2000 + parseInt(match[1]) : parseInt(match[1]);
      if (year >= 2024 && year <= 2032) return year;
    }
  }
  return 0;
}

function extractJerseyNumber(markdown: string): string | null {
  const match = markdown.match(/(?:jersey|number|#)\s*(\d{1,2})\b/i);
  return match?.[1] || null;
}

function extractNumericField(markdown: string, field: string): number | null {
  const match = markdown.match(new RegExp(`${field}[:\\s]*[|]*\\s*(\\d+\\.?\\d*)`, "i"));
  return match ? parseFloat(match[1]) : null;
}

function extractHighlights(markdown: string): HudlHighlight[] {
  const highlights: HudlHighlight[] = [];

  // Look for video/highlight links
  const linkPattern = /\[([^\]]*(?:highlight|reel|film)[^\]]*)\]\(([^)]+)\)/gi;
  let match;
  while ((match = linkPattern.exec(markdown)) !== null) {
    highlights.push({
      title: match[1],
      url: match[2],
      duration: null,
      viewCount: null,
      createdAt: null,
    });
  }

  // Also look for bare Hudl video URLs
  const videoUrlPattern = /https?:\/\/www\.hudl\.com\/video\/\S+/g;
  while ((match = videoUrlPattern.exec(markdown)) !== null) {
    if (!highlights.some((h) => h.url === match[0])) {
      highlights.push({
        title: "Highlight Reel",
        url: match[0],
        duration: null,
        viewCount: null,
        createdAt: null,
      });
    }
  }

  return highlights;
}

function countGameFilm(markdown: string): number {
  const filmMentions = markdown.match(/\b(?:game\s*film|full\s*game|game\s*\d+)\b/gi);
  return filmMentions?.length || 0;
}

function extractEmail(markdown: string): string | null {
  const match = markdown.match(/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/);
  return match?.[1] || null;
}

function extractPhone(markdown: string): string | null {
  const match = markdown.match(/\b(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})\b/);
  return match?.[1] || null;
}

function extractBio(markdown: string): string | null {
  // Look for bio/about section
  const bioPattern = /(?:bio|about|summary)[:\s]*\n?([^\n]{10,})/i;
  const match = markdown.match(bioPattern);
  return match?.[1]?.trim() || null;
}

// ============ BATCH OPERATIONS ============

// Scrape multiple Hudl profiles in sequence with rate limiting
export async function batchScrapeHudlProfiles(
  profileUrls: string[],
  options: JinaOptions = {},
  delayMs: number = 2000
): Promise<{ successes: HudlProfile[]; failures: { url: string; error: string }[] }> {
  const successes: HudlProfile[] = [];
  const failures: { url: string; error: string }[] = [];

  for (const url of profileUrls) {
    try {
      const profile = await scrapeHudlProfile(url, options);
      successes.push(profile);
    } catch (error) {
      failures.push({
        url,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Rate limit between requests
    if (profileUrls.indexOf(url) < profileUrls.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { successes, failures };
}

// Create a scrape job for tracking
export function createScrapeJob(profileUrl: string): ScrapeJob {
  return {
    id: crypto.randomUUID(),
    type: "hudl_profile",
    targetUrl: profileUrl,
    status: "pending",
    result: null,
    error: null,
    createdAt: Date.now(),
    completedAt: null,
    retryCount: 0,
  };
}

// Validate a Hudl profile URL
export function isValidHudlUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?hudl\.com\/profile\/\d+/.test(url);
}

// Extract Hudl profile URL from text (e.g., from a tweet or bio)
export function extractHudlUrl(text: string): string | null {
  const match = text.match(/https?:\/\/(?:www\.)?hudl\.com\/profile\/\d+[^\s)"]*/);
  return match?.[0] || null;
}
