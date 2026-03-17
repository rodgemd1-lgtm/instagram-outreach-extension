/**
 * Data Pipeline — Seed Expanded Target Schools + Coaches
 *
 * POST: Imports expandedTargetSchools (40 schools, ~80 coaches) from static data
 *       and upserts them into schools_v2 and coaches tables.
 *
 * GET:  Returns current counts for verification.
 *
 * Protected by CRON_SECRET via Authorization: Bearer header.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { expandedTargetSchools } from "@/lib/data/target-schools-expanded";

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

/** Derive position_type from coach title */
function getPositionType(title: string): string {
  if (title.includes("Head Coach")) return "both";
  if (title.includes("Offensive")) return "OL";
  if (title.includes("Defensive")) return "DL";
  return "OL"; // default
}

/** Map tier number to label */
function getTierLabel(tier: number): string {
  return `Tier ${tier}`;
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
  let schoolsInserted = 0;
  let coachesInserted = 0;

  // ---------- Map schools ----------

  const schoolRows = expandedTargetSchools.map((s) => ({
    slug: s.slug,
    name: s.name,
    mascot: null as string | null,
    division: s.division,
    conference: s.conference,
    city: s.city,
    state: s.state,
    athletics_url: s.athleticsUrl,
    staff_url: null as string | null,
    updated_at: new Date().toISOString(),
  }));

  // ---------- Upsert schools in batches ----------

  const schoolBatches = chunk(schoolRows, BATCH_SIZE);
  for (const batch of schoolBatches) {
    const { data, error } = await supabase
      .from("schools_v2")
      .upsert(batch, { onConflict: "slug", ignoreDuplicates: false })
      .select("slug");

    if (error) {
      errors.push(`Schools batch error: ${error.message}`);
    } else {
      schoolsInserted += data?.length ?? 0;
    }
  }

  // ---------- Map coaches ----------

  const coachRows = expandedTargetSchools.flatMap((s) =>
    s.coaches.map((c) => ({
      name: c.name,
      title: c.title,
      school_slug: s.slug,
      school_name: s.name,
      division: s.division,
      conference: s.conference,
      x_handle: c.xHandle,
      priority_tier: getTierLabel(s.tier),
      position_type: getPositionType(c.title),
      dm_open: false,
      follow_status: "not_followed",
      dm_status: "not_sent",
    }))
  );

  // ---------- Upsert coaches in batches ----------

  const coachBatches = chunk(coachRows, BATCH_SIZE);
  for (const batch of coachBatches) {
    const { data, error } = await supabase
      .from("coaches")
      .upsert(batch, { onConflict: "name,school_slug", ignoreDuplicates: false })
      .select("name");

    if (error) {
      errors.push(`Coaches batch error: ${error.message}`);
    } else {
      coachesInserted += data?.length ?? 0;
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    schools: schoolsInserted,
    coaches: coachesInserted,
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

  const [schoolsRes, coachesRes] = await Promise.all([
    supabase.from("schools_v2").select("slug", { count: "exact", head: true }),
    supabase.from("coaches").select("name", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    ok: true,
    counts: {
      schools: schoolsRes.count ?? 0,
      coaches: coachesRes.count ?? 0,
    },
    expected: {
      schools: expandedTargetSchools.length,
      coaches: expandedTargetSchools.reduce((sum, s) => sum + s.coaches.length, 0),
    },
  });
}
