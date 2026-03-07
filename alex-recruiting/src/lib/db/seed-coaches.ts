import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { targetSchools } from "@/lib/data/target-schools";

// ---------------------------------------------------------------------------
// State mapping for school geography (used to populate the `state` column)
// ---------------------------------------------------------------------------
const STATE_MAP: Record<string, string> = {
  wisconsin: "WI",
  northwestern: "IL",
  iowa: "IA",
  "iowa-state": "IA",
  "northern-illinois": "IL",
  "western-michigan": "MI",
  "ball-state": "IN",
  "central-michigan": "MI",
  "south-dakota-state": "SD",
  "north-dakota-state": "ND",
  "illinois-state": "IL",
  "youngstown-state": "OH",
  "saginaw-valley": "MI",
  "michigan-tech": "MI",
  "ferris-state": "MI",
  "winona-state": "MN",
  "minnesota-state-mankato": "MN",
};

// ---------------------------------------------------------------------------
// Seed result type
// ---------------------------------------------------------------------------
export interface SeedResult {
  success: boolean;
  schoolsUpserted: number;
  coachesUpserted: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
export async function seedCoachesAndSchools(): Promise<SeedResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      schoolsUpserted: 0,
      coachesUpserted: 0,
      errors: ["Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."],
    };
  }

  const supabase = createAdminClient();
  const errors: string[] = [];
  let schoolsUpserted = 0;
  let coachesUpserted = 0;

  // ── 1. Upsert schools ──────────────────────────────────────────────────
  const schoolRows = targetSchools.map((s) => ({
    id: s.id,
    name: s.name,
    division: s.division,
    conference: s.conference,
    state: STATE_MAP[s.id] ?? null,
    priority_tier: s.priorityTier,
    ol_need_score: 3, // default baseline
    why_jacob: s.whyJacob,
    roster_url: s.rosterUrl,
    staff_url: s.staffUrl,
    official_x_handle: s.officialXHandle,
    updated_at: new Date().toISOString(),
  }));

  const { error: schoolError, data: schoolData } = await supabase
    .from("schools")
    .upsert(schoolRows, { onConflict: "id" })
    .select("id");

  if (schoolError) {
    errors.push(`Schools upsert failed: ${schoolError.message}`);
  } else {
    schoolsUpserted = schoolData?.length ?? 0;
  }

  // ── 2. Upsert coaches (one placeholder OL coach per school) ────────────
  // We use school_id + title as a natural dedup key. Since the coaches table
  // uses a UUID PK, we first query for existing coaches by school_id so we
  // can decide whether to insert or update.

  const { data: existingCoaches } = await supabase
    .from("coaches")
    .select("id, school_id")
    .in(
      "school_id",
      targetSchools.map((s) => s.id),
    );

  const existingBySchool = new Map<string, string>();
  if (existingCoaches) {
    for (const c of existingCoaches) {
      existingBySchool.set(c.school_id as string, c.id as string);
    }
  }

  for (const school of targetSchools) {
    const coachPayload = {
      name: `OL Coach - ${school.name}`,
      title: "Offensive Line Coach",
      school_id: school.id,
      school_name: school.name,
      division: school.division,
      conference: school.conference,
      x_handle: "",
      dm_open: school.priorityTier === "Tier 3",
      follow_status: "not_followed",
      dm_status: "not_sent",
      priority_tier: school.priorityTier,
      ol_need_score: 3,
      x_activity_score: 3,
      last_engaged: null,
      notes: school.whyJacob,
      updated_at: new Date().toISOString(),
    };

    const existingId = existingBySchool.get(school.id);

    if (existingId) {
      // Update existing coach row
      const { error } = await supabase
        .from("coaches")
        .update(coachPayload)
        .eq("id", existingId);

      if (error) {
        errors.push(`Coach update for ${school.name} failed: ${error.message}`);
      } else {
        coachesUpserted++;
      }
    } else {
      // Insert new coach row
      const { error } = await supabase.from("coaches").insert(coachPayload);

      if (error) {
        errors.push(`Coach insert for ${school.name} failed: ${error.message}`);
      } else {
        coachesUpserted++;
      }
    }
  }

  return {
    success: errors.length === 0,
    schoolsUpserted,
    coachesUpserted,
    errors,
  };
}
