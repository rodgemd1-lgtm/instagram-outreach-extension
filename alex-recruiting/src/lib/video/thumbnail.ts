import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const execFileAsync = promisify(execFile);

const FFMPEG_PATH = "/opt/homebrew/bin/ffmpeg";

export async function generateThumbnail(
  videoPath: string,
  outputDir: string
): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });

  const hash = crypto.createHash("md5").update(videoPath).digest("hex").slice(0, 12);
  const filename = `thumb_${hash}.jpg`;
  const outputPath = path.join(outputDir, filename);

  // Skip if already generated
  try {
    await fs.access(outputPath);
    return `/thumbnails/${filename}`;
  } catch {
    // File doesn't exist, generate it
  }

  await execFileAsync(FFMPEG_PATH, [
    "-i", videoPath,
    "-ss", "2",
    "-vframes", "1",
    "-vf", "scale=320:-1",
    "-q:v", "5",
    "-y",
    outputPath,
  ]);

  return `/thumbnails/${filename}`;
}
