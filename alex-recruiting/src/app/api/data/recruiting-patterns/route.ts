/**
 * GET /api/data/recruiting-patterns — Historical patterns for OL recruiting
 *
 * Query params:
 *   view — "full" | "thresholds" | "timelines" | "camps" | "area" (default: "full")
 *   division — filter thresholds by division (e.g., "D1 FBS Power")
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getHistoricalRecruitingPatterns,
  getAreaRecruitingHistory,
  getMeasurableThresholds,
  getRecruitingTimelines,
  getCampPipelineAnalysis,
} from "@/lib/data-pipeline/recruiting-patterns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") ?? "full";
  const division = searchParams.get("division");

  try {
    switch (view) {
      case "thresholds": {
        let thresholds = await getMeasurableThresholds();
        if (division) {
          thresholds = thresholds.filter(
            (t) => t.division.toLowerCase() === division.toLowerCase()
          );
        }
        return NextResponse.json({
          thresholds,
          total: thresholds.length,
          jacobProfile: {
            height: 76,
            heightFormatted: "6'4\"",
            weight: 285,
            position: "OG/DT",
            classYear: 2029,
          },
        });
      }

      case "timelines": {
        const timelines = getRecruitingTimelines();
        return NextResponse.json({ timelines });
      }

      case "camps": {
        const camps = getCampPipelineAnalysis();
        return NextResponse.json({ camps });
      }

      case "area": {
        const areaHistory = await getAreaRecruitingHistory();
        return NextResponse.json({
          areaHistory,
          total: areaHistory.length,
          area: "Pewaukee / Waukesha County, WI",
        });
      }

      default: {
        const patterns = await getHistoricalRecruitingPatterns();
        return NextResponse.json({
          patterns,
          summary: {
            dataSource: patterns.dataSource,
            areaRecruits: patterns.areaHistory.length,
            thresholds: patterns.measurableThresholds.length,
            timelines: patterns.timelines.length,
            campTypes: patterns.campPipeline.length,
            insights: patterns.insights.length,
          },
        });
      }
    }
  } catch (err) {
    console.error("[GET /api/data/recruiting-patterns]", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to fetch recruiting patterns",
        // Graceful fallback: return static timelines and camps even on error
        timelines: getRecruitingTimelines(),
        camps: getCampPipelineAnalysis(),
      },
      { status: 200 } // Still 200 — client receives usable data
    );
  }
}
