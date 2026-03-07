/**
 * GET  /api/rec/questionnaire — Get pre-filled questionnaire data
 * POST /api/rec/questionnaire — Record a received questionnaire and auto-generate response
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getQuestionnaireData,
  generateQuestionnaireResponse,
  getFieldMapping,
} from "@/lib/rec/knowledge/questionnaire-data";
import {
  recordQuestionnaire,
  updateQuestionnaireStatus,
} from "@/lib/rec/knowledge/questionnaire-tracker";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const school = searchParams.get("school");
  const format = searchParams.get("format"); // "flat" | "mapping" | default

  try {
    if (format === "mapping") {
      return NextResponse.json({
        fieldMapping: getFieldMapping(),
      });
    }

    if (school) {
      // Generate a complete response tailored for this school
      const response = generateQuestionnaireResponse(school);
      return NextResponse.json({ questionnaire: response });
    }

    // Return raw pre-filled data
    const data = getQuestionnaireData();
    return NextResponse.json({ data });
  } catch (err) {
    console.error("[GET /api/rec/questionnaire]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get questionnaire data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schoolName, notes } = body;

    if (!schoolName) {
      return NextResponse.json(
        { error: "schoolName is required" },
        { status: 400 }
      );
    }

    // Step 1: Record the questionnaire receipt
    const { record, alerts } = await recordQuestionnaire(schoolName, notes);

    // Step 2: Auto-generate a pre-filled response
    const response = generateQuestionnaireResponse(schoolName);

    // Step 3: Update status to in_progress (auto-fill is ready)
    const updated = await updateQuestionnaireStatus(
      record.id,
      "in_progress",
      response.data as unknown as Record<string, unknown>
    );

    return NextResponse.json({
      record: updated ?? record,
      response,
      alerts,
      message: `Questionnaire from ${schoolName} recorded. Auto-fill is ${response.completionRate}% complete. ${response.placeholderFields.length} fields need manual input.`,
    });
  } catch (err) {
    console.error("[POST /api/rec/questionnaire]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record questionnaire" },
      { status: 500 }
    );
  }
}
