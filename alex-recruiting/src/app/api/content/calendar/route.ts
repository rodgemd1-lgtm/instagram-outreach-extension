/**
 * POST /api/content/calendar
 *
 * Generate a 7-day AI-powered content calendar.
 *
 * Body (all optional):
 * {
 *   startDate?: string,        — ISO date (YYYY-MM-DD), defaults to today (Monday logic applied)
 *   recentHistory?: Array<{    — recent post history for gap analysis
 *     postType: string,
 *     pillar: string,
 *     postedAt: string
 *   }>
 * }
 *
 * Returns:
 * {
 *   weekStartDate: string,
 *   weekEndDate: string,
 *   pillarBreakdown: { performance: number, work_ethic: number, character: number },
 *   entries: CalendarEntry[],
 *   weeklyTheme: string,
 *   generatedAt: string
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  generateWeeklyCalendar,
  suggestNextPost,
  type RecentPostHistory,
} from "@/lib/content-engine/calendar-automation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Parse optional start date — default to the coming Monday
    let startDate: Date;
    if (body.startDate) {
      startDate = new Date(body.startDate);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid startDate — use ISO format YYYY-MM-DD" },
          { status: 400 }
        );
      }
    } else {
      startDate = nextMonday();
    }

    const recentHistory: RecentPostHistory[] = Array.isArray(body.recentHistory)
      ? body.recentHistory
      : [];

    const calendar = await generateWeeklyCalendar(startDate);

    // If recentHistory is provided, also surface a next-post suggestion
    let nextPostSuggestion = null;
    if (recentHistory.length > 0) {
      nextPostSuggestion = await suggestNextPost(recentHistory);
    }

    return NextResponse.json({
      calendar,
      nextPostSuggestion,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[POST /api/content/calendar]", err);
    return NextResponse.json(
      { error: "Failed to generate calendar", details: message },
      { status: 500 }
    );
  }
}

/** Return the date of the next Monday (or today if today is Monday) */
function nextMonday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() + (dayOfWeek === 1 ? 0 : daysUntilMonday));
  monday.setHours(0, 0, 0, 0);
  return monday;
}
