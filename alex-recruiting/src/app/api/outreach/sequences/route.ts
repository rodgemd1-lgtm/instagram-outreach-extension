// POST /api/outreach/sequences — Create a new DM sequence for a coach
// GET  /api/outreach/sequences — List all sequences with optional status filter

import { NextRequest, NextResponse } from "next/server";
import {
  createSequence,
  listSequences,
  type DMSequenceRecord,
} from "@/lib/outreach/dm-sequences";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as DMSequenceRecord["status"] | null;

    const sequences = await listSequences(status ?? undefined);

    return NextResponse.json({
      sequences,
      total: sequences.length,
      active: sequences.filter((s) => s.status === "active").length,
      paused: sequences.filter((s) => s.status === "paused").length,
      completed: sequences.filter((s) => s.status === "completed").length,
      responseReceived: sequences.filter((s) => s.status === "response_received").length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list sequences";
    console.error("[API] GET /outreach/sequences error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      coachId,
      coachName,
      school,
      tier = "Tier 2",
      templateType = "initial_outreach",
      xHandle,
      xUserId,
      templateVars = {},
    } = body;

    // Validation
    if (!coachId || !coachName || !school) {
      return NextResponse.json(
        { error: "coachId, coachName, and school are required" },
        { status: 400 }
      );
    }

    const validTiers = ["Tier 1", "Tier 2", "Tier 3", "all"];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: `tier must be one of: ${validTiers.join(", ")}` },
        { status: 400 }
      );
    }

    const sequence = await createSequence(coachId, templateType, {
      coachName,
      school,
      tier,
      xHandle,
      xUserId,
      templateVars,
    });

    return NextResponse.json(
      {
        sequence,
        message: `DM sequence created for ${coachName} at ${school}. Step 1 is scheduled immediately.`,
        nextSteps: {
          step1: "Initial outreach — sends on Day 0",
          step2: "Follow-up 1 — sends on Day 3 if no response",
          step3: "Follow-up 2 — sends on Day 7 if no response",
          step4: "Final touchpoint — sends on Day 14 if no response",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create sequence";
    console.error("[API] POST /outreach/sequences error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
