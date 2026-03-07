/**
 * Post Pipeline — Scheduled posting queue for Jacob Rodgers recruiting content
 *
 * Uses Supabase (via admin client) as primary storage, with a full in-memory
 * fallback for environments where Supabase is not configured.
 *
 * Exports:
 *   createScheduledPost  — add a post to the queue
 *   processPostQueue     — send any posts that are due right now
 *   getPostQueue         — list all queued/pending posts
 *   cancelScheduledPost  — mark a post as cancelled
 */

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { postTweet } from "@/lib/integrations/x-api";

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
// Supabase row type
// ---------------------------------------------------------------------------

interface ScheduledPostRow {
  id: string;
  content: string;
  media_type: string | null;
  media_url: string | null;
  scheduled_at: string;
  status: string | null;
  posted_at: string | null;
  tweet_id: string | null;
  pillar: string | null;
  created_at: string | null;
}

function rowToPost(row: ScheduledPostRow): ScheduledPost {
  return {
    id: row.id,
    content: row.content,
    mediaType: row.media_type,
    mediaUrl: row.media_url,
    scheduledAt: row.scheduled_at,
    status: (row.status ?? "pending") as PostStatus,
    postedAt: row.posted_at,
    tweetId: row.tweet_id,
    pillar: row.pillar,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
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

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("scheduled_posts")
      .insert({
        content,
        media_type: mediaType,
        media_url: mediaUrl,
        scheduled_at: scheduledAt.toISOString(),
        status: "pending",
        pillar,
      })
      .select()
      .single();

    if (error) throw new Error(`Supabase insert failed: ${error.message}`);
    return rowToPost(data as ScheduledPostRow);
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
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    let query = supabase
      .from("scheduled_posts")
      .select("*")
      .order("scheduled_at", { ascending: true });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Supabase select failed: ${error.message}`);
    return (data as ScheduledPostRow[]).map(rowToPost);
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

  // ----- Supabase path -----
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();

    // Fetch posts that are pending and whose scheduled_at is <= now
    const { data: duePosts, error: fetchError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_at", now.toISOString());

    if (fetchError) {
      throw new Error(`Supabase fetch failed: ${fetchError.message}`);
    }

    for (const row of (duePosts ?? []) as ScheduledPostRow[]) {
      result.processed++;
      try {
        const tweeted = await postTweet(row.content);
        if (tweeted) {
          const { error: updateError } = await supabase
            .from("scheduled_posts")
            .update({
              status: "posted",
              posted_at: new Date().toISOString(),
              tweet_id: tweeted.id,
            })
            .eq("id", row.id);

          if (updateError) {
            console.error(`[processPostQueue] Failed to update row ${row.id}:`, updateError);
          }

          result.succeeded++;
          result.details.push({
            id: row.id,
            status: "posted",
            tweetId: tweeted.id,
          });
        } else {
          await supabase
            .from("scheduled_posts")
            .update({ status: "failed" })
            .eq("id", row.id);

          result.failed++;
          result.details.push({
            id: row.id,
            status: "failed",
            error: "postTweet returned null",
          });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        await supabase
          .from("scheduled_posts")
          .update({ status: "failed" })
          .eq("id", row.id);

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
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("scheduled_posts")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("status", "pending")
      .select();

    if (error) throw new Error(`Supabase update failed: ${error.message}`);
    return (data ?? []).length > 0;
  }

  const post = memQueue.find((p) => p.id === id && p.status === "pending");
  if (post) {
    post.status = "cancelled";
    return true;
  }
  return false;
}
