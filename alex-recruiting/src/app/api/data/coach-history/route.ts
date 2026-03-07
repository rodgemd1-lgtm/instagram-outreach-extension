/**
 * GET /api/data/coach-history/[name] — Coach's recruiting history and patterns
 *
 * Since Next.js dynamic routes need a [param] directory, this route
 * uses a query parameter instead:
 *
 *   /api/data/coach-history?name=Kirk+Ferentz&school=Iowa
 *
 * Query params:
 *   name   — Coach name (required)
 *   school — School name (required)
 *   view   — "full" | "patterns" | "geographic" | "likelihood" (default: "full")
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getCoachRecruitingHistory,
  getOfferPatterns,
  getGeographicPatterns,
  predictOfferLikelihood,
  analyzeAllTargetSchools,
} from "@/lib/data-pipeline/coach-history";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const school = searchParams.get("school");
  const view = searchParams.get("view") ?? "full";

  // Special: analyze all target schools
  if (searchParams.get("all") === "true") {
    try {
      const results = await analyzeAllTargetSchools();
      return NextResponse.json({
        schools: results,
        total: results.length,
        analyzedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("[GET /api/data/coach-history?all=true]", err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to analyze target schools" },
        { status: 500 }
      );
    }
  }

  if (!school) {
    return NextResponse.json(
      { error: "school query parameter is required" },
      { status: 400 }
    );
  }

  const coachName = name ?? "HC";

  try {
    switch (view) {
      case "patterns": {
        const patterns = await getOfferPatterns(school);
        return NextResponse.json({ patterns });
      }

      case "geographic": {
        const geographic = await getGeographicPatterns(school);
        return NextResponse.json({ geographic });
      }

      case "likelihood": {
        const likelihood = await predictOfferLikelihood(school, coachName);
        return NextResponse.json({ likelihood });
      }

      default: {
        const history = await getCoachRecruitingHistory(coachName, school);
        return NextResponse.json({ history });
      }
    }
  } catch (err) {
    console.error(`[GET /api/data/coach-history] coach=${coachName} school=${school}`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch coach recruiting history" },
      { status: 500 }
    );
  }
}
