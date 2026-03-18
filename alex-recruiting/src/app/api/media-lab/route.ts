import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import type { MediaLabSnapshot } from "@/lib/media-lab/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SNAPSHOT_PATH = path.join(process.cwd(), ".media-lab-snapshot.json");

function parseBoolean(value: string | null | undefined, fallback: boolean): boolean {
  if (value == null) return fallback;
  return value === "1" || value.toLowerCase() === "true";
}

function readStoredMediaLabSnapshot(): MediaLabSnapshot | null {
  try {
    return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8")) as MediaLabSnapshot;
  } catch {
    return null;
  }
}

function canRunHeavyMediaBuild(): boolean {
  return !process.env.VERCEL || process.env.ALLOW_MEDIA_LAB_BUILD === "1";
}

async function buildSnapshot(options: {
  optimizePhotos: boolean;
  buildReel: boolean;
  queuePosts: boolean;
}): Promise<MediaLabSnapshot> {
  const { buildMediaLabSnapshot } = await import("@/lib/media-lab/snapshot");
  return buildMediaLabSnapshot(options);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const refresh = parseBoolean(searchParams.get("refresh"), false);

    if (!refresh) {
      const snapshot = readStoredMediaLabSnapshot();
      if (snapshot) {
        return NextResponse.json({ snapshot, cached: true });
      }
    }

    if (!canRunHeavyMediaBuild()) {
      // On Vercel: return an empty snapshot with guidance instead of a 503 error
      return NextResponse.json({
        snapshot: {
          photos: [],
          videos: [],
          reels: [],
          posts: [],
          summary: {
            totalPhotos: 0,
            totalVideos: 0,
            totalReels: 0,
            totalPosts: 0,
          },
          generatedAt: new Date().toISOString(),
        },
        cached: false,
        hint: "Media Lab heavy builds run locally. Use 'npm run dev' on your machine and visit /media-lab to process media files. Uploads via /media-upload are available on Vercel.",
      });
    }

    const snapshot = await buildSnapshot({
      optimizePhotos: parseBoolean(searchParams.get("optimizePhotos"), true),
      buildReel: parseBoolean(searchParams.get("buildReel"), true),
      queuePosts: parseBoolean(searchParams.get("queuePosts"), true),
    });

    return NextResponse.json({ snapshot, cached: false });
  } catch (error) {
    console.error("[GET /api/media-lab] Failed:", error);
    return NextResponse.json(
      { error: "Failed to build media lab snapshot" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!canRunHeavyMediaBuild()) {
      return NextResponse.json({
        snapshot: null,
        refreshed: false,
        hint: "Media Lab heavy builds only run locally. Start the dev server on your machine to process media.",
      });
    }

    const body = await req.json().catch(() => ({}));
    const snapshot = await buildSnapshot({
      optimizePhotos: body.optimizePhotos ?? true,
      buildReel: body.buildReel ?? true,
      queuePosts: body.queuePosts ?? true,
    });

    return NextResponse.json({ snapshot, refreshed: true });
  } catch (error) {
    console.error("[POST /api/media-lab] Failed:", error);
    return NextResponse.json(
      { error: "Failed to refresh media lab snapshot" },
      { status: 500 }
    );
  }
}
