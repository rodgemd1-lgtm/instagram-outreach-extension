/**
 * POST /api/content/splash
 *
 * Generate a 1920×1080 highlight splash screen PNG.
 *
 * Body (all fields optional — defaults come from jacobProfile):
 * {
 *   playerName?: string,
 *   jerseyNumber?: number,
 *   position?: string,
 *   school?: string,
 *   classYear?: number,
 *   subtitle?: string,
 *   stats?: {
 *     pancakes?: number,
 *     sacks?: number,
 *     bench?: string,
 *     squat?: string,
 *     record?: string
 *   }
 * }
 *
 * Returns: image/png binary
 */

import { NextRequest, NextResponse } from "next/server";
import { generateHighlightSplash } from "@/lib/content-engine/splash-generator";
import type { HighlightSplashOptions } from "@/lib/content-engine/splash-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const options: HighlightSplashOptions = {
      playerName: body.playerName,
      jerseyNumber: body.jerseyNumber,
      position: body.position,
      school: body.school,
      classYear: body.classYear,
      subtitle: body.subtitle,
      stats: body.stats,
    };

    const imageBuffer = await generateHighlightSplash(options);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="jacob-rodgers-splash.png"`,
        "Content-Length": String(imageBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[POST /api/content/splash]", err);
    return NextResponse.json(
      { error: "Failed to generate splash screen", details: message },
      { status: 500 }
    );
  }
}
