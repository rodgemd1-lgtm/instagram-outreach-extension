// Competitor Tracker — Live Comparison Engine
//
// Pulls live X data for each competitor in the intel database and
// compares their metrics against Jacob's current numbers.
// Cross-references the static competitor-intel.ts knowledge base
// with live follower counts and posting activity.

import { verifyHandle, getUserTweets } from "@/lib/integrations/x-api";
import {
  competitorIntel,
  getActiveCompetitors,
  type CompetitorProfile,
} from "@/lib/rec/knowledge/competitor-intel";
import type { XUser, XTweet } from "@/lib/integrations/x-api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LiveCompetitorData extends CompetitorProfile {
  liveFollowers: number | null;
  livePostsThisWeek: number | null;
  liveEngagementRate: number | null;
  followerDelta: number | null; // diff vs static baseline
  isActive: boolean; // posted in last 7 days
  lastFetchedAt: string;
}

export type CompetitorStatus = "threat" | "watch" | "behind";

export interface CompetitorUpdate {
  id: string;
  competitorName: string;
  school: string;
  xHandle: string;
  updateType: "follower_spike" | "new_post" | "high_engagement" | "went_inactive";
  description: string;
  jacobComparison: string;
  detectedAt: string;
  status: CompetitorStatus;
}

export interface CompetitorComparison {
  jacobFollowers: number;
  jacobPostsPerWeek: number;
  jacobEngagementRate: number;
  competitors: CompetitorComparisonRow[];
  jacobRank: number; // 1-based rank by followers among all tracked
  jacobAdvantages: string[];
  jacobGaps: string[];
  comparisonDate: string;
}

export interface CompetitorComparisonRow {
  name: string;
  school: string;
  xHandle: string | null;
  followers: number;
  postsPerWeek: number;
  engagementRate: number;
  hasXPresence: boolean;
  isAheadOfJacob: boolean;
  jacobEdge: string;
}

// ─── Live Competitor Fetcher ──────────────────────────────────────────────────

/**
 * Fetches live X data for all competitors who have an X handle.
 * Returns the competitor list enriched with live metrics.
 * Falls back to static baseline data for competitors that cannot be reached.
 */
export async function getCompetitorUpdates(): Promise<CompetitorUpdate[]> {
  const updates: CompetitorUpdate[] = [];
  const activeCompetitors = getActiveCompetitors(); // only those with X handles
  const fetchedAt = new Date().toISOString();

  for (const competitor of activeCompetitors) {
    if (!competitor.xHandle) continue;

    try {
      const handle = competitor.xHandle.replace("@", "");
      const user: XUser | null = await verifyHandle(handle);

      if (!user) continue;

      const liveFollowers = user.public_metrics?.followers_count ?? competitor.estimatedFollowers;
      const followerDelta = liveFollowers - competitor.estimatedFollowers;

      // Fetch recent tweets to determine posting activity
      const tweets: XTweet[] = await getUserTweets(user.id, 10);
      const weekStart = getWeekStart();
      const recentTweets = tweets.filter((t) => {
        if (!t.created_at) return false;
        return new Date(t.created_at) >= weekStart;
      });

      const postsThisWeek = recentTweets.length;
      const isActive = postsThisWeek > 0;

      // Detect update types
      let status: CompetitorStatus = "behind";
      if (liveFollowers > 100) status = "watch";
      if (liveFollowers > 200) status = "threat";

      if (followerDelta >= 20) {
        updates.push({
          id: `update-follower-${competitor.name.replace(/\s+/g, "-").toLowerCase()}`,
          competitorName: competitor.name,
          school: competitor.school,
          xHandle: competitor.xHandle,
          updateType: "follower_spike",
          description: `${competitor.name} gained ${followerDelta} new followers (now at ${liveFollowers})`,
          jacobComparison: competitor.jacobAdvantage,
          detectedAt: fetchedAt,
          status,
        });
      }

      if (!isActive && competitor.postingFrequency !== "None") {
        updates.push({
          id: `update-inactive-${competitor.name.replace(/\s+/g, "-").toLowerCase()}`,
          competitorName: competitor.name,
          school: competitor.school,
          xHandle: competitor.xHandle,
          updateType: "went_inactive",
          description: `${competitor.name} posted 0 times this week — consistency gap opening`,
          jacobComparison: "Jacob's daily cadence now has a larger advantage",
          detectedAt: fetchedAt,
          status: "behind",
        });
      }

      if (postsThisWeek >= 4) {
        updates.push({
          id: `update-active-${competitor.name.replace(/\s+/g, "-").toLowerCase()}`,
          competitorName: competitor.name,
          school: competitor.school,
          xHandle: competitor.xHandle,
          updateType: "new_post",
          description: `${competitor.name} posted ${postsThisWeek} times this week — increased activity`,
          jacobComparison: competitor.jacobAdvantage,
          detectedAt: fetchedAt,
          status,
        });
      }
    } catch {
      // Rate limited or network error — skip
      continue;
    }
  }

  // If no live updates were generated (e.g., all rate limited),
  // return synthetic updates from the static knowledge base
  if (updates.length === 0) {
    return generateFallbackUpdates(fetchedAt);
  }

  return updates;
}

/**
 * Builds a side-by-side comparison of Jacob vs each tracked competitor.
 * Attempts live lookups; falls back to static baseline data.
 */
export async function getCompetitorComparison(
  jacobCurrentFollowers: number = 47,
  jacobPostsPerWeek: number = 4,
  jacobEngagementRate: number = 6.2
): Promise<CompetitorComparison> {
  const comparisonDate = new Date().toISOString();
  const rows: CompetitorComparisonRow[] = [];

  for (const competitor of competitorIntel) {
    let liveFollowers = competitor.estimatedFollowers;

    // Attempt live lookup for competitors with X handles
    if (competitor.xHandle) {
      try {
        const handle = competitor.xHandle.replace("@", "");
        const user: XUser | null = await verifyHandle(handle);
        if (user?.public_metrics) {
          liveFollowers = user.public_metrics.followers_count;
        }
      } catch {
        // Use static baseline
      }
    }

    // Derive posts per week from posting frequency string
    const postsPerWeek = parsePostingFrequency(competitor.postingFrequency);

    rows.push({
      name: competitor.name,
      school: competitor.school,
      xHandle: competitor.xHandle,
      followers: liveFollowers,
      postsPerWeek,
      engagementRate: 0, // Not available without detailed tweet data
      hasXPresence: competitor.xHandle !== null,
      isAheadOfJacob: liveFollowers > jacobCurrentFollowers,
      jacobEdge: competitor.jacobAdvantage,
    });
  }

  // Sort by followers descending
  rows.sort((a, b) => b.followers - a.followers);

  // Calculate Jacob's rank
  const jacobRank =
    rows.filter((r) => r.followers > jacobCurrentFollowers).length + 1;

  // Identify clear advantages and gaps
  const jacobAdvantages = buildJacobAdvantages(rows, jacobCurrentFollowers, jacobPostsPerWeek);
  const jacobGaps = buildJacobGaps(rows, jacobCurrentFollowers, jacobPostsPerWeek);

  return {
    jacobFollowers: jacobCurrentFollowers,
    jacobPostsPerWeek,
    jacobEngagementRate,
    competitors: rows,
    jacobRank,
    jacobAdvantages,
    jacobGaps,
    comparisonDate,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

/**
 * Parses a human-readable posting frequency string into a numeric
 * posts-per-week estimate.
 */
function parsePostingFrequency(frequency: string): number {
  if (!frequency || frequency === "None" || frequency.toLowerCase().includes("none")) return 0;
  if (frequency.toLowerCase().includes("sporadic")) return 0.5;

  // Match patterns like "4-5 posts/week", "2-3 posts/month", "1-2 posts/week"
  const weekMatch = frequency.match(/(\d+)-?(\d+)?\s*posts?\/(week|wk)/i);
  if (weekMatch) {
    const low = parseInt(weekMatch[1], 10);
    const high = weekMatch[2] ? parseInt(weekMatch[2], 10) : low;
    return (low + high) / 2;
  }

  const monthMatch = frequency.match(/(\d+)-?(\d+)?\s*posts?\/(month|mo)/i);
  if (monthMatch) {
    const low = parseInt(monthMatch[1], 10);
    const high = monthMatch[2] ? parseInt(monthMatch[2], 10) : low;
    return ((low + high) / 2) / 4.3; // convert to per-week
  }

  return 1; // default
}

function buildJacobAdvantages(
  rows: CompetitorComparisonRow[],
  jacobFollowers: number,
  jacobPostsPerWeek: number
): string[] {
  const advantages: string[] = [];

  const withoutX = rows.filter((r) => !r.hasXPresence).length;
  if (withoutX > 0) {
    advantages.push(`${withoutX} of ${rows.length} competitors have NO X presence — invisible to coaches`);
  }

  const lowCadence = rows.filter((r) => r.postsPerWeek < jacobPostsPerWeek && r.hasXPresence).length;
  if (lowCadence > 0) {
    advantages.push(`${lowCadence} active competitors post less frequently than Jacob's ${jacobPostsPerWeek}x/week cadence`);
  }

  const behind = rows.filter((r) => r.followers <= jacobFollowers).length;
  if (behind > 0) {
    advantages.push(`${behind} competitors have fewer followers than Jacob right now`);
  }

  advantages.push("Systematic DM strategy — most competitors have no coach outreach plan");
  advantages.push("Optimized profile with bio, pinned post, and recruiter-ready positioning");

  return advantages;
}

function buildJacobGaps(
  rows: CompetitorComparisonRow[],
  jacobFollowers: number,
  jacobPostsPerWeek: number
): string[] {
  const gaps: string[] = [];

  const ahead = rows.filter((r) => r.followers > jacobFollowers && r.hasXPresence);
  if (ahead.length > 0) {
    const top = ahead[0];
    gaps.push(`${top.name} leads with ${top.followers} followers — close the gap through consistent posting`);
  }

  const highCadence = rows.filter((r) => r.postsPerWeek >= jacobPostsPerWeek);
  if (highCadence.length > 0) {
    gaps.push(`${highCadence.length} competitor(s) match or exceed Jacob's posting frequency — maintain the edge`);
  }

  if (jacobFollowers < 100) {
    gaps.push("Follower count still building — focus on coach follows over raw numbers");
  }

  return gaps;
}

/**
 * Generates fallback update objects from static knowledge base data.
 * Used when live API calls fail or are rate-limited.
 */
function generateFallbackUpdates(fetchedAt: string): CompetitorUpdate[] {
  const activeCompetitors = getActiveCompetitors();

  return activeCompetitors.slice(0, 3).map((c) => ({
    id: `fallback-${c.name.replace(/\s+/g, "-").toLowerCase()}`,
    competitorName: c.name,
    school: c.school,
    xHandle: c.xHandle ?? "",
    updateType: "new_post" as const,
    description: `${c.name} (${c.school}): ~${c.estimatedFollowers} followers, ${c.postingFrequency}`,
    jacobComparison: c.jacobAdvantage,
    detectedAt: fetchedAt,
    status: c.estimatedFollowers > 100 ? ("watch" as CompetitorStatus) : ("behind" as CompetitorStatus),
  }));
}
