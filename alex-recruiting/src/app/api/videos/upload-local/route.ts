import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { videoAssets } from "@/lib/db/schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filePath, source, sourceAlbum, tags } = body as {
      filePath: string;
      source: string;
      sourceAlbum?: string;
      tags?: string[];
    };

    if (!filePath || !source) {
      return NextResponse.json(
        { error: "filePath and source are required" },
        { status: 400 }
      );
    }

    // Read the file from the local filesystem
    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(filePath);
    } catch {
      return NextResponse.json(
        { error: `File not found or not readable: ${filePath}` },
        { status: 404 }
      );
    }

    // Determine filename and storage path
    const filename = path.basename(filePath);
    const timestamp = Date.now();
    const storagePath = `videos/${timestamp}-${filename}`;

    // Determine MIME type from extension
    const ext = path.extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".mp4": "video/mp4",
      ".mov": "video/quicktime",
      ".m4v": "video/x-m4v",
      ".avi": "video/x-msvideo",
      ".mkv": "video/x-matroska",
      ".wmv": "video/x-ms-wmv",
    };
    const mimeType = mimeMap[ext] || "video/mp4";

    // Upload to Supabase Storage
    const supabase = await createServerSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from("football-videos")
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload failed:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("football-videos")
      .getPublicUrl(storagePath);

    const supabaseUrl = urlData.publicUrl;

    // Insert record into the database
    const [asset] = await db
      .insert(videoAssets)
      .values({
        name: filename,
        source: source,
        sourceAlbum: sourceAlbum || null,
        filePath: filePath,
        supabaseUrl: supabaseUrl,
        storagePath: storagePath,
        fileSize: fileBuffer.length,
        mimeType: mimeType,
        tags: tags || [],
        uploadStatus: "uploaded",
        uploadedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Internal server error during upload" },
      { status: 500 }
    );
  }
}
