import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { isDbConfigured, db } from "@/lib/db";
import { videoAssets } from "@/lib/db/schema";
import { generateThumbnail } from "@/lib/video/thumbnail";
import { insertAsset, type VideoAssetRecord } from "@/lib/video/store";
import type { ScannedVideoFileWithMeta } from "@/lib/types";

export const dynamic = "force-dynamic";

const THUMBNAIL_DIR = path.join(process.cwd(), "public", "thumbnails");

export async function POST(req: NextRequest) {
  try {
    const { files } = (await req.json()) as { files: ScannedVideoFileWithMeta[] };

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const imported: (typeof videoAssets.$inferSelect | VideoAssetRecord)[] = [];
    const failed: { filename: string; error: string }[] = [];

    for (const file of files) {
      try {
        let thumbnailUrl: string | null = null;
        try {
          thumbnailUrl = await generateThumbnail(file.filePath, THUMBNAIL_DIR);
        } catch (thumbErr) {
          console.error(`Thumbnail failed for ${file.filename}:`, thumbErr);
        }

        if (isDbConfigured()) {
          const [asset] = await db
            .insert(videoAssets)
            .values({
              name: file.filename,
              source: "local",
              filePath: file.filePath,
              fileSize: file.fileSize,
              duration: Math.round(file.duration),
              mimeType: file.mimeType,
              tags: [],
              thumbnailUrl,
              uploadStatus: "local",
              category: file.category,
              width: file.width,
              height: file.height,
            })
            .returning();
          imported.push(asset);
        } else {
          const asset = insertAsset({
            name: file.filename,
            source: "local",
            filePath: file.filePath,
            fileSize: file.fileSize,
            duration: Math.round(file.duration),
            mimeType: file.mimeType,
            tags: [],
            thumbnailUrl,
            uploadStatus: "local",
            category: file.category,
            width: file.width,
            height: file.height,
            optimizedFilePath: null,
          });
          imported.push(asset);
        }
      } catch (err) {
        failed.push({
          filename: file.filename,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json(
      {
        imported: imported.length,
        failed: failed.length,
        assets: imported,
        errors: failed.length > 0 ? failed : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Video import failed:", error);
    return NextResponse.json(
      { error: "Internal server error during import" },
      { status: 500 }
    );
  }
}
