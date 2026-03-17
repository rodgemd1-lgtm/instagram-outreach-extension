import { NextRequest, NextResponse } from "next/server";
import {
  getCalendarSnapshot,
  getCurrentPeriod,
  getNextPeriodChange,
  canCoachContact,
  getTimelineForClass2029,
  getRecommendedActions,
  type NCAADivision,
} from "@/lib/rec/knowledge/ncaa-calendar";

// ---------------------------------------------------------------------------
// GET /api/rec/calendar — NCAA recruiting calendar and period detection
// Query params:
//   (none)           — Full calendar snapshot (period, permissions, milestones, actions)
//   ?view=period     — Current period only
//   ?view=timeline   — Class of 2029 full timeline
//   ?view=actions    — Recommended actions only
//   ?division=D1+FBS — Contact permissions for a specific division
//   ?date=2027-09-01 — Override date for testing / what-if scenarios
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const view = req.nextUrl.searchParams.get("view");
    const divisionParam = req.nextUrl.searchParams.get("division");
    const dateParam = req.nextUrl.searchParams.get("date");

    // Parse optional date override
    let date: Date | undefined;
    if (dateParam) {
      const parsed = new Date(dateParam);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: `Invalid date: ${dateParam}. Use ISO format (YYYY-MM-DD).` },
          { status: 400 }
        );
      }
      date = parsed;
    }

    // Division-specific contact permission query
    if (divisionParam) {
      const division = divisionParam.replace(/\+/g, " ") as NCAADivision;
      const validDivisions: NCAADivision[] = [
        "D1 FBS",
        "D1 FCS",
        "D2",
        "D3",
        "NAIA",
      ];
      if (!validDivisions.includes(division)) {
        return NextResponse.json(
          {
            error: `Invalid division: ${division}. Valid: ${validDivisions.join(", ")}`,
          },
          { status: 400 }
        );
      }

      const permission = canCoachContact(division, date);
      return NextResponse.json({ permission });
    }

    // View-specific responses
    switch (view) {
      case "period": {
        const period = getCurrentPeriod(date);
        const nextChange = getNextPeriodChange(date);
        return NextResponse.json({ period, nextChange });
      }

      case "timeline": {
        const timeline = getTimelineForClass2029(date);
        return NextResponse.json({
          classYear: 2029,
          milestones: timeline,
          total: timeline.length,
          upcoming: timeline.filter((m) => !m.isPast).length,
          completed: timeline.filter((m) => m.isPast).length,
        });
      }

      case "actions": {
        const actions = getRecommendedActions(date);
        return NextResponse.json({
          actions,
          total: actions.length,
          highPriority: actions.filter((a) => a.priority === "high").length,
        });
      }

      default: {
        // Full calendar snapshot
        const snapshot = getCalendarSnapshot(date);
        return NextResponse.json({ calendar: snapshot });
      }
    }
  } catch (err) {
    const details = err instanceof Error ? err.message : String(err);
    console.error("[rec/calendar] Unhandled error:", err);
    return NextResponse.json({ error: "Failed to load recruiting calendar", details }, { status: 500 });
  }
}
