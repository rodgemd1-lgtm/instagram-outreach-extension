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

  for (const entry of results) {
    if ("result" in entry && entry.result) {
      await storeDiscoveryResult(entry.result);
      console.info(`  ${entry.name}: ${entry.result.resultCount} results stored`);
    }
  }
  console.info(`\n[discover] Done: ${results.length} queries completed`);
}
