/**
 * GET /api/data/prospects
 *
 * Returns stored Class of 2029 OL recruiting prospects.
 * Returns empty array (not 404) when no scrape has run yet.
 *
 * Query params:
 *   state     — filter by US state abbreviation (e.g. "WI")
 *   stars     — minimum star rating (1-5)
 *   committed — "true" shows only committed prospects, "false" shows uncommitted
 *   position  — filter by OL sub-position (e.g. "OT", "OG", "C")
 */

import { NextRequest, NextResponse } from "next/server";
import { getStoredProspects } from "@/lib/data-pipeline/recruiting-scraper";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state");
  const minStars = searchParams.get("stars") ? parseInt(searchParams.get("stars")!, 10) : null;
  const committed = searchParams.get("committed");
  const position = searchParams.get("position");

  try {
    let prospects = await getStoredProspects();

    if (state) {
      prospects = prospects.filter(
        (p) => p.state?.toUpperCase() === state.toUpperCase()
      );
    }

    if (minStars !== null && !isNaN(minStars)) {
      prospects = prospects.filter((p) => (p.stars ?? 0) >= minStars);
    }

    if (committed === "true") {
      prospects = prospects.filter((p) => p.committedTo !== null);
    } else if (committed === "false") {
      prospects = prospects.filter((p) => p.committedTo === null);
    }

    if (position) {
      prospects = prospects.filter(
        (p) => p.position?.toUpperCase() === position.toUpperCase()
      );
    }

    // Sort by rating descending (highest rated first)
    prospects.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return NextResponse.json({
      prospects,
      total: prospects.length,
      classYear: 2029,
    });
  } catch (err) {
    console.error("[GET /api/data/prospects]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch prospects" },
      { status: 500 }
    );
  }
}
