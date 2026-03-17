/**
 * discover command
 *
 * Runs Exa semantic discovery queries across recruiting topics and
 * stores the results in the database.
 *
 * Usage: npm run recruit -- discover [--query "..."]
 */

export interface Options {
  query?: string;
}

export async function run(options: Options = {}): Promise<void> {
  const { runAllDiscovery } = await import("@/lib/scraper-engines/exa-engine");
  const { storeDiscoveryResult } = await import(
    "@/lib/scraper-engines/storage"
  );

  console.info("[discover] Running Exa semantic discovery...");
  const results = await runAllDiscovery();

  for (const result of results) {
    await storeDiscoveryResult(result);
    console.info(`  "${result.query.slice(0, 40)}...": ${result.resultCount} results stored`);
  }
  console.info(`\n[discover] Done: ${results.length} queries completed`);
}
