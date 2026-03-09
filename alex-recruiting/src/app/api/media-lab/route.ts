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
      return NextResponse.json(
        {
          error: "Media Lab refresh is only available in local operator mode.",
          cached: false,
        },
        { status: 503 }
      );
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
      return NextResponse.json(
        {
          error: "Media Lab refresh is only available in local operator mode.",
          refreshed: false,
        },
        { status: 503 }
      );
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
