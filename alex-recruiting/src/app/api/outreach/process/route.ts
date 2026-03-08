// POST /api/outreach/process — Process all due DM sequences (cron endpoint)
// This route is called by a Vercel Cron job or external scheduler.
// It fires step-N DMs for any sequence where nextSendAt <= now and no response detected.

import { NextRequest, NextResponse } from "next/server";
import { processSequences } from "@/lib/outreach/dm-sequences";

export async function POST(req: NextRequest) {
  // Validate the cron secret to prevent unauthorized triggers
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();

  try {
    console.log("[Outreach Process] Starting sequence processing run...");
    const result = await processSequences();

    const durationMs = Date.now() - startedAt;

    console.log(
      `[Outreach Process] Complete — processed: ${result.processed}, sent: ${result.sent}, skipped: ${result.skipped}, errors: ${result.errors.length}`
    );

    return NextResponse.json({
      success: true,
      runAt: new Date().toISOString(),
      durationMs,
      summary: {
        processed: result.processed,
        sent: result.sent,
        skipped: result.skipped,
        errorCount: result.errors.length,
      },
      details: result.details,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed";
    console.error("[API] POST /outreach/process error:", err);
    return NextResponse.json(
      {
        success: false,
        error: message,
        runAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
      },
      { status: 500 }
    );
  }
}

// GET for Vercel cron (crons send GET requests)
export async function GET(req: NextRequest) {
  return POST(req);
}
