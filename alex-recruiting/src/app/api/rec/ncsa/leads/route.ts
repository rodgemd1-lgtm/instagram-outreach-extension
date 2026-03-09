import { NextRequest, NextResponse } from "next/server";
import {
  getAllLeads,
  getLeadsByStatus,
  updateLeadStatus,
  addLead,
} from "@/lib/rec/knowledge/ncsa-leads";
import {
  buildLeadSummary,
  dedupeNcsaLeads,
  getLeadCoachMatches,
} from "@/lib/rec/knowledge/ncsa-actions";
import type { NCSALead } from "@/lib/rec/types";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const rawLeads = status
    ? await getLeadsByStatus(status as NCSALead["outreachStatus"])
    : await getAllLeads();
  const leads = dedupeNcsaLeads(rawLeads);
  const matches = await getLeadCoachMatches(leads);
  const summary = buildLeadSummary(leads, matches);
  return NextResponse.json({
    leads,
    total: leads.length,
    summary,
    matches,
  });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const lead = await addLead({
    coachName: data.coachName || "",
    schoolName: data.schoolName || "",
    division: data.division || "",
    conference: data.conference || "",
    source: data.source || "manual",
    sourceDetail: data.sourceDetail || "Manually added",
    xHandle: data.xHandle || null,
    outreachStatus: "new",
    assignedTo: data.assignedTo || "nina",
    notes: data.notes || "",
  });
  return NextResponse.json({ lead });
}

export async function PUT(req: NextRequest) {
  const { id, status } = await req.json();
  if (!id || !status) {
    return NextResponse.json(
      { error: "id and status required" },
      { status: 400 }
    );
  }
  const updated = await updateLeadStatus(id, status);
  if (!updated) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }
  return NextResponse.json({ lead: updated });
}
