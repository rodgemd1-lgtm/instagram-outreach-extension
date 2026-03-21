/**
 * Data Pipeline — Seed Outreach Learnings
 *
 * POST: Imports 4 weeks of mock learning history and upserts them
 *       into the outreach_learnings Supabase table.
 *
 * GET:  Returns current count of learning entries for verification.
 *
 * Protected by CRON_SECRET via Authorization: Bearer header.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { learningHistoryMock } from "@/lib/data/learning-history-mock";

export const dynamic = "force-dynamic";

// ---------- Helpers ----------

function validateAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
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
  let inserted = 0;

  // Map mock data to database row format
  const rows = learningHistoryMock.map((w) => ({
    week_number: w.week_number,
    week_start: w.week_start,
    week_end: w.week_end,
    what_worked: w.what_worked,
    what_didnt: w.what_didnt,
    what_to_try: w.what_to_try,
    metrics: w.metrics,
    strategy_adjustments: w.strategy_adjustments,
    ab_test_results: w.ab_test_results,
    generated_by: w.generated_by,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("outreach_learnings")
    .upsert(rows, { onConflict: "week_number", ignoreDuplicates: false })
    .select("id");

  if (error) {
    errors.push(`Upsert error: ${error.message}`);
  } else {
    inserted = data?.length ?? 0;
  }

  return NextResponse.json({
    ok: errors.length === 0,
    message: `Seeded ${inserted} learning entries${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
    inserted,
    total: learningHistoryMock.length,
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

  const { count, error } = await supabase
    .from("outreach_learnings")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    counts: {
      learnings: count ?? 0,
    },
    expected: learningHistoryMock.length,
  });
}
