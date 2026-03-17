/**
 * Data Pipeline — Mega Scraper API Route
 *
 * POST: Triggers a scrape run across NCAA football program staff directories.
 *       Accepts { division?: string, limit?: number } in the request body.
 *
 * GET:  Returns the status of the most recent scrape job.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  runMegaScrape,
  getLastScrapeResult,
  getSchoolCounts,
} from "@/lib/data-pipeline/mega-scraper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { division, limit } = body as {
      division?: string;
      limit?: number;
    };

    // Validate division if provided
    const validDivisions = ["D1_FBS", "D1_FCS", "D2", "D3", "NAIA"];
    if (division && !validDivisions.includes(division)) {
      return NextResponse.json(
        {
          error: `Invalid division. Must be one of: ${validDivisions.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate limit if provided
    if (limit !== undefined && (typeof limit !== "number" || limit < 1)) {
      return NextResponse.json(
        { error: "limit must be a positive number" },
        { status: 400 }
      );
    }

    const counts = getSchoolCounts();
    const schoolsQueued = division
      ? counts[division] ?? 0
      : counts.total;
    const effectiveQueued = limit
      ? Math.min(limit, schoolsQueued)
      : schoolsQueued;

    // Start the scrape in the background (non-blocking for large runs)
    // For small runs (limit <= 5), await inline
    if (limit && limit <= 5) {
      const result = await runMegaScrape({ division, limit });
      return NextResponse.json({
        status: "completed",
        schoolsQueued: effectiveQueued,
        message: `Scrape completed: ${result.coachesFound} coaches found across ${result.schoolsProcessed} schools`,
        result,
      });
    }

    // For larger runs, fire and forget (responds immediately)
    runMegaScrape({ division, limit }).catch((err) => {
      console.error("[scrape-api] Background scrape failed:", err);
    });

    return NextResponse.json({
      status: "started",
      schoolsQueued: effectiveQueued,
      message: `Scrape job started for ${effectiveQueued} ${division ?? "all"} schools. Use GET to check status.`,
    });
  } catch (err) {
    console.error("[scrape-api] POST error:", err);
    return NextResponse.json(
      {
        error: "Failed to start scrape job",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const lastResult = getLastScrapeResult();
    const counts = getSchoolCounts();

    // Check for optional division filter in query params
    const { searchParams } = new URL(request.url);
    const division = searchParams.get("division");

    if (!lastResult) {
      return NextResponse.json({
        status: "idle",
        message: "No scrape jobs have been run yet",
        schoolDatabase: counts,
        division: division ?? "all",
      });
    }

    const isRunning = lastResult.completedAt === null;

    return NextResponse.json({
      status: isRunning ? "running" : "completed",
      lastRun: lastResult,
      schoolDatabase: counts,
    });
  } catch (err) {
    console.error("[scrape-api] GET error:", err);
    return NextResponse.json(
      {
        error: "Failed to get scrape status",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
