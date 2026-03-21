import { NextRequest, NextResponse } from "next/server";
import { seedCoachesAndSchools } from "@/lib/db/seed-coaches";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// POST /api/recruit/seed
//
// Populates the `schools` Supabase table with the target school data from
// src/lib/data/target-schools.ts and removes legacy placeholder coach rows.
// Safe to call repeatedly -- existing school rows are updated (upsert) rather
// than duplicated.
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.",
      },
      { status: 503 },
    );
  }

  try {
    const result = await seedCoachesAndSchools();

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Seed completed with errors",
          ...result,
        },
        { status: 207 },
      );
    }

    return NextResponse.json({
      message: "Seed completed successfully",
      ...result,
    });
  } catch (err) {
    console.error("[seed] Unexpected error:", err);
    return NextResponse.json(
      { error: "Seed failed unexpectedly", detail: String(err) },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/recruit/seed  -- check seed status (how many rows exist)
// ---------------------------------------------------------------------------
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      message: "Supabase is not configured",
    });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const [schoolsResult, coachesResult] = await Promise.all([
      supabase.from("schools").select("id", { count: "exact", head: true }),
      supabase.from("coaches").select("id", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      configured: true,
      schoolCount: schoolsResult.count ?? 0,
      coachCount: coachesResult.count ?? 0,
      seeded: (schoolsResult.count ?? 0) > 0,
    });
  } catch (err) {
    return NextResponse.json(
      { configured: true, error: String(err) },
      { status: 500 },
    );
  }
}
