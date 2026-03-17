/**
 * Jina AI Reader Scraping Engine
 *
 * Fallback scraper using the Jina AI Reader API (r.jina.ai) for clean
 * markdown extraction from any URL. Works without an API key on the free
 * tier but supports JINA_API_KEY for higher rate limits.
 *
 * Part of the scraper CLI engine suite.
 * All public functions return null on failure (never throw).
 */

// ─── Exported Constants ─────────────────────────────────────────────────────

export const JINA_READER_PREFIX = "https://r.jina.ai/";

// ─── Exported Types ─────────────────────────────────────────────────────────

export interface JinaScrapeResult {
  url: string;
  markdown: string;
  title: string;
  wordCount: number;
  source: "jina";
  scrapedAt: string;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Scrape a URL using Jina AI Reader mode and return clean markdown content.
 * Returns null on failure.
 */
export async function scrapeUrl(
  url: string
): Promise<JinaScrapeResult | null> {
  try {
    const headers: Record<string, string> = { Accept: "text/markdown" };
    const apiKey = process.env.JINA_API_KEY;
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    const response = await fetch(`${JINA_READER_PREFIX}${url}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error(`[jina] HTTP ${response.status} for ${url}`);
      return null;
    }

    const markdown = await response.text();
    if (!markdown || markdown.length < 50) return null;

    const titleMatch = markdown.match(/^#\s+(.+)/m);
    const title = titleMatch?.[1] || url.split("/").pop() || "";

    return {
      url,
      markdown,
      title,
      wordCount: markdown.split(/\s+/).length,
      source: "jina",
      scrapedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(
      `[jina] Failed to scrape ${url}:`,
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
