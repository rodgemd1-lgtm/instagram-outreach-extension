// NCSA lead store — Supabase JS client with file-backed fallback
// Migrated from Drizzle ORM (which requires direct PG connection) to Supabase REST client

import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { promises as fs } from "fs";
import path from "path";
import type { NCSALead, TeamMemberId } from "@/lib/rec/types";

const FALLBACK_PATH = path.join(process.cwd(), ".ncsa-leads.json");

// ── File-backed fallback ──

async function readFallback(): Promise<NCSALead[]> {
  try {
    const data = await fs.readFile(FALLBACK_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeFallback(leads: NCSALead[]) {
  await fs.writeFile(FALLBACK_PATH, JSON.stringify(leads, null, 2));
}

// ── Supabase row mapping ──

function rowToLead(row: Record<string, unknown>): NCSALead {
  return {
    id: row.id as string,
    coachName: row.coach_name as string,
    schoolName: row.school_name as string,
    division: row.division as string,
    conference: (row.conference as string) || "",
    source: row.source as NCSALead["source"],
    sourceDetail: (row.source_detail as string) || "",
    detectedAt: (row.detected_at as string) || new Date().toISOString(),
    xHandle: (row.x_handle as string) || null,
    outreachStatus: row.outreach_status as NCSALead["outreachStatus"],
    assignedTo: (row.assigned_to as TeamMemberId) || "nina",
    notes: (row.notes as string) || "",
  };
}

// ── Public API ──

export async function addLead(
  data: Omit<NCSALead, "id" | "detectedAt">
): Promise<NCSALead> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data: row, error } = await supabase
      .from("ncsa_leads")
      .insert({
        coach_name: data.coachName,
        school_name: data.schoolName,
        division: data.division,
        conference: data.conference,
        source: data.source,
        source_detail: data.sourceDetail,
        x_handle: data.xHandle,
        outreach_status: data.outreachStatus,
        assigned_to: data.assignedTo,
        notes: data.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return rowToLead(row);
  }

  // File fallback
  const leads = await readFallback();
  const lead: NCSALead = {
    ...data,
    id: crypto.randomUUID(),
    detectedAt: new Date().toISOString(),
  };
  leads.push(lead);
  await writeFallback(leads);
  return lead;
}

export async function updateLeadStatus(
  id: string,
  status: NCSALead["outreachStatus"]
): Promise<NCSALead | undefined> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data: row, error } = await supabase
      .from("ncsa_leads")
      .update({ outreach_status: status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return undefined;
    return rowToLead(row);
  }

  const leads = await readFallback();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return undefined;
  leads[idx].outreachStatus = status;
  await writeFallback(leads);
  return leads[idx];
}

export async function getAllLeads(): Promise<NCSALead[]> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("ncsa_leads")
      .select("*")
      .order("detected_at", { ascending: false });

    if (error) {
      console.error("NCSA leads fetch error:", error);
      return readFallback();
    }
    return (data || []).map(rowToLead);
  }

  return readFallback();
}

export async function getLeadsByStatus(
  status: NCSALead["outreachStatus"]
): Promise<NCSALead[]> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("ncsa_leads")
      .select("*")
      .eq("outreach_status", status)
      .order("detected_at", { ascending: false });

    if (error) return [];
    return (data || []).map(rowToLead);
  }

  const leads = await readFallback();
  return leads.filter((l) => l.outreachStatus === status);
}

export async function clearLeads(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    await supabase.from("ncsa_leads").delete().neq("id", "");
    return;
  }
  await writeFallback([]);
}

export async function getKnowledgeContext(): Promise<string> {
  try {
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
  } catch (err) {
    console.error("NCSA knowledge context error:", err);
    return "=== NCSA LEAD PIPELINE ===\nUnable to load leads. Database may be unavailable.";
  }
}
