// GET /api/growth/targets — Recommended follow targets with live X verification
// Returns high-priority accounts to follow, optionally with follower analysis

import { NextRequest, NextResponse } from "next/server";
import {
  findFollowTargets,
  findLiveFollowTargets,
  analyzeTargetFollowers,
  getGrowthRecommendations,
} from "@/lib/growth/follower-scraper";
import { parseTargetLimit } from "./route-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const maxResults = parseTargetLimit(searchParams.get("limit"));
    const analyze = searchParams.get("analyze"); // handle to analyze followers of
    const type = searchParams.get("type"); // filter by category
    const liveParam = searchParams.get("live");
    const preferLive = liveParam === null ? true : liveParam === "true";
    const includeRecommendations = searchParams.get("recommendations") !== "false";

    // If an analyze handle is provided, return the follower analysis for that account
    if (analyze) {
      const analysis = await analyzeTargetFollowers(analyze);
      return NextResponse.json({
        analysis,
        generatedAt: new Date().toISOString(),
      });
    }

    // Build follow targets. `live=true` switches from the curated seed list to
    // real X follower-graph discovery from schools + coaches already in the system.
    let targets = preferLive
      ? await findLiveFollowTargets(maxResults)
      : await findFollowTargets(maxResults);
    let mode: "live" | "curated" | "live_fallback" = preferLive ? "live" : "curated";

    if (preferLive && targets.length === 0) {
      targets = await findFollowTargets(maxResults);
      mode = "live_fallback";
    }

    // Apply type filter if requested
    const filteredTargets = type
      ? targets.filter((t) => t.category === type)
      : targets;

    const response: Record<string, unknown> = {
      targets: filteredTargets,
      total: filteredTargets.length,
      byPriority: {
        high: filteredTargets.filter((t) => t.priority === "high").length,
        medium: filteredTargets.filter((t) => t.priority === "medium").length,
        low: filteredTargets.filter((t) => t.priority === "low").length,
      },
      generatedAt: new Date().toISOString(),
      mode,
    };

    if (includeRecommendations) {
      response.contentRecommendations = await getGrowthRecommendations();
    }

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load growth targets";
    console.error("[API] GET /growth/targets error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
