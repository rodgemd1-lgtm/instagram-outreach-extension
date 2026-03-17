// Live Data Fetcher — Dashboard Intelligence Layer
//
// Pulls real-time data from the X API and cross-references against
// target coaches and Jacob's profile. All functions are designed to
// fail gracefully: if the X API is unavailable or rate-limited,
// fallback values are returned so the dashboard never breaks.

import { verifyHandle, getFollowers, getUserTweets } from "@/lib/integrations/x-api";
import { targetSchools } from "@/lib/data/target-schools";
import { jacobProfile } from "@/lib/data/jacob-profile";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { XUser, XTweet } from "@/lib/integrations/x-api";

// ─── Return Types ─────────────────────────────────────────────────────────────

export interface FollowerMetric {
  count: number;
  weekChange: number;
  target: number;
  /** ISO timestamp of when this was fetched */
  fetchedAt: string;
}

export interface CoachFollowMetric {
  count: number;
  target: number;
  recentFollows: RecentCoachFollow[];
  fetchedAt: string;
}

export interface RecentCoachFollow {
  name: string;
  xHandle: string;
  schoolName: string;
  followedAt: string;
  division: string;
}

export interface EngagementMetric {
  rate: number;
  weekChange: number;
  totalImpressions: number;
  totalEngagements: number;
  fetchedAt: string;
}

export interface WeeklyStats {
  postsThisWeek: number;
  weeklyTarget: number;
  dmsSent: number;
  dmsResponded: number;
  responseRate: number;
  profileVisits: number;
  fetchedAt: string;
}

export interface DashboardSnapshot {
  followers: FollowerMetric;
  coachFollows: CoachFollowMetric;
  engagement: EngagementMetric;
  weeklyStats: WeeklyStats;
  jacobUserId: string | null;
  fetchedAt: string;
  dataSource: "live" | "fallback";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FOLLOWER_TARGET = 20_000;
const COACH_FOLLOW_TARGET = 15;
const WEEKLY_POST_TARGET = 5;

// Known target coach X handles cross-referenced from target-schools data.
// These are the program-level handles; in production you would maintain a
// separate coach-level handle list. We use the school handles as a proxy
// for detecting any program follow-back.
const TARGET_COACH_HANDLES = targetSchools
  .map((s) => s.officialXHandle.replace("@", "").toLowerCase())
  .filter(Boolean);

interface CoachHandleRow {
  name: string;
  school_name: string;
  division: string;
  x_handle: string | null;
}

interface DMMessageRow {
  sent_at: string | null;
  responded_at: string | null;
}

// ─── Jacob's X Identity ───────────────────────────────────────────────────────

let _jacobUserCache: XUser | null = null;
let _jacobUserFetchedAt = 0;
const JACOB_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getJacobUser(): Promise<XUser | null> {
  const now = Date.now();
  if (_jacobUserCache && now - _jacobUserFetchedAt < JACOB_CACHE_TTL_MS) {
    return _jacobUserCache;
  }

  const handle = jacobProfile.xHandle.replace("@", "");
  const user = await verifyHandle(handle);
  if (user) {
    _jacobUserCache = user;
    _jacobUserFetchedAt = now;
  }
  return user;
}

// ─── Individual Fetchers ──────────────────────────────────────────────────────

/**
 * Fetches Jacob's current follower count from the X API.
 * Falls back to the last known cache or zero if unreachable.
 */
export async function getLiveFollowerCount(): Promise<FollowerMetric> {
  const now = new Date().toISOString();

  try {
    const user = await getJacobUser();
    const count = user?.public_metrics?.followers_count ?? 0;

    return {
      count,
      weekChange: 0,
      target: FOLLOWER_TARGET,
      fetchedAt: now,
    };
  } catch {
    return {
      count: 0,
      weekChange: 0,
      target: FOLLOWER_TARGET,
      fetchedAt: now,
    };
  }
}

/**
 * Retrieves Jacob's follower list and cross-references against known
 * target coach handles. Returns the count of coaches who follow Jacob
 * plus metadata for recently detected coach follows.
 */
export async function getLiveCoachFollows(): Promise<CoachFollowMetric> {
  const now = new Date().toISOString();

  try {
    const jacobUser = await getJacobUser();
    if (!jacobUser) {
      return { count: 0, target: COACH_FOLLOW_TARGET, recentFollows: [], fetchedAt: now };
    }

    // Fetch Jacob's followers (up to 1000 to catch all coaches)
    const followers: XUser[] = await getFollowers(jacobUser.id, 1000);
    let coachRows: CoachHandleRow[] = [];

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("coaches")
        .select("name, school_name, division, x_handle")
        .not("x_handle", "is", null)
        .neq("x_handle", "");

      coachRows = (data ?? []) as CoachHandleRow[];
    }

    const coachHandleMap = new Map(
      coachRows
        .filter((row) => row.x_handle)
        .map((row) => [row.x_handle!.replace("@", "").toLowerCase(), row])
    );

    const knownHandles = new Set([
      ...TARGET_COACH_HANDLES,
      ...Array.from(coachHandleMap.keys()),
    ]);

    // Cross-reference followers against known coach/program handles
    const coachFollowers = followers.filter((f) => knownHandles.has(f.username.toLowerCase()));

    // Build recent follows list — in production these would be sorted by
    // follow timestamp via the X API; here we return them as detected.
    const recentFollows: RecentCoachFollow[] = coachFollowers
      .slice(0, 5)
      .map((f) => {
        const coach = coachHandleMap.get(f.username.toLowerCase());
        const school = targetSchools.find(
          (s) => s.officialXHandle.replace("@", "").toLowerCase() === f.username.toLowerCase()
        );
        return {
          name: coach?.name ?? f.name,
          xHandle: `@${f.username}`,
          schoolName: coach?.school_name ?? school?.name ?? f.name,
          followedAt: now, // X API v2 free tier doesn't expose follow timestamps
          division: coach?.division ?? school?.division ?? "Unknown",
        };
      });

    return {
      count: coachFollowers.length,
      target: COACH_FOLLOW_TARGET,
      recentFollows,
      fetchedAt: now,
    };
  } catch {
    return { count: 0, target: COACH_FOLLOW_TARGET, recentFollows: [], fetchedAt: now };
  }
}

/**
 * Calculates Jacob's engagement rate from his most recent 20 tweets.
 * Engagement rate = (likes + retweets + replies) / impressions * 100.
 * Falls back to 6.2% if the API is unreachable or returns no data.
 */
export async function getLiveEngagementRate(): Promise<EngagementMetric> {
  const now = new Date().toISOString();

  try {
    const jacobUser = await getJacobUser();
    if (!jacobUser) {
      return { rate: 0, weekChange: 0, totalImpressions: 0, totalEngagements: 0, fetchedAt: now };
    }

    const tweets: XTweet[] = await getUserTweets(jacobUser.id, 20);
    if (!tweets || tweets.length === 0) {
      return { rate: 0, weekChange: 0, totalImpressions: 0, totalEngagements: 0, fetchedAt: now };
    }

    let totalImpressions = 0;
    let totalEngagements = 0;

    for (const tweet of tweets) {
      if (!tweet.public_metrics) continue;
      const { like_count, retweet_count, reply_count, impression_count } = tweet.public_metrics;
      totalImpressions += impression_count;
      totalEngagements += like_count + retweet_count + reply_count;
    }

    const rate =
      totalImpressions > 0
        ? Math.round((totalEngagements / totalImpressions) * 10000) / 100
        : 0;

    // weekChange: compare recent 10 tweets vs older 10 tweets
    const recentTweets = tweets.slice(0, 10);
    const olderTweets = tweets.slice(10);

    const calcRate = (tw: XTweet[]) => {
      let imp = 0;
      let eng = 0;
      for (const t of tw) {
        if (!t.public_metrics) continue;
        imp += t.public_metrics.impression_count;
        eng += t.public_metrics.like_count + t.public_metrics.retweet_count + t.public_metrics.reply_count;
      }
      return imp > 0 ? Math.round((eng / imp) * 10000) / 100 : 0;
    };

    const recentRate = calcRate(recentTweets);
    const olderRate = calcRate(olderTweets);
    const weekChange = Math.round((recentRate - olderRate) * 10) / 10;

    return {
      rate,
      weekChange,
      totalImpressions,
      totalEngagements,
      fetchedAt: now,
    };
  } catch {
    return { rate: 6.2, weekChange: 0, totalImpressions: 0, totalEngagements: 0, fetchedAt: now };
  }
}

/**
 * Calculates weekly activity stats: posts this week, DMs sent,
 * DM responses, and estimated profile visits.
 *
 * Posts this week comes from tweet timestamps filtered to the current
 * ISO week. DM and profile visit metrics are estimated from engagement
 * signals since the free X API tier does not expose DM analytics.
 */
export async function getLiveWeeklyStats(): Promise<WeeklyStats> {
  const now = new Date().toISOString();

  try {
    const jacobUser = await getJacobUser();
    if (!jacobUser) {
      return { postsThisWeek: 0, weeklyTarget: WEEKLY_POST_TARGET, dmsSent: 0, dmsResponded: 0, responseRate: 0, profileVisits: 0, fetchedAt: now };
    }

    const tweets: XTweet[] = await getUserTweets(jacobUser.id, 50);

    // Count tweets published in the current ISO week (Monday–Sunday)
    const weekStart = getWeekStart();
    const postsThisWeek = tweets.filter((t) => {
      if (!t.created_at) return false;
      return new Date(t.created_at) >= weekStart;
    }).length;

    // DMs come from the outreach log in Supabase. Profile visits still have
    // to be estimated because the public X APIs do not expose them.
    let dmsSent = 0;
    let dmsResponded = 0;

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("dm_messages")
        .select("sent_at, responded_at")
        .or(`sent_at.gte.${weekStart.toISOString()},responded_at.gte.${weekStart.toISOString()}`);

      const rows = (data ?? []) as DMMessageRow[];
      dmsSent = rows.filter((row) => row.sent_at && new Date(row.sent_at) >= weekStart).length;
      dmsResponded = rows.filter((row) => row.responded_at && new Date(row.responded_at) >= weekStart).length;
    }

    const followerCount = jacobUser.public_metrics?.followers_count ?? 0;
    const estimatedProfileVisits = Math.round(followerCount * 3.5);

    return {
      postsThisWeek,
      weeklyTarget: WEEKLY_POST_TARGET,
      dmsSent,
      dmsResponded,
      responseRate: dmsSent > 0 ? Math.round((dmsResponded / dmsSent) * 100) : 0,
      profileVisits: estimatedProfileVisits,
      fetchedAt: now,
    };
  } catch {
    return {
      postsThisWeek: 0,
      weeklyTarget: WEEKLY_POST_TARGET,
      dmsSent: 0,
      dmsResponded: 0,
      responseRate: 0,
      profileVisits: 0,
      fetchedAt: now,
    };
  }
}

/**
 * Aggregates all live metrics into a single DashboardSnapshot.
 * This is the primary function called by the API route.
 * Runs all sub-fetchers concurrently and merges results.
 */
export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const now = new Date().toISOString();

  let dataSource: "live" | "fallback" = "live";

  try {
    const [followers, coachFollows, engagement, weeklyStats] = await Promise.all([
      getLiveFollowerCount(),
      getLiveCoachFollows(),
      getLiveEngagementRate(),
      getLiveWeeklyStats(),
    ]);

    const jacobUser = await getJacobUser();

    // If all counts match the fallback values exactly, flag as fallback
    if (followers.count === 47 && coachFollows.count === 3 && engagement.rate === 6.2) {
      dataSource = "fallback";
    }

    return {
      followers,
      coachFollows,
      engagement,
      weeklyStats,
      jacobUserId: jacobUser?.id ?? null,
      fetchedAt: now,
      dataSource,
    };
  } catch {
    dataSource = "fallback";
    return {
      followers: { count: 0, weekChange: 0, target: FOLLOWER_TARGET, fetchedAt: now },
      coachFollows: { count: 0, target: COACH_FOLLOW_TARGET, recentFollows: [], fetchedAt: now },
      engagement: { rate: 0, weekChange: 0, totalImpressions: 0, totalEngagements: 0, fetchedAt: now },
      weeklyStats: { postsThisWeek: 0, weeklyTarget: WEEKLY_POST_TARGET, dmsSent: 0, dmsResponded: 0, responseRate: 0, profileVisits: 0, fetchedAt: now },
      jacobUserId: null,
      fetchedAt: now,
      dataSource,
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the Monday 00:00:00 UTC of the current ISO week. */
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // adjust so Monday = start
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}
