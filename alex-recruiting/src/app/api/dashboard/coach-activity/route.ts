// GET /api/dashboard/coach-activity
//
// Returns a live coach activity report: recruiting signals detected in
// target coaches' recent tweets, actionable engagement alerts, and
// behavior score changes across the target school list.
//
// This endpoint is intentionally separate from /api/dashboard/live
// because coach scanning is more expensive (multiple X API calls) and
// can be polled less frequently (every 30 minutes vs 5 minutes).

import { NextResponse } from "next/server";
import { getCoachActivityReport } from "@/lib/dashboard/coach-monitor";
import type { CoachActivityReport } from "@/lib/dashboard/coach-monitor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(): Promise<NextResponse> {
  try {
    const report: CoachActivityReport = await getCoachActivityReport();

    return NextResponse.json(report, {
      status: 200,
      headers: {
        // Cache for 15 minutes — coach tweet patterns don't change by the second
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[/api/dashboard/coach-activity] Unhandled error:", error);

    const fallback: CoachActivityReport = {
      signals: [],
      alerts: [],
      behaviorChanges: [],
      scanSummary: {
        schoolsScanned: 0,
        signalsDetected: 0,
        alertsGenerated: 0,
        fetchedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}
