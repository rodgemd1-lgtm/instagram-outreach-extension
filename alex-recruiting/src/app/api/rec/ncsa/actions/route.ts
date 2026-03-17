import { NextRequest, NextResponse } from "next/server";
import {
  followLeadCoach,
  getLeadCoachMatches,
} from "@/lib/rec/knowledge/ncsa-actions";
import { getAllLeads } from "@/lib/rec/knowledge/ncsa-leads";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const leadId = typeof body.leadId === "string" ? body.leadId : "";
  const action = typeof body.action === "string" ? body.action : "";

  if (!leadId || !action) {
    return NextResponse.json(
      { error: "leadId and action are required" },
      { status: 400 }
    );
  }

  if (action === "follow") {
    const result = await followLeadCoach(leadId);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (action === "draft") {
    const leads = await getAllLeads();
    const lead = leads.find((entry) => entry.id === leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const [match] = await getLeadCoachMatches([lead]);
    return NextResponse.json({
      ok: true,
      leadId,
      thankYouDraft: match?.thankYouDraft ?? "",
      matchedCoachXHandle: match?.matchedCoachXHandle ?? null,
      matchedCoachName: match?.matchedCoachName ?? null,
    });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
