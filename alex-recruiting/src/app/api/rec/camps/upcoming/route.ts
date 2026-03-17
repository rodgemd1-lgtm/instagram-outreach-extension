import { NextRequest, NextResponse } from "next/server";
import { getUpcomingCamps, SUMMER_2026_CAMPS } from "@/lib/rec/knowledge/camp-database";

export async function GET(req: NextRequest) {
  const monthsParam = req.nextUrl.searchParams.get("months");
  const months = monthsParam ? parseInt(monthsParam, 10) : 3;
  const includePlan = req.nextUrl.searchParams.get("plan");

  const upcoming = await getUpcomingCamps(months);

  // If no camps in DB yet and plan=true, return the pre-populated plan
  if (upcoming.length === 0 && includePlan === "true") {
    const planned = SUMMER_2026_CAMPS.map((camp, i) => ({
      id: `plan-${i}`,
      ...camp,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    return NextResponse.json({
      camps: planned,
      total: planned.length,
      source: "plan",
      note: "These are planned camps not yet saved to database. POST to /api/rec/camps to add them.",
    });
  }

  return NextResponse.json({
    camps: upcoming,
    total: upcoming.length,
    source: "database",
  });
}
