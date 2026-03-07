// Supabase-backed NCSA lead store using Drizzle ORM
// Migrated from file-backed .ncsa-leads.json to PostgreSQL

import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { ncsaLeads } from "@/lib/db/schema";
import type { NCSALead, TeamMemberId } from "@/lib/rec/types";

// Map a Drizzle row to the NCSALead shape used by the rest of the codebase
function rowToLead(row: typeof ncsaLeads.$inferSelect): NCSALead {
  return {
    id: row.id,
    coachName: row.coachName,
    schoolName: row.schoolName,
    division: row.division,
    conference: row.conference,
    source: row.source as NCSALead["source"],
    sourceDetail: row.sourceDetail,
    detectedAt: row.detectedAt?.toISOString() ?? new Date().toISOString(),
    xHandle: row.xHandle ?? null,
    outreachStatus: row.outreachStatus as NCSALead["outreachStatus"],
    assignedTo: row.assignedTo as TeamMemberId,
    notes: row.notes ?? "",
  };
}

export async function addLead(
  data: Omit<NCSALead, "id" | "detectedAt">
): Promise<NCSALead> {
  const [row] = await db
    .insert(ncsaLeads)
    .values({
      coachName: data.coachName,
      schoolName: data.schoolName,
      division: data.division,
      conference: data.conference,
      source: data.source,
      sourceDetail: data.sourceDetail,
      xHandle: data.xHandle,
      outreachStatus: data.outreachStatus,
      assignedTo: data.assignedTo,
      notes: data.notes,
    })
    .returning();
  return rowToLead(row);
}

export async function updateLeadStatus(
  id: string,
  status: NCSALead["outreachStatus"]
): Promise<NCSALead | undefined> {
  const [row] = await db
    .update(ncsaLeads)
    .set({ outreachStatus: status, updatedAt: new Date() })
    .where(eq(ncsaLeads.id, id))
    .returning();
  return row ? rowToLead(row) : undefined;
}

export async function getAllLeads(): Promise<NCSALead[]> {
  const rows = await db
    .select()
    .from(ncsaLeads)
    .orderBy(desc(ncsaLeads.detectedAt));
  return rows.map(rowToLead);
}

export async function getLeadsByStatus(
  status: NCSALead["outreachStatus"]
): Promise<NCSALead[]> {
  const rows = await db
    .select()
    .from(ncsaLeads)
    .where(eq(ncsaLeads.outreachStatus, status))
    .orderBy(desc(ncsaLeads.detectedAt));
  return rows.map(rowToLead);
}

export async function clearLeads(): Promise<void> {
  await db.delete(ncsaLeads);
}

export async function getKnowledgeContext(): Promise<string> {
  const leads = await getAllLeads();
  const lines: string[] = [];

  lines.push("=== NCSA LEAD PIPELINE ===\n");

  if (leads.length === 0) {
    lines.push("No leads currently in pipeline.");
    lines.push("Leads are added when coaches view Jacob's NCSA profile, send camp invites, or message through the platform.");
    return lines.join("\n");
  }

  lines.push(`Total leads: ${leads.length}\n`);

  const statusCounts: Record<string, number> = {};
  for (const lead of leads) {
    statusCounts[lead.outreachStatus] = (statusCounts[lead.outreachStatus] || 0) + 1;
  }

  lines.push("Pipeline breakdown:");
  for (const [status, count] of Object.entries(statusCounts)) {
    lines.push(`  ${status}: ${count}`);
  }

  lines.push("\nRecent leads:");
  const recent = leads.slice(0, 5);

  for (const lead of recent) {
    lines.push(
      `  - ${lead.coachName} (${lead.schoolName}, ${lead.division}) — ${lead.outreachStatus} — Source: ${lead.source}`
    );
  }

  return lines.join("\n");
}
