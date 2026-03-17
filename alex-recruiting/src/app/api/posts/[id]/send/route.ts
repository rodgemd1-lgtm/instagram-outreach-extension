import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { postTweet, uploadMediaFromFile } from "@/lib/integrations/x-api";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getPostById, updatePost } from "@/lib/posts/store";

function resolveLocalMediaPath(mediaUrl: string | null): string | null {
  if (!mediaUrl) return null;

  if (mediaUrl.startsWith("/optimized-media/") || mediaUrl.startsWith("/recruit/")) {
    return path.join(process.cwd(), "public", mediaUrl.replace(/^\//, ""));
  }

  if (mediaUrl.startsWith("/api/videos/serve?")) {
    const media = new URL(mediaUrl, "http://localhost");
    return media.searchParams.get("path");
  }

  return null;
}

function buildAltText(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 900);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => null);
    const storedPost = !body?.text ? getPostById(params.id) : null;
    const text = body?.text ?? storedPost?.content;
    const mediaUrl = body?.mediaUrl ?? storedPost?.mediaUrl ?? null;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing 'text' in request body" },
        { status: 400 }
      );
    }

    if (text.length > 280) {
      return NextResponse.json(
        { error: "Post exceeds 280 character limit" },
        { status: 400 }
      );
    }

    let mediaId = body?.mediaId as string | undefined;
    if (!mediaId && mediaUrl) {
      const localMediaPath = resolveLocalMediaPath(mediaUrl);
      if (!localMediaPath) {
        return NextResponse.json(
          { error: "Unsupported mediaUrl format for X upload" },
          { status: 400 }
        );
      }

      const uploaded = await uploadMediaFromFile(localMediaPath, {
        altText: buildAltText(text),
      });
      if (!uploaded) {
        return NextResponse.json(
          { error: "Failed to upload media to X before posting" },
          { status: 502 }
        );
      }

      mediaId = uploaded.mediaId;
    }

    const result = await postTweet(text, mediaId);
    const now = new Date().toISOString();

    if (!result) {
      return NextResponse.json(
        { error: "Failed to post tweet. Check server logs for details." },
        { status: 502 }
      );
    }

    let persistedPost: unknown = null;
    let warning: string | null = null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from("posts")
          .update({
            content: text,
            media_url: mediaUrl,
            status: "posted",
            x_post_id: result.id,
            updated_at: now,
          })
          .eq("id", params.id)
          .select()
          .single();

        if (error) {
          warning = "Tweet posted, but the Supabase post record was not updated.";
        } else {
          persistedPost = data;
        }
      } catch (error) {
        console.error("Failed to persist posted status via Supabase:", error);
        warning = "Tweet posted, but the Supabase post record was not updated.";
      }
    }

    if (!persistedPost) {
      const updated = updatePost(params.id, {
        content: text,
        mediaUrl,
        status: "posted",
        xPostId: result.id,
      });

      if (updated) {
        persistedPost = updated;
      } else if (!warning) {
        warning = "Tweet posted, but no local post record was found to update.";
      }
    }

    return NextResponse.json({
      postId: params.id,
      tweetId: result.id,
      tweetUrl: `https://x.com/i/status/${result.id}`,
      status: "posted",
      mediaId,
      post: persistedPost,
      warning,
    });
  } catch (error) {
    console.error("Post send error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = /Reconnect X|No connected X account|configured/i.test(message)
      ? 503
      : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
