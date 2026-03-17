import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { targetSchools } from "@/lib/data/target-schools";
import { getTierForDivision, scoreCoach } from "@/lib/alex/coach-ranker";
import {
  createAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase/admin";
import type { Coach } from "@/lib/types";

// ---------------------------------------------------------------------------
// Input validation schema — POST /api/coaches
// ---------------------------------------------------------------------------
const createCoachSchema = z.object({
  name: z.string().min(1, "name is required").max(200),
  title: z.string().max(200).optional(),
  schoolId: z.string().max(100).optional().nullable(),
  schoolSlug: z.string().max(100).optional().nullable(),
  schoolName: z.string().min(1, "schoolName is required").max(200),
  division: z.enum(["FBS", "FCS", "D2", "D3", "NAIA", "JUCO"], {
    errorMap: () => ({ message: "division must be FBS, FCS, D2, D3, NAIA, or JUCO" }),
  }),
  conference: z.string().max(100).optional(),
  xHandle: z.string().max(100).optional(),
  dmOpen: z.boolean().optional(),
  priorityTier: z.string().max(50).optional(),
  olNeedScore: z.number().int().min(0).max(10).optional(),
  dlNeedScore: z.number().int().min(0).max(10).optional(),
  xActivityScore: z.number().int().min(0).max(10).optional(),
  positionType: z.enum(["OL", "DL", "both"]).optional(),
  notes: z.string().max(5000).optional(),
});

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// In-memory fallback (used when Supabase env vars are missing)
// ---------------------------------------------------------------------------
const coachStore = targetSchools.map((school) => ({
  id: school.id,
  name: `OL Coach — ${school.name}`,
  title: "Offensive Line Coach",
  schoolId: school.id,
  schoolName: school.name,
  division: school.division,
  conference: school.conference,
  xHandle: "",
  dmOpen: school.priorityTier === "Tier 3",
  followStatus: "not_followed" as const,
  dmStatus: "not_sent" as const,
  priorityTier: school.priorityTier,
  olNeedScore: 3,
  xActivityScore: 3,
  lastEngaged: null,
  notes: school.whyJacob,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

// ---------------------------------------------------------------------------
// Supabase row shape (snake_case columns)
// ---------------------------------------------------------------------------
interface CoachRow {
  id: string;
  name: string;
  title: string | null;
  school_id: string | null;
  school_slug: string | null;
  school_name: string;
  division: string;
  conference: string | null;
  x_handle: string | null;
  dm_open: boolean | null;
  follow_status: string | null;
  dm_status: string | null;
  priority_tier: string;
  ol_need_score: number | null;
  dl_need_score: number | null;
  position_type: string | null;
  x_activity_score: number | null;
  last_engaged: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function isPlaceholderCoach(name: string): boolean {
  return /^OL Coach\s*[-—]/.test(name);
}

// ---------------------------------------------------------------------------
// Helper: map a Supabase row (snake_case) to the Coach shape (camelCase)
// ---------------------------------------------------------------------------
function mapRow(row: CoachRow): Coach {
  return {
    id: row.id,
    name: row.name,
    title: row.title ?? "",
    schoolId: row.school_id ?? "",
    schoolName: row.school_name,
    division: row.division as Coach["division"],
    conference: row.conference ?? "",
    xHandle: row.x_handle ?? "",
    dmOpen: row.dm_open ?? false,
    followStatus: (row.follow_status ?? "not_followed") as Coach["followStatus"],
    dmStatus: (row.dm_status ?? "not_sent") as Coach["dmStatus"],
    priorityTier: row.priority_tier as Coach["priorityTier"],
    olNeedScore: row.ol_need_score ?? 0,
    xActivityScore: row.x_activity_score ?? 0,
    lastEngaged: row.last_engaged ?? null,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// GET /api/coaches?tier=&division=&followStatus=
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get("tier");
  const division = searchParams.get("division");
  const status = searchParams.get("followStatus");

  // ── Supabase path ──────────────────────────────────────────────────────
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();

      let query = supabase.from("coaches").select("*");

      if (tier) {
        query = query.eq("priority_tier", tier);
      }
      if (division) {
        query = query.eq("division", division);
      }
      if (status) {
        query = query.eq("follow_status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("[coaches/GET] Supabase error, falling back to memory:", error.message);
        // fall through to in-memory path below
      } else {
        const coaches = ((data ?? []) as CoachRow[])
          .map(mapRow)
          .filter((coach) => !isPlaceholderCoach(coach.name));

        // Sort by composite score (same logic as in-memory path)
        coaches.sort((a, b) => scoreCoach(b) - scoreCoach(a));

        return NextResponse.json({ coaches, total: coaches.length });
      }
    } catch (err) {
      console.error("[coaches/GET] Supabase exception, falling back to memory:", err);
      // fall through to in-memory path
    }
  }

  // ── In-memory fallback ─────────────────────────────────────────────────
  let filtered = [...coachStore];

  if (tier) filtered = filtered.filter((c) => c.priorityTier === tier);
  if (division) filtered = filtered.filter((c) => c.division === division);
  if (status) filtered = filtered.filter((c) => c.followStatus === status);

  filtered.sort((a, b) => scoreCoach(b) - scoreCoach(a));

  return NextResponse.json({ coaches: filtered, total: filtered.length });
}

// ---------------------------------------------------------------------------
// POST /api/coaches  — create a new coach record
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createCoachSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const body = parsed.data;

  const now = new Date().toISOString();
  const priorityTier =
    body.priorityTier ||
    getTierForDivision(body.division, body.conference || "");

  // ── Supabase path ──────────────────────────────────────────────────────
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();

      const insertPayload = {
        name: body.name,
        title: body.title || "",
        school_id: body.schoolId || null,
        school_name: body.schoolName,
        division: body.division,
        conference: body.conference || "",
        x_handle: body.xHandle || "",
        dm_open: body.dmOpen ?? false,
        follow_status: "not_followed",
        dm_status: "not_sent",
        priority_tier: priorityTier,
        ol_need_score: body.olNeedScore ?? 3,
        x_activity_score: body.xActivityScore ?? 3,
        last_engaged: null,
        notes: body.notes || "",
      };

      const { data, error } = await supabase
        .from("coaches")
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        console.error("[coaches/POST] Supabase insert error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ coach: mapRow(data as CoachRow) }, { status: 201 });
    } catch (err) {
      console.error("[coaches/POST] Supabase exception:", err);
      return NextResponse.json(
        { error: "Database insert failed" },
        { status: 500 },
      );
    }
  }

  // ── In-memory fallback ─────────────────────────────────────────────────
  const newCoach = {
    id: `coach-${Date.now()}`,
    name: body.name,
    title: body.title || "",
    schoolId: body.schoolId || "",
    schoolName: body.schoolName,
    division: body.division,
    conference: body.conference || "",
    xHandle: body.xHandle || "",
    dmOpen: body.dmOpen || false,
    followStatus: "not_followed" as const,
    dmStatus: "not_sent" as const,
    priorityTier,
    olNeedScore: body.olNeedScore || 3,
    xActivityScore: body.xActivityScore || 3,
    lastEngaged: null,
    notes: body.notes || "",
    createdAt: now,
    updatedAt: now,
  };

  coachStore.push(newCoach);

  return NextResponse.json({ coach: newCoach }, { status: 201 });
}
