/**
 * One-time sync: Update WIAC coach X handles in Supabase
 * Matches by name + school_name and updates x_handle
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { expandedTargetSchools } from "@/lib/data/target-schools-expanded";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const supabase = createAdminClient();
  const wiacSchools = expandedTargetSchools.filter((s) => s.conference === "WIAC");
  const results: Array<{ name: string; school: string; action: string; handle: string | null }> = [];

  for (const school of wiacSchools) {
    for (const coach of school.coaches) {
      // Try to find existing coach by name + school
      const { data: existing } = await supabase
        .from("coaches")
        .select("id, name, school_name, x_handle")
        .eq("school_name", school.name)
        .ilike("name", `%${coach.name.split(" ").pop()}%`)
        .limit(1)
        .maybeSingle();

      if (existing) {
        // Update handle and name if found
        const { error } = await supabase
          .from("coaches")
          .update({
            name: coach.name,
            title: coach.title,
            x_handle: coach.xHandle,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        results.push({
          name: coach.name,
          school: school.name,
          action: error ? `error: ${error.message}` : "updated",
          handle: coach.xHandle,
        });
      } else {
        // Insert new coach
        const { error } = await supabase.from("coaches").insert({
          name: coach.name,
          title: coach.title,
          school_name: school.name,
          school_slug: school.slug,
          division: school.division,
          conference: school.conference,
          x_handle: coach.xHandle,
          priority_tier: `Tier ${school.tier}`,
          position_type: coach.title.includes("Head Coach") ? "both" : coach.title.includes("Offensive") ? "OL" : "DL",
          dm_open: false,
          follow_status: "not_followed",
          dm_status: "not_sent",
        });

        results.push({
          name: coach.name,
          school: school.name,
          action: error ? `error: ${error.message}` : "inserted",
          handle: coach.xHandle,
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    updated: results.filter((r) => r.action === "updated").length,
    inserted: results.filter((r) => r.action === "inserted").length,
    errors: results.filter((r) => r.action.startsWith("error")).length,
    handlesSet: results.filter((r) => r.handle !== null).length,
    details: results,
  });
}
