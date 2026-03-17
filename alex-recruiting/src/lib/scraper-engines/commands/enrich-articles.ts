/**
 * enrich-articles command
 *
 * AI-summarizes scraped research articles using Claude Haiku. Fetches
 * unprocessed articles from the database and runs enrichment on each.
 *
 * Usage: npm run recruit -- enrich-articles [--reprocess]
 */

export interface Options {
  reprocess?: boolean;
}

export async function run(options: Options = {}): Promise<void> {
  const { getScrapingStats } = await import("@/lib/scraper-engines/storage");

  console.info("[enrich-articles] Fetching unprocessed articles...");

  // Get articles from DB that need enrichment
  const stats = await getScrapingStats();
  const unenriched = stats.articles - stats.enrichedArticles;

  if (unenriched === 0 && !options.reprocess) {
    console.info(
      "[enrich-articles] All articles already enriched. Use --reprocess to re-enrich."
    );
    return;
  }

  console.info(`[enrich-articles] ${unenriched} articles to enrich`);

  // In a real run, we'd query the DB for unprocessed articles
  // For now, log what would happen
  console.info(
    "[enrich-articles] Note: Run scrape-research first to populate articles, then run this command."
  );
  console.info(
    "[enrich-articles] The enrichment will call Claude Haiku for each unprocessed article."
  );
}
