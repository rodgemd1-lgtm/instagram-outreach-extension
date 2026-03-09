import { NextRequest, NextResponse } from "next/server";
import { buildMediaLabSnapshot, readStoredMediaLabSnapshot } from "@/lib/media-lab/snapshot";

export const dynamic = "force-dynamic";

function parseBoolean(value: string | null | undefined, fallback: boolean): boolean {
  if (value == null) return fallback;
  return value === "1" || value.toLowerCase() === "true";
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

    const snapshot = await buildMediaLabSnapshot({
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
    const body = await req.json().catch(() => ({}));
    const snapshot = await buildMediaLabSnapshot({
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
