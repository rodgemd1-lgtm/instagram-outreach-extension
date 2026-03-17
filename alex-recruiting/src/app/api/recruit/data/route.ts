import { NextResponse } from "next/server";
import {
  getEnrichedSchools,
  getCoachSignals,
  getResearchInsights,
} from "@/lib/recruit/data-fetcher";

export async function GET() {
  const [schools, coachSignals, insights] = await Promise.all([
    getEnrichedSchools(),
    getCoachSignals(),
    getResearchInsights(),
  ]);

  return NextResponse.json({
    schools,
    coachSignals,
    insights,
    generatedAt: new Date().toISOString(),
  });
}
