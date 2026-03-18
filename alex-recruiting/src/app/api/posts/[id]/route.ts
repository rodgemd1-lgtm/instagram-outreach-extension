import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error("[GET /api/posts/[id]] failure:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));

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

    if (error) {
      console.error("[PATCH /api/posts/[id]] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update post", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error("[PATCH /api/posts/[id]] failure:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
