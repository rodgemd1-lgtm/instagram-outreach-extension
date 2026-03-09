/**
 * Multi-Engine Scraper Orchestrator
 *
 * Coordinates scraping across Firecrawl, Jina, and Playwright engines with
 * automatic fallback. Tries engines in priority order and returns the first
 * successful result.
 *
 * Priority order: Firecrawl -> Jina -> Playwright
 * Exception: Reddit/forum URLs prefer Playwright first.
 *
 * All public functions return null on total failure (never throw).
 */

import * as firecrawl from "./firecrawl-engine";
import * as jina from "./jina-engine";
import * as playwright from "./playwright-engine";
import type { ParsedCoach } from "./firecrawl-engine";
import type { SchoolEntry } from "@/lib/data-pipeline/mega-scraper";

export type { ParsedCoach };

// ─── Exported Constants & Types ─────────────────────────────────────────────

export const ENGINE_PRIORITY = ["firecrawl", "jina", "playwright"] as const;

export type EngineSource = "firecrawl" | "jina" | "playwright";

export interface UnifiedScrapeResult {
  url: string;
  markdown: string;
  title: string;
  wordCount: number;
  source: EngineSource;
  scrapedAt: string;
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

/** URL patterns that benefit from JS rendering (Playwright preferred). */
const PLAYWRIGHT_PREFERRED_DOMAINS = [
  "reddit.com",
  "coachad.com",
  "operationsports.com",
];

function isPlaywrightPreferred(url: string): boolean {
  const lower = url.toLowerCase();
  return PLAYWRIGHT_PREFERRED_DOMAINS.some((domain) => lower.includes(domain));
}

/**
 * Check whether an engine can be used based on environment variables.
 * Firecrawl requires FIRECRAWL_API_KEY. Jina and Playwright work without keys.
 */
function isEngineAvailable(engine: EngineSource): boolean {
  if (engine === "firecrawl") {
    return !!process.env.FIRECRAWL_API_KEY;
  }
  // Jina works on free tier without a key; Playwright only needs the binary
  return true;
}

/**
 * Attempt a single scrape using the specified engine.
 * Returns a UnifiedScrapeResult or null on failure.
 */
async function tryEngine(
  engine: EngineSource,
  url: string
): Promise<UnifiedScrapeResult | null> {
  try {
    switch (engine) {
      case "firecrawl": {
        const result = await firecrawl.scrapeUrl(url);
        if (!result) return null;
        return {
          url: result.url,
          markdown: result.markdown,
          title: result.title,
          wordCount: result.wordCount,
          source: "firecrawl",
          scrapedAt: result.scrapedAt,
        };
      }
      case "jina": {
        const result = await jina.scrapeUrl(url);
        if (!result) return null;
        return {
          url: result.url,
          markdown: result.markdown,
          title: result.title,
          wordCount: result.wordCount,
          source: "jina",
          scrapedAt: result.scrapedAt,
        };
      }
      case "playwright": {
        const result = await playwright.scrapeDynamicPage(url);
        if (!result) return null;
        return {
          url: result.url,
          markdown: result.markdown,
          title: result.title,
          wordCount: result.wordCount,
          source: "playwright",
          scrapedAt: result.scrapedAt,
        };
      }
      default:
        return null;
    }
  } catch (err) {
    console.error(
      `[orchestrator] Engine "${engine}" failed for ${url}:`,
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

/**
 * Reorder the default priority list so that `preferred` comes first,
 * with the rest following in their original order.
 */
function buildPriorityList(preferred?: EngineSource): EngineSource[] {
  if (!preferred) return [...ENGINE_PRIORITY];
  const rest = ENGINE_PRIORITY.filter((e) => e !== preferred);
  return [preferred, ...rest];
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Try scraping a URL using engines in priority order with automatic fallback.
 *
 * - Accepts an optional `preferredEngine` to reorder priority.
 * - Skips engines whose required env vars are missing.
 * - Returns the first successful UnifiedScrapeResult, or null if all fail.
 */
export async function scrapeWithFallback(
  url: string,
  preferredEngine?: EngineSource
): Promise<UnifiedScrapeResult | null> {
  const engines = buildPriorityList(preferredEngine);

  for (const engine of engines) {
    if (!isEngineAvailable(engine)) {
      console.log(
        `[orchestrator] Skipping "${engine}" — required env var missing`
      );
      continue;
    }

    console.log(`[orchestrator] Trying "${engine}" for ${url}...`);
    const result = await tryEngine(engine, url);

    if (result) {
      console.log(
        `[orchestrator] Success with "${engine}" for ${url} (${result.wordCount} words)`
      );
      return result;
    }

    console.log(`[orchestrator] "${engine}" returned no result for ${url}`);
  }

  console.error(`[orchestrator] All engines failed for ${url}`);
  return null;
}

/**
 * Scrape a school's coaching staff page with structured coach extraction.
 *
 * Strategy:
 * 1. Try firecrawl.scrapeCoachingStaffPage first (structured extraction).
 * 2. If that fails or returns no coaches, fall back to scrapeWithFallback
 *    for raw content.
 *
 * Returns `{ raw, coaches }` where `raw` is the unified scrape result and
 * `coaches` is the array of parsed coach records (may be empty).
 */
export async function scrapeCoachesForSchool(
  school: SchoolEntry
): Promise<{ raw: UnifiedScrapeResult | null; coaches: ParsedCoach[] }> {
  const { staffUrl } = school;

  // 1. Try Firecrawl's structured coaching staff scraper
  if (isEngineAvailable("firecrawl")) {
    console.log(
      `[orchestrator] Trying firecrawl coaching staff scraper for ${school.name}...`
    );
    try {
      const fcResult = await firecrawl.scrapeCoachingStaffPage(staffUrl);
      if (fcResult && fcResult.coaches.length > 0) {
        console.log(
          `[orchestrator] Firecrawl found ${fcResult.coaches.length} coaches for ${school.name}`
        );
        const raw: UnifiedScrapeResult = {
          url: fcResult.scrape.url,
          markdown: fcResult.scrape.markdown,
          title: fcResult.scrape.title,
          wordCount: fcResult.scrape.wordCount,
          source: "firecrawl",
          scrapedAt: fcResult.scrape.scrapedAt,
        };
        return { raw, coaches: fcResult.coaches };
      }
    } catch {
      console.log(
        `[orchestrator] Firecrawl coaching staff scraper failed for ${school.name}`
      );
    }
  }

  // 2. Fallback: get raw content from any available engine
  console.log(
    `[orchestrator] Falling back to raw scrape for ${school.name} staff page...`
  );
  const raw = await scrapeWithFallback(staffUrl);
  return { raw, coaches: [] };
}

/**
 * Scrape a research article URL with smart engine selection.
 *
 * - Reddit, coachad.com, operationsports.com -> Playwright first
 * - Everything else -> default priority (Firecrawl first)
 *
 * Returns a UnifiedScrapeResult or null if all engines fail.
 */
export async function scrapeResearchArticle(
  url: string,
  _dataType?: string
): Promise<UnifiedScrapeResult | null> {
  const preferred: EngineSource | undefined = isPlaywrightPreferred(url)
    ? "playwright"
    : undefined;

  return scrapeWithFallback(url, preferred);
}
