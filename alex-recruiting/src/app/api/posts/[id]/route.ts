import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getPostById, updatePost } from "@/lib/posts/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!error && data) {
        return NextResponse.json({ post: data });
      }
    } catch (error) {
      console.error("[GET /api/posts/[id]] Supabase failure:", error);
    }
  }

  const post = getPostById(params.id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}));
  let supabaseFailure = false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const updates = {
        ...(body.content != null ? { content: body.content } : {}),
        ...(body.status != null ? { status: body.status } : {}),
        ...(body.mediaUrl !== undefined ? { media_url: body.mediaUrl } : {}),
        ...(body.bestTime !== undefined ? { best_time: body.bestTime } : {}),
        ...(body.hashtags !== undefined ? { hashtags: body.hashtags } : {}),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", params.id)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ post: data });
      }
    } catch (error) {
      console.error("[PATCH /api/posts/[id]] Supabase failure:", error);
      supabaseFailure = true;
    }
  }

  const post = updatePost(params.id, {
    ...(body.content != null ? { content: body.content } : {}),
    ...(body.status != null ? { status: body.status } : {}),
    ...(body.mediaUrl !== undefined ? { mediaUrl: body.mediaUrl } : {}),
    ...(body.bestTime !== undefined ? { bestTime: body.bestTime } : {}),
    ...(body.hashtags !== undefined ? { hashtags: body.hashtags } : {}),
  });

  if (!post) {
    return NextResponse.json(
      { error: supabaseFailure ? "Post not found in Supabase or local store" : "Post not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ post });
}
