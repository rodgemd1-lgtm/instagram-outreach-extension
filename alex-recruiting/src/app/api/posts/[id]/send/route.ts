import { NextRequest, NextResponse } from "next/server";
import { postTweet } from "@/lib/integrations/x-api";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get post content from request body
    const body = await req.json().catch(() => null);
    const text = body?.text;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing 'text' in request body" },
        { status: 400 }
      );
    }

    if (text.length > 280) {
      return NextResponse.json(
        { error: "Post exceeds 280 character limit" },
        { status: 400 }
      );
    }

    // Check OAuth credentials are configured
    if (
      !process.env.X_API_CONSUMER_KEY ||
      !process.env.X_API_CONSUMER_SECRET ||
      !process.env.X_API_ACCESS_TOKEN ||
      !process.env.X_API_ACCESS_TOKEN_SECRET
    ) {
      return NextResponse.json(
        { error: "X API OAuth 1.0a credentials not configured. Set X_API_CONSUMER_KEY, X_API_CONSUMER_SECRET, X_API_ACCESS_TOKEN, and X_API_ACCESS_TOKEN_SECRET in .env" },
        { status: 500 }
      );
    }

    const result = await postTweet(text, body?.mediaId);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to post tweet. Check server logs for details." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      postId: params.id,
      tweetId: result.id,
      tweetUrl: `https://x.com/i/status/${result.id}`,
      status: "posted",
    });
  } catch (error) {
    console.error("Post send error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
