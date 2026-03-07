// GET /api/growth/plan — Get today's engagement plan (10–18 accounts + suggested actions)

import { NextResponse } from "next/server";
import { getDailyEngagementPlan } from "@/lib/growth/engagement-strategy";

export async function GET() {
  try {
    const plan = await getDailyEngagementPlan();

    return NextResponse.json({
      ...plan,
      generatedAt: new Date().toISOString(),
      tip: "Complete high-priority items first. Aim for quality engagement over volume — one thoughtful reply beats ten likes.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate engagement plan";
    console.error("[API] GET /growth/plan error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
