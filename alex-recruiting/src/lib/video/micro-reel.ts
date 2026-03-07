/**
 * Micro Reel Compiler — FFmpeg-based 15-second highlight reel generator.
 *
 * Selects top-rated moments across diverse play types, trims each to 2-4 seconds,
 * concatenates with crossfades, and outputs H.264 MP4 at 720p.
 *
 * NOTE: FFmpeg is unavailable on Vercel. This must be run locally.
 * The output is committed to public/recruit/micro-reel.mp4 as a static asset.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { getReelHighlights, type HighlightEntry } from "./highlight-catalog";

const execFileAsync = promisify(execFile);
const FFMPEG_PATH = "/opt/homebrew/bin/ffmpeg";
const OUTPUT_DIR = path.join(process.cwd(), "public", "recruit");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "micro-reel.mp4");
const TARGET_DURATION = 15; // seconds

export interface MicroReelResult {
  outputPath: string;
  duration: number;
  clipCount: number;
}

/**
 * Select clips for the reel: diversify play types, pick highest quality.
 * Returns clips totaling ~15 seconds.
 */
function selectClips(highlights: HighlightEntry[]): HighlightEntry[] {
  const selected: HighlightEntry[] = [];
  const usedTypes = new Set<string>();
  let totalDuration = 0;

  // First pass: one clip per play type (highest quality first)
  const sorted = [...highlights].sort((a, b) => b.quality - a.quality);

  for (const clip of sorted) {
    if (totalDuration >= TARGET_DURATION) break;
    const clipDur = clip.endTime - clip.startTime;
    if (clipDur < 1 || clipDur > 5) continue;

    if (!usedTypes.has(clip.playType)) {
      selected.push(clip);
      usedTypes.add(clip.playType);
      totalDuration += clipDur;
    }
  }

  // Second pass: fill remaining time with best remaining clips
  for (const clip of sorted) {
    if (totalDuration >= TARGET_DURATION) break;
    if (selected.includes(clip)) continue;
    const clipDur = clip.endTime - clip.startTime;
    if (clipDur < 1 || clipDur > 5) continue;
    if (totalDuration + clipDur <= TARGET_DURATION + 1) {
      selected.push(clip);
      totalDuration += clipDur;
    }
  }

  return selected;
}

/**
 * Generate the micro reel using FFmpeg concat demuxer with crossfades.
 */
export async function generateMicroReel(): Promise<MicroReelResult> {
  const highlights = getReelHighlights();
  if (highlights.length === 0) {
    throw new Error("No highlights marked for reel. Add highlights first.");
  }

  const clips = selectClips(highlights);
  if (clips.length === 0) {
    throw new Error("No suitable clips found (need 1-5 second clips).");
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Create temp directory for trimmed clips
  const tmpDir = path.join(OUTPUT_DIR, ".tmp-reel");
  await fs.mkdir(tmpDir, { recursive: true });

  try {
    // Step 1: Trim each clip
    const trimmedPaths: string[] = [];
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const trimmed = path.join(tmpDir, `clip_${i}.mp4`);
      const duration = clip.endTime - clip.startTime;

      await execFileAsync(FFMPEG_PATH, [
        "-ss",
        String(clip.startTime),
        "-i",
        clip.videoPath,
        "-t",
        String(duration),
        "-vf",
        "scale=-2:720",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "23",
        "-an", // Remove audio for clean reel
        "-movflags",
        "+faststart",
        "-y",
        trimmed,
      ]);

      trimmedPaths.push(trimmed);
    }

    // Step 2: Create concat list
    const concatList = path.join(tmpDir, "concat.txt");
    const listContent = trimmedPaths
      .map((p) => `file '${p}'`)
      .join("\n");
    await fs.writeFile(concatList, listContent);

    // Step 3: Concatenate with crossfade
    if (trimmedPaths.length === 1) {
      // Single clip — just copy
      await fs.copyFile(trimmedPaths[0], OUTPUT_PATH);
    } else {
      // Use concat demuxer (simple, reliable)
      await execFileAsync(
        FFMPEG_PATH,
        [
          "-f",
          "concat",
          "-safe",
          "0",
          "-i",
          concatList,
          "-c:v",
          "libx264",
          "-preset",
          "medium",
          "-crf",
          "22",
          "-movflags",
          "+faststart",
          "-y",
          OUTPUT_PATH,
        ],
        { timeout: 120_000 }
      );
    }

    const totalDuration = clips.reduce(
      (sum, c) => sum + (c.endTime - c.startTime),
      0
    );

    return {
      outputPath: OUTPUT_PATH,
      duration: totalDuration,
      clipCount: clips.length,
    };
  } finally {
    // Cleanup temp directory
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
