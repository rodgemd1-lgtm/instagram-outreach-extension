import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execFileAsync = promisify(execFile);

const FFMPEG_PATH = "/opt/homebrew/bin/ffmpeg";
const MAX_DURATION = 140; // 2 minutes 20 seconds (X limit)
const TARGET_SIZE_MB = 15;

export interface OptimizeResult {
  outputPath: string;
  fileSize: number;
  duration: number;
}

export async function optimizeForX(
  inputPath: string,
  duration: number
): Promise<OptimizeResult> {
  const dir = path.dirname(inputPath);
  const clipsDir = path.join(dir, "clips");
  await fs.mkdir(clipsDir, { recursive: true });

  const ext = path.extname(inputPath);
  const base = path.basename(inputPath, ext);
  const outputPath = path.join(clipsDir, `${base}_x_optimized.mp4`);

  const effectiveDuration = Math.min(duration, MAX_DURATION);
  // Target bitrate to hit ~15MB: (15 * 8 * 1024) / duration kbps
  const targetBitrateKbps = Math.floor((TARGET_SIZE_MB * 8 * 1024) / effectiveDuration);
  const videoBitrate = Math.min(targetBitrateKbps - 128, 4000); // reserve 128k for audio, cap at 4Mbps

  const args = [
    "-i", inputPath,
    "-t", String(effectiveDuration),
    "-vf", "scale=-2:720",
    "-c:v", "libx264",
    "-preset", "medium",
    "-b:v", `${videoBitrate}k`,
    "-maxrate", `${Math.floor(videoBitrate * 1.5)}k`,
    "-bufsize", `${videoBitrate * 2}k`,
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    "-y",
    outputPath,
  ];

  await execFileAsync(FFMPEG_PATH, args, { timeout: 300_000 });

  const stat = await fs.stat(outputPath);

  return {
    outputPath,
    fileSize: stat.size,
    duration: effectiveDuration,
  };
}
