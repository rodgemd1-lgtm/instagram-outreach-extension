// POST /api/growth/track — Log an engagement action
// GET  /api/growth/track — List recent engagement actions

import { NextRequest, NextResponse } from "next/server";
import {
  trackEngagementAction,
  measureEngagementROI,
  type EngagementActionType,
} from "@/lib/growth/engagement-strategy";
import { db, isDbConfigured } from "@/lib/db";
import { engagementActions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

const VALID_ACTION_TYPES: EngagementActionType[] = [
  "like",
  "reply",
  "retweet",
  "quote_tweet",
  "follow",
  "dm",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetHandle, targetCategory, actionType, content, resultFollowerGain } = body;

    // Validation
    if (!targetHandle || !actionType) {
      return NextResponse.json(
        { error: "targetHandle and actionType are required" },
        { status: 400 }
      );
    }

    if (!VALID_ACTION_TYPES.includes(actionType)) {
      return NextResponse.json(
        {
          error: `actionType must be one of: ${VALID_ACTION_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const action = await trackEngagementAction({
      targetHandle,
      targetCategory,
      actionType,
      content,
      resultFollowerGain: resultFollowerGain !== undefined ? parseInt(resultFollowerGain) : undefined,
    });

    return NextResponse.json(
      {
        action,
        message: `Logged ${actionType} on ${targetHandle}`,
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to track action";
    console.error("[API] POST /growth/track error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
    const includeRoi = searchParams.get("roi") === "true";

    let recentActions: unknown[] = [];

    if (isDbConfigured()) {
      const rows = await db
        .select()
        .from(engagementActions)
        .orderBy(desc(engagementActions.createdAt))
        .limit(limit);

      recentActions = rows.map((r) => ({
        id: r.id,
        targetHandle: r.targetHandle,
        targetCategory: r.targetCategory,
        actionType: r.actionType,
        content: r.content,
        resultFollowerGain: r.resultFollowerGain,
        createdAt: r.createdAt?.toISOString(),
      }));
    }

    const response: Record<string, unknown> = {
      actions: recentActions,
      total: recentActions.length,
    };

    if (includeRoi) {
      response.roi = await measureEngagementROI();
    }

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get actions";
    console.error("[API] GET /growth/track error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
