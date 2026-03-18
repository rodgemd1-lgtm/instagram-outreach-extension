/**
 * POST /api/data/social-snapshot
 *
 * Takes a daily social media snapshot for Jacob's X account (@JacobRodgersOL29).
 * Captures follower count, following count, recent post engagement, and coach follow status.
 *
 * Request body (optional):
 *   { handle?: string }  — X handle override (defaults to JacobRodgersOL29)
 *
 * Response:
 *   { success: true, source: "live"|"mock", snapshot: GrowthSnapshot }
 *
 * Falls back to mock snapshot data (built on latest DB snapshot) when X API is unavailable.
 */

import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { targetSchools } from "@/lib/data/target-schools";

export const dynamic = "force-dynamic";

interface GrowthSnapshotData {
  followerCount: number;
  coachFollowers: number;
  followingCount: number;
  engagementRate: number;
  postsThisWeek: number;
  dmsThisWeek: number;
  snapshotDate: string;
  coachFollowStatus: CoachFollowEntry[];
}

interface CoachFollowEntry {
  schoolName: string;
  handle: string;
  isFollowing: boolean;
  isFollowedBy: boolean;
}

const DEFAULT_HANDLE = "JacobRodgersOL29";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const handle: string = body.handle ?? DEFAULT_HANDLE;

    let snapshot: GrowthSnapshotData;
    let source: "live" | "mock" = "mock";

    // Attempt live X API snapshot
    const liveSnapshot = await attemptLiveSnapshot(handle);
    if (liveSnapshot) {
      snapshot = liveSnapshot;
      source = "live";
    } else {
      // Fall back to mock snapshot, building on latest DB data
      snapshot = await generateMockSnapshot();
    }

    // Persist to database if available
    if (isDbConfigured()) {
      try {
        await db.insert(schema.growthSnapshots).values({
          followerCount: snapshot.followerCount,
          coachFollowers: snapshot.coachFollowers,
          followingCount: snapshot.followingCount,
          engagementRate: snapshot.engagementRate,
          postsThisWeek: snapshot.postsThisWeek,
          dmsThisWeek: snapshot.dmsThisWeek,
          snapshotDate: new Date(),
        });
      } catch (dbError) {
        console.error("[social-snapshot] DB insert failed:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      source,
      snapshot,
    });
  } catch (error) {
    console.error("[POST /api/data/social-snapshot]", error);
    return NextResponse.json(
      {
        error: `Social snapshot failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

/**
 * Attempt to pull live data from the X API.
 */
async function attemptLiveSnapshot(handle: string): Promise<GrowthSnapshotData | null> {
  try {
    const xApi = await import("@/lib/integrations/x-api");

    // Verify the user and get metrics
    const user = await xApi.verifyHandle(handle);
    if (!user || !user.public_metrics) {
      return null;
    }

    const followerCount = user.public_metrics.followers_count;
    const followingCount = user.public_metrics.following_count;

    // Get recent tweets to calculate engagement rate
    let engagementRate = 0;
    let postsThisWeek = 0;

    try {
      const tweets = await xApi.getUserTweets(user.id, 20);
      if (tweets.length > 0) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentTweets = tweets.filter(
          (t) => new Date(t.created_at) >= oneWeekAgo
        );
        postsThisWeek = recentTweets.length;

        // Calculate average engagement rate
        const totalEngagement = tweets.reduce((sum, t) => {
          const metrics = t.public_metrics;
          if (!metrics) return sum;
          return sum + metrics.like_count + metrics.retweet_count + metrics.reply_count;
        }, 0);

        const totalImpressions = tweets.reduce((sum, t) => {
          return sum + (t.public_metrics?.impression_count ?? 0);
        }, 0);

        engagementRate = totalImpressions > 0
          ? (totalEngagement / totalImpressions) * 100
          : 0;
      }
    } catch {
      // Tweet fetch failed — still have profile data
    }

    // Check coach follow status for target school handles
    const coachFollowStatus: CoachFollowEntry[] = [];
    for (const school of targetSchools) {
      try {
        const coachUser = await xApi.verifyHandle(school.officialXHandle);
        if (coachUser) {
          const relationship = await xApi.checkFollowRelationship(user.id, coachUser.id);
          coachFollowStatus.push({
            schoolName: school.name,
            handle: school.officialXHandle,
            isFollowing: relationship.following,
            isFollowedBy: relationship.followed_by,
          });
        }
      } catch {
        // Skip individual coach check failures
        coachFollowStatus.push({
          schoolName: school.name,
          handle: school.officialXHandle,
          isFollowing: false,
          isFollowedBy: false,
        });
      }
    }

    const coachFollowers = coachFollowStatus.filter((c) => c.isFollowedBy).length;

    return {
      followerCount,
      coachFollowers,
      followingCount,
      engagementRate: Math.round(engagementRate * 100) / 100,
      postsThisWeek,
      dmsThisWeek: 0, // DM count requires separate tracking
      snapshotDate: new Date().toISOString(),
      coachFollowStatus,
    };
  } catch {
    // X API completely unavailable
    return null;
  }
}

/**
 * No mock data — return zeros when real X API is unavailable.
 */
async function generateMockSnapshot(): Promise<GrowthSnapshotData> {
  // No mock data — return empty/zero snapshot when real X API unavailable
  return {
    followerCount: 0,
    coachFollowers: 0,
    followingCount: 0,
    engagementRate: 0,
    postsThisWeek: 0,
    dmsThisWeek: 0,
    snapshotDate: new Date().toISOString(),
    coachFollowStatus: [],
    source: "empty",
  } as GrowthSnapshotData & { source: string };
}
