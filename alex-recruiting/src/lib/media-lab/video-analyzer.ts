import path from "path";
import sharp from "sharp";
import { getAllAssets, type VideoAssetRecord } from "@/lib/video/store";
import type { VideoAnalysis, VideoTrim } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function getPriorityBoost(tags: string[]): number {
  let boost = 0;

  if (tags.includes("premium-cut")) boost += 8;
  if (tags.includes("defensive-finish")) boost += 8;
  if (tags.includes("impact-rep")) boost += 6;
  if (tags.includes("game-sequence")) boost += 4;

  return boost;
}

function thumbnailPathFromUrl(url: string | null): string | null {
  if (!url?.startsWith("/thumbnails/")) return null;
  return path.join(process.cwd(), "public", url.replace(/^\//, ""));
}

function inferVideoTags(video: VideoAssetRecord): string[] {
  const tags = new Set<string>(video.tags);
  const lower = video.name.toLowerCase();

  if (video.category === "highlight_reel") tags.add("hero-reel");
  if (video.category === "game_film") tags.add("coach-film");
  if (video.category === "clip" || video.category === "micro_clip") tags.add("single-play");
  if ((video.filePath || "").includes("Jacob Media Master")) tags.add("master-intake");
  if ((video.filePath || "").includes("2025 Football Videos")) tags.add("football-library");
  if (lower.startsWith("mah")) tags.add("premium-cut");

  const match = lower.match(/img_(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 4673 && num <= 4691) tags.add("defensive-finish");
    if (num >= 4727 && num <= 4728) tags.add("impact-rep");
    if (num >= 739 && num <= 747) tags.add("game-sequence");
    if (num >= 361 && num <= 367) tags.add("training-sequence");
    if (num >= 391 && num <= 399) tags.add("quick-hit");
  }

  return [...tags];
}

function buildTrim(duration: number | null): VideoTrim {
  const safeDuration = duration ?? 0;
  const clipDuration = clamp(safeDuration >= 10 ? 3.5 : safeDuration * 0.45, 2, 4);
  const midpoint = safeDuration > 0 ? safeDuration / 2 : 0;
  const startTime = round(clamp(midpoint - clipDuration / 2, 0, Math.max(0, safeDuration - clipDuration)));
  const endTime = round(clamp(startTime + clipDuration, clipDuration, safeDuration || clipDuration));

  return {
    startTime,
    endTime,
    clipDuration: round(endTime - startTime),
  };
}

function buildVideoNotes(video: VideoAssetRecord, score: number, tags: string[]): string[] {
  const notes: string[] = [];

  if (tags.includes("premium-cut")) {
    notes.push("Short-form premium cut likely came from a prior highlight workflow.");
  }

  if (tags.includes("defensive-finish")) {
    notes.push("Filename range suggests defensive disruption or finish-oriented rep.");
  }

  if (tags.includes("impact-rep")) {
    notes.push("Likely impact-rep clip worth checking for sacks, knockdowns, or clean wins at contact.");
  }

  if (video.category === "micro_clip") {
    notes.push("Short enough for autoplay-first X posting.");
  }

  if (score >= 82) {
    notes.push("Thumbnail quality is strong enough for a convincing first frame on X and the website.");
  }

  if (score >= 84) {
    notes.push("Strong candidate for highlight reel inclusion.");
  } else if (score >= 75) {
    notes.push("Strong candidate for standalone X clip usage.");
  } else {
    notes.push("Better as supporting film-room content than hero content.");
  }

  return notes;
}

function getRecommendedUse(
  video: VideoAssetRecord,
  score: number,
  tags: string[]
): VideoAnalysis["recommendedUse"] {
  if (
    video.category === "highlight_reel" ||
    score >= 88 ||
    tags.includes("premium-cut") ||
    tags.includes("defensive-finish")
  ) {
    return "highlight_reel";
  }

  if (video.category === "game_film") return "film_room";
  if ((video.duration ?? 0) <= 10) return "x_clip";
  return "training_clip";
}

export async function analyzeVideoAsset(video: VideoAssetRecord): Promise<VideoAnalysis | null> {
  if (!video.filePath) return null;

  try {
    const thumbPath = thumbnailPathFromUrl(video.thumbnailUrl);
    const thumbStats = thumbPath ? await sharp(thumbPath).stats() : null;
    const width = video.width ?? 0;
    const height = video.height ?? 0;
    const duration = video.duration ?? 0;
    const meanBrightness = thumbStats
      ? thumbStats.channels.reduce((sum, channel) => sum + channel.mean, 0) /
        thumbStats.channels.length
      : 118;
    const contrast = thumbStats
      ? thumbStats.channels.reduce((sum, channel) => sum + channel.stdev, 0) /
        thumbStats.channels.length
      : 48;

    const technicalScore = round(
      clamp(
        (width >= 1920 ? 40 : width >= 1280 ? 32 : 20) +
          (height >= 720 ? 20 : 10) +
          clamp((video.fileSize ?? 0) / 1_000_000, 0, 30) * 0.8,
        0,
        100
      )
    );
    const frameScore = round(
      clamp(
        (thumbStats?.sharpness ?? 3) * 8 +
          (thumbStats?.entropy ?? 6) * 6 +
          (100 - Math.abs(meanBrightness - 122) * 0.5) * 0.25 +
          (100 - Math.abs(contrast - 50) * 0.9) * 0.2,
        0,
        100
      )
    );
    const actionScore = round(
      clamp(
        45 +
          (duration >= 6 && duration <= 18 ? 25 : duration <= 30 ? 18 : 8) +
          (video.category === "clip" ? 12 : 0) +
          (video.category === "micro_clip" ? 10 : 0),
        0,
        100
      )
    );
    const recruitingScore = round(
      clamp(
        45 +
          (video.category === "highlight_reel" ? 26 : 0) +
          (video.category === "game_film" ? 22 : 0) +
          (video.category === "clip" ? 24 : 0) +
          (video.category === "micro_clip" ? 18 : 0),
        0,
        100
      )
    );
    const xFitScore = round(
      clamp(
        50 +
          (duration >= 5 && duration <= 15 ? 25 : 10) +
          (width >= 1280 ? 15 : 8) +
          (video.optimizedFilePath ? 10 : 0),
        0,
        100
      )
    );
    const tags = inferVideoTags(video);
    const priorityBoost = getPriorityBoost(tags);

    const score = round(
      technicalScore * 0.2 +
        frameScore * 0.24 +
        actionScore * 0.22 +
        recruitingScore * 0.24 +
        xFitScore * 0.1 +
        priorityBoost
    );

    return {
      id: video.id,
      name: video.name,
      category: video.category ?? "clip",
      filePath: video.filePath,
      thumbnailUrl: video.thumbnailUrl,
      score,
      technicalScore,
      frameScore,
      actionScore,
      recruitingScore,
      xFitScore,
      tags,
      notes: buildVideoNotes(video, score, tags),
      recommendedUse: getRecommendedUse(video, score, tags),
      trim: buildTrim(video.duration),
    };
  } catch (error) {
    console.error(`Failed to analyze video asset ${video.name}:`, error);
    return null;
  }
}

export async function analyzeVideoLibrary(): Promise<VideoAnalysis[]> {
  const analyses = await Promise.all(
    getAllAssets().map((video) => analyzeVideoAsset(video))
  );

  return analyses
    .filter((analysis): analysis is VideoAnalysis => Boolean(analysis))
    .filter((analysis) => !analysis.name.toLowerCase().startsWith("screenrecording_"))
    .sort((a, b) => b.score - a.score);
}

export function selectTopVideos(
  analyses: VideoAnalysis[],
  count = 20
): VideoAnalysis[] {
  const priority = analyses
    .filter((video) => {
      if (video.category === "highlight_reel" || video.category === "game_film") {
        return true;
      }

      return video.score >= 72;
    })
    .sort((a, b) => {
      const aPriority = a.tags.includes("defensive-finish") || a.tags.includes("impact-rep") || a.tags.includes("premium-cut") ? 1 : 0;
      const bPriority = b.tags.includes("defensive-finish") || b.tags.includes("impact-rep") || b.tags.includes("premium-cut") ? 1 : 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.score - a.score;
    });

  const selected: VideoAnalysis[] = [];
  const seen = new Set<string>();

  for (const video of priority) {
    const key = video.name.toLowerCase();
    if (seen.has(key)) continue;
    selected.push(video);
    seen.add(key);
    if (selected.length >= count) break;
  }

  if (selected.length < count) {
    for (const video of analyses) {
      const key = video.name.toLowerCase();
      if (seen.has(key)) continue;
      selected.push(video);
      seen.add(key);
      if (selected.length >= count) break;
    }
  }

  return selected;
}
