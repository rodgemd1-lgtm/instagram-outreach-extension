import { NextRequest, NextResponse } from "next/server";
import { scrapeHudlProfile, isValidHudlUrl, extractHudlUrl } from "@/lib/intelligence";

// POST /api/intelligence/hudl — Scrape a Hudl profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileUrl, rawText } = body as { profileUrl?: string; rawText?: string };

    // Extract URL from raw text if provided (e.g., from a tweet or bio)
    let url = profileUrl;
    if (!url && rawText) {
      url = extractHudlUrl(rawText) || undefined;
    }

    if (!url) {
      return NextResponse.json(
        { error: "No Hudl profile URL provided or found in text" },
        { status: 400 }
      );
    }

    if (!isValidHudlUrl(url)) {
      return NextResponse.json(
        { error: "Invalid Hudl profile URL. Expected format: hudl.com/profile/<id>/<name>" },
        { status: 400 }
      );
    }

    const profile = await scrapeHudlProfile(url, {
      apiKey: process.env.JINA_API_KEY,
      timeout: 30000,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Hudl scrape error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to scrape Hudl profile" },
      { status: 500 }
    );
  }
}

// GET /api/intelligence/hudl?url=... — Quick scrape by URL param
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url || !isValidHudlUrl(url)) {
    return NextResponse.json(
      { error: "Valid Hudl profile URL required" },
      { status: 400 }
    );
  }

  try {
    const profile = await scrapeHudlProfile(url, {
      apiKey: process.env.JINA_API_KEY,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scrape failed" },
      { status: 500 }
    );
  }
}
