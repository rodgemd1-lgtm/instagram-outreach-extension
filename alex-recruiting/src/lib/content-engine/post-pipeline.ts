/**
 * Post Pipeline — Scheduled posting queue for Jacob Rodgers recruiting content
 *
 * Stores scheduled posts in the `scheduled_posts` DB table when configured,
 * with a full in-memory fallback for development environments.
 *
 * Exports:
 *   createScheduledPost  — add a post to the queue
 *   processPostQueue     — send any posts that are due right now
 *   getPostQueue         — list all queued/pending posts
 *   cancelScheduledPost  — mark a post as cancelled
 */

import { db, isDbConfigured } from "@/lib/db";
import { scheduledPosts } from "@/lib/db/schema";
import { postTweet } from "@/lib/integrations/x-api";
import { eq, lte, and } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PostStatus = "pending" | "processing" | "posted" | "failed" | "cancelled";

export interface ScheduledPost {
  id: string;
  content: string;
  mediaType: string | null;
  mediaUrl: string | null;
  scheduledAt: string;   // ISO timestamp
  status: PostStatus;
  postedAt: string | null;
  tweetId: string | null;
  pillar: string | null;
  createdAt: string;
}

export interface CreatePostOptions {
  content: string;
  scheduledAt: Date;
  mediaBuffer?: Buffer;
  mediaType?: string;
  mediaUrl?: string;
  pillar?: string;
}

export interface ProcessResult {
  processed: number;
  succeeded: number;
  failed: number;
  details: Array<{
    id: string;
    status: "posted" | "failed";
    tweetId?: string;
    error?: string;
  }>;
}

// ---------------------------------------------------------------------------
// In-memory fallback store
// ---------------------------------------------------------------------------

const memQueue: ScheduledPost[] = [];

function generateId(): string {
  return `sp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// 1. createScheduledPost
// ---------------------------------------------------------------------------

export async function createScheduledPost(
  options: CreatePostOptions
): Promise<ScheduledPost> {
  const {
    content,
    scheduledAt,
    mediaUrl = null,
    mediaType = null,
    pillar = null,
  } = options;

  if (isDbConfigured()) {
    const [row] = await db
      .insert(scheduledPosts)
      .values({
        content,
        mediaType,
        mediaUrl,
        scheduledAt,
        status: "pending",
        pillar,
      })
      .returning();

    return dbRowToPost(row);
  }

  // In-memory fallback
  const post: ScheduledPost = {
    id: generateId(),
    content,
    mediaType,
    mediaUrl,
    scheduledAt: scheduledAt.toISOString(),
    status: "pending",
    postedAt: null,
    tweetId: null,
    pillar,
    createdAt: new Date().toISOString(),
  };

  memQueue.push(post);
  return post;
}

// ---------------------------------------------------------------------------
// 2. getPostQueue
// ---------------------------------------------------------------------------

export async function getPostQueue(
  statusFilter?: PostStatus
): Promise<ScheduledPost[]> {
  if (isDbConfigured()) {
    const rows = statusFilter
      ? await db
          .select()
          .from(scheduledPosts)
          .where(eq(scheduledPosts.status, statusFilter))
      : await db.select().from(scheduledPosts);

    return rows.map(dbRowToPost).sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }

  const items = statusFilter
    ? memQueue.filter((p) => p.status === statusFilter)
    : [...memQueue];

  return items.sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );
}

// ---------------------------------------------------------------------------
// 3. processPostQueue
// ---------------------------------------------------------------------------

export async function processPostQueue(): Promise<ProcessResult> {
  const now = new Date();
  const result: ProcessResult = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    details: [],
  };

  // ----- DB path -----
  if (isDbConfigured()) {
    const duePosts = await db
      .select()
      .from(scheduledPosts)
      .where(
        and(
          eq(scheduledPosts.status, "pending"),
          lte(scheduledPosts.scheduledAt, now)
        )
      );

    for (const row of duePosts) {
      result.processed++;
      try {
        const tweeted = await postTweet(row.content);
        if (tweeted) {
          await db
            .update(scheduledPosts)
            .set({
              status: "posted",
              postedAt: new Date(),
              tweetId: tweeted.id,
            })
            .where(eq(scheduledPosts.id, row.id));

          result.succeeded++;
          result.details.push({
            id: row.id,
            status: "posted",
            tweetId: tweeted.id,
          });
        } else {
          await db
            .update(scheduledPosts)
            .set({ status: "failed" })
            .where(eq(scheduledPosts.id, row.id));

          result.failed++;
          result.details.push({
            id: row.id,
            status: "failed",
            error: "postTweet returned null",
          });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        await db
          .update(scheduledPosts)
          .set({ status: "failed" })
          .where(eq(scheduledPosts.id, row.id));

        result.failed++;
        result.details.push({
          id: row.id,
          status: "failed",
          error: errorMsg,
        });
      }
    }

    return result;
  }

  // ----- In-memory path -----
  const duePosts = memQueue.filter(
    (p) => p.status === "pending" && new Date(p.scheduledAt) <= now
  );

  for (const post of duePosts) {
    result.processed++;
    post.status = "processing";

    try {
      const tweeted = await postTweet(post.content);
      if (tweeted) {
        post.status = "posted";
        post.postedAt = new Date().toISOString();
        post.tweetId = tweeted.id;
        result.succeeded++;
        result.details.push({ id: post.id, status: "posted", tweetId: tweeted.id });
      } else {
        post.status = "failed";
        result.failed++;
        result.details.push({ id: post.id, status: "failed", error: "postTweet returned null" });
      }
    } catch (err) {
      post.status = "failed";
      const errorMsg = err instanceof Error ? err.message : String(err);
      result.failed++;
      result.details.push({ id: post.id, status: "failed", error: errorMsg });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// 4. cancelScheduledPost
// ---------------------------------------------------------------------------

export async function cancelScheduledPost(id: string): Promise<boolean> {
  if (isDbConfigured()) {
    const result = await db
      .update(scheduledPosts)
      .set({ status: "cancelled" })
      .where(and(eq(scheduledPosts.id, id), eq(scheduledPosts.status, "pending")))
      .returning();

    return result.length > 0;
  }

  const post = memQueue.find((p) => p.id === id && p.status === "pending");
  if (post) {
    post.status = "cancelled";
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Internal — row mapper
// ---------------------------------------------------------------------------

type DbRow = {
  id: string;
  content: string;
  mediaType: string | null;
  mediaUrl: string | null;
  scheduledAt: Date;
  status: string | null;
  postedAt: Date | null;
  tweetId: string | null;
  pillar: string | null;
  createdAt: Date | null;
};

function dbRowToPost(row: DbRow): ScheduledPost {
  return {
    id: row.id,
    content: row.content,
    mediaType: row.mediaType,
    mediaUrl: row.mediaUrl,
    scheduledAt: row.scheduledAt.toISOString(),
    status: (row.status ?? "pending") as PostStatus,
    postedAt: row.postedAt ? row.postedAt.toISOString() : null,
    tweetId: row.tweetId,
    pillar: row.pillar,
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
  };
}
