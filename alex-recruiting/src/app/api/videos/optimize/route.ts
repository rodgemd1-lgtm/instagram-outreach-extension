import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured, db } from "@/lib/db";
import { videoAssets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { optimizeForX } from "@/lib/video/optimize";
import { getAssetById, updateAsset } from "@/lib/video/store";

export async function POST(req: NextRequest) {
  try {
    const { assetId } = (await req.json()) as { assetId: string };

    if (!assetId) {
      return NextResponse.json(
        { error: "assetId is required" },
        { status: 400 }
      );
    }

    let filePath: string | null = null;
    let duration = 0;

    if (isDbConfigured()) {
      const [asset] = await db
        .select()
        .from(videoAssets)
        .where(eq(videoAssets.id, assetId))
        .limit(1);

      if (!asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      }
      filePath = asset.filePath;
      duration = asset.duration ?? 0;
    } else {
      const asset = getAssetById(assetId);
      if (!asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      }
      filePath = asset.filePath;
      duration = asset.duration ?? 0;
    }

    if (!filePath) {
      return NextResponse.json(
        { error: "Asset has no local file path" },
        { status: 400 }
      );
    }

    const result = await optimizeForX(filePath, duration);

    if (isDbConfigured()) {
      await db
        .update(videoAssets)
        .set({ optimizedFilePath: result.outputPath })
        .where(eq(videoAssets.id, assetId));
    } else {
      updateAsset(assetId, { optimizedFilePath: result.outputPath });
    }

    return NextResponse.json({
      assetId,
      optimizedFilePath: result.outputPath,
      fileSize: result.fileSize,
      duration: result.duration,
    });
  } catch (error) {
    console.error("Video optimization failed:", error);
    return NextResponse.json(
      { error: "Internal server error during optimization" },
      { status: 500 }
    );
  }
}
