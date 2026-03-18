/**
 * GET /api/content/queue
 *
 * Retrieve all posts where status is 'queued' or 'draft', ordered by scheduledFor.
 * Falls back to empty array if DB is not configured.
 *
 * Query params:
 *   pillar   — filter by pillar: performance | work_ethic | character
 *   status   — filter by status: queued | draft | approved | rejected | posted
 *
 * Returns:
 * {
 *   posts: Post[],
 *   total: number,
 *   counts: { queued: number, draft: number, approved: number, rejected: number, posted: number }
 * }
 *
 * PATCH /api/content/queue
 *
 * Bulk update post statuses.
 *
 * Body:
 * {
 *   ids: string[],
 *   action: 'approve' | 'reject' | 'reschedule',
 *   scheduledFor?: string   // required for 'reschedule' action
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, inArray, or, asc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET — Retrieve content queue
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pillarFilter = searchParams.get("pillar");
    const statusFilter = searchParams.get("status");

    if (!isDbConfigured()) {
      return NextResponse.json({
        posts: [],
        total: 0,
        counts: { queued: 0, draft: 0, approved: 0, rejected: 0, posted: 0 },
        hint: "No posts yet. Use the Content Generator or ask Trey to draft posts.",
      });
    }

    // Build query conditions
    let posts;
    try {
      // If no specific status filter, get queued and draft posts
      if (statusFilter) {
        if (pillarFilter) {
          posts = await db
            .select()
            .from(schema.posts)
            .where(
              sql`${schema.posts.status} = ${statusFilter} AND ${schema.posts.pillar} = ${pillarFilter}`
            )
            .orderBy(asc(schema.posts.scheduledFor));
        } else {
          posts = await db
            .select()
            .from(schema.posts)
            .where(eq(schema.posts.status, statusFilter))
            .orderBy(asc(schema.posts.scheduledFor));
        }
      } else {
        if (pillarFilter) {
          posts = await db
            .select()
            .from(schema.posts)
            .where(
              sql`(${schema.posts.status} = 'queued' OR ${schema.posts.status} = 'draft') AND ${schema.posts.pillar} = ${pillarFilter}`
            )
            .orderBy(asc(schema.posts.scheduledFor));
        } else {
          posts = await db
            .select()
            .from(schema.posts)
            .where(
              or(
                eq(schema.posts.status, "queued"),
                eq(schema.posts.status, "draft")
              )
            )
            .orderBy(asc(schema.posts.scheduledFor));
        }
      }
    } catch (dbErr) {
      console.error("[GET /api/content/queue] DB query failed:", dbErr);
      return NextResponse.json({
        posts: [],
        total: 0,
        counts: { queued: 0, draft: 0, approved: 0, rejected: 0, posted: 0 },
      });
    }

    // Compute counts across all statuses
    const counts = { queued: 0, draft: 0, approved: 0, rejected: 0, posted: 0 };
    try {
      const allPosts = await db.select({ status: schema.posts.status }).from(schema.posts);
      for (const p of allPosts) {
        const s = p.status as keyof typeof counts;
        if (s in counts) counts[s]++;
      }
    } catch {
      // counts remain zeroed if this fails
    }

    // Serialize for the client
    const serialized = posts.map((p) => ({
      id: p.id,
      content: p.content,
      pillar: p.pillar,
      hashtags: p.hashtags,
      mediaUrl: p.mediaUrl,
      scheduledFor: p.scheduledFor ? p.scheduledFor.toISOString() : null,
      bestTime: p.bestTime,
      status: p.status,
      xPostId: p.xPostId,
      impressions: p.impressions,
      engagements: p.engagements,
      engagementRate: p.engagementRate,
      createdAt: p.createdAt ? p.createdAt.toISOString() : null,
      updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
    }));

    return NextResponse.json({
      posts: serialized,
      total: serialized.length,
      counts,
      ...(serialized.length === 0 && {
        hint: "No posts yet. Use the Content Generator or ask Trey to draft posts.",
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[GET /api/content/queue]", err);
    return NextResponse.json(
      { error: "Failed to retrieve content queue", details: message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH — Bulk update post statuses
// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, action, scheduledFor } = body as {
      ids: string[];
      action: "approve" | "reject" | "reschedule";
      scheduledFor?: string;
    };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: ids (string[])" },
        { status: 400 }
      );
    }

    if (!action || !["approve", "reject", "reschedule"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be: approve, reject, or reschedule" },
        { status: 400 }
      );
    }

    if (action === "reschedule" && !scheduledFor) {
      return NextResponse.json(
        { error: "scheduledFor is required for reschedule action" },
        { status: 400 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({
        success: true,
        updated: ids.length,
        action,
        note: "Database not configured -- no actual updates performed",
      });
    }

    // Map action to status
    const statusMap: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      reschedule: "queued",
    };

    const newStatus = statusMap[action];
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updatedAt: new Date(),
    };

    if (action === "reschedule" && scheduledFor) {
      updateData.scheduledFor = new Date(scheduledFor);
    }

    await db
      .update(schema.posts)
      .set(updateData)
      .where(inArray(schema.posts.id, ids));

    return NextResponse.json({
      success: true,
      updated: ids.length,
      action,
      newStatus,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[PATCH /api/content/queue]", err);
    return NextResponse.json(
      { error: "Failed to update posts", details: message },
      { status: 500 }
    );
  }
}
