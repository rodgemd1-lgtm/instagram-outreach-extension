/* eslint-disable @typescript-eslint/no-explicit-any */
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

function getApiKey(): string | null {
  return process.env.YOUTUBE_API_KEY || null;
}

// ── Types ──────────────────────────────────────────────────────────────

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  duration: string;
  tags: string[];
}

export interface YouTubeChannelStats {
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  channelId: string;
  title: string;
  description: string;
}

// ── Helpers ────────────────────────────────────────────────────────────

async function ytFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not configured");
  }

  const url = new URL(`${YOUTUBE_API_BASE}/${path}`);
  url.searchParams.set("key", apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // Detect quota exhaustion specifically
    if (res.status === 403 && body.includes("quotaExceeded")) {
      throw new Error("YouTube API daily quota exceeded — try again tomorrow");
    }
    throw new Error(`YouTube API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

function parseVideoFromItem(item: any): YouTubeVideo {
  const snippet = item.snippet ?? {};
  const stats = item.statistics ?? {};
  const content = item.contentDetails ?? {};
  const thumbs = snippet.thumbnails ?? {};

  return {
    id: typeof item.id === "string" ? item.id : item.id?.videoId ?? "",
    title: snippet.title ?? "",
    description: snippet.description ?? "",
    publishedAt: snippet.publishedAt ?? "",
    thumbnailUrl: thumbs.high?.url ?? thumbs.medium?.url ?? thumbs.default?.url ?? "",
    viewCount: parseInt(stats.viewCount ?? "0", 10),
    likeCount: parseInt(stats.likeCount ?? "0", 10),
    duration: content.duration ?? "",
    tags: Array.isArray(snippet.tags) ? snippet.tags : [],
  };
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Fetch channel-level statistics and metadata.
 */
export async function getChannelStats(channelId: string): Promise<YouTubeChannelStats | null> {
  const data = await ytFetch<{ items?: any[] }>("channels", {
    part: "statistics,snippet",
    id: channelId,
  });

  const item = data.items?.[0];
  if (!item) return null;

  const stats = item.statistics ?? {};
  const snippet = item.snippet ?? {};

  return {
    subscriberCount: parseInt(stats.subscriberCount ?? "0", 10),
    videoCount: parseInt(stats.videoCount ?? "0", 10),
    viewCount: parseInt(stats.viewCount ?? "0", 10),
    channelId,
    title: snippet.title ?? "",
    description: snippet.description ?? "",
  };
}

/**
 * List recent videos for a channel, enriched with statistics + duration.
 *
 * 1. Search for video IDs by channel (ordered by date).
 * 2. Batch-fetch statistics & contentDetails for each video.
 */
export async function getChannelVideos(
  channelId: string,
  maxResults = 50,
): Promise<YouTubeVideo[]> {
  // Step 1 — search for video IDs
  const searchData = await ytFetch<{ items?: any[] }>("search", {
    part: "snippet",
    channelId,
    type: "video",
    order: "date",
    maxResults: String(Math.min(maxResults, 50)),
  });

  const searchItems = searchData.items ?? [];
  if (searchItems.length === 0) return [];

  // Step 2 — batch video details (stats + contentDetails)
  const ids = searchItems.map((i: any) => i.id?.videoId).filter(Boolean);
  if (ids.length === 0) return [];

  // YouTube accepts up to 50 IDs per request
  const detailsData = await ytFetch<{ items?: any[] }>("videos", {
    part: "snippet,statistics,contentDetails",
    id: ids.join(","),
  });

  return (detailsData.items ?? []).map(parseVideoFromItem);
}

/**
 * Fetch full details for a single video by ID.
 */
export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  const data = await ytFetch<{ items?: any[] }>("videos", {
    part: "snippet,statistics,contentDetails",
    id: videoId,
  });

  const item = data.items?.[0];
  return item ? parseVideoFromItem(item) : null;
}

/**
 * Keyword search for videos across YouTube.
 */
export async function searchVideos(
  query: string,
  maxResults = 10,
): Promise<YouTubeVideo[]> {
  // Step 1 — search
  const searchData = await ytFetch<{ items?: any[] }>("search", {
    part: "snippet",
    q: query,
    type: "video",
    maxResults: String(Math.min(maxResults, 50)),
  });

  const searchItems = searchData.items ?? [];
  if (searchItems.length === 0) return [];

  // Step 2 — enrich with statistics + duration
  const ids = searchItems.map((i: any) => i.id?.videoId).filter(Boolean);
  if (ids.length === 0) return [];

  const detailsData = await ytFetch<{ items?: any[] }>("videos", {
    part: "snippet,statistics,contentDetails",
    id: ids.join(","),
  });

  return (detailsData.items ?? []).map(parseVideoFromItem);
}
