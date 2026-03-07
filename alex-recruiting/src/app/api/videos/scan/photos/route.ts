import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import type { PhotosAlbumInfo, ScannedVideoFile } from "@/lib/types";

const EXPORT_DIR = "/tmp/alex-recruiting-export";
const VIDEO_EXTENSIONS = [".mp4", ".mov", ".m4v", ".avi"];

function execAsync(command: string, timeoutMs = 30000): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: timeoutMs }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function scanDirectoryForVideos(dir: string): Promise<ScannedVideoFile[]> {
  const files: ScannedVideoFile[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (!VIDEO_EXTENSIONS.includes(ext)) continue;

      const fullPath = path.join(dir, entry.name);
      const stat = await fs.stat(fullPath);

      const mimeMap: Record<string, string> = {
        ".mp4": "video/mp4",
        ".mov": "video/quicktime",
        ".m4v": "video/x-m4v",
        ".avi": "video/x-msvideo",
      };

      files.push({
        filename: entry.name,
        filePath: fullPath,
        fileSize: stat.size,
        mimeType: mimeMap[ext] || "video/mp4",
        selected: false,
      });
    }
  } catch {
    // Directory may not exist or be unreadable
  }

  return files;
}

export async function POST(req: NextRequest) {
  try {
    let albumName: string | undefined;

    try {
      const body = await req.json();
      albumName = body.albumName;
    } catch {
      // No body provided — list albums
    }

    // If no album name, list all albums
    if (!albumName) {
      try {
        const script = `osascript -e 'tell application "Photos" to get {name, count of media items} of albums'`;
        const output = await execAsync(script);

        // Parse AppleScript output: {name1, name2, ...}, {count1, count2, ...}
        // Output format varies, but typically: name1, name2, count1, count2
        const albums: PhotosAlbumInfo[] = [];

        if (output) {
          // AppleScript returns two lists: names and counts
          // Format: "name1, name2, 5, 10" or "{name1, name2}, {5, 10}"
          const cleaned = output.replace(/[{}]/g, "");
          const parts = cleaned.split(",").map((s) => s.trim());

          if (parts.length >= 2 && parts.length % 2 === 0) {
            const half = parts.length / 2;
            for (let i = 0; i < half; i++) {
              albums.push({
                name: parts[i],
                itemCount: parseInt(parts[half + i], 10) || 0,
              });
            }
          }
        }

        return NextResponse.json({ albums });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (
          message.includes("permission") ||
          message.includes("not allowed") ||
          message.includes("assistive access")
        ) {
          return NextResponse.json(
            {
              error: "Permission denied",
              message:
                "Photos app access requires permission. Go to System Settings > Privacy & Security > Automation and allow access to Photos.",
            },
            { status: 403 }
          );
        }

        return NextResponse.json(
          { error: "Failed to list albums", message },
          { status: 500 }
        );
      }
    }

    // Album name provided — export videos from that album
    try {
      // Ensure the export directory exists
      await fs.mkdir(EXPORT_DIR, { recursive: true });

      // AppleScript to export videos from the specified album
      const exportScript = `osascript -e '
        tell application "Photos"
          set targetAlbum to album "${albumName.replace(/"/g, '\\"')}"
          set videoItems to (every media item of targetAlbum whose type description is "Video" or type description is "Movie")
          if (count of videoItems) > 0 then
            export videoItems to POSIX file "${EXPORT_DIR}" with using originals
          end if
          return count of videoItems
        end tell
      '`;

      const countOutput = await execAsync(exportScript, 30000);
      const exportedCount = parseInt(countOutput, 10) || 0;

      // Scan the export directory for video files
      const files = await scanDirectoryForVideos(EXPORT_DIR);

      return NextResponse.json({
        albumName,
        exportedCount,
        files,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (
        message.includes("permission") ||
        message.includes("not allowed") ||
        message.includes("assistive access")
      ) {
        return NextResponse.json(
          {
            error: "Permission denied",
            message:
              "Photos app access requires permission. Go to System Settings > Privacy & Security > Automation and allow access to Photos.",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: "Failed to export videos from album", message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Photos scan failed:", error);
    return NextResponse.json(
      { error: "Internal server error during Photos scan" },
      { status: 500 }
    );
  }
}
