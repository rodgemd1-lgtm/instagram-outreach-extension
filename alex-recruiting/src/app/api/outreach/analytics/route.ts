// GET /api/outreach/analytics — DM analytics dashboard data
// Returns stats, send-time analysis, insights, and recommendations

import { NextResponse } from "next/server";
import { getFullAnalyticsDashboard } from "@/lib/outreach/dm-analytics";

export async function GET() {
  try {
    const dashboard = await getFullAnalyticsDashboard();

    return NextResponse.json({
      ...dashboard,
      generatedAt: new Date().toISOString(),
      note: "Best send times are based on observed response patterns. Research defaults shown when sample size < 5.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load analytics";
    console.error("[API] GET /outreach/analytics error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
