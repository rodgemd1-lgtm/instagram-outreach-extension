import fs from "fs";
import path from "path";
import { analyzeImageLibrary, optimizeImageAsset, selectTopPhotos } from "./image-analyzer";
import { analyzeVideoLibrary, selectTopVideos } from "./video-analyzer";
import { buildXDrafts } from "./post-analyzer";
import { buildHighlightReelPackage } from "./reel-builder";
import { MEDIA_LAB_CAPABILITIES, MEDIA_LAB_RESEARCH_NOTES, SUSAN_MEDIA_TEAM } from "./team";
import type { DraftAnalysis, MediaLabSnapshot } from "./types";
import { getAllPosts, insertPost } from "@/lib/posts/store";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

const SNAPSHOT_PATH = path.join(process.cwd(), ".media-lab-snapshot.json");

function persistSnapshot(snapshot: MediaLabSnapshot): void {
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
}

export function readStoredMediaLabSnapshot(): MediaLabSnapshot | null {
  try {
    return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8")) as MediaLabSnapshot;
  } catch {
    return null;
  }
}

async function queueDrafts(drafts: DraftAnalysis[]): Promise<void> {
  const existing = getAllPosts();
  const existingContents = new Set(existing.map((post) => post.content));
  const now = new Date().toISOString();
  let supabase = null as ReturnType<typeof createAdminClient> | null;
  const supabaseContents = new Set<string>();

  if (isSupabaseConfigured()) {
    try {
      supabase = createAdminClient();
      const { data, error } = await supabase
        .from("posts")
        .select("content");

      if (error) {
        throw error;
      }

      for (const row of data ?? []) {
        const content = row.content;
        if (typeof content === "string") {
          supabaseContents.add(content);
        }
      }
    } catch (error) {
      console.error("[media-lab] Failed to preload Supabase posts:", error);
      supabase = null;
    }
  }

  for (const draft of drafts) {
    if (existingContents.has(draft.content) || supabaseContents.has(draft.content)) continue;

    if (supabase) {
      try {
        const { error } = await supabase.from("posts").insert({
          content: draft.content,
          pillar: draft.pillar,
          hashtags: draft.hashtags,
          media_url: draft.mediaUrl,
          scheduled_for: draft.scheduledFor,
          best_time: draft.bestTime,
          status: "draft",
          x_post_id: null,
          impressions: 0,
          engagements: 0,
          engagement_rate: 0,
          created_at: now,
          updated_at: now,
        });

        if (!error) {
          supabaseContents.add(draft.content);
          continue;
        }

        console.error("[media-lab] Failed to insert Supabase post:", error);
      } catch (error) {
        console.error("[media-lab] Supabase insert exception:", error);
      }
    }

    insertPost({
      content: draft.content,
      pillar: draft.pillar,
      hashtags: draft.hashtags,
      mediaUrl: draft.mediaUrl,
      scheduledFor: draft.scheduledFor,
      bestTime: draft.bestTime,
      status: "draft",
      xPostId: null,
      impressions: 0,
      engagements: 0,
      engagementRate: 0,
    });
    existingContents.add(draft.content);
  }
}

export async function buildMediaLabSnapshot(options?: {
  optimizePhotos?: boolean;
  buildReel?: boolean;
  queuePosts?: boolean;
}): Promise<MediaLabSnapshot> {
  const optimizePhotos = options?.optimizePhotos ?? false;
  const buildReel = options?.buildReel ?? false;
  const queuePosts = options?.queuePosts ?? false;

  const [imageAnalyses, videoAnalyses] = await Promise.all([
    analyzeImageLibrary(false),
    analyzeVideoLibrary(),
  ]);

  let topPhotos = selectTopPhotos(imageAnalyses, 20);
  if (optimizePhotos) {
    topPhotos = await Promise.all(
      topPhotos.map(async (photo) => ({
        ...photo,
        optimizedPath: await optimizeImageAsset(photo),
      }))
    );
  }

  const topVideos = selectTopVideos(videoAnalyses, 20);
  const drafts = buildXDrafts(topPhotos, topVideos).sort((a, b) => b.score - a.score);
  const reelPackage = buildReel
    ? await buildHighlightReelPackage(topVideos)
    : null;

  if (queuePosts) {
    await queueDrafts(drafts);
  }

  const snapshot: MediaLabSnapshot = {
    generatedAt: new Date().toISOString(),
    sources: [
      "/Users/mikerodgers/Desktop/Jacob Media Master",
      "/Users/mikerodgers/Desktop/2025 Football Videos",
      "/tmp/alex-recruiting-export",
    ],
    researchNotes: MEDIA_LAB_RESEARCH_NOTES,
    team: SUSAN_MEDIA_TEAM,
    capabilities: MEDIA_LAB_CAPABILITIES,
    topPhotos,
    topVideos,
    drafts,
    reelPackage,
  };

  persistSnapshot(snapshot);
  return snapshot;
}
