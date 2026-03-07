import { NextRequest, NextResponse } from "next/server";
import {
  getAllHighlights,
  addHighlight,
  updateHighlight,
  deleteHighlight,
  type PlayType,
  type SideOfBall,
} from "@/lib/video/highlight-catalog";

/** GET /api/recruit/highlights — List all highlights */
export async function GET() {
  const highlights = getAllHighlights();
  return NextResponse.json(highlights);
}

/** POST /api/recruit/highlights — Add a new highlight */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      videoId,
      videoPath,
      startTime,
      endTime,
      playType,
      side,
      quality,
      description,
      gameContext,
      includeInReel,
    } = body;

    if (!videoId || !videoPath || startTime == null || endTime == null) {
      return NextResponse.json(
        { error: "Missing required fields: videoId, videoPath, startTime, endTime" },
        { status: 400 }
      );
    }

    const highlight = addHighlight({
      videoId,
      videoPath,
      startTime: Number(startTime),
      endTime: Number(endTime),
      playType: (playType as PlayType) || "other",
      side: (side as SideOfBall) || "offense",
      quality: Number(quality) || 3,
      description: description || "",
      gameContext,
      includeInReel: includeInReel ?? true,
    });

    return NextResponse.json(highlight, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

/** PUT /api/recruit/highlights — Update a highlight */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing highlight id" },
        { status: 400 }
      );
    }

    const updated = updateHighlight(id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: "Highlight not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

/** DELETE /api/recruit/highlights — Delete a highlight */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing highlight id" },
      { status: 400 }
    );
  }

  const deleted = deleteHighlight(id);
  if (!deleted) {
    return NextResponse.json(
      { error: "Highlight not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
