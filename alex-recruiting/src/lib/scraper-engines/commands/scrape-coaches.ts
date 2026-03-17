/**
 * scrape-coaches command
 *
 * Scrapes coaching staff pages for NCAA schools and stores parsed coach
 * records in the database. Supports filtering by division and limiting
 * the number of schools processed.
 *
 * Usage: npm run recruit -- scrape-coaches [--division D1_FBS] [--limit 10]
 */

export interface Options {
  division?: string;
  limit?: number;
}

export async function run(options: Options = {}): Promise<void> {
  const { getSchools } = await import("@/lib/data-pipeline/mega-scraper");
  const { scrapeCoachesForSchool } = await import(
    "@/lib/scraper-engines/orchestrator"
  );
  const { storeCoach } = await import("@/lib/scraper-engines/storage");

  const schools = getSchools(options.division);
  const batch = options.limit ? schools.slice(0, options.limit) : schools;
  console.info(`[scrape-coaches] Starting: ${batch.length} schools`);

  let totalCoaches = 0,
    totalErrors = 0;
  for (const school of batch) {
    try {
      const { coaches } = await scrapeCoachesForSchool(school);
      totalCoaches += coaches.length;
      console.info(`  ${school.name}: ${coaches.length} coaches`);
      for (const coach of coaches) {
        await storeCoach(
          school.name,
          school.division,
          school.conference,
          coach
        );
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
    `\n[scrape-coaches] Done: ${totalCoaches} coaches, ${totalErrors} errors`
  );
}
