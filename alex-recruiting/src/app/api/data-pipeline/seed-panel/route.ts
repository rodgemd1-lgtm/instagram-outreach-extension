/**
 * Data Pipeline — Seed Coach Panel
 *
 * POST: Imports panelCoachesData and panelSurveysSeed from static data
 *       and upserts them into panel_coaches and panel_surveys tables.
 *
 * GET:  Returns current panel coach and survey counts for verification.
 *
 * Protected by CRON_SECRET via Authorization: Bearer header.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { panelCoachesData } from "@/lib/data/panel-coaches";
import { panelSurveysSeed } from "@/lib/data/panel-surveys-seed";

// ---------- Helpers ----------

function validateAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // no secret configured = allow (dev mode)
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

const BATCH_SIZE = 50;

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
  let coachesInserted = 0;
  let surveysInserted = 0;

  // ---------- 1. Upsert panel coaches ----------

  const coachRows = panelCoachesData.map((c) => ({
    name: c.name,
    school: c.school,
    division: c.division,
    role: c.position_coached,
    status: c.status,
    panel_round: 1,
  }));

  const coachBatches = chunk(coachRows, BATCH_SIZE);
  for (const batch of coachBatches) {
    const { data, error } = await supabase
      .from("panel_coaches")
      .upsert(batch, { onConflict: "name,school", ignoreDuplicates: false })
      .select("id, name");

    if (error) {
      errors.push(`Panel coaches batch error: ${error.message}`);
    } else {
      coachesInserted += data?.length ?? 0;
    }
  }

  // ---------- 2. Build coach name → id lookup ----------

  const { data: allCoaches, error: lookupError } = await supabase
    .from("panel_coaches")
    .select("id, name");

  if (lookupError) {
    errors.push(`Coach lookup error: ${lookupError.message}`);
    return NextResponse.json({
      ok: false,
      coaches: coachesInserted,
      surveys: 0,
      errors,
    });
  }

  const coachIdByName: Record<string, string> = {};
  for (const c of allCoaches ?? []) {
    coachIdByName[c.name] = c.id;
  }

  // ---------- 3. Upsert panel surveys ----------

  const surveyRows = panelSurveysSeed
    .filter((s) => coachIdByName[s.coach_name]) // skip if coach not found
    .map((s) => ({
      panel_coach_id: coachIdByName[s.coach_name],
      would_recruit: s.would_recruit,
      what_convinced: s.what_convinced,
      what_almost_made_leave: s.what_almost_made_leave,
      comparison_score: s.comparison_score,
    }));

  const surveyBatches = chunk(surveyRows, BATCH_SIZE);
  for (const batch of surveyBatches) {
    const { data, error } = await supabase
      .from("panel_surveys")
      .upsert(batch, { onConflict: "panel_coach_id,would_recruit", ignoreDuplicates: false })
      .select("id");

    if (error) {
      // If upsert on composite fails, fall back to insert
      const { data: insertData, error: insertError } = await supabase
        .from("panel_surveys")
        .insert(batch)
        .select("id");

      if (insertError) {
        errors.push(`Panel surveys batch error: ${insertError.message}`);
      } else {
        surveysInserted += insertData?.length ?? 0;
      }
    } else {
      surveysInserted += data?.length ?? 0;
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    coaches: coachesInserted,
    surveys: surveysInserted,
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

  const [coachRes, surveyRes] = await Promise.all([
    supabase.from("panel_coaches").select("id", { count: "exact", head: true }),
    supabase.from("panel_surveys").select("id", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    ok: true,
    counts: {
      panelCoaches: coachRes.count ?? 0,
      panelSurveys: surveyRes.count ?? 0,
    },
    expected: {
      coaches: panelCoachesData.length,
      surveys: panelSurveysSeed.length,
    },
  });
}
