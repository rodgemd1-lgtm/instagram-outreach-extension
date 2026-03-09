import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getPhotoById } from "@/lib/photos/store";

const ALLOWED_DIRS = [
  `${process.env.HOME}/Downloads/iCloud Photos from Michael Rodgers`,
  `${process.env.HOME}/Desktop/Images`,
  `${process.env.HOME}/Desktop/Jacob Media Master`,
  `${process.env.HOME}/Desktop/Videos/Jake's Videos`,
  "/tmp/alex-recruiting-export",
];

function isPathAllowed(filePath: string): boolean {
  const resolved = path.resolve(filePath);
  return ALLOWED_DIRS.some((dir) => resolved.startsWith(path.resolve(dir)));
}

function getMimeType(filePath: string, fallback: string | null): string {
  if (fallback) return fallback;

  const ext = path.extname(filePath).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".heic": "image/heic",
    ".webp": "image/webp",
  };

  return mimeMap[ext] ?? "application/octet-stream";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = getPhotoById(id);

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const resolved = path.resolve(photo.filePath);
  if (!isPathAllowed(resolved)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const file = await fs.readFile(resolved);

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": getMimeType(resolved, photo.mimeType),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Photo file not found" }, { status: 404 });
  }
}
