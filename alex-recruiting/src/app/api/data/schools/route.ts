/**
 * GET /api/data/schools
 *
 * Returns enriched school profiles for all target schools.
 *
 * Query params:
 *   tier     — filter by priority tier ("Tier 1" | "Tier 2" | "Tier 3")
 *   division — filter by division string (e.g. "D1 FBS")
 *   fast     — "true" skips CFBD enrichment and returns static data immediately
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllEnrichedSchoolProfiles,
  getStaticSchoolProfiles,
} from "@/lib/data-pipeline/school-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get("tier");
  const division = searchParams.get("division");
  const fast = searchParams.get("fast") === "true";

  try {
    const profiles = fast
      ? getStaticSchoolProfiles()
      : await getAllEnrichedSchoolProfiles();

    let filtered = profiles;
    if (tier) {
      filtered = filtered.filter((p) => p.priorityTier === tier);
    }
    if (division) {
      filtered = filtered.filter(
        (p) => p.division.toLowerCase() === division.toLowerCase()
      );
    }

    return NextResponse.json({
      schools: filtered,
      total: filtered.length,
      cfbdEnriched: !fast && filtered.some((p) => p.cfbdAvailable),
    });
  } catch (err) {
    console.error("[GET /api/data/schools]", err);
    // Graceful degradation: return static profiles on any error
    const fallback = getStaticSchoolProfiles();
    return NextResponse.json(
      {
        schools: fallback,
        total: fallback.length,
        cfbdEnriched: false,
        error: err instanceof Error ? err.message : "Enrichment failed; returning static data",
      },
      { status: 200 } // Still 200 — client receives usable data
    );
  }
}
