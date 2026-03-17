import { NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const supabase = createAdminClient();

    const [snapshots, windows, engagement, coachProfiles] = await Promise.all([
      supabase
        .from("growth_snapshots")
        .select("*")
        .order("snapshot_date", { ascending: true })
        .limit(90),
      supabase
        .from("posting_windows")
        .select("*")
        .order("score", { ascending: false }),
      supabase
        .from("engagement_log")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50),
      supabase
        .from("coach_behavior_profiles")
        .select("*")
        .order("dm_open_probability", { ascending: false })
        .limit(20),
    ]);

    const latestSnapshot = snapshots.data?.[snapshots.data.length - 1] ?? null;
    const prevSnapshot = snapshots.data?.[snapshots.data.length - 2] ?? null;

    return NextResponse.json({
      snapshots: snapshots.data ?? [],
      postingWindows: windows.data ?? [],
      recentEngagement: engagement.data ?? [],
      coachProfiles: coachProfiles.data ?? [],
      summary: {
        currentFollowers: latestSnapshot?.follower_count ?? null,
        followerChange: latestSnapshot && prevSnapshot
          ? (latestSnapshot.follower_count ?? 0) - (prevSnapshot.follower_count ?? 0)
          : null,
        coachFollowers: latestSnapshot?.coach_followers ?? null,
        engagementRate: latestSnapshot?.engagement_rate ?? null,
        postsThisWeek: latestSnapshot?.posts_this_week ?? null,
      },
    });
  } catch (err) {
    console.error("[growth/analytics] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
