/**
 * Data Pipeline — Seed Intelligence Data
 *
 * POST: Imports competitorIntel (15 competitor profiles) into competitor_recruits
 *       and generates 30 days of growth_snapshots (follower progression 47 -> ~90).
 *
 * GET:  Returns current counts for verification.
 *
 * Protected by CRON_SECRET via Authorization: Bearer header.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { competitorIntel } from "@/lib/rec/knowledge/competitor-intel";

export const dynamic = "force-dynamic";

// ---------- Helpers ----------

function validateAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // no secret configured = allow (dev mode)
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

const BATCH_SIZE = 50;

/** Split an array into chunks of `size` */
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/** Generate 30 days of mock analytics snapshots */
function generateAnalyticsSnapshots(): {
  follower_count: number;
  following_count: number;
  engagement_rate: number;
  posts_this_week: number;
  dms_this_week: number;
  snapshot_date: string;
}[] {
  const snapshots = [];
  const startFollowers = 47;
  const endFollowers = 90;
  const days = 30;
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));

    // Organic-looking growth curve (slightly exponential with noise)
    const progress = i / (days - 1);
    const baseFollowers = startFollowers + (endFollowers - startFollowers) * (progress * progress * 0.3 + progress * 0.7);
    const noise = Math.round((Math.random() - 0.3) * 2); // slight upward bias
    const followers = Math.round(baseFollowers) + noise;

    // Following count grows from ~30 to ~120 (coaches + peers)
    const following = Math.round(30 + 90 * progress + (Math.random() - 0.5) * 5);

    // Engagement rate fluctuates between 3-8%
    const engagementRate = 3 + Math.random() * 5;

    // Posts per week: 3-5
    const postsThisWeek = Math.floor(3 + Math.random() * 3);

    // DMs per week: 0-3
    const dmsThisWeek = Math.floor(Math.random() * 4);

    snapshots.push({
      follower_count: Math.max(startFollowers, followers),
      following_count: following,
      engagement_rate: Math.round(engagementRate * 100) / 100,
      posts_this_week: postsThisWeek,
      dms_this_week: dmsThisWeek,
      snapshot_date: date.toISOString(),
    });
  }

  return snapshots;
}

// ---------- POST Handler ----------

export async function POST(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }

  const supabase = createAdminClient();
  const errors: string[] = [];
  let competitorsInserted = 0;
  let snapshotsInserted = 0;

  // ---------- Map competitor profiles to competitor_recruits ----------

  const competitorRows = competitorIntel.map((c) => ({
    name: c.name,
    x_handle: c.xHandle,
    position: c.position,
    class_year: c.classYear,
    school: c.school,
    state: c.state,
    height: c.height,
    weight: c.weight,
    follower_count: c.estimatedFollowers,
    post_cadence: c.postingFrequency.includes("week")
      ? parseFloat(c.postingFrequency) || 1
      : c.postingFrequency.includes("month")
        ? 0.25
        : 0,
    engagement_rate: 0,
    top_content_types: c.strengths,
    school_interest_signals: [c.jacobAdvantage],
    last_updated: new Date().toISOString(),
  }));

  // ---------- Upsert competitors ----------

  const competitorBatches = chunk(competitorRows, BATCH_SIZE);
  for (const batch of competitorBatches) {
    const { data, error } = await supabase
      .from("competitor_recruits")
      .upsert(batch, { onConflict: "name", ignoreDuplicates: false })
      .select("name");

    if (error) {
      errors.push(`Competitors batch error: ${error.message}`);
    } else {
      competitorsInserted += data?.length ?? 0;
    }
  }

  // ---------- Generate and insert analytics snapshots ----------

  const snapshots = generateAnalyticsSnapshots();

  const snapshotBatches = chunk(snapshots, BATCH_SIZE);
  for (const batch of snapshotBatches) {
    const { data, error } = await supabase
      .from("growth_snapshots")
      .upsert(batch, { onConflict: "snapshot_date", ignoreDuplicates: false })
      .select("follower_count");

    if (error) {
      errors.push(`Snapshots batch error: ${error.message}`);
    } else {
      snapshotsInserted += data?.length ?? 0;
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    competitors: competitorsInserted,
    analytics_snapshots: snapshotsInserted,
    errors: errors.length > 0 ? errors : undefined,
  });
}

// ---------- GET Handler ----------

export async function GET(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }

  const supabase = createAdminClient();

  const [competitorsRes, snapshotsRes] = await Promise.all([
    supabase.from("competitor_recruits").select("name", { count: "exact", head: true }),
    supabase.from("growth_snapshots").select("follower_count", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    ok: true,
    counts: {
      competitors: competitorsRes.count ?? 0,
      analytics_snapshots: snapshotsRes.count ?? 0,
    },
    expected: {
      competitors: competitorIntel.length,
      analytics_snapshots: 30,
    },
  });
}
