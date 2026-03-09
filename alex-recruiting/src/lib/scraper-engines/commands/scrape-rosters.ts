/**
 * scrape-rosters command
 *
 * Scrapes roster pages for NCAA schools to identify OL players and
 * graduating seniors (potential roster gaps). Supports filtering by
 * division and limiting the number of schools processed.
 *
 * Usage: npm run recruit -- scrape-rosters [--division D1_FBS] [--limit 10]
 */

export interface Options {
  division?: string;
  limit?: number;
}

export async function run(options: Options = {}): Promise<void> {
  const { getSchools } = await import("@/lib/data-pipeline/mega-scraper");
  const { scrapeRosterPage } = await import(
    "@/lib/scraper-engines/firecrawl-engine"
  );

  const schools = getSchools(options.division);
  const batch = options.limit ? schools.slice(0, options.limit) : schools;
  console.info(`[scrape-rosters] Starting: ${batch.length} schools`);

  let totalOL = 0,
    totalErrors = 0;
  for (const school of batch) {
    try {
      const result = await scrapeRosterPage(school.rosterUrl);
      if (result) {
        totalOL += result.totalOL;
        console.info(
          `  ${school.name}: ${result.totalOL} OL (${result.graduatingSeniors} graduating)`
        );
      } else {
        console.info(`  ${school.name}: no roster data`);
      }
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      totalErrors++;
      console.error(
        `  ${school.name}: ERROR - ${err instanceof Error ? err.message : err}`
      );
    }
  }
  console.info(
    `\n[scrape-rosters] Done: ${totalOL} OL found, ${totalErrors} errors`
  );
}
