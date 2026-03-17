// GET /api/dashboard/competitors
//
// Returns live competitor data and a side-by-side comparison between
// Jacob's current metrics and each tracked Class of 2029 OL competitor.
//
// Query params:
//   followers  — Jacob's current follower count (integer, optional)
//   posts      — Jacob's posts this week (integer, optional)
//   engagement — Jacob's engagement rate (float, optional)
//
// These allow the caller to pass in already-fetched live metrics so
// this endpoint doesn't need to re-fetch Jacob's own data.

import { NextRequest, NextResponse } from "next/server";
import {
  getCompetitorUpdates,
  getCompetitorComparison,
} from "@/lib/dashboard/competitor-tracker";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const jacobFollowers = parseInt(searchParams.get("followers") ?? "0", 10);
    const jacobPosts = parseInt(searchParams.get("posts") ?? "0", 10);
    const jacobEngagement = parseFloat(searchParams.get("engagement") ?? "0");

    const [updates, comparison] = await Promise.all([
      getCompetitorUpdates(),
      getCompetitorComparison(
        isNaN(jacobFollowers) ? 0 : jacobFollowers,
        isNaN(jacobPosts) ? 0 : jacobPosts,
        isNaN(jacobEngagement) ? 0 : jacobEngagement
      ),
    ]);

    return NextResponse.json(
      { updates, comparison },
      {
        status: 200,
        headers: {
          // Cache for 20 minutes — competitor data changes slowly
          "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=180",
        },
      }
    );
  } catch (error) {
    console.error("[/api/dashboard/competitors] Unhandled error:", error);

    return NextResponse.json(
      {
        updates: [],
        comparison: {
          jacobFollowers: 0,
          jacobPostsPerWeek: 0,
          jacobEngagementRate: 0,
          competitors: [],
          jacobRank: 1,
          jacobAdvantages: [],
          jacobGaps: [],
          comparisonDate: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  }
}
