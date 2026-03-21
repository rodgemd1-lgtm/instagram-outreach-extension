/**
 * Data Pipeline — CFBD (College Football Data) API Route
 *
 * POST /api/data-pipeline/cfbd
 *
 * Triggers a full pull of all FBS and FCS teams + their head coaches from
 * the CollegeFootballData.com API, then upserts results into Supabase
 * "schools" and "coaches" tables.
 *
 * Request body (optional):
 *   { year?: number }  — coaching year to fetch (defaults to current year)
 *
 * Protected by CRON_SECRET via Authorization: Bearer header.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase/admin";
import {
  fetchAllFBSFCSData,
  type NormalizedTeam,
  type NormalizedCoach,
} from "@/lib/integrations/cfbd";

export const dynamic = "force-dynamic";

// ─── Auth guard ──────────────────────────────────────────────────────────────

function validateAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // In dev, if CRON_SECRET is not set, allow requests
  if (!cronSecret) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[cfbd-pipeline] CRON_SECRET not set — allowing request (dev mode)",
      );
      return true;
    }
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.replace(/^Bearer\s+/i, "");
  return token === cronSecret;
}

// ─── Supabase upsert helpers ────────────────────────────────────────────────

async function upsertSchools(teams: NormalizedTeam[]): Promise<{
  inserted: number;
  updated: number;
  errors: string[];
}> {
  if (!isSupabaseConfigured()) {
    return { inserted: 0, updated: 0, errors: ["Supabase not configured"] };
  }

  const supabase = createAdminClient();
  let inserted = 0;
  let updated = 0;
  const errors: string[] = [];

  // Batch upsert in chunks of 50 to avoid payload limits
  const chunkSize = 50;
  for (let i = 0; i < teams.length; i += chunkSize) {
    const chunk = teams.slice(i, i + chunkSize);

    const rows = chunk.map((t) => ({
      slug: t.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""),
      name: t.name,
      mascot: t.mascot,
      conference: t.conference,
      division: t.division,
      city: t.city,
      state: t.state,
      logo_url: t.logo_url,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("schools_v2")
      .upsert(rows, { onConflict: "slug", ignoreDuplicates: false })
      .select("id");

    if (error) {
      errors.push(`Schools batch ${i / chunkSize + 1}: ${error.message}`);
    } else {
      // Supabase upsert doesn't distinguish inserted vs updated,
      // so count all as "upserted"
      inserted += data?.length ?? 0;
    }
  }

  return { inserted, updated, errors };
}

async function upsertCoaches(coaches: NormalizedCoach[]): Promise<{
  inserted: number;
  errors: string[];
}> {
  if (!isSupabaseConfigured()) {
    return { inserted: 0, errors: ["Supabase not configured"] };
  }

  const supabase = createAdminClient();
  let inserted = 0;
  const errors: string[] = [];

  // First, build a school_name -> school_id lookup
  const schoolNames = [...new Set(coaches.map((c) => c.school_name))];
  const schoolIdMap = new Map<string, string>();

  // Fetch school IDs in batches
  const idChunkSize = 50;
  for (let i = 0; i < schoolNames.length; i += idChunkSize) {
    const chunk = schoolNames.slice(i, i + idChunkSize);
    const { data } = await supabase
      .from("schools_v2")
      .select("id, name")
      .in("name", chunk);

    if (data) {
      for (const row of data) {
        schoolIdMap.set(row.name, row.id);
      }
    }
  }

  // Upsert coaches in batches
  const chunkSize = 50;
  for (let i = 0; i < coaches.length; i += chunkSize) {
    const chunk = coaches.slice(i, i + chunkSize);

    const rows = chunk.map((c) => ({
      name: c.name,
      title: c.title,
      school_id: schoolIdMap.get(c.school_name) ?? null,
      school_name: c.school_name,
      division: c.division,
      conference: c.conference,
      notes: c.record
        ? `Record: ${c.record.wins}-${c.record.losses}${c.record.ties > 0 ? `-${c.record.ties}` : ""}. ${c.seasons_at_school} season(s) at school.`
        : null,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("coaches")
      .upsert(rows, {
        onConflict: "name,school_name",
        ignoreDuplicates: false,
      })
      .select("id");

    if (error) {
      errors.push(`Coaches batch ${i / chunkSize + 1}: ${error.message}`);
    } else {
      inserted += data?.length ?? 0;
    }
  }

  return { inserted, errors };
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Auth check
  if (!validateAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Provide Authorization: Bearer <CRON_SECRET>." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { year } = body as { year?: number };

    // Validate year if provided
    if (year !== undefined) {
      if (typeof year !== "number" || year < 2000 || year > 2100) {
        return NextResponse.json(
          { error: "year must be a number between 2000 and 2100" },
          { status: 400 },
        );
      }
    }

    console.log(
      `[cfbd-pipeline] Starting full FBS/FCS data pull for year ${year ?? "current"}...`,
    );

    // 1. Fetch all teams + coaches from CFBD
    const pipelineResult = await fetchAllFBSFCSData(year);

    console.log(
      `[cfbd-pipeline] Fetched ${pipelineResult.meta.totalTeams} teams, ${pipelineResult.meta.totalCoaches} coaches`,
    );

    // 2. Upsert into Supabase
    let schoolsResult = { inserted: 0, updated: 0, errors: [] as string[] };
    let coachesResult = { inserted: 0, errors: [] as string[] };

    if (isSupabaseConfigured()) {
      schoolsResult = await upsertSchools(pipelineResult.teams);
      coachesResult = await upsertCoaches(pipelineResult.coaches);
    } else {
      console.warn("[cfbd-pipeline] Supabase not configured — skipping upsert");
    }

    // 3. Extract OL coaches from the coach list (filter by title)
    const olCoaches = pipelineResult.coaches.filter((c) => {
      const title = c.title.toLowerCase();
      return (
        title.includes("offensive line") ||
        title.includes("o-line") ||
        title.includes("oline")
      );
    });

    // 4. Build response
    const allErrors = [
      ...pipelineResult.meta.errors,
      ...schoolsResult.errors,
      ...coachesResult.errors,
    ];

    return NextResponse.json({
      status: "completed",
      data: {
        teams: {
          total: pipelineResult.meta.totalTeams,
          fbs: pipelineResult.meta.fbsCount,
          fcs: pipelineResult.meta.fcsCount,
          upserted: schoolsResult.inserted,
        },
        coaches: {
          total: pipelineResult.meta.totalCoaches,
          olCoaches: olCoaches.length,
          upserted: coachesResult.inserted,
        },
        olCoachesBySchool: olCoaches.map((c) => ({
          school: c.school_name,
          name: c.name,
          title: c.title,
          division: c.division,
          conference: c.conference,
        })),
      },
      meta: {
        year: year ?? new Date().getFullYear(),
        fetchedAt: pipelineResult.meta.fetchedAt,
        supabaseConfigured: isSupabaseConfigured(),
        errors: allErrors.length > 0 ? allErrors : undefined,
        note:
          "CFBD only provides head coach data. OL/position coaches require the mega-scraper pipeline or manual entry.",
      },
    });
  } catch (err) {
    console.error("[cfbd-pipeline] POST error:", err);
    return NextResponse.json(
      {
        error: "Failed to execute CFBD pipeline",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/data-pipeline/cfbd",
    description:
      "Triggers full FBS/FCS data pull from CollegeFootballData.com API",
    auth: "Authorization: Bearer <CRON_SECRET>",
    body: "{ year?: number }",
    note: "CFBD provides head coach data only. For OL/position coaches, use the mega-scraper pipeline.",
  });
}
