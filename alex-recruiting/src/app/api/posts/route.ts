import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Post, ContentPillar } from "@/lib/types";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getAllPosts, insertPost } from "@/lib/posts/store";

// ---------------------------------------------------------------------------
// Input validation schema — POST /api/posts
// ---------------------------------------------------------------------------
const createPostSchema = z.object({
  content: z.string().min(1, "content is required").max(2800, "content exceeds 2800 chars"),
  pillar: z.enum(["performance", "work_ethic", "character"], {
    errorMap: () => ({ message: "pillar must be performance, work_ethic, or character" }),
  }),
  hashtags: z.array(z.string().max(100)).max(30).optional(),
  mediaUrl: z.string().url().optional().nullable(),
  scheduledFor: z.string().datetime({ offset: true }).optional(),
  bestTime: z.string().max(50).optional(),
});

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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // ----- Supabase path -----
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const now = new Date().toISOString();

      const insertRow = {
        content: data.content,
        pillar: data.pillar,
        hashtags: data.hashtags ?? [],
        media_url: data.mediaUrl ?? null,
        scheduled_for: data.scheduledFor ?? now,
        best_time: data.bestTime ?? "",
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
    content: data.content,
    pillar: data.pillar as ContentPillar,
    hashtags: data.hashtags || [],
    mediaUrl: data.mediaUrl || null,
    scheduledFor: data.scheduledFor || new Date().toISOString(),
    bestTime: data.bestTime || "",
    status: "draft",
    xPostId: null,
    impressions: 0,
    engagements: 0,
    engagementRate: 0,
  });

  return NextResponse.json({ post }, { status: 201 });
}
