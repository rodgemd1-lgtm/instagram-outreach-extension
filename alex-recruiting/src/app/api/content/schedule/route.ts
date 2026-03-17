/**
 * /api/content/schedule
 *
 * POST — Schedule a new post for future publishing via the X API.
 * GET  — Cron endpoint: process the post queue (Vercel cron sends GET).
 *
 * POST Body:
 * {
 *   content: string,         — tweet text (required, max 280 chars)
 *   scheduledAt: string,     — ISO timestamp for when to post (required, must be future)
 *   mediaUrl?: string,       — optional URL to media asset
 *   mediaType?: string,      — "image/png" | "image/jpeg" | "video/mp4" etc.
 *   pillar?: string          — "performance" | "work_ethic" | "character"
 * }
 *
 * GET ?action=process — trigger queue processing (for Vercel cron)
 *   Requires Authorization: Bearer <CRON_SECRET>
 *
 * Returns:
 * { post: ScheduledPost } or { result: ProcessResult }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createScheduledPost,
  processPostQueue,
} from "@/lib/content-engine/post-pipeline";
import { autoScheduleToday } from "@/lib/content-engine/auto-scheduler";

export const dynamic = "force-dynamic";

const MAX_TWEET_LENGTH = 280;
const VALID_PILLARS = ["performance", "work_ethic", "character"];

// ---------------------------------------------------------------------------
// Cron secret validation
// ---------------------------------------------------------------------------

function isValidCronRequest(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // If no CRON_SECRET is configured, allow the request in dev
  if (!cronSecret) {
    console.warn("[schedule/cron] CRON_SECRET not set — allowing request (dev mode)");
    return true;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;

  // Accept "Bearer <secret>" format
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return token === cronSecret;
}

// ---------------------------------------------------------------------------
// GET — Cron-triggered queue processing
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "process") {
    if (!isValidCronRequest(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      // Auto-schedule a post if today is Mon/Wed/Fri and none exists yet
      const autoResult = await autoScheduleToday();

      // Process any due posts
      const result = await processPostQueue();
      return NextResponse.json({ autoSchedule: autoResult, result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[GET /api/content/schedule?action=process]", err);
      return NextResponse.json(
        { error: "Failed to process post queue", details: message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: "Unknown action. Use ?action=process" },
    { status: 400 }
  );
}

// ---------------------------------------------------------------------------
// POST — Schedule a new post or manually trigger processing
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // Manual trigger via POST ?action=process (legacy support)
    if (action === "process") {
      if (!isValidCronRequest(req)) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

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
