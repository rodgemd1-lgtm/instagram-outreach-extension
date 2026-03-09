import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { updatePost } from "@/lib/posts/store";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  void req;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("posts")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({
          message: `Post ${params.id} approved and queued for publishing`,
          postId: params.id,
          status: "approved",
          post: data,
        });
      }
    } catch (error) {
      console.error("Failed to approve post via Supabase:", error);
    }
  }

  const post = updatePost(params.id, { status: "approved" });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({
    message: `Post ${params.id} approved and queued for publishing`,
    postId: params.id,
    status: "approved",
    post,
  });
}
