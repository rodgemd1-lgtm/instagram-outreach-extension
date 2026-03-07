import { NextRequest, NextResponse } from "next/server";
import { getAllPhotos, getPhotosByCategory, getPhotoStats } from "@/lib/photos/store";
import { importPhotosFromSources } from "@/lib/photos/import";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const stats = req.nextUrl.searchParams.get("stats") === "true";

  if (stats) {
    return NextResponse.json(getPhotoStats());
  }

  const photos = category
    ? getPhotosByCategory(category as Parameters<typeof getPhotosByCategory>[0])
    : getAllPhotos();

  return NextResponse.json({ photos, total: photos.length });
}

export async function POST() {
  const result = importPhotosFromSources();
  const photos = getAllPhotos();

  return NextResponse.json({
    ...result,
    total: photos.length,
    message: `Imported ${result.imported} photos. ${result.errors.length} errors.`,
  });
}
