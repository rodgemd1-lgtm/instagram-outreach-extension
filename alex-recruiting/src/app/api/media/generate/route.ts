import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/integrations/fal";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { prompt, promptId, section, aspectRatio } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 503 });
    }

    // Map aspect ratio string to dimensions
    const sizeMap: Record<string, { width: number; height: number }> = {
      "16:9": { width: 1792, height: 1024 },
      "9:16": { width: 1024, height: 1792 },
      "1:1": { width: 1024, height: 1024 },
      "4:3": { width: 1408, height: 1024 },
    };

    const imageSize = sizeMap[aspectRatio || "16:9"] ?? sizeMap["16:9"];

    const images = await generateImage(prompt, { imageSize });

    return NextResponse.json({
      images,
      promptId: promptId ?? null,
      section: section ?? null,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[media/generate] Error:", err);
    return NextResponse.json(
      { error: "Image generation failed", detail: String(err) },
      { status: 500 }
    );
  }
}
