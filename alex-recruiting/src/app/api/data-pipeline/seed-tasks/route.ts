/**
 * Data Pipeline — Seed Tasks (30-Day Schedule)
 *
 * POST: Imports taskSchedule30d from static data
 *       and upserts them into the rec_tasks table.
 *
 * GET:  Returns current task counts for verification.
 *
 * Protected by CRON_SECRET via Authorization: Bearer header.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { taskSchedule30d } from "@/lib/data/task-schedule-30d";

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

/** Map priority 1-3 scale to 1-5 scale: 1 -> 5, 2 -> 3, 3 -> 1 */
function mapPriority(p: 1 | 2 | 3): number {
  const map: Record<number, number> = { 1: 5, 2: 3, 3: 1 };
  return map[p];
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
  let tasksSeeded = 0;

  // ---------- Map task schedule to rec_tasks table ----------

  const taskRows = taskSchedule30d.map((t) => ({
    id: t.id,
    assigned_to: "jacob",
    title: t.title,
    description: `${t.description} [Scheduled: ${t.date} ${t.time}]`,
    status: "pending",
    priority: mapPriority(t.priority),
    created_at: `${t.date}T${t.time}:00`,
  }));

  // ---------- Upsert tasks in batches ----------

  const taskBatches = chunk(taskRows, BATCH_SIZE);
  for (const batch of taskBatches) {
    const { data, error } = await supabase
      .from("rec_tasks")
      .upsert(batch, { onConflict: "id", ignoreDuplicates: false })
      .select("id");

    if (error) {
      errors.push(`Tasks batch error: ${error.message}`);
    } else {
      tasksSeeded += data?.length ?? 0;
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    tasks_seeded: tasksSeeded,
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

  const { count } = await supabase
    .from("rec_tasks")
    .select("id", { count: "exact", head: true });

  return NextResponse.json({
    ok: true,
    counts: {
      tasks: count ?? 0,
    },
    expected: {
      tasks: taskSchedule30d.length,
    },
  });
}
