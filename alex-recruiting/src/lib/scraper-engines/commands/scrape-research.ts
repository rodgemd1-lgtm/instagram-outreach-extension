/**
 * scrape-research command
 *
 * Scrapes research stream URLs using the multi-engine orchestrator and
 * stores the results in the database. Supports filtering by stream name.
 *
 * Usage: npm run recruit -- scrape-research [--stream "Coach Decision Psychology"]
 */

export interface Options {
  stream?: string;
}

export async function run(options: Options = {}): Promise<void> {
  const { getAllStreams, getStreamByName } = await import(
    "@/lib/research/streams"
  );
  const { scrapeResearchArticle } = await import(
    "@/lib/scraper-engines/orchestrator"
  );
  const { storeResearchArticle } = await import(
    "@/lib/scraper-engines/storage"
  );

  const streams = options.stream
    ? [getStreamByName(options.stream)].filter(Boolean)
    : getAllStreams();
  console.info(`[scrape-research] Scraping ${streams.length} streams...`);

  let totalArticles = 0,
    totalErrors = 0;
  for (const stream of streams) {
    if (!stream) continue;
    console.info(`\n  Stream: ${stream.name} (${stream.urls.length} URLs)`);
    for (const url of stream.urls) {
      try {
        const result = await scrapeResearchArticle(url, stream.dataType);
        if (result) {
          await storeResearchArticle(result, stream.dataType);
          totalArticles++;
          console.info(
            `    ${url}: ${result.wordCount} words (${result.source})`
          );
        } else {
          console.info(`    ${url}: no content`);
        }
        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        totalErrors++;
        console.error(
          `    ${url}: ERROR - ${err instanceof Error ? err.message : err}`
        );
      }
    }
  }
  console.info(
    `\n[scrape-research] Done: ${totalArticles} articles, ${totalErrors} errors`
  );
}
