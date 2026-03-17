import { NextRequest, NextResponse } from "next/server";
import { uploadMedia } from "@/lib/supabase/storage";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const category = (formData.get("category") as string) || "uploads";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "File exceeds 100MB limit" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadMedia(buffer, file.name, file.type, category);

  if (!result) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json(result);
}
