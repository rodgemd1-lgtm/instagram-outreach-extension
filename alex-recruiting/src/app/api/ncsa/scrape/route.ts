import { NextRequest, NextResponse } from "next/server";
import { processNCSAData } from "@/lib/scraping/ncsa-scraper";

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
    const result = await processNCSAData();
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
    const result = await processNCSAData();
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
