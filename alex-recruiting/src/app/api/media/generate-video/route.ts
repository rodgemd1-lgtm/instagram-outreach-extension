import { NextRequest, NextResponse } from "next/server";
import { generateVideo } from "@/lib/integrations/fal";

export const maxDuration = 300; // 5 min for video generation

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, prompt, duration, aspectRatio } = await req.json();

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: "imageUrl and prompt are required" },
        { status: 400 }
      );
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: "FAL_KEY not configured" },
        { status: 503 }
      );
    }

    const video = await generateVideo(imageUrl, prompt, {
      duration: duration ?? "5",
      aspectRatio: aspectRatio ?? "16:9",
    });

    return NextResponse.json({
      video,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[media/generate-video] Error:", err);
    return NextResponse.json(
      { error: "Video generation failed", detail: String(err) },
      { status: 500 }
    );
  }
}
