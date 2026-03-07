/**
 * GET /api/content/queue
 *
 * Retrieve the scheduled post queue.
 *
 * Query params:
 *   status — filter by status: pending | processing | posted | failed | cancelled
 *
 * Returns:
 * {
 *   posts: ScheduledPost[],
 *   total: number,
 *   counts: { pending: number, posted: number, failed: number, cancelled: number }
 * }
 *
 * DELETE /api/content/queue?id=<post-id>
 *
 * Cancel a pending scheduled post.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getPostQueue,
  cancelScheduledPost,
  type PostStatus,
} from "@/lib/content-engine/post-pipeline";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") as PostStatus | null;

    const validStatuses: PostStatus[] = [
      "pending",
      "processing",
      "posted",
      "failed",
      "cancelled",
    ];

    const statusFilter =
      statusParam && validStatuses.includes(statusParam) ? statusParam : undefined;

    const posts = await getPostQueue(statusFilter);

    // Compute counts across all statuses (only when no filter applied)
    let counts = { pending: 0, processing: 0, posted: 0, failed: 0, cancelled: 0 };
    if (!statusFilter) {
      for (const post of posts) {
        if (post.status in counts) {
          counts[post.status as keyof typeof counts]++;
        }
      }
    }

    return NextResponse.json({
      posts,
      total: posts.length,
      counts: statusFilter ? undefined : counts,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[GET /api/content/queue]", err);
    return NextResponse.json(
      { error: "Failed to retrieve post queue", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required query parameter: id" },
        { status: 400 }
      );
    }

    const cancelled = await cancelScheduledPost(id);

    if (!cancelled) {
      return NextResponse.json(
        { error: "Post not found or not in pending state", id },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id, status: "cancelled" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[DELETE /api/content/queue]", err);
    return NextResponse.json(
      { error: "Failed to cancel post", details: message },
      { status: 500 }
    );
  }
}
