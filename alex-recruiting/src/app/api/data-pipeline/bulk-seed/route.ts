/**
 * Data Pipeline — Bulk Seed API
 *
 * POST: Accepts { schools: [...], coaches: [...] } arrays and upserts them
 *       into schools_v2 and coaches tables respectively.
 *
 * Protected by CRON_SECRET via Authorization: Bearer header.
 *
 * Schools are upserted by slug (unique key).
 * Coaches are upserted by school_slug + title composite match.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

// ---------- Types ----------

interface SchoolInput {
  slug: string;
  name: string;
  mascot?: string;
  division: string;
  conference?: string;
  city?: string;
  state?: string;
  logo_url?: string;
  athletics_url?: string;
  staff_url?: string;
  roster_url?: string;
  primary_color?: string;
  secondary_color?: string;
}

interface CoachInput {
  name: string;
  title?: string;
  school_slug: string;
  school_name: string;
  division: string;
  conference?: string;
  x_handle?: string;
  priority_tier?: string;
}

interface BulkSeedBody {
  schools?: SchoolInput[];
  coaches?: CoachInput[];
}

// ---------- Helpers ----------

function validateAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // no secret configured = allow (dev mode)
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

const BATCH_SIZE = 500;

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
  // Auth check
  if (!validateAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Supabase check
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }

  const supabase = createAdminClient();

  let body: BulkSeedBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { schools = [], coaches = [] } = body;

  if (!Array.isArray(schools) || !Array.isArray(coaches)) {
    return NextResponse.json(
      { error: "schools and coaches must be arrays" },
      { status: 400 }
    );
  }

  if (schools.length === 0 && coaches.length === 0) {
    return NextResponse.json(
      { error: "At least one of schools or coaches must be non-empty" },
      { status: 400 }
    );
  }

  const results = {
    schools: { inserted: 0, updated: 0, errors: 0 },
    coaches: { inserted: 0, updated: 0, errors: 0 },
    errorDetails: [] as string[],
  };

  // ---------- Upsert Schools ----------

  if (schools.length > 0) {
    // Validate required fields
    const validSchools = schools.filter((s) => {
      if (!s.slug || !s.name || !s.division) {
        results.schools.errors++;
        results.errorDetails.push(
          `School missing required fields (slug, name, division): ${JSON.stringify(s).slice(0, 100)}`
        );
        return false;
      }
      return true;
    });

    const schoolBatches = chunk(validSchools, BATCH_SIZE);

    for (const batch of schoolBatches) {
      const rows = batch.map((s) => ({
        slug: s.slug,
        name: s.name,
        mascot: s.mascot ?? null,
        division: s.division,
        conference: s.conference ?? null,
        city: s.city ?? null,
        state: s.state ?? null,
        logo_url: s.logo_url ?? null,
        athletics_url: s.athletics_url ?? null,
        staff_url: s.staff_url ?? null,
        roster_url: s.roster_url ?? null,
        primary_color: s.primary_color ?? null,
        secondary_color: s.secondary_color ?? null,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("schools_v2")
        .upsert(rows, { onConflict: "slug", ignoreDuplicates: false })
        .select("id");

      if (error) {
        results.schools.errors += batch.length;
        results.errorDetails.push(`Schools batch error: ${error.message}`);
      } else {
        // Supabase upsert doesn't distinguish insert vs update in response,
        // so we count all successful rows. The caller can infer from totals.
        results.schools.inserted += data?.length ?? 0;
      }
    }
  }

  // ---------- Upsert Coaches ----------

  if (coaches.length > 0) {
    // Validate required fields
    const validCoaches = coaches.filter((c) => {
      if (!c.name || !c.school_slug || !c.school_name || !c.division) {
        results.coaches.errors++;
        results.errorDetails.push(
          `Coach missing required fields (name, school_slug, school_name, division): ${JSON.stringify(c).slice(0, 100)}`
        );
        return false;
      }
      return true;
    });

    // For coaches, we need to check existence to do proper upsert
    // since there's no unique constraint on school_slug + title
    const coachBatches = chunk(validCoaches, BATCH_SIZE);

    for (const batch of coachBatches) {
      for (const c of batch) {
        // Check if coach already exists at this school with this title
        const { data: existing } = await supabase
          .from("coaches")
          .select("id")
          .eq("school_slug", c.school_slug)
          .eq("name", c.name)
          .maybeSingle();

        const row = {
          name: c.name,
          title: c.title ?? null,
          school_slug: c.school_slug,
          school_name: c.school_name,
          division: c.division,
          conference: c.conference ?? null,
          x_handle: c.x_handle ?? null,
          priority_tier: c.priority_tier ?? "expansion",
          updated_at: new Date().toISOString(),
        };

        if (existing?.id) {
          // Update existing coach
          const { error } = await supabase
            .from("coaches")
            .update(row)
            .eq("id", existing.id);

          if (error) {
            results.coaches.errors++;
            results.errorDetails.push(
              `Coach update error (${c.name} @ ${c.school_slug}): ${error.message}`
            );
          } else {
            results.coaches.updated++;
          }
        } else {
          // Insert new coach
          const { error } = await supabase.from("coaches").insert(row);

          if (error) {
            results.coaches.errors++;
            results.errorDetails.push(
              `Coach insert error (${c.name} @ ${c.school_slug}): ${error.message}`
            );
          } else {
            results.coaches.inserted++;
          }
        }
      }
    }
  }

  const totalProcessed =
    results.schools.inserted +
    results.schools.updated +
    results.coaches.inserted +
    results.coaches.updated;

  const totalErrors = results.schools.errors + results.coaches.errors;

  return NextResponse.json({
    ok: totalErrors === 0,
    message: `Processed ${totalProcessed} records (${totalErrors} errors)`,
    results,
    // Truncate error details to avoid huge responses
    errorDetails:
      results.errorDetails.length > 20
        ? [...results.errorDetails.slice(0, 20), `... and ${results.errorDetails.length - 20} more`]
        : results.errorDetails,
  });
}
