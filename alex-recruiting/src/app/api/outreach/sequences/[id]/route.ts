// PUT /api/outreach/sequences/[id] — Pause or resume a DM sequence
// GET /api/outreach/sequences/[id] — Get a single sequence by ID

import { NextRequest, NextResponse } from "next/server";
import {
  getSequenceById,
  pauseSequence,
  resumeSequence,
  markResponseDetected,
} from "@/lib/outreach/dm-sequences";

interface RouteParams {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const sequence = await getSequenceById(params.id);

    if (!sequence) {
      return NextResponse.json(
        { error: `Sequence ${params.id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ sequence });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get sequence";
    console.error(`[API] GET /outreach/sequences/${params.id} error:`, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const body = await req.json();
    const { action } = body; // "pause" | "resume" | "mark_responded"

    if (!action) {
      return NextResponse.json(
        { error: "action is required: 'pause', 'resume', or 'mark_responded'" },
        { status: 400 }
      );
    }

    const sequence = await getSequenceById(params.id);
    if (!sequence) {
      return NextResponse.json(
        { error: `Sequence ${params.id} not found` },
        { status: 404 }
      );
    }

    let success = false;
    let message = "";

    switch (action) {
      case "pause":
        success = await pauseSequence(params.id, "manual");
        message = success
          ? `Sequence for ${sequence.coachName} paused.`
          : "Failed to pause sequence.";
        break;

      case "resume":
        if (sequence.status === "completed") {
          return NextResponse.json(
            { error: "Cannot resume a completed sequence. Create a new sequence instead." },
            { status: 400 }
          );
        }
        success = await resumeSequence(params.id);
        message = success
          ? `Sequence for ${sequence.coachName} resumed. Next step will fire at the scheduled time.`
          : "Failed to resume sequence.";
        break;

      case "mark_responded":
        // Mark the coach as having responded — pauses the sequence
        await markResponseDetected(sequence.coachId);
        success = true;
        message = `Marked ${sequence.coachName} as having responded. Sequence paused. Time to personalize your reply!`;
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Use 'pause', 'resume', or 'mark_responded'.` },
          { status: 400 }
        );
    }

    const updated = await getSequenceById(params.id);

    return NextResponse.json({
      success,
      message,
      sequence: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update sequence";
    console.error(`[API] PUT /outreach/sequences/${params.id} error:`, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
