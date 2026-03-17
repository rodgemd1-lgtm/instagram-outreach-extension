import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { uploadMedia } from "@/lib/supabase/storage";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Allowed MIME types and categories for file uploads
// ---------------------------------------------------------------------------
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

const uploadCategorySchema = z.enum(
  ["uploads", "photos", "videos", "media", "thumbnails"],
  { errorMap: () => ({ message: "category must be one of: uploads, photos, videos, media, thumbnails" }) },
);

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const rawCategory = (formData.get("category") as string) || "uploads";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate category
  const categoryParsed = uploadCategorySchema.safeParse(rawCategory);
  if (!categoryParsed.success) {
    return NextResponse.json(
      { error: "Invalid category", details: categoryParsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const category = categoryParsed.data;

  // Validate file MIME type
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `File type "${file.type}" is not allowed. Permitted types: image/jpeg, image/png, image/gif, image/webp, video/mp4, video/quicktime, video/webm` },
      { status: 400 },
    );
  }

  // Validate file name length to prevent path traversal
  if (file.name.length > 255 || /[/\\]/.test(file.name)) {
    return NextResponse.json(
      { error: "Invalid file name" },
      { status: 400 },
    );
  }

  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "File exceeds 100MB limit" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadMedia(buffer, file.name, file.type, category);

  if (!result) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json(result);
}
