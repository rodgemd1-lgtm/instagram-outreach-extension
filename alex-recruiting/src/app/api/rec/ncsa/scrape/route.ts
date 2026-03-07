import { NextRequest, NextResponse } from "next/server";
import { addLead } from "@/lib/rec/knowledge/ncsa-leads";

export async function POST(req: NextRequest) {
  const { html } = await req.json();

  if (!html || typeof html !== "string") {
    return NextResponse.json({ error: "html field required" }, { status: 400 });
  }

  const leads = [];

  // Parse profile viewers -- look for table rows with coach info
  // Pattern: rows containing school names, coach names, dates
  const viewerRegex =
    /<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/gi;

  let match;
  while ((match = viewerRegex.exec(html)) !== null) {
    const [, col1, col2, col3, col4] = match.map(
      (s) => s?.replace(/<[^>]*>/g, "").trim() || ""
    );
    if (col1 && col2 && !col1.includes("Coach Name")) {
      const lead = await addLead({
        coachName: col1,
        schoolName: col2,
        division: col3 || "Unknown",
        conference: col4 || "Unknown",
        source: "profile_view",
        sourceDetail: `Viewed Jacob's NCSA profile`,
        xHandle: null,
        outreachStatus: "new",
        assignedTo: "nina",
        notes: "",
      });
      leads.push(lead);
    }
  }

  // Also support a simpler JSON-like format for easier testing/manual entry
  // If the HTML contains a JSON block like <!-- NCSA_DATA: {...} -->
  const jsonMatch = html.match(/<!-- NCSA_DATA: ([\s\S]*?) -->/);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      if (Array.isArray(data.viewers)) {
        for (const v of data.viewers) {
          const lead = await addLead({
            coachName: v.coachName || "Unknown Coach",
            schoolName: v.schoolName || "Unknown School",
            division: v.division || "Unknown",
            conference: v.conference || "Unknown",
            source: "profile_view",
            sourceDetail: v.detail || "Viewed profile",
            xHandle: v.xHandle || null,
            outreachStatus: "new",
            assignedTo: "nina",
            notes: "",
          });
          leads.push(lead);
        }
      }
      if (Array.isArray(data.campInvites)) {
        for (const c of data.campInvites) {
          const lead = await addLead({
            coachName: c.coachName || "Camp Coordinator",
            schoolName: c.schoolName || "Unknown School",
            division: c.division || "Unknown",
            conference: c.conference || "Unknown",
            source: "camp_invite",
            sourceDetail: c.detail || "Camp invite received",
            xHandle: c.xHandle || null,
            outreachStatus: "new",
            assignedTo: "nina",
            notes: c.notes || "",
          });
          leads.push(lead);
        }
      }
      if (Array.isArray(data.messages)) {
        for (const m of data.messages) {
          const lead = await addLead({
            coachName: m.coachName || "Unknown Coach",
            schoolName: m.schoolName || "Unknown School",
            division: m.division || "Unknown",
            conference: m.conference || "Unknown",
            source: "message",
            sourceDetail: m.detail || "Message received",
            xHandle: m.xHandle || null,
            outreachStatus: "new",
            assignedTo: "nina",
            notes: m.preview || "",
          });
          leads.push(lead);
        }
      }
    } catch {
      // JSON parse failed, continue with HTML parsing results
    }
  }

  return NextResponse.json({ leads, created: leads.length });
}
