/**
 * Data Pipeline — Seed Content Calendar
 *
 * POST: Imports contentCalendar30d (17 scheduled posts) from static data
 *       and upserts them into the posts table.
 *
 * GET:  Returns current post counts for verification.
 *
 * Protected by CRON_SECRET via Authorization: Bearer header.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { contentCalendar30d } from "@/lib/data/content-calendar-30d";

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
  let postsInserted = 0;

  // ---------- Map content calendar to posts table ----------

  const postRows = contentCalendar30d.map((p) => ({
    content: p.draft_text,
    pillar: p.pillar,
    hashtags: p.hashtags,
    scheduled_for: p.scheduled_time,
    status: "draft",
    media_url: null as string | null,
    best_time: p.scheduled_time.includes("T23:00") ? "6:00 PM CT" : null,
  }));

  // ---------- Upsert posts in batches ----------

  const postBatches = chunk(postRows, BATCH_SIZE);
  for (const batch of postBatches) {
    const { data, error } = await supabase
      .from("posts")
      .upsert(batch, { onConflict: "content", ignoreDuplicates: false })
      .select("content");

    if (error) {
      errors.push(`Posts batch error: ${error.message}`);
    } else {
      postsInserted += data?.length ?? 0;
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    posts: postsInserted,
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

  const [totalRes, draftRes] = await Promise.all([
    supabase.from("posts").select("content", { count: "exact", head: true }),
    supabase.from("posts").select("content", { count: "exact", head: true }).eq("status", "draft"),
  ]);

  return NextResponse.json({
    ok: true,
    counts: {
      total: totalRes.count ?? 0,
      drafts: draftRes.count ?? 0,
    },
    expected: {
      posts: contentCalendar30d.length,
    },
  });
}
