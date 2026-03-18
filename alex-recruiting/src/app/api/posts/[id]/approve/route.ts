import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  void req;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

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

    if (error) {
      console.error("Failed to approve post via Supabase:", error);
      return NextResponse.json(
        { error: "Failed to approve post", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Post ${params.id} approved and queued for publishing`,
      postId: params.id,
      status: "approved",
      post: data,
    });
  } catch (error) {
    console.error("Failed to approve post:", error);
    return NextResponse.json(
      { error: "Failed to approve post" },
      { status: 500 }
    );
  }
}
