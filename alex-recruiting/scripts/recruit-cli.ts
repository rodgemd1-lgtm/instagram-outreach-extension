/**
 * Recruit CLI — Unified scraper and data enrichment tool.
 * Usage: npx tsx scripts/recruit-cli.ts <command> [options]
 *        npm run recruit -- <command> [options]
 */

// Load Next.js env vars
import "@next/env";

const [command, ...rawArgs] = process.argv.slice(2);

function parseArgs(args: string[]): Record<string, string | boolean> {
  const parsed: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        parsed[key] = next;
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }
  return parsed;
}

async function main() {
  if (!command || command === "help" || command === "--help") {
    console.info(`
Recruit CLI — Unified scraper and data enrichment

Commands:
  scrape-coaches  [--division D1_FBS] [--limit 10]   Scrape coaching staff pages
  scrape-rosters  [--division D1_FBS] [--limit 10]   Scrape roster pages for OL gaps
  discover        [--query "..."]                     Run Exa semantic discovery
  scrape-research [--stream "name"]                   Scrape research stream URLs
  sync-ncsa                                           Run NCSA browser sync (Playwright)
  scrape-forums                                       Scrape Reddit/forum URLs
  enrich-articles [--reprocess]                       AI-summarize scraped articles
  enrich-all                                          Run full pipeline
  status                                              Show scraping stats
    `);
    return;
  }

  const args = parseArgs(rawArgs);

  switch (command) {
    case "scrape-coaches": {
      const { run } = await import(
        "../src/lib/scraper-engines/commands/scrape-coaches"
      );
      await run({
        division: args.division as string,
        limit: args.limit ? parseInt(args.limit as string) : undefined,
      });
      break;
    }
    case "scrape-rosters": {
      const { run } = await import(
        "../src/lib/scraper-engines/commands/scrape-rosters"
      );
      await run({
        division: args.division as string,
        limit: args.limit ? parseInt(args.limit as string) : undefined,
      });
      break;
    }
    case "discover": {
      const { run } = await import(
        "../src/lib/scraper-engines/commands/discover"
      );
      await run({ query: args.query as string });
      break;
    }
    case "scrape-research": {
      const { run } = await import(
        "../src/lib/scraper-engines/commands/scrape-research"
      );
      await run({ stream: args.stream as string });
      break;
    }
    case "sync-ncsa": {
      // Delegate to existing NCSA sync script
      console.info("[recruit-cli] Running NCSA browser sync...");
      const { syncNcsaDashboard } = await import(
        "../src/lib/scraping/ncsa-browser-sync.mjs"
      );
      const result = await syncNcsaDashboard();
      console.info(JSON.stringify(result, null, 2));
      break;
    }
    case "scrape-forums": {
      const { run } = await import(
        "../src/lib/scraper-engines/commands/scrape-research"
      );
      await run({ stream: "Reddit/Forum Coach Insights" });
      break;
    }
    case "enrich-articles": {
      const { run } = await import(
        "../src/lib/scraper-engines/commands/enrich-articles"
      );
      await run({ reprocess: args.reprocess === true });
      break;
    }
    case "enrich-all": {
      console.info("[recruit-cli] Running full pipeline...\n");
      const { run: runCoaches } = await import(
        "../src/lib/scraper-engines/commands/scrape-coaches"
      );
      await runCoaches({});
      const { run: runRosters } = await import(
        "../src/lib/scraper-engines/commands/scrape-rosters"
      );
      await runRosters({});
      const { run: runDiscover } = await import(
        "../src/lib/scraper-engines/commands/discover"
      );
      await runDiscover({});
      const { run: runResearch } = await import(
        "../src/lib/scraper-engines/commands/scrape-research"
      );
      await runResearch({});
      const { run: runEnrich } = await import(
        "../src/lib/scraper-engines/commands/enrich-articles"
      );
      await runEnrich({});
      console.info("\n[recruit-cli] Full pipeline complete.");
      break;
    }
    case "status": {
      const { run } = await import(
        "../src/lib/scraper-engines/commands/status"
      );
      await run();
      break;
    }
    default:
      console.error(
        `Unknown command: ${command}. Run with --help for usage.`
      );
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
