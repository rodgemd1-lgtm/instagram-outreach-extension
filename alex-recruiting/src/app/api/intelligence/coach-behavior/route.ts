import { NextRequest, NextResponse } from "next/server";
import {
  analyzeCoachBehavior,
  rankCoachesByResponseLikelihood,
  getCoachInsights,
} from "@/lib/intelligence";
import { getUserTweets, verifyHandle } from "@/lib/integrations/x-api";
import type { Coach } from "@/lib/types";

export const dynamic = "force-dynamic";

interface CoachAnalysisRequest {
  coaches: Partial<Coach>[];
  recruitHandle?: string;
}

// POST /api/intelligence/coach-behavior — Analyze coach behavior patterns
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CoachAnalysisRequest;
    const { coaches, recruitHandle } = body;

    if (!coaches || coaches.length === 0) {
      return NextResponse.json(
        { error: "At least one coach required" },
        { status: 400 }
      );
    }

    const profiles = [];

    for (const coach of coaches) {
      if (!coach.xHandle) continue;

      // Fetch coach's X data
      const xUser = await verifyHandle(coach.xHandle);
      const tweets = xUser
        ? await getUserTweets(xUser.id, 50)
        : [];

      // Check if coach follows the recruit
      let followsRecruit = false;
      if (recruitHandle && xUser) {
        // Simplified: would need full follower check in production
        followsRecruit = coach.followStatus === "followed_back";
      }

      const hasResponded = coach.dmStatus === "responded";

      const profile = analyzeCoachBehavior(
        coach,
        tweets,
        xUser,
        followsRecruit,
        hasResponded
      );

      profiles.push({
        ...profile,
        insights: getCoachInsights(profile),
      });
    }

    // Rank by response likelihood
    const ranked = rankCoachesByResponseLikelihood(profiles);

    return NextResponse.json({
      profiles: ranked.map((p) => ({
        ...p,
        insights: getCoachInsights(p),
      })),
      totalAnalyzed: profiles.length,
    });
  } catch (error) {
    console.error("Coach behavior analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
