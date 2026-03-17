import { NextRequest, NextResponse } from "next/server";
import type { Post, ContentPillar } from "@/lib/types";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getAllPosts, insertPost } from "@/lib/posts/store";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Helpers — map Supabase row to Post type
// ---------------------------------------------------------------------------

interface PostRow {
  id: string;
  content: string;
  pillar: string;
  hashtags: string[] | null;
  media_url: string | null;
  scheduled_for: string | null;
  best_time: string | null;
  status: string;
  x_post_id: string | null;
  impressions: number;
  engagements: number;
  engagement_rate: number;
  created_at: string;
  updated_at: string;
}

function rowToPost(row: PostRow): Post {
  return {
    id: row.id,
    content: row.content,
    pillar: row.pillar as ContentPillar,
    hashtags: row.hashtags ?? [],
    mediaUrl: row.media_url,
    scheduledFor: row.scheduled_for ?? "",
    bestTime: row.best_time ?? "",
    status: row.status as Post["status"],
    xPostId: row.x_post_id,
    impressions: row.impressions ?? 0,
    engagements: row.engagements ?? 0,
    engagementRate: row.engagement_rate ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// GET /api/posts — list posts, optionally filtered by status and/or pillar
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const pillar = searchParams.get("pillar");
  let supabasePosts: Post[] = [];

  // ----- Supabase path -----
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      let query = supabase.from("posts").select("*");

      if (status) query = query.eq("status", status);
      if (pillar) query = query.eq("pillar", pillar);

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      supabasePosts = (data as PostRow[]).map(rowToPost);
    } catch (err) {
      console.error("[GET /api/posts] Supabase error, falling through to in-memory:", err);
    }
  }

  let localPosts = getAllPosts();
  if (status) localPosts = localPosts.filter((p) => p.status === status);
  if (pillar) localPosts = localPosts.filter((p) => p.pillar === pillar);

  const merged = [...supabasePosts];
  const seen = new Set(merged.map((post) => post.id));
  for (const post of localPosts) {
    if (seen.has(post.id)) continue;
    merged.push(post);
    seen.add(post.id);
  }

  merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ posts: merged, total: merged.length });
}

// ---------------------------------------------------------------------------
// POST /api/posts — create a new post
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const body = await req.json();

  // ----- Supabase path -----
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const now = new Date().toISOString();

      const insertRow = {
        content: body.content,
        pillar: body.pillar ?? "performance",
        hashtags: body.hashtags ?? [],
        media_url: body.mediaUrl ?? null,
        scheduled_for: body.scheduledFor ?? now,
        best_time: body.bestTime ?? "",
        status: "draft",
        x_post_id: null,
        impressions: 0,
        engagements: 0,
        engagement_rate: 0,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from("posts")
        .insert(insertRow)
        .select()
        .single();

      if (error) throw error;

      const post = rowToPost(data as PostRow);
      return NextResponse.json({ post }, { status: 201 });
    } catch (err) {
      console.error("[POST /api/posts] Supabase error, falling through to in-memory:", err);
      // Fall through to in-memory on error
    }
  }

  // ----- In-memory fallback -----
  const post: Post = insertPost({
    content: body.content,
    pillar: body.pillar as ContentPillar,
    hashtags: body.hashtags || [],
    mediaUrl: body.mediaUrl || null,
    scheduledFor: body.scheduledFor || new Date().toISOString(),
    bestTime: body.bestTime || "",
    status: "draft",
    xPostId: null,
    impressions: 0,
    engagements: 0,
    engagementRate: 0,
  });

  return NextResponse.json({ post }, { status: 201 });
}
