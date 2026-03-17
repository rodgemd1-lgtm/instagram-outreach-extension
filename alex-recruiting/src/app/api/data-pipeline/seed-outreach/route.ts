/**
 * Data Pipeline — Seed Outreach Schedule (60-Day)
 *
 * POST: Imports the 60-day outreach schedule into agent_actions and dm_messages
 *       tables via upsert.
 *
 * GET:  Returns current counts for verification.
 *
 * Protected by CRON_SECRET via Authorization: Bearer header.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { outreachSchedule60d } from "@/lib/data/outreach-schedule-60d";

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

/** Map wave number to priority: wave 0 = 5, wave 1 = 4, wave 2 = 3, wave 3 = 2 */
function waveToPriority(wave: number): number {
  return 5 - wave;
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
  let actionsSeeded = 0;
  let dmsSeeded = 0;

  // ---------- Map outreach schedule to agent_actions table ----------

  const actionRows = outreachSchedule60d.map((a) => ({
    id: a.id,
    agent_id: "outreach-scheduler",
    run_id: "seed-outreach-60d",
    action_type: a.action_type,
    title: `${a.coach_name} — ${a.action_type}`,
    description: a.template || a.notes,
    payload: {
      wave: a.wave,
      step_number: a.step_number,
      coach_slug: a.coach_slug,
      school: a.school,
      scheduled_date: a.scheduled_date,
      follow_back_check_date: a.follow_back_check_date,
    },
    status: "pending_approval",
    priority: waveToPriority(a.wave),
  }));

  // ---------- Upsert agent_actions in batches ----------

  const actionBatches = chunk(actionRows, BATCH_SIZE);
  for (const batch of actionBatches) {
    const { data, error } = await supabase
      .from("agent_actions")
      .upsert(batch, { onConflict: "id", ignoreDuplicates: false })
      .select("id");

    if (error) {
      errors.push(`agent_actions batch error: ${error.message}`);
    } else {
      actionsSeeded += data?.length ?? 0;
    }
  }

  // ---------- Map DM-type actions to dm_messages table ----------

  const dmActions = outreachSchedule60d.filter((a) => a.action_type === "dm");

  const dmRows = dmActions.map((a) => ({
    coach_name: a.coach_name,
    school_name: a.school,
    template_type: "outreach_dm",
    content: a.template,
    status: "drafted",
  }));

  // ---------- Upsert dm_messages in batches ----------

  const dmBatches = chunk(dmRows, BATCH_SIZE);
  for (const batch of dmBatches) {
    const { data, error } = await supabase
      .from("dm_messages")
      .upsert(batch, { onConflict: "coach_name,template_type", ignoreDuplicates: false })
      .select("coach_name");

    if (error) {
      errors.push(`dm_messages batch error: ${error.message}`);
    } else {
      dmsSeeded += data?.length ?? 0;
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    actions_seeded: actionsSeeded,
    dms_seeded: dmsSeeded,
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

  const dmCount = outreachSchedule60d.filter((a) => a.action_type === "dm").length;

  const [actionsRes, dmsRes] = await Promise.all([
    supabase.from("agent_actions").select("id", { count: "exact", head: true }).eq("run_id", "seed-outreach-60d"),
    supabase.from("dm_messages").select("coach_name", { count: "exact", head: true }).eq("template_type", "outreach_dm"),
  ]);

  if (actionsRes.error || dmsRes.error) {
    return NextResponse.json(
      { ok: false, error: actionsRes.error?.message || dmsRes.error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    counts: {
      actions: actionsRes.count ?? 0,
      dms: dmsRes.count ?? 0,
    },
    expected: {
      actions: outreachSchedule60d.length,
      dms: dmCount,
    },
  });
}
