/**
 * /api/growth/auto-engage
 *
 * GET — Cron-triggered daily growth engine
 * Runs autoFollowCoaches(10) + autoEngageCoachContent(5)
 * Schedule: Daily at 9 AM CT (15:00 UTC)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  autoFollowCoaches,
  autoEngageCoachContent,
  getGrowthReport,
} from "@/lib/growth/auto-engage";

function isValidCronRequest(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return token === cronSecret;
}

export async function GET(req: NextRequest) {
  if (!isValidCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [followResult, engageResult, report] = await Promise.all([
      autoFollowCoaches(10),
      autoEngageCoachContent(5),
      getGrowthReport(),
    ]);

    return NextResponse.json({
      success: true,
      follows: followResult,
      engagement: engageResult,
      report,
      runAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[growth/auto-engage] Error:", err);
    return NextResponse.json(
      { error: "Growth engine failed", details: message },
      { status: 500 }
    );
  }
}
