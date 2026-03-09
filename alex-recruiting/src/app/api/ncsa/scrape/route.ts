import { NextRequest, NextResponse } from "next/server";
import { processNCSAData } from "@/lib/scraping/ncsa-scraper";
import { syncNcsaDashboard } from "@/lib/scraping/ncsa-browser-sync.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET — Cron-triggered NCSA scrape (every 4 hours).
 * Validates CRON_SECRET from Authorization header.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runScrape(req);
    return NextResponse.json({
      ok: true,
      trigger: "cron",
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * POST — Manual trigger for NCSA scrape.
 * No auth required (internal use).
 */
export async function POST() {
  try {
    const result = await runScrape();
    return NextResponse.json({
      ok: true,
      trigger: "manual",
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

async function runScrape(req?: NextRequest) {
  const mode = req?.nextUrl.searchParams.get("mode") ?? "authenticated";
  const allowLegacyFallback = req?.nextUrl.searchParams.get("legacyFallback") === "1";

  if (mode === "legacy") {
    const legacy = await processNCSAData();
    return {
      mode: "legacy",
      ...legacy,
    };
  }

  try {
    const synced = await syncNcsaDashboard();
    return {
      mode: "authenticated",
      ...synced,
    };
  } catch (error) {
    if (!allowLegacyFallback) {
      throw error;
    }

    const legacy = await processNCSAData();
    return {
      mode: "legacy_fallback",
      warning:
        "Authenticated NCSA sync failed, so the route fell back to the public scraper. Results may be incomplete.",
      error: error instanceof Error ? error.message : String(error),
      ...legacy,
    };
  }
}
