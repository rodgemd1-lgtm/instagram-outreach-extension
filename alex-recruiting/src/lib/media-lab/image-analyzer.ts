import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getAllPhotos, type PhotoAssetRecord } from "@/lib/photos/store";
import type { ImageAnalysis } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function getPriorityBoost(tags: string[]): number {
  let boost = 0;

  if (tags.includes("game-finish")) boost += 7;
  if (tags.includes("on-field-finish")) boost += 7;
  if (tags.includes("profile-ready")) boost += 5;
  if (tags.includes("agility-training")) boost += 4;
  if (tags.includes("strength-session")) boost += 4;

  return boost;
}

function inferTags(photo: PhotoAssetRecord): string[] {
  const tags = new Set<string>(photo.tags);
  const lower = photo.name.toLowerCase();

  if (photo.category === "training") {
    tags.add("weight-room");
    tags.add("development");
  }

  if (photo.category === "action") {
    tags.add("football-action");
    tags.add("game-context");
  }

  if (lower.includes("profile")) {
    tags.add("profile-ready");
  }

  const match = lower.match(/img_(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 3554 && num <= 3654) tags.add("agility-training");
    if (num >= 4319 && num <= 4320) tags.add("sideline-presence");
    if (num >= 237 && num <= 253) tags.add("game-finish");
    if (num >= 3884 && num <= 3898) tags.add("strength-session");
    if (num >= 4684 && num <= 4691) tags.add("on-field-finish");
  }

  return [...tags];
}

function getRecommendedUse(photo: PhotoAssetRecord, score: number): ImageAnalysis["recommendedUse"] {
  if (photo.category === "profile") return "profile";
  if (photo.category === "action" && score >= 84) return "hero";
  if (photo.category === "training") return "training_update";
  if (photo.category === "action") return "x_post";
  return "recruit_page";
}

function buildPhotoNotes(photo: PhotoAssetRecord, score: number, tags: string[]): string[] {
  const notes: string[] = [];

  if (photo.category === "training") {
    notes.push("Training frame shows work ethic and body development.");
  }

  if (photo.category === "action") {
    notes.push("Action frame is useful for coach-facing recruiting proof.");
  }

  if (tags.includes("profile-ready")) {
    notes.push("Clean enough for profile or website bio placement.");
  }

  if (tags.includes("game-finish") || tags.includes("on-field-finish")) {
    notes.push("Filename pattern suggests a finish-oriented football rep worth prioritizing for coaches.");
  }

  if (score >= 82) {
    notes.push("Frame has strong enough subject clarity to survive X crops and website hero placement.");
  }

  if (score >= 85) {
    notes.push("Strong enough for hero or featured X visual.");
  } else if (score >= 75) {
    notes.push("Usable for regular X posts and supporting web sections.");
  } else {
    notes.push("Good library asset, but not a first-wave hero image.");
  }

  return notes;
}

export async function optimizeImageAsset(
  photo: Pick<ImageAnalysis, "id" | "filePath" | "recommendedUse">
): Promise<string | null> {
  try {
    const outputDir = path.join(process.cwd(), "public", "optimized-media", "photos");
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `${photo.id}.jpg`);
    await sharp(photo.filePath)
      .rotate()
      .resize({
        width: photo.recommendedUse === "hero" ? 1800 : 1400,
        height: photo.recommendedUse === "hero" ? 1800 : 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .modulate({ brightness: 1.02, saturation: 1.05 })
      .sharpen({ sigma: 1.1 })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(outputPath);

    return `/optimized-media/photos/${photo.id}.jpg`;
  } catch (error) {
    console.error("Failed to optimize image asset:", error);
    return null;
  }
}

export async function analyzeImageAsset(
  photo: PhotoAssetRecord,
  optimize = false
): Promise<ImageAnalysis | null> {
  try {
    const image = sharp(photo.filePath);
    const [metadata, stats] = await Promise.all([image.metadata(), image.stats()]);
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    const megapixels = width * height > 0 ? (width * height) / 1_000_000 : 0;
    const meanBrightness =
      stats.channels.reduce((sum, channel) => sum + channel.mean, 0) /
      stats.channels.length;
    const contrast =
      stats.channels.reduce((sum, channel) => sum + channel.stdev, 0) /
      stats.channels.length;

    const technicalScore = round(
      clamp(
        (clamp(megapixels, 0, 18) / 18) * 35 +
          clamp(stats.sharpness, 0, 10) * 2.5 +
          clamp(stats.entropy, 4, 8) * 4,
        0,
        100
      )
    );
    const lightingScore = round(
      clamp(
        100 -
          Math.abs(meanBrightness - 122) * 0.55 -
          Math.abs(contrast - 52) * 0.8,
        0,
        100
      )
    );
    const portraitBias = height >= width ? 8 : 4;
    const compositionScore = round(
      clamp(
        55 +
          portraitBias +
          clamp(stats.entropy - 6, 0, 2) * 10 +
          (photo.category === "action" ? 12 : photo.category === "training" ? 10 : 6),
        0,
        100
      )
    );
    const recruitingScore = round(
      clamp(
        50 +
          (photo.category === "action" ? 24 : 0) +
          (photo.category === "training" ? 22 : 0) +
          (photo.category === "profile" ? 28 : 0),
        0,
        100
      )
    );
    const xFitScore = round(
      clamp(
        60 +
          (width >= 1200 ? 20 : 8) +
          (height >= 1200 ? 10 : 4) +
          (photo.category === "action" ? 5 : 0),
        0,
        100
      )
    );
    const tags = inferTags(photo);
    const priorityBoost = getPriorityBoost(tags);

    const score = round(
      technicalScore * 0.23 +
        lightingScore * 0.2 +
        compositionScore * 0.21 +
        recruitingScore * 0.26 +
        xFitScore * 0.1 +
        priorityBoost
    );

    const recommendedUse = getRecommendedUse(photo, score);
    const analysis: ImageAnalysis = {
      id: photo.id,
      name: photo.name,
      category: photo.category,
      source: photo.source,
      filePath: photo.filePath,
      width,
      height,
      score,
      technicalScore,
      lightingScore,
      compositionScore,
      recruitingScore,
      xFitScore,
      tags,
      notes: buildPhotoNotes(photo, score, tags),
      recommendedUse,
      optimizedPath: null,
    };

    if (optimize) {
      analysis.optimizedPath = await optimizeImageAsset(analysis);
    }

    return analysis;
  } catch (error) {
    console.error(`Failed to analyze photo asset ${photo.name}:`, error);
    return null;
  }
}

export async function analyzeImageLibrary(
  optimize = false
): Promise<ImageAnalysis[]> {
  const photos = getAllPhotos();
  const analyses = await Promise.all(
    photos.map((photo) => analyzeImageAsset(photo, optimize))
  );

  return analyses
    .filter((analysis): analysis is ImageAnalysis => Boolean(analysis))
    .sort((a, b) => b.score - a.score);
}

export function selectTopPhotos(
  analyses: ImageAnalysis[],
  count = 20
): ImageAnalysis[] {
  const action = analyses.filter((photo) => photo.category === "action").slice(0, 12);
  const training = analyses.filter((photo) => photo.category === "training").slice(0, 6);
  const profile = analyses.filter((photo) => photo.category === "profile").slice(0, 1);
  const portrait = analyses.filter((photo) => photo.category === "portrait").slice(0, 1);

  const ordered = [...action, ...training, ...profile, ...portrait];
  const seen = new Set<string>();
  const selected: ImageAnalysis[] = [];

  for (const item of ordered) {
    const key = item.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    selected.push(item);
    if (selected.length >= count) break;
  }

  if (selected.length < count) {
    for (const item of analyses) {
      const key = item.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      selected.push(item);
      if (selected.length >= count) break;
    }
  }

  return selected;
}
