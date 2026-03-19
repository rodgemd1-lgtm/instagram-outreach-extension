import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { createSequence } from "@/lib/outreach/dm-sequences";

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

  // Wave 0: WIAC coaches (Tier 1 D3) + Tier 3 coaches with X handles who haven't been DM'd
  const { data: coaches, error } = await supabase
    .from("coaches")
    .select("id, name, school_name, x_handle, priority_tier, dm_status, conference")
    .not("x_handle", "is", null)
    .in("dm_status", ["not_sent", "not sent"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter to Wave 0 eligible: Tier 3 (D2 safety) + WIAC (D3 local)
  const eligible = (coaches ?? []).filter(
    (c) => c.priority_tier === "Tier 3" || c.conference === "WIAC"
  );

  const results: Array<{ coachName: string; school: string; status: string }> = [];

  for (const coach of eligible) {
    try {
      await createSequence(coach.id, "initial_outreach", {
        coachName: coach.name,
        school: coach.school_name,
        tier: "Tier 3",
        xHandle: coach.x_handle,
      });
      results.push({ coachName: coach.name, school: coach.school_name, status: "created" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ coachName: coach.name, school: coach.school_name, status: `error: ${msg}` });
    }
  }

  return NextResponse.json({
    success: true,
    wave: "Wave 0 — WIAC + Tier 3 coaches with X handles",
    sequencesCreated: results.filter((r) => r.status === "created").length,
    errors: results.filter((r) => r.status.startsWith("error")).length,
    details: results,
    note: "Sequences are now active. The cron at /api/outreach/process (2pm + 7pm weekdays) will send Step 1 DMs when nextSendAt is due.",
  });
}
