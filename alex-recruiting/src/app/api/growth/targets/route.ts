// GET /api/growth/targets — Recommended follow targets with live X verification
// Returns high-priority accounts to follow, optionally with follower analysis

import { NextRequest, NextResponse } from "next/server";
import {
  findFollowTargets,
  analyzeTargetFollowers,
  getGrowthRecommendations,
} from "@/lib/growth/follower-scraper";

function parseTargetLimit(rawLimit: string | null): number {
  const parsed = Number.parseInt(rawLimit ?? "", 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return 25;
  }

  return Math.max(1, Math.min(parsed, 50));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const maxResults = parseTargetLimit(searchParams.get("limit"));
    const analyze = searchParams.get("analyze"); // handle to analyze followers of
    const type = searchParams.get("type"); // filter by category
    const includeRecommendations = searchParams.get("recommendations") !== "false";

    // If an analyze handle is provided, return the follower analysis for that account
    if (analyze) {
      const analysis = await analyzeTargetFollowers(analyze);
      return NextResponse.json({
        analysis,
        generatedAt: new Date().toISOString(),
      });
    }

    // Build follow targets (from curated list)
    const targets = await findFollowTargets(maxResults);

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
