import { NextResponse } from "next/server";
import type { AnalyticsSnapshot } from "@/lib/types";
import { getDashboardSnapshot } from "@/lib/dashboard/live-data";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

// Force dynamic rendering — never cache this route at build time
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PostRow {
  engagement_rate: number | null;
  x_post_id: string | null;
}

interface DMRow {
  sent_at: string | null;
  responded_at: string | null;
}

interface SnapshotRow {
  date: string;
  total_followers: number | null;
  coach_follows: number | null;
  dms_sent: number | null;
  dm_response_rate: number | null;
  posts_published: number | null;
  avg_engagement_rate: number | null;
  profile_visits: number | null;
  audit_score: number | null;
}

const targets = {
  month1: { followers: 50, coachFollows: 5, dmsSent: 5, dmResponseRate: 20, posts: 16, engagementRate: 3, profileVisits: 100, auditScore: 7 },
  month3: { followers: 200, coachFollows: 20, dmsSent: 15, dmResponseRate: 30, posts: 60, engagementRate: 5, profileVisits: 500, auditScore: 8 },
  month6: { followers: 500, coachFollows: 40, dmsSent: 30, dmResponseRate: 40, posts: 120, engagementRate: 7, profileVisits: 2000, auditScore: 9 },
};

export async function GET() {
  let snapshot;
  try {
    snapshot = await getDashboardSnapshot();
  } catch (err) {
    console.error("[GET /api/analytics] Dashboard snapshot error:", err);
    snapshot = null;
  }

  let postsPublished = 0;
  let avgEngagementRate = snapshot?.engagement.rate ?? 0;
  let dmsSent = snapshot?.weeklyStats.dmsSent ?? 0;
  let dmResponseRate = snapshot?.weeklyStats.responseRate ?? 0;
  let auditScore = 0;
  let history: AnalyticsSnapshot[] = [];
  // Fallback follower/coach counts from analytics_snapshots when X API returns 0
  let totalFollowersFromSnapshot = 0;
  let coachFollowsFromSnapshot = 0;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();

      const [
        postsResponse,
        dmsResponse,
        auditsResponse,
        historyResponse,
      ] = await Promise.all([
        supabase.from("posts").select("engagement_rate, x_post_id"),
        supabase.from("dm_messages").select("sent_at, responded_at"),
        supabase.from("profile_audits").select("total_score").order("date", { ascending: false }).limit(1),
        supabase
          .from("analytics_snapshots")
          .select("date, total_followers, coach_follows, dms_sent, dm_response_rate, posts_published, avg_engagement_rate, profile_visits, audit_score")
          .order("date", { ascending: false })
          .limit(8),
      ]);

      const posts = (postsResponse.data ?? []) as PostRow[];
      // Count all posts that have engagement data OR an x_post_id (published).
      // Also count posts with engagement_rate > 0 as published (they have real data).
      const publishedPosts = posts.filter((post) => post.x_post_id || (post.engagement_rate ?? 0) > 0);
      postsPublished = publishedPosts.length;
      // Fall back to total posts count if none have x_post_id yet
      if (postsPublished === 0 && posts.length > 0) {
        postsPublished = posts.length;
      }
      const withEngagement = posts.filter((post) => (post.engagement_rate ?? 0) > 0);
      if (withEngagement.length > 0) {
        avgEngagementRate = Number(
          (
            withEngagement.reduce((sum, post) => sum + (post.engagement_rate ?? 0), 0) /
            withEngagement.length
          ).toFixed(1)
        );
      }

      const dms = (dmsResponse.data ?? []) as DMRow[];
      const sentCount = dms.filter((dm) => dm.sent_at).length;
      const respondedCount = dms.filter((dm) => dm.responded_at).length;
      if (sentCount > 0) {
        dmsSent = sentCount;
        dmResponseRate = Math.round((respondedCount / sentCount) * 100);
      }

      auditScore = Number(auditsResponse.data?.[0]?.total_score ?? 0);

      const snapshotRows = (historyResponse.data ?? []) as SnapshotRow[];
      history = snapshotRows.map((row) => ({
        date: row.date,
        totalFollowers: row.total_followers ?? 0,
        coachFollows: row.coach_follows ?? 0,
        dmsSent: row.dms_sent ?? 0,
        dmResponseRate: row.dm_response_rate ?? 0,
        postsPublished: row.posts_published ?? 0,
        avgEngagementRate: row.avg_engagement_rate ?? 0,
        profileVisits: row.profile_visits ?? 0,
        auditScore: (row.audit_score ?? 0) as AnalyticsSnapshot["auditScore"],
      }));

      // Use the most recent analytics_snapshots row as fallback for follower counts
      // when the X API is unavailable or returns 0.
      if (snapshotRows.length > 0) {
        totalFollowersFromSnapshot = snapshotRows[0].total_followers ?? 0;
        coachFollowsFromSnapshot = snapshotRows[0].coach_follows ?? 0;
      }
    } catch (err) {
      console.error("[GET /api/analytics] Supabase error, using fallback data:", err);
    }
  }

  // Prefer live X API data; fall back to analytics_snapshots when X API returns 0
  const liveFollowers = snapshot?.followers.count ?? 0;
  const liveCoachFollows = snapshot?.coachFollows.count ?? 0;

  const current: AnalyticsSnapshot = {
    date: new Date().toISOString(),
    totalFollowers: liveFollowers > 0 ? liveFollowers : totalFollowersFromSnapshot,
    coachFollows: liveCoachFollows > 0 ? liveCoachFollows : coachFollowsFromSnapshot,
    dmsSent,
    dmResponseRate,
    postsPublished,
    avgEngagementRate,
    profileVisits: snapshot?.weeklyStats.profileVisits ?? 0,
    auditScore: auditScore as AnalyticsSnapshot["auditScore"],
  };

  return NextResponse.json({
    current,
    history: history.length > 0 ? history : [current],
    targets,
    meta: {
      lastUpdated: new Date().toISOString(),
    },
  });
}
