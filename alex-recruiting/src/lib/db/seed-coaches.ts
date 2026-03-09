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

  // ── 2. Remove legacy placeholder coaches ───────────────────────────────
  // Real coach data now comes from the live staff-directory scraper.
  const { data: existingCoaches } = await supabase
    .from("coaches")
    .select("id, name")
    .or("name.like.OL Coach - %,name.like.OL Coach — %");

  const placeholderIds = (existingCoaches ?? []).map((coach) => coach.id as string);
  if (placeholderIds.length > 0) {
    const { error } = await supabase.from("coaches").delete().in("id", placeholderIds);
    if (error) {
      errors.push(`Placeholder coach cleanup failed: ${error.message}`);
    }
  }

  // ── 3. Count real coach rows for reporting ─────────────────────────────
  const { count: coachCount, error: coachCountError } = await supabase
    .from("coaches")
    .select("id", { count: "exact", head: true })
    .in(
      "school_id",
      targetSchools.map((s) => s.id),
    );

  if (coachCountError) {
    errors.push(`Coach count failed: ${coachCountError.message}`);
  } else {
    coachesUpserted = coachCount ?? 0;
  }

  return {
    success: errors.length === 0,
    schoolsUpserted,
    coachesUpserted,
    errors,
  };
}
