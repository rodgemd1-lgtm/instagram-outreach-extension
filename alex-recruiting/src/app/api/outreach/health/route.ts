import { NextResponse } from "next/server";
import { listSequences } from "@/lib/outreach/dm-sequences";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let allSequences: Awaited<ReturnType<typeof listSequences>> = [];
    let sequenceError: string | null = null;
    try {
      allSequences = await listSequences();
    } catch (e) {
      sequenceError = e instanceof Error ? e.message : "Failed to query sequences";
    }
    const active = allSequences.filter((s) => s.status === "active");
    const paused = allSequences.filter((s) => s.status === "paused");
    const completed = allSequences.filter((s) => s.status === "completed");
    const responseReceived = allSequences.filter((s) => s.status === "response_received");

    let recentDMs: Array<{ coachName: string; status: string; sentAt: string | null }> = [];
    let coachCoverage = { total: 0, withHandles: 0, withActiveSequences: 0 };

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();

      const { data: dms } = await supabase
        .from("dm_messages")
        .select("coach_name, status, sent_at")
        .order("created_at", { ascending: false })
        .limit(10);

      recentDMs = (dms ?? []).map((d) => ({
        coachName: d.coach_name,
        status: d.status,
        sentAt: d.sent_at,
      }));

      const { count: totalCoaches } = await supabase
        .from("coaches")
        .select("id", { count: "exact", head: true });

      const { count: coachesWithHandles } = await supabase
        .from("coaches")
        .select("id", { count: "exact", head: true })
        .not("x_handle", "is", null);

      coachCoverage = {
        total: totalCoaches ?? 0,
        withHandles: coachesWithHandles ?? 0,
        withActiveSequences: active.length,
      };
    }

    const hasActiveSequences = active.length > 0;
    const hasSentRecently = recentDMs.some(
      (d) => d.sentAt && Date.now() - new Date(d.sentAt).getTime() < 7 * 24 * 60 * 60 * 1000
    );

    let status: "healthy" | "warning" | "stale" = "healthy";
    if (!hasActiveSequences) status = "warning";
    if (active.length > 0 && !hasSentRecently) status = "stale";

    return NextResponse.json({
      status,
      checkedAt: new Date().toISOString(),
      sequences: {
        active: active.length,
        paused: paused.length,
        completed: completed.length,
        responseReceived: responseReceived.length,
        total: allSequences.length,
      },
      recentDMs,
      coachCoverage,
      sequenceError,
      cronSchedule: "0 14,19 * * 1-5 (weekdays 2pm + 7pm CT)",
      engineLocation: "src/lib/outreach/dm-sequences.ts → processSequences()",
      upcomingDue: active
        .filter((s) => s.nextSendAt)
        .sort((a, b) => new Date(a.nextSendAt!).getTime() - new Date(b.nextSendAt!).getTime())
        .slice(0, 5)
        .map((s) => ({
          coachName: s.coachName,
          school: s.school,
          step: s.currentStep,
          dueAt: s.nextSendAt,
        })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Health check failed";
    return NextResponse.json({ status: "error", error: message }, { status: 500 });
  }
}
