import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { ScannedVideoFileWithMeta, VideoCategory } from "@/lib/types";
import { probeVideo } from "@/lib/video/ffprobe";
import { categorizeVideo } from "@/lib/video/categorize";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".m4v", ".avi", ".mkv", ".wmv"];
const MAX_DEPTH = 5;
const MAX_FILES = 200;
const PROBE_BATCH_SIZE = 5;

const DEFAULT_FOLDER = `${process.env.HOME}/Desktop/2025 Football Videos`;

const MIME_MAP: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
  ".avi": "video/x-msvideo",
  ".mkv": "video/x-matroska",
  ".wmv": "video/x-ms-wmv",
};

interface BasicFileInfo {
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

async function scanRecursive(
  dir: string,
  files: BasicFileInfo[],
  depth: number
): Promise<void> {
  if (depth > MAX_DEPTH || files.length >= MAX_FILES) return;

  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (files.length >= MAX_FILES) return;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await scanRecursive(fullPath, files, depth + 1);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!VIDEO_EXTENSIONS.includes(ext)) continue;

      try {
        const stat = await fs.stat(fullPath);
        files.push({
          filename: entry.name,
          filePath: fullPath,
          fileSize: stat.size,
          mimeType: MIME_MAP[ext] || "video/mp4",
        });
      } catch {
        // Skip files we cannot stat
      }
    }
  }
}

async function probeBatch(
  files: BasicFileInfo[]
): Promise<ScannedVideoFileWithMeta[]> {
  const results: ScannedVideoFileWithMeta[] = [];

  for (let i = 0; i < files.length; i += PROBE_BATCH_SIZE) {
    const batch = files.slice(i, i + PROBE_BATCH_SIZE);
    const probed = await Promise.all(
      batch.map(async (f) => {
        try {
          const probe = await probeVideo(f.filePath);
          const category = categorizeVideo(probe.duration, f.fileSize);
          return {
            ...f,
            selected: false,
            duration: probe.duration,
            width: probe.width,
            height: probe.height,
            category,
          } as ScannedVideoFileWithMeta;
        } catch {
          // If probe fails, return with defaults
          return {
            ...f,
            selected: false,
            duration: 0,
            width: 0,
            height: 0,
            category: "clip" as VideoCategory,
          } as ScannedVideoFileWithMeta;
        }
      })
    );
    results.push(...probed);
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    let folderPath: string | undefined;

    try {
      const body = await req.json();
      folderPath = body.folderPath;
    } catch {
      // No body — use default
    }

    const targetPath = folderPath || DEFAULT_FOLDER;

    try {
      await fs.access(targetPath);
    } catch {
      return NextResponse.json({
        available: false,
        message: `Folder not accessible: ${targetPath}`,
        folderPath: targetPath,
      });
    }

    const basicFiles: BasicFileInfo[] = [];
    await scanRecursive(targetPath, basicFiles, 0);

    const files = await probeBatch(basicFiles);

    const summary = {
      highlight_reel: files.filter((f) => f.category === "highlight_reel").length,
      game_film: files.filter((f) => f.category === "game_film").length,
      clip: files.filter((f) => f.category === "clip").length,
      micro_clip: files.filter((f) => f.category === "micro_clip").length,
    };

    return NextResponse.json({
      available: true,
      folderPath: targetPath,
      files,
      total: files.length,
      summary,
    });
  } catch (error) {
    console.error("Local scan failed:", error);
    return NextResponse.json(
      { error: "Internal server error during local scan" },
      { status: 500 }
    );
  }
}
