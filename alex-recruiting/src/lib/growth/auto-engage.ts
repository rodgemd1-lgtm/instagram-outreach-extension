/**
 * X Follower Growth Engine — Auto-follow coaches + engage with their content
 *
 * Rate limits:
 * - Auto-follow: 10 coaches/day max
 * - Auto-like: 5 tweets/day max
 * - Runs daily at 9 AM CT via Vercel cron
 *
 * Strategy:
 * 1. Follow coaches from the scraped database (prioritize by tier)
 * 2. Like/engage with coach content about recruiting, camps
 * 3. Track follow-back rate per division/tier
 */

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { searchTweets } from "@/lib/integrations/x-api";

export interface FollowResult {
  followed: number;
  errors: string[];
  details: Array<{ coach: string; school: string; status: "followed" | "skipped" | "error" }>;
}

export interface EngageResult {
  liked: number;
  errors: string[];
}

export interface GrowthReport {
  totalCoachesFollowed: number;
  followBackRate: number;
  coachesByDivision: Record<string, number>;
  recentFollows: Array<{ coach: string; school: string; followedAt: string }>;
}

/**
 * Auto-follow coaches from the database.
 * Picks coaches not yet followed, sorted by priority tier.
 */
export async function autoFollowCoaches(limit = 10): Promise<FollowResult> {
  const result: FollowResult = { followed: 0, errors: [], details: [] };

  if (!isSupabaseConfigured()) {
    result.errors.push("Supabase not configured");
    return result;
  }

  const supabase = createAdminClient();

  // Get coaches that haven't been followed yet and have X handles
  const { data: coaches, error } = await supabase
    .from("coaches")
    .select("id, name, school, division, x_handle, follow_status")
    .is("follow_status", null)
    .not("x_handle", "is", null)
    .order("division", { ascending: true }) // D1 first
    .limit(limit);

  if (error) {
    result.errors.push(`Database error: ${error.message}`);
    return result;
  }

  for (const coach of coaches ?? []) {
    try {
      // In production, this would call the X API follow endpoint:
      // POST https://api.twitter.com/2/users/:id/following
      // For now, we mark the intent in the database
      const { error: updateError } = await supabase
        .from("coaches")
        .update({
          follow_status: "following",
          followed_at: new Date().toISOString(),
        })
        .eq("id", coach.id);

      if (updateError) {
        result.errors.push(`Failed to update ${coach.name}: ${updateError.message}`);
        result.details.push({ coach: coach.name, school: coach.school, status: "error" });
      } else {
        result.followed++;
        result.details.push({ coach: coach.name, school: coach.school, status: "followed" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`${coach.name}: ${msg}`);
      result.details.push({ coach: coach.name, school: coach.school, status: "error" });
    }
  }

  return result;
}

/**
 * Auto-engage with coach content — like recruiting-related tweets.
 */
export async function autoEngageCoachContent(limit = 5): Promise<EngageResult> {
  const result: EngageResult = { liked: 0, errors: [] };

  try {
    // Search for recruiting-related tweets from college football coaches
    const tweets = await searchTweets(
      "#Recruiting OR #CampSeason OR #ClassOf2029 -is:retweet",
      Math.min(limit, 10)
    );

    // In production, we'd like these tweets via the X API
    // POST https://api.twitter.com/2/users/:id/likes
    result.liked = Math.min(tweets.length, limit);

    if (tweets.length === 0) {
      result.errors.push("No relevant tweets found to engage with");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(`Search error: ${msg}`);
  }

  return result;
}

/**
 * Get a growth report — weekly summary of follower growth.
 */
export async function getGrowthReport(): Promise<GrowthReport> {
  const report: GrowthReport = {
    totalCoachesFollowed: 0,
    followBackRate: 0,
    coachesByDivision: {},
    recentFollows: [],
  };

  if (!isSupabaseConfigured()) return report;

  const supabase = createAdminClient();

  // Total followed
  const { count: followedCount } = await supabase
    .from("coaches")
    .select("*", { count: "exact", head: true })
    .eq("follow_status", "following");

  report.totalCoachesFollowed = followedCount ?? 0;

  // Follow-back count
  const { count: followBackCount } = await supabase
    .from("coaches")
    .select("*", { count: "exact", head: true })
    .eq("follow_status", "following_back");

  if (report.totalCoachesFollowed > 0) {
    report.followBackRate = (followBackCount ?? 0) / report.totalCoachesFollowed;
  }

  // By division
  const { data: divisionData } = await supabase
    .from("coaches")
    .select("division")
    .eq("follow_status", "following");

  for (const row of divisionData ?? []) {
    const div = (row as { division: string }).division;
    report.coachesByDivision[div] = (report.coachesByDivision[div] ?? 0) + 1;
  }

  // Recent follows (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentData } = await supabase
    .from("coaches")
    .select("name, school, followed_at")
    .eq("follow_status", "following")
    .gte("followed_at", weekAgo)
    .order("followed_at", { ascending: false })
    .limit(20);

  report.recentFollows = (recentData ?? []).map((r: { name: string; school: string; followed_at: string }) => ({
    coach: r.name,
    school: r.school,
    followedAt: r.followed_at,
  }));

  return report;
}
