/**
 * Data Pipeline — Seed Peer Follow Targets & Growth Milestones
 *
 * POST: Imports peerFollowTargets (60 strategic accounts) into engagement_actions
 *       and seeds 4 projected growth milestones into growth_snapshots.
 *
 * GET:  Returns current counts for verification.
 *
 * Protected by CRON_SECRET via Authorization: Bearer header.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { peerFollowTargets, followerGrowthTargets } from "@/lib/data/peer-follow-targets";

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
  let peersSeeded = 0;
  let milestonesSeeded = 0;

  // ---------- Map peer follow targets to engagement_actions ----------

  const peerRows = peerFollowTargets.map((p) => ({
    target_handle: p.handle,
    target_category: p.category,
    action_type: p.engagement_strategy,
    content: p.bio_snippet,
    result_follower_gain: null as number | null,
  }));

  // ---------- Upsert peers in batches ----------

  const peerBatches = chunk(peerRows, BATCH_SIZE);
  for (const batch of peerBatches) {
    const { data, error } = await supabase
      .from("engagement_actions")
      .upsert(batch, { onConflict: "target_handle", ignoreDuplicates: false })
      .select("target_handle");

    if (error) {
      errors.push(`Peers batch error: ${error.message}`);
    } else {
      peersSeeded += data?.length ?? 0;
    }
  }

  // ---------- Seed growth milestones into growth_snapshots ----------

  const now = new Date();
  const milestoneRows = [
    { week: 0, follower_count: followerGrowthTargets.baseline },
    { week: 4, follower_count: followerGrowthTargets.week4 },
    { week: 8, follower_count: followerGrowthTargets.week8 },
    { week: 12, follower_count: followerGrowthTargets.week12 },
  ].map((m) => {
    const snapshotDate = new Date(now);
    snapshotDate.setDate(snapshotDate.getDate() + m.week * 7);
    return {
      follower_count: m.follower_count,
      coach_followers: null as number | null,
      following_count: null as number | null,
      engagement_rate: null as number | null,
      posts_this_week: null as number | null,
      dms_this_week: null as number | null,
      snapshot_date: snapshotDate.toISOString(),
    };
  });

  const { data: milestoneData, error: milestoneError } = await supabase
    .from("growth_snapshots")
    .upsert(milestoneRows, { onConflict: "snapshot_date", ignoreDuplicates: false })
    .select("snapshot_date");

  if (milestoneError) {
    errors.push(`Milestones error: ${milestoneError.message}`);
  } else {
    milestonesSeeded = milestoneData?.length ?? 0;
  }

  return NextResponse.json({
    ok: errors.length === 0,
    peers_seeded: peersSeeded,
    milestones_seeded: milestonesSeeded,
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

  const [peersRes, milestonesRes] = await Promise.all([
    supabase.from("engagement_actions").select("target_handle", { count: "exact", head: true }),
    supabase.from("growth_snapshots").select("snapshot_date", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    ok: true,
    counts: {
      peers: peersRes.count ?? 0,
      milestones: milestonesRes.count ?? 0,
    },
    expected: {
      peers: peerFollowTargets.length,
      milestones: 4,
    },
  });
}
