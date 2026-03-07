// GET /api/growth/analytics — Growth metrics, follower breakdown, and projections
// POST /api/growth/analytics — Record a new follower count snapshot

import { NextRequest, NextResponse } from "next/server";
import {
  getGrowthMetrics,
  getFollowerBreakdown,
  getTopGrowthDrivers,
  recordGrowthSnapshot,
} from "@/lib/growth/growth-analytics";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDrivers = searchParams.get("drivers") !== "false";
    const includeBreakdown = searchParams.get("breakdown") !== "false";

    const [metrics, drivers] = await Promise.all([
      getGrowthMetrics(),
      includeDrivers ? getTopGrowthDrivers() : Promise.resolve([]),
    ]);

    const breakdown = includeBreakdown
      ? await getFollowerBreakdown(metrics.currentFollowers)
      : null;

    // Find the next unachieved milestone
    const nextMilestone = metrics.milestones.find((m) => !m.alreadyAchieved);

    return NextResponse.json({
      metrics,
      breakdown,
      topGrowthDrivers: drivers,
      nextMilestone,
      generatedAt: new Date().toISOString(),
      note: "Follower breakdown is estimated from engagement patterns. Use /api/growth/targets for live X data on specific accounts.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load growth analytics";
    console.error("[API] GET /growth/analytics error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      followerCount,
      coachFollowers,
      followingCount,
      engagementRate,
      postsThisWeek,
      dmsThisWeek,
    } = body;

    if (followerCount === undefined || typeof followerCount !== "number") {
      return NextResponse.json(
        { error: "followerCount (number) is required" },
        { status: 400 }
      );
    }

    const snapshot = await recordGrowthSnapshot({
      followerCount,
      coachFollowers,
      followingCount,
      engagementRate,
      postsThisWeek,
      dmsThisWeek,
    });

    return NextResponse.json(
      {
        snapshot,
        message: snapshot
          ? `Growth snapshot recorded: ${followerCount} followers`
          : "Snapshot logged (in-memory — configure database to persist)",
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record snapshot";
    console.error("[API] POST /growth/analytics error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
