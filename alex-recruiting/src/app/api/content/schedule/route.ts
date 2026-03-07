/**
 * POST /api/content/schedule
 *
 * Schedule a new post for future publishing via the X API.
 *
 * Body:
 * {
 *   content: string,         — tweet text (required, max 280 chars)
 *   scheduledAt: string,     — ISO timestamp for when to post (required, must be future)
 *   mediaUrl?: string,       — optional URL to media asset
 *   mediaType?: string,      — "image/png" | "image/jpeg" | "video/mp4" etc.
 *   pillar?: string          — "performance" | "work_ethic" | "character"
 * }
 *
 * Also handles:
 * POST /api/content/schedule/process  — trigger queue processing (for cron or manual trigger)
 *
 * Returns:
 * { post: ScheduledPost }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createScheduledPost,
  processPostQueue,
} from "@/lib/content-engine/post-pipeline";

const MAX_TWEET_LENGTH = 280;
const VALID_PILLARS = ["performance", "work_ethic", "character"];

export async function POST(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);

    // Handle the /process sub-action without a separate route file
    if (pathname.endsWith("/process")) {
      const result = await processPostQueue();
      return NextResponse.json({ result });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.content || typeof body.content !== "string") {
      return NextResponse.json(
        { error: "Missing required field: content" },
        { status: 400 }
      );
    }

    if (body.content.length > MAX_TWEET_LENGTH) {
      return NextResponse.json(
        {
          error: `Content exceeds Twitter's ${MAX_TWEET_LENGTH}-character limit`,
          length: body.content.length,
          limit: MAX_TWEET_LENGTH,
        },
        { status: 400 }
      );
    }

    if (!body.scheduledAt) {
      return NextResponse.json(
        { error: "Missing required field: scheduledAt" },
        { status: 400 }
      );
    }

    const scheduledAt = new Date(body.scheduledAt);
    if (isNaN(scheduledAt.getTime())) {
      return NextResponse.json(
        { error: "Invalid scheduledAt — use ISO 8601 format" },
        { status: 400 }
      );
    }

    if (scheduledAt <= new Date()) {
      return NextResponse.json(
        {
          error: "scheduledAt must be in the future",
          provided: scheduledAt.toISOString(),
          now: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const pillar =
      body.pillar && VALID_PILLARS.includes(body.pillar) ? body.pillar : null;

    const post = await createScheduledPost({
      content: body.content,
      scheduledAt,
      mediaUrl: body.mediaUrl ?? null,
      mediaType: body.mediaType ?? null,
      pillar,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[POST /api/content/schedule]", err);
    return NextResponse.json(
      { error: "Failed to schedule post", details: message },
      { status: 500 }
    );
  }
}
