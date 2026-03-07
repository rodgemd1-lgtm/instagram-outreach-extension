import { NextRequest, NextResponse } from "next/server";
import { validateDM } from "@/lib/agents/compliance-guardian";
import type { Division } from "@/lib/agents/compliance-guardian";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Parse optional compliance metadata from the request body.
  // If the caller provides coach/school/division info, run the
  // Compliance Guardian check before queuing the DM for delivery.
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // No body — skip compliance check (fallback to simple queue)
  }

  const content = (body.content as string) || "";
  const coachName = (body.coachName as string) || "";
  const schoolName = (body.schoolName as string) || "";
  const division = ((body.division as string) || "") as Division;

  // Run compliance validation when we have enough metadata
  if (content && coachName && schoolName && division) {
    const check = await validateDM({
      coachName,
      schoolName,
      division,
      messageContent: content,
      athleteClassYear: (body.athleteClassYear as number) || 2029,
    });

    if (!check.allowed) {
      return NextResponse.json(
        {
          message: `DM ${params.id} blocked by Compliance Guardian`,
          dmId: params.id,
          status: "rejected",
          reason: check.reason,
          rule: check.rule,
        },
        { status: 422 }
      );
    }

    // Attach advisory if present
    if (check.reason) {
      return NextResponse.json({
        message: `DM ${params.id} queued for delivery via X API`,
        dmId: params.id,
        status: "sent",
        advisory: check.reason,
        rule: check.rule,
        note: "X API DM requires OAuth 2.0 user context",
      });
    }
  }

  return NextResponse.json({
    message: `DM ${params.id} queued for delivery via X API`,
    dmId: params.id,
    status: "sent",
    note: "X API DM requires OAuth 2.0 user context",
  });
}
