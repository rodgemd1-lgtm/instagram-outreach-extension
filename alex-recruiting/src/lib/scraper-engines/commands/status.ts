/**
 * status command
 *
 * Displays current scraping statistics including school counts by
 * division and scraped data totals from the database.
 *
 * Usage: npm run recruit -- status
 */

export async function run(): Promise<void> {
  const { getScrapingStats } = await import("@/lib/scraper-engines/storage");
  const { getSchoolCounts } = await import("@/lib/data-pipeline/mega-scraper");

  console.info("\n=== Recruit Scraper Status ===\n");

  const schoolCounts = getSchoolCounts();
  console.info("School Database:");
  console.info(`  Total schools: ${schoolCounts.total}`);
  console.info(`  D1 FBS: ${schoolCounts.D1_FBS}`);
  console.info(`  D1 FCS: ${schoolCounts.D1_FCS}`);
  console.info(`  D2: ${schoolCounts.D2}`);
  console.info(`  D3: ${schoolCounts.D3}`);
  console.info(`  NAIA: ${schoolCounts.NAIA}`);

  const stats = await getScrapingStats();
  console.info("\nScraped Data:");
  console.info(`  Coaches: ${stats.coaches}`);
  console.info(`  Research articles: ${stats.articles}`);
  console.info(`  AI-enriched articles: ${stats.enrichedArticles}`);
  console.info(`  Exa discoveries: ${stats.discoveries}`);

  console.info("\n==============================\n");
}
