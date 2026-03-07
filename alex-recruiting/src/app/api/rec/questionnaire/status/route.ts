/**
 * GET /api/rec/questionnaire/status — Track sent/pending questionnaires
 *
 * Query params:
 *   filter — "pending" | "submitted" | "all" | "non_target" | "overdue" (default: "all")
 *   school — filter by school name
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllQuestionnaires,
  getPendingQuestionnaires,
  getNonTargetSchoolQuestionnaires,
  getQuestionnaireStatus,
  getOverdueAlerts,
  updateQuestionnaireStatus,
} from "@/lib/rec/knowledge/questionnaire-tracker";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "all";
  const school = searchParams.get("school");

  try {
    // Single school lookup
    if (school) {
      const status = await getQuestionnaireStatus(school);
      if (!status) {
        return NextResponse.json(
          { error: `No questionnaire found for "${school}"` },
          { status: 404 }
        );
      }
      return NextResponse.json({ questionnaire: status });
    }

    // Filtered list
    switch (filter) {
      case "pending": {
        const pending = await getPendingQuestionnaires();
        return NextResponse.json({
          questionnaires: pending,
          total: pending.length,
          filter: "pending",
        });
      }

      case "submitted": {
        const all = await getAllQuestionnaires();
        const submitted = all.filter(
          (q) => q.status === "submitted" || q.status === "confirmed"
        );
        return NextResponse.json({
          questionnaires: submitted,
          total: submitted.length,
          filter: "submitted",
        });
      }

      case "non_target": {
        const nonTarget = await getNonTargetSchoolQuestionnaires();
        return NextResponse.json({
          questionnaires: nonTarget,
          total: nonTarget.length,
          filter: "non_target",
          message: "These schools are not on the target list — evaluate for potential addition.",
        });
      }

      case "overdue": {
        const alerts = await getOverdueAlerts();
        return NextResponse.json({
          alerts,
          total: alerts.length,
          filter: "overdue",
        });
      }

      default: {
        const all = await getAllQuestionnaires();
        const pending = all.filter((q) => q.status === "received");
        const inProgress = all.filter((q) => q.status === "in_progress");
        const submitted = all.filter(
          (q) => q.status === "submitted" || q.status === "confirmed"
        );
        const nonTarget = all.filter((q) => !q.isTargetSchool);
        const overdueAlerts = await getOverdueAlerts();

        return NextResponse.json({
          questionnaires: all,
          total: all.length,
          summary: {
            pending: pending.length,
            inProgress: inProgress.length,
            submitted: submitted.length,
            nonTargetSchools: nonTarget.length,
            overdue: overdueAlerts.length,
          },
          overdueAlerts,
          filter: "all",
        });
      }
    }
  } catch (err) {
    console.error("[GET /api/rec/questionnaire/status]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get questionnaire status" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, responseData } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["received", "in_progress", "submitted", "confirmed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await updateQuestionnaireStatus(id, status, responseData);
    if (!updated) {
      return NextResponse.json(
        { error: "Questionnaire not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ questionnaire: updated });
  } catch (err) {
    console.error("[PUT /api/rec/questionnaire/status]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update questionnaire status" },
      { status: 500 }
    );
  }
}
