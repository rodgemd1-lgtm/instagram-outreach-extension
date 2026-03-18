import { NextRequest, NextResponse } from "next/server";
import {
  scrapeHudlProfile,
  isValidHudlUrl,
} from "@/lib/intelligence/hudl-scraper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface HudlScrapeRequest {
  profileUrl: string;
}

// POST /api/intelligence/hudl — Scrape a Hudl profile and return structured athlete data
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as HudlScrapeRequest;

    if (!body.profileUrl || typeof body.profileUrl !== "string") {
      return NextResponse.json(
        { error: "Missing required field: profileUrl" },
        { status: 400 }
      );
    }

    const profileUrl = body.profileUrl.trim();

    if (!isValidHudlUrl(profileUrl)) {
      return NextResponse.json(
        {
          error:
            "Invalid Hudl profile URL. Expected format: https://www.hudl.com/profile/<id>/...",
        },
        { status: 400 }
      );
    }

    const jinaApiKey = process.env.JINA_API_KEY || undefined;

    const profile = await scrapeHudlProfile(profileUrl, {
      apiKey: jinaApiKey,
      timeout: 30000,
    });

    // Strip rawMarkdown from the response to keep payload size reasonable
    const { rawMarkdown: _raw, ...profileData } = profile;

    return NextResponse.json({
      success: true,
      profile: profileData,
    });
  } catch (error) {
    console.error("Hudl profile scrape error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to scrape Hudl profile",
      },
      { status: 500 }
    );
  }
}
