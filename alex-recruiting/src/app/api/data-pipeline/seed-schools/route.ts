/**
 * Data Pipeline — Seed All D2 & D3 Schools
 *
 * POST: Imports d2Schools (161) and d3Schools (244) from static data files
 *       and upserts them all into the schools_v2 Supabase table.
 *
 * GET:  Returns current school counts by division for verification.
 *
 * Protected by CRON_SECRET via Authorization: Bearer header.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { d2Schools } from "@/lib/data/d2-schools";
import { d3Schools } from "@/lib/data/d3-schools";

export const dynamic = "force-dynamic";

// ---------- Helpers ----------

function validateAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // no secret configured = allow (dev mode)
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

/** Generate a URL-safe slug from a school name */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}

const BATCH_SIZE = 100;

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
  let d2Inserted = 0;
  let d3Inserted = 0;

  // ---------- Map D2 schools ----------

  const d2Rows = d2Schools.map((s) => ({
    slug: generateSlug(s.name),
    name: s.name,
    mascot: s.mascot,
    division: "D2",
    conference: s.conference,
    city: s.city,
    state: s.state,
    athletics_url: s.athleticsUrl,
    staff_url: s.staffUrl,
    updated_at: new Date().toISOString(),
  }));

  // ---------- Map D3 schools ----------

  const d3Rows = d3Schools.map((s) => ({
    slug: generateSlug(s.name),
    name: s.name,
    mascot: s.mascot,
    division: "D3",
    conference: s.conference,
    city: s.city,
    state: s.state,
    athletics_url: s.athleticsUrl,
    staff_url: s.staffUrl,
    updated_at: new Date().toISOString(),
  }));

  // ---------- Upsert D2 in batches ----------

  const d2Batches = chunk(d2Rows, BATCH_SIZE);
  for (const batch of d2Batches) {
    const { data, error } = await supabase
      .from("schools_v2")
      .upsert(batch, { onConflict: "slug", ignoreDuplicates: false })
      .select("slug");

    if (error) {
      errors.push(`D2 batch error: ${error.message}`);
    } else {
      d2Inserted += data?.length ?? 0;
    }
  }

  // ---------- Upsert D3 in batches ----------

  const d3Batches = chunk(d3Rows, BATCH_SIZE);
  for (const batch of d3Batches) {
    const { data, error } = await supabase
      .from("schools_v2")
      .upsert(batch, { onConflict: "slug", ignoreDuplicates: false })
      .select("slug");

    if (error) {
      errors.push(`D3 batch error: ${error.message}`);
    } else {
      d3Inserted += data?.length ?? 0;
    }
  }

  const total = d2Inserted + d3Inserted;

  return NextResponse.json({
    ok: errors.length === 0,
    message: `Seeded ${total} schools (${d2Inserted} D2, ${d3Inserted} D3)${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
    d2Inserted,
    d3Inserted,
    total,
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

  // Count by division
  const [d1Res, d2Res, d3Res, totalRes] = await Promise.all([
    supabase.from("schools_v2").select("slug", { count: "exact", head: true }).or("division.eq.FBS,division.eq.FCS,division.eq.D1"),
    supabase.from("schools_v2").select("slug", { count: "exact", head: true }).eq("division", "D2"),
    supabase.from("schools_v2").select("slug", { count: "exact", head: true }).eq("division", "D3"),
    supabase.from("schools_v2").select("slug", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    ok: true,
    counts: {
      d1: d1Res.count ?? 0,
      d2: d2Res.count ?? 0,
      d3: d3Res.count ?? 0,
      total: totalRes.count ?? 0,
    },
    expected: {
      d2: d2Schools.length,
      d3: d3Schools.length,
    },
  });
}
