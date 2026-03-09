import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import type { ReelPackage, VideoAnalysis } from "./types";

const execFileAsync = promisify(execFile);
const FFMPEG_PATH = "/opt/homebrew/bin/ffmpeg";

export async function buildHighlightReelPackage(
  videos: VideoAnalysis[]
): Promise<ReelPackage> {
  const packageDir = path.join(process.cwd(), "public", "recruit", "media-lab");
  const reelsDir = path.join(packageDir, "reels");
  const tempDir = path.join(reelsDir, ".tmp");
  await fs.mkdir(reelsDir, { recursive: true });
  await fs.rm(tempDir, { recursive: true, force: true });
  await fs.mkdir(tempDir, { recursive: true });

  const selected = videos.slice(0, 8);
  const renderedReelPath = path.join(reelsDir, "jacob-highlight-reel.mp4");
  const shotListPath = path.join(packageDir, "capcut-shot-list.csv");
  const manifestPath = path.join(packageDir, "manifest.json");

  const notes = [
    "CapCut does not expose a dependable third-party project import pipeline, so this package uses a clip manifest plus a shot-list workflow.",
    "If CapCut is used, import the listed source clips manually and follow the trim order from the CSV.",
    "The rendered FFmpeg reel is the fast path for immediate website/X use.",
  ];

  const shotList = [
    "order,clip_name,source_path,start_time,end_time,tag_summary",
    ...selected.map((video, index) =>
      [
        index + 1,
        video.name,
        `"${video.filePath}"`,
        video.trim.startTime,
        video.trim.endTime,
        `"${video.tags.slice(0, 4).join(", ")}"`,
      ].join(",")
    ),
  ].join("\n");

  const manifest = {
    generatedAt: new Date().toISOString(),
    selectedClipCount: selected.length,
    renderedReelPath: "/recruit/media-lab/reels/jacob-highlight-reel.mp4",
    clips: selected.map((video, index) => ({
      order: index + 1,
      name: video.name,
      filePath: video.filePath,
      trim: video.trim,
      tags: video.tags,
      score: video.score,
    })),
    notes,
  };

  await fs.writeFile(shotListPath, shotList);
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  if (selected.length === 0) {
    return {
      renderedReelPath: null,
      capCutShotListPath: shotListPath,
      manifestPath,
      selectedClipCount: 0,
      notes,
    };
  }

  try {
    const trimmedPaths: string[] = [];

    for (let i = 0; i < selected.length; i++) {
      const video = selected[i];
      const trimmedPath = path.join(tempDir, `clip-${i}.mp4`);
      await execFileAsync(FFMPEG_PATH, [
        "-ss",
        String(video.trim.startTime),
        "-i",
        video.filePath,
        "-t",
        String(video.trim.clipDuration),
        "-vf",
        "scale=-2:720",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "22",
        "-an",
        "-movflags",
        "+faststart",
        "-y",
        trimmedPath,
      ]);
      trimmedPaths.push(trimmedPath);
    }

    const concatListPath = path.join(tempDir, "concat.txt");
    await fs.writeFile(
      concatListPath,
      trimmedPaths.map((clipPath) => `file '${clipPath}'`).join("\n")
    );

    await execFileAsync(FFMPEG_PATH, [
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatListPath,
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "21",
      "-movflags",
      "+faststart",
      "-y",
      renderedReelPath,
    ]);

    return {
      renderedReelPath: "/recruit/media-lab/reels/jacob-highlight-reel.mp4",
      capCutShotListPath: shotListPath,
      manifestPath,
      selectedClipCount: selected.length,
      notes,
    };
  } catch (error) {
    console.error("Failed to build highlight reel package:", error);
    return {
      renderedReelPath: null,
      capCutShotListPath: shotListPath,
      manifestPath,
      selectedClipCount: selected.length,
      notes,
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
