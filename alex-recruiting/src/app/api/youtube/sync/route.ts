import { NextRequest, NextResponse } from "next/server";
import {
  getChannelVideos,
  getChannelStats,
  type YouTubeVideo,
  type YouTubeChannelStats,
} from "@/lib/integrations/youtube";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

// ── POST  /api/youtube/sync ────────────────────────────────────────────
// Syncs a YouTube channel's stats + videos, optionally persisting to Supabase.

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const channelId: string | undefined = body.channelId;

  if (!channelId) {
    return NextResponse.json({ error: "channelId required" }, { status: 400 });
  }

  if (!process.env.YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: "YouTube API key not configured" },
      { status: 500 },
    );
  }

  try {
    // 1. Fetch channel stats
    const channelStats: YouTubeChannelStats | null =
      await getChannelStats(channelId);

    // 2. Fetch videos
    const videos: YouTubeVideo[] = await getChannelVideos(channelId);

    // 3. Persist to Supabase if configured
    let synced = 0;

    if (isSupabaseConfigured() && videos.length > 0) {
      const supabase = createAdminClient();

      const rows = videos.map((v) => ({
        name: v.title,
        source: "youtube" as const,
        source_album: channelId,
        supabase_url: `https://www.youtube.com/watch?v=${v.id}`,
        thumbnail_url: v.thumbnailUrl,
        tags: v.tags,
        duration: parseDurationSeconds(v.duration),
        upload_status: "synced" as const,
        uploaded_at: v.publishedAt ? new Date(v.publishedAt).toISOString() : null,
      }));

      // Upsert by (source, supabase_url) — avoids duplicates on re-sync
      const { error, count } = await supabase
        .from("video_assets")
        .upsert(rows, { onConflict: "supabase_url", ignoreDuplicates: false })
        .select("id");

      if (error) {
        console.error("[youtube/sync] Supabase upsert error:", error.message);
      } else {
        synced = count ?? rows.length;
      }
    }

    return NextResponse.json({
      channelStats,
      synced,
      videos,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[youtube/sync] Error:", message);

    // Surface quota errors as 429
    if (message.includes("quota")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── GET  /api/youtube/sync?channelId=... ───────────────────────────────
// Returns channel stats without persisting anything.

export async function GET(request: NextRequest) {
  const channelId = request.nextUrl.searchParams.get("channelId");

  if (!channelId) {
    return NextResponse.json({ error: "channelId required" }, { status: 400 });
  }

  if (!process.env.YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: "YouTube API key not configured" },
      { status: 500 },
    );
  }

  try {
    const stats = await getChannelStats(channelId);
    return NextResponse.json({ stats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[youtube/sync] GET error:", message);

    if (message.includes("quota")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Convert ISO 8601 duration (PT1H2M3S) to total seconds.
 * Returns null for unparseable values.
 */
function parseDurationSeconds(iso: string): number | null {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}
