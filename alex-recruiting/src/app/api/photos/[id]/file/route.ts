import { NextRequest, NextResponse } from "next/server";
import { getPhotoById } from "@/lib/photos/store";
import fs from "fs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = getPhotoById(id);
  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  try {
    const buffer = fs.readFileSync(photo.filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": photo.mimeType || "image/jpeg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }
}
