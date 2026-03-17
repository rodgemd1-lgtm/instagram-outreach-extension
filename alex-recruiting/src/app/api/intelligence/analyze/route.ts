import { NextRequest, NextResponse } from "next/server";
import {
  analyzeTweets,
  extractOfferEvents,
  extractCommitmentEvents,
  calculateIntelligenceScore,
  calculateRecruitingTimeline,
} from "@/lib/intelligence";
import type { XTweet } from "@/lib/integrations/x-api";
import type { HudlProfile } from "@/lib/types/recruiting-intelligence";

interface AnalyzeRequest {
  athleteId: string;
  athleteName: string;
  athleteHandle: string;
  classYear: number;
  height: string;
  weight: string;
  gpa?: number;
  satScore?: number;
  actScore?: number;
  followerCount?: number;
  coachFollowerCount?: number;
  postFrequency?: number;
  engagementRate?: number;
  tweets?: XTweet[];
  hudlProfile?: HudlProfile;
  division?: string;
}

// POST /api/intelligence/analyze — Run full intelligence analysis
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequest;

    // Analyze tweet patterns
    const tweetPatterns = body.tweets
      ? analyzeTweets(body.tweets, body.athleteHandle, body.athleteName)
      : [];

    // Extract events
    const offers = extractOfferEvents(tweetPatterns);
    const commitments = extractCommitmentEvents(tweetPatterns);

    // Calculate intelligence score
    const score = calculateIntelligenceScore({
      athleteId: body.athleteId,
      athleteName: body.athleteName,
      hudlProfile: body.hudlProfile || null,
      tweetPatterns,
      offers,
      followerCount: body.followerCount || 0,
      coachFollowerCount: body.coachFollowerCount || 0,
      postFrequency: body.postFrequency || 0,
      engagementRate: body.engagementRate || 0,
      height: body.height,
      weight: body.weight,
      gpa: body.gpa || null,
      satScore: body.satScore || null,
      actScore: body.actScore || null,
      classYear: body.classYear,
    });

    // Calculate recruiting timeline
    const timeline = calculateRecruitingTimeline(
      body.classYear,
      body.division || "D1 FBS"
    );

    return NextResponse.json({
      score,
      tweetPatterns,
      offers,
      commitments,
      timeline,
    });
  } catch (error) {
    console.error("Intelligence analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
