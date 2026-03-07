import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const REEL_PATH = path.join(process.cwd(), "public", "recruit", "micro-reel.mp4");

/** GET /api/recruit/reel — Check reel status / serve metadata */
export async function GET() {
  try {
    const stat = await fs.stat(REEL_PATH);
    return NextResponse.json({
      exists: true,
      path: "/recruit/micro-reel.mp4",
      fileSize: stat.size,
      lastModified: stat.mtime.toISOString(),
    });
  } catch {
    return NextResponse.json({
      exists: false,
      path: null,
      message:
        "No micro reel found. Generate one locally with POST /api/recruit/reel",
    });
  }
}

/** POST /api/recruit/reel — Trigger reel generation (local only) */
export async function POST() {
  try {
    // Dynamic import to avoid bundling FFmpeg deps on Vercel
    const { generateMicroReel } = await import("@/lib/video/micro-reel");
    const result = await generateMicroReel();

    return NextResponse.json({
      success: true,
      outputPath: "/recruit/micro-reel.mp4",
      duration: result.duration,
      clipCount: result.clipCount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
