import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { ScannedVideoFile } from "@/lib/types";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".m4v", ".avi", ".mkv", ".wmv"];
const MAX_DEPTH = 5;
const MAX_FILES = 200;

const MIME_MAP: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
  ".avi": "video/x-msvideo",
  ".mkv": "video/x-matroska",
  ".wmv": "video/x-ms-wmv",
};

async function scanRecursive(
  dir: string,
  files: ScannedVideoFile[],
  depth: number
): Promise<void> {
  if (depth > MAX_DEPTH || files.length >= MAX_FILES) return;

  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    // Skip directories we cannot read
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
          selected: false,
        });
      } catch {
        // Skip files we cannot stat
      }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    let folderPath: string | undefined;

    try {
      const body = await req.json();
      folderPath = body.folderPath;
    } catch {
      // No body provided — use default path
    }

    // Default to Google Drive cloud storage path
    const targetPath =
      folderPath || `${process.env.HOME}/Library/CloudStorage/GoogleDrive`;

    // Check if the path exists and is accessible
    try {
      await fs.access(targetPath);
    } catch {
      return NextResponse.json({
        available: false,
        message:
          "Google Drive not mounted or not accessible at the expected path. Please ensure Google Drive for Desktop is installed and signed in.",
        folderPath: targetPath,
      });
    }

    // Recursively scan for video files
    const files: ScannedVideoFile[] = [];
    await scanRecursive(targetPath, files, 0);

    return NextResponse.json({
      available: true,
      folderPath: targetPath,
      files,
      total: files.length,
    });
  } catch (error) {
    console.error("Google Drive scan failed:", error);
    return NextResponse.json(
      { error: "Internal server error during Google Drive scan" },
      { status: 500 }
    );
  }
}
