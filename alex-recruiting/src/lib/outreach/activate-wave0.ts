/**
 * Wave 0 Activation — Create DM sequences for all Tier 3 coaches
 *
 * This is a one-time activation script that:
 * 1. Queries coaches from the database (or seed data)
 * 2. Creates a 4-step DM sequence for each Tier 3 coach
 * 3. Sequences are queued but NOT sent — the cron handles delivery
 *
 * Tier 3 = D2/D3/NAIA schools (most receptive to Class of 2029 OLs)
 */

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { createSequence } from "./dm-sequences";

export interface Wave0Result {
  created: number;
  skipped: number;
  errors: string[];
  coaches: Array<{ name: string; school: string; status: "created" | "skipped" | "error" }>;
}

export async function activateWave0(options: {
  divisions?: string[];
  limit?: number;
  dryRun?: boolean;
} = {}): Promise<Wave0Result> {
  const {
    divisions = ["D2", "D3", "NAIA"],
    limit = 50,
    dryRun = false,
  } = options;

  const result: Wave0Result = {
    created: 0,
    skipped: 0,
    errors: [],
    coaches: [],
  };

  // Get coaches from Supabase
  let coaches: Array<{
    id: string;
    name: string;
    school: string;
    division: string;
    x_handle: string | null;
    x_user_id: string | null;
  }> = [];

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();

    // Check if coaches table exists and has data
    const { data, error } = await supabase
      .from("coaches")
      .select("id, name, school, division, x_handle, x_user_id")
      .in("division", divisions)
      .limit(limit);

    if (error) {
      console.warn("[Wave0] Could not query coaches table:", error.message);
    } else {
      coaches = (data ?? []) as typeof coaches;
    }
  }

  if (coaches.length === 0) {
    return {
      ...result,
      errors: ["No coaches found for Wave 0 activation. Seed the coaches database first."],
    };
  }

  for (const coach of coaches) {
    try {
      // Skip coaches without X presence (can't DM them)
      if (!coach.x_handle && !coach.x_user_id) {
        result.skipped++;
        result.coaches.push({ name: coach.name, school: coach.school, status: "skipped" });
        continue;
      }

      if (dryRun) {
        result.created++;
        result.coaches.push({ name: coach.name, school: coach.school, status: "created" });
        continue;
      }

      await createSequence(coach.id, "initial_outreach", {
        coachName: coach.name,
        school: coach.school,
        tier: "Tier 3",
        xHandle: coach.x_handle ?? undefined,
        xUserId: coach.x_user_id ?? undefined,
      });

      result.created++;
      result.coaches.push({ name: coach.name, school: coach.school, status: "created" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`${coach.name} (${coach.school}): ${msg}`);
      result.coaches.push({ name: coach.name, school: coach.school, status: "error" });
    }
  }

  console.log(
    `[Wave0] Activation complete — created: ${result.created}, skipped: ${result.skipped}, errors: ${result.errors.length}`
  );

  return result;
}
