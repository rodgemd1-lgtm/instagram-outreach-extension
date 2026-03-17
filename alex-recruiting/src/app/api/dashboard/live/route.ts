// GET /api/dashboard/live
//
// Returns a live snapshot of Jacob's recruiting dashboard metrics.
// Aggregates follower count, coach follows, engagement rate, weekly
// post stats, and DM metrics from the X API. Fails gracefully —
// if the X API is unreachable, fallback values matching the static
// dashboard defaults are returned with dataSource: "fallback".

import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/dashboard/live-data";
import type { DashboardSnapshot } from "@/lib/dashboard/live-data";

// Route segment config — disable static caching so this always runs
// on the server at request time.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface LiveDashboardResponse {
  followers: {
    count: number;
    weekChange: number;
    target: number;
  };
  coachFollows: {
    count: number;
    target: number;
    recentFollows: Array<{
      name: string;
      xHandle: string;
      schoolName: string;
      followedAt: string;
      division: string;
    }>;
  };
  engagement: {
    rate: number;
    weekChange: number;
  };
  posts: {
    thisWeek: number;
    target: number;
  };
  dms: {
    sent: number;
    responses: number;
    responseRate: number;
  };
  alerts: string[];
  competitorUpdates: string[];
  meta: {
    fetchedAt: string;
    dataSource: "live" | "fallback";
    jacobUserId: string | null;
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    const snapshot: DashboardSnapshot = await getDashboardSnapshot();

    const body: LiveDashboardResponse = {
      followers: {
        count: snapshot.followers.count,
        weekChange: snapshot.followers.weekChange,
        target: snapshot.followers.target,
      },
      coachFollows: {
        count: snapshot.coachFollows.count,
        target: snapshot.coachFollows.target,
        recentFollows: snapshot.coachFollows.recentFollows,
      },
      engagement: {
        rate: snapshot.engagement.rate,
        weekChange: snapshot.engagement.weekChange,
      },
      posts: {
        thisWeek: snapshot.weeklyStats.postsThisWeek,
        target: snapshot.weeklyStats.weeklyTarget,
      },
      dms: {
        sent: snapshot.weeklyStats.dmsSent,
        responses: snapshot.weeklyStats.dmsResponded,
        responseRate: snapshot.weeklyStats.responseRate,
      },
      // Alerts and competitor updates are provided by their own dedicated
      // endpoints. Returning empty arrays here keeps this endpoint fast.
      alerts: [],
      competitorUpdates: [],
      meta: {
        fetchedAt: snapshot.fetchedAt,
        dataSource: snapshot.dataSource,
        jacobUserId: snapshot.jacobUserId,
      },
    };

    return NextResponse.json(body, {
      status: 200,
      headers: {
        // Allow clients to cache for 4 minutes; revalidate in background
        "Cache-Control": "public, s-maxage=240, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("[/api/dashboard/live] Unhandled error:", error);

    // Return zeros — never show fake data
    const fallback: LiveDashboardResponse = {
      followers: { count: 0, weekChange: 0, target: 20000 },
      coachFollows: { count: 0, target: 15, recentFollows: [] },
      engagement: { rate: 0, weekChange: 0 },
      posts: { thisWeek: 0, target: 5 },
      dms: { sent: 0, responses: 0, responseRate: 0 },
      alerts: [],
      competitorUpdates: [],
      meta: {
        fetchedAt: new Date().toISOString(),
        dataSource: "fallback",
        jacobUserId: null,
      },
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}
