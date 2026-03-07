/**
 * POST /api/content/post-graphic
 *
 * Generate a 1080×1080 square post graphic PNG for X/Twitter.
 *
 * Body:
 * {
 *   text: string,          — main quote or stat (required)
 *   subtext?: string,      — supporting line below the main text
 *   brandTag?: string,     — override bottom branding tag
 *   style?: "dark" | "gradient",
 *   type?: "quote" | "stat" — "stat" triggers stat card instead
 * }
 *
 * When type === "stat", body.stats is used to generate a stat card instead:
 * {
 *   type: "stat",
 *   stats: {
 *     pancakeBlocks?: number,
 *     sacks?: number,
 *     fumbleRecoveries?: number,
 *     benchPress?: string,
 *     squat?: string,
 *     height?: string,
 *     weight?: string,
 *     gpa?: string,
 *     teamRecord?: string,
 *     classYear?: number
 *   }
 * }
 *
 * Returns: image/png binary
 */

import { NextRequest, NextResponse } from "next/server";
import {
  generatePostGraphic,
  generateStatCard,
} from "@/lib/content-engine/splash-generator";
import type {
  PostGraphicOptions,
  StatCardStats,
} from "@/lib/content-engine/splash-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "stat") {
      const stats: StatCardStats = body.stats ?? {};
      const imageBuffer = await generateStatCard(stats);

      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="jacob-rodgers-stat-card.png"`,
          "Content-Length": String(imageBuffer.length),
          "Cache-Control": "no-store",
        },
      });
    }

    if (!body.text || typeof body.text !== "string") {
      return NextResponse.json(
        {
          error: "Missing required field: text",
          hint: "Provide { text: string } or { type: 'stat', stats: {...} }",
        },
        { status: 400 }
      );
    }

    const options: PostGraphicOptions = {
      text: body.text,
      subtext: body.subtext,
      brandTag: body.brandTag,
      style: body.style ?? "dark",
    };

    const imageBuffer = await generatePostGraphic(options);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="jacob-rodgers-post.png"`,
        "Content-Length": String(imageBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[POST /api/content/post-graphic]", err);
    return NextResponse.json(
      { error: "Failed to generate post graphic", details: message },
      { status: 500 }
    );
  }
}
