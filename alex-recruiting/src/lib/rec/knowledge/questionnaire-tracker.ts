/**
 * Questionnaire Tracker
 *
 * Track which schools have sent questionnaires — each questionnaire is a
 * signal of interest. When a non-target school sends one, that's opportunity
 * detection: a new program is interested that we haven't been tracking.
 *
 * Uses Supabase/Drizzle for persistence with in-memory fallback for
 * development without a database.
 */

import { eq, desc } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db";
import { questionnaires } from "@/lib/db/schema";
import { targetSchools } from "@/lib/data/target-schools";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuestionnaireStatus = "received" | "in_progress" | "submitted" | "confirmed";

export interface QuestionnaireRecord {
  id: string;
  schoolName: string;
  schoolId: string | null;
  receivedAt: string;
  respondedAt: string | null;
  status: QuestionnaireStatus;
  responseData: Record<string, unknown> | null;
  notes: string;
  isTargetSchool: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionnaireAlert {
  type: "new_target_school" | "new_non_target_school" | "overdue_response";
  schoolName: string;
  message: string;
  priority: "high" | "medium" | "low";
  createdAt: string;
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

const memoryQuestionnaires: QuestionnaireRecord[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isTargetSchool(schoolName: string): boolean {
  const normalized = schoolName.toLowerCase().trim();
  return targetSchools.some(
    (s) =>
      s.name.toLowerCase() === normalized ||
      s.id === normalized ||
      s.name.toLowerCase().includes(normalized) ||
      normalized.includes(s.name.toLowerCase())
  );
}

function findSchoolId(schoolName: string): string | null {
  const normalized = schoolName.toLowerCase().trim();
  const found = targetSchools.find(
    (s) =>
      s.name.toLowerCase() === normalized ||
      s.id === normalized ||
      s.name.toLowerCase().includes(normalized) ||
      normalized.includes(s.name.toLowerCase())
  );
  return found?.id ?? null;
}

function rowToRecord(row: typeof questionnaires.$inferSelect): QuestionnaireRecord {
  return {
    id: row.id,
    schoolName: row.schoolName,
    schoolId: row.schoolId,
    receivedAt: row.receivedAt?.toISOString() ?? new Date().toISOString(),
    respondedAt: row.respondedAt?.toISOString() ?? null,
    status: row.status as QuestionnaireStatus,
    responseData: row.responseData as Record<string, unknown> | null,
    notes: row.notes ?? "",
    isTargetSchool: row.isTargetSchool ?? false,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Record a new questionnaire received from a school.
 * Returns the record and any generated alerts.
 */
export async function recordQuestionnaire(
  schoolName: string,
  notes?: string
): Promise<{ record: QuestionnaireRecord; alerts: QuestionnaireAlert[] }> {
  const isTarget = isTargetSchool(schoolName);
  const schoolId = findSchoolId(schoolName);
  const now = new Date();

  const alerts: QuestionnaireAlert[] = [];

  if (!isDbConfigured()) {
    // In-memory fallback
    const record: QuestionnaireRecord = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      schoolName,
      schoolId,
      receivedAt: now.toISOString(),
      respondedAt: null,
      status: "received",
      responseData: null,
      notes: notes ?? "",
      isTargetSchool: isTarget,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    memoryQuestionnaires.push(record);

    // Generate alerts
    if (isTarget) {
      alerts.push({
        type: "new_target_school",
        schoolName,
        message: `TARGET SCHOOL questionnaire received from ${schoolName}! Respond IMMEDIATELY — this is a strong interest signal.`,
        priority: "high",
        createdAt: now.toISOString(),
      });
    } else {
      alerts.push({
        type: "new_non_target_school",
        schoolName,
        message: `NEW OPPORTUNITY: ${schoolName} sent a questionnaire. This school is not on our target list — research needed to evaluate fit.`,
        priority: "medium",
        createdAt: now.toISOString(),
      });
    }

    return { record, alerts };
  }

  // Database path
  const [row] = await db
    .insert(questionnaires)
    .values({
      schoolName,
      schoolId,
      receivedAt: now,
      status: "received",
      notes: notes ?? "",
      isTargetSchool: isTarget,
    })
    .returning();

  const record = rowToRecord(row);

  if (isTarget) {
    alerts.push({
      type: "new_target_school",
      schoolName,
      message: `TARGET SCHOOL questionnaire received from ${schoolName}! Respond IMMEDIATELY — this is a strong interest signal.`,
      priority: "high",
      createdAt: now.toISOString(),
    });
  } else {
    alerts.push({
      type: "new_non_target_school",
      schoolName,
      message: `NEW OPPORTUNITY: ${schoolName} sent a questionnaire. This school is not on our target list — research needed to evaluate fit.`,
      priority: "medium",
      createdAt: now.toISOString(),
    });
  }

  return { record, alerts };
}

/**
 * Get the status of a specific school's questionnaire.
 */
export async function getQuestionnaireStatus(
  schoolName: string
): Promise<QuestionnaireRecord | null> {
  if (!isDbConfigured()) {
    return (
      memoryQuestionnaires.find(
        (q) => q.schoolName.toLowerCase() === schoolName.toLowerCase()
      ) ?? null
    );
  }

  const rows = await db
    .select()
    .from(questionnaires)
    .where(eq(questionnaires.schoolName, schoolName))
    .limit(1);

  return rows.length > 0 ? rowToRecord(rows[0]) : null;
}

/**
 * Get all questionnaires that still need a response (status = "received").
 */
export async function getPendingQuestionnaires(): Promise<QuestionnaireRecord[]> {
  if (!isDbConfigured()) {
    return memoryQuestionnaires.filter((q) => q.status === "received");
  }

  const rows = await db
    .select()
    .from(questionnaires)
    .where(eq(questionnaires.status, "received"))
    .orderBy(desc(questionnaires.receivedAt));

  return rows.map(rowToRecord);
}

/**
 * Get all tracked questionnaires, ordered by most recent first.
 */
export async function getAllQuestionnaires(): Promise<QuestionnaireRecord[]> {
  if (!isDbConfigured()) {
    return [...memoryQuestionnaires].sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    );
  }

  const rows = await db
    .select()
    .from(questionnaires)
    .orderBy(desc(questionnaires.receivedAt));

  return rows.map(rowToRecord);
}

/**
 * Update a questionnaire status (e.g., mark as submitted).
 */
export async function updateQuestionnaireStatus(
  id: string,
  status: QuestionnaireStatus,
  responseData?: Record<string, unknown>
): Promise<QuestionnaireRecord | null> {
  const now = new Date();

  if (!isDbConfigured()) {
    const idx = memoryQuestionnaires.findIndex((q) => q.id === id);
    if (idx === -1) return null;

    memoryQuestionnaires[idx] = {
      ...memoryQuestionnaires[idx],
      status,
      respondedAt: status === "submitted" || status === "confirmed" ? now.toISOString() : memoryQuestionnaires[idx].respondedAt,
      responseData: responseData ?? memoryQuestionnaires[idx].responseData,
      updatedAt: now.toISOString(),
    };
    return memoryQuestionnaires[idx];
  }

  const updateValues: Record<string, unknown> = {
    status,
    updatedAt: now,
  };

  if (status === "submitted" || status === "confirmed") {
    updateValues.respondedAt = now;
  }

  if (responseData) {
    updateValues.responseData = responseData;
  }

  const [row] = await db
    .update(questionnaires)
    .set(updateValues)
    .where(eq(questionnaires.id, id))
    .returning();

  return row ? rowToRecord(row) : null;
}

/**
 * Get questionnaires from non-target schools — these represent
 * new opportunities that need evaluation.
 */
export async function getNonTargetSchoolQuestionnaires(): Promise<QuestionnaireRecord[]> {
  if (!isDbConfigured()) {
    return memoryQuestionnaires.filter((q) => !q.isTargetSchool);
  }

  const rows = await db
    .select()
    .from(questionnaires)
    .where(eq(questionnaires.isTargetSchool, false))
    .orderBy(desc(questionnaires.receivedAt));

  return rows.map(rowToRecord);
}

/**
 * Generate overdue response alerts for questionnaires received
 * more than 24 hours ago that haven't been submitted.
 */
export async function getOverdueAlerts(): Promise<QuestionnaireAlert[]> {
  const pending = await getPendingQuestionnaires();
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  return pending
    .filter((q) => now - new Date(q.receivedAt).getTime() > TWENTY_FOUR_HOURS)
    .map((q) => ({
      type: "overdue_response" as const,
      schoolName: q.schoolName,
      message: `OVERDUE: Questionnaire from ${q.schoolName} received ${Math.round((now - new Date(q.receivedAt).getTime()) / (60 * 60 * 1000))} hours ago and has not been submitted. Respond ASAP.`,
      priority: q.isTargetSchool ? ("high" as const) : ("medium" as const),
      createdAt: new Date().toISOString(),
    }));
}

/**
 * Knowledge context injection for the REC team personas.
 */
export async function getKnowledgeContext(): Promise<string> {
  const all = await getAllQuestionnaires();
  const pending = all.filter((q) => q.status === "received");
  const submitted = all.filter((q) => q.status === "submitted" || q.status === "confirmed");
  const nonTarget = all.filter((q) => !q.isTargetSchool);
  const overdue = await getOverdueAlerts();

  const lines: string[] = [];

  lines.push("=== QUESTIONNAIRE TRACKER ===\n");

  if (all.length === 0) {
    lines.push("No questionnaires received yet.");
    lines.push("FBS programs can begin sending questionnaires to Class of 2029 on June 15, 2027.");
    lines.push("FCS and D2 programs may send questionnaires earlier.");
    return lines.join("\n");
  }

  lines.push(`Total questionnaires received: ${all.length}`);
  lines.push(`Pending response: ${pending.length}`);
  lines.push(`Submitted: ${submitted.length}`);
  lines.push(`From non-target schools (new opportunities): ${nonTarget.length}`);

  if (overdue.length > 0) {
    lines.push(`\nOVERDUE RESPONSES: ${overdue.length}`);
    for (const alert of overdue) {
      lines.push(`  - ${alert.message}`);
    }
  }

  if (pending.length > 0) {
    lines.push("\nPENDING QUESTIONNAIRES:");
    for (const q of pending) {
      lines.push(`  - ${q.schoolName} (received: ${new Date(q.receivedAt).toLocaleDateString()}) ${q.isTargetSchool ? "[TARGET]" : "[NEW OPPORTUNITY]"}`);
    }
  }

  if (nonTarget.length > 0) {
    lines.push("\nNEW OPPORTUNITIES (non-target schools showing interest):");
    for (const q of nonTarget) {
      lines.push(`  - ${q.schoolName} — ${q.status}`);
    }
  }

  return lines.join("\n");
}
