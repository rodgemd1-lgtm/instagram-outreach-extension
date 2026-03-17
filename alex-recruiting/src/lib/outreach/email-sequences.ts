// Email Sequence Engine — Automated multi-step email outreach for coach recruiting
// Parallel to dm-sequences.ts but for email outreach
// NCAA allows prospects to email coaches at any age — email often preferred over X DMs

import { db, isDbConfigured } from "@/lib/db";
import { emailOutreach } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { jacobProfile } from "@/lib/data/jacob-profile";
import {
  EMAIL_TEMPLATES,
  fillMergeFields,
  getTemplateByType,
  type EmailTemplateType,
  type EmailTemplate,
} from "./email-templates";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EmailStatus = "draft" | "queued" | "sent" | "opened" | "responded";

export interface EmailSequenceStep {
  stepNumber: number;
  dayOffset: number; // days from sequence start
  templateType: EmailTemplateType;
  description: string;
}

export interface EmailOutreachRecord {
  id: string;
  coachId: string | null;
  coachName: string;
  schoolName: string;
  coachEmail: string | null;
  templateType: string;
  subject: string;
  body: string;
  status: EmailStatus;
  sentAt: string | null;
  openedAt: string | null;
  respondedAt: string | null;
  sequenceId: string | null;
  stepNumber: number | null;
  createdAt: string;
}

export interface CreateEmailOptions {
  coachId?: string;
  coachName: string;
  schoolName: string;
  coachEmail?: string;
  templateType: EmailTemplateType;
  mergeVars?: Record<string, string>;
  status?: EmailStatus;
  sequenceId?: string;
  stepNumber?: number;
}

export interface EmailSequenceConfig {
  coachId?: string;
  coachName: string;
  schoolName: string;
  coachEmail?: string;
  mergeVars?: Record<string, string>;
}

export interface EmailAnalytics {
  totalEmails: number;
  drafted: number;
  queued: number;
  sent: number;
  opened: number;
  responded: number;
  responseRate: number; // 0-100
  openRate: number; // 0-100 (estimated)
  activeSequences: number;
  templateBreakdown: {
    templateType: string;
    count: number;
    responded: number;
  }[];
  recommendations: string[];
}

export interface ProcessEmailQueueResult {
  processed: number;
  sent: number;
  skipped: number;
  errors: string[];
  details: Array<{
    emailId: string;
    coachName: string;
    action: "sent" | "skipped" | "error";
    reason?: string;
  }>;
}

// ---------------------------------------------------------------------------
// In-memory store (fallback when DB is not configured)
// ---------------------------------------------------------------------------

const inMemoryEmails: EmailOutreachRecord[] = [];
let sequenceCounter = 0;

// ---------------------------------------------------------------------------
// Sequence schedule — 4-step email cadence
// ---------------------------------------------------------------------------

const EMAIL_SEQUENCE_STEPS: EmailSequenceStep[] = [
  {
    stepNumber: 1,
    dayOffset: 0,
    templateType: "initial_introduction",
    description: "Day 0 — Initial introduction email with full profile and Hudl link",
  },
  {
    stepNumber: 2,
    dayOffset: 7,
    templateType: "film_update",
    description: "Day 7 — Share new or updated film to re-engage",
  },
  {
    stepNumber: 3,
    dayOffset: 21,
    templateType: "camp_followup",
    description: "Day 21 — Camp follow-up or training update as value-add",
  },
  {
    stepNumber: 4,
    dayOffset: 45,
    templateType: "season_recap",
    description: "Day 45 — Season recap with updated stats and highlight reel",
  },
];

// ---------------------------------------------------------------------------
// Helper — build default merge variables from jacob-profile
// ---------------------------------------------------------------------------

function buildDefaultMergeVars(
  coachName: string,
  schoolName: string,
  overrides: Record<string, string> = {}
): Record<string, string> {
  const lastName = coachName.split(" ").pop() ?? coachName;
  return {
    coachName: lastName,
    schoolName,
    position: jacobProfile.position,
    measurables: `${jacobProfile.height}, ${jacobProfile.weight}`,
    hudlLink: jacobProfile.hudlUrl || "https://www.hudl.com/profile/jacob-rodgers",
    ncsaLink: jacobProfile.ncsaProfileUrl || "https://www.ncsasports.org/jacob-rodgers",
    gpa: jacobProfile.gpa,
    classYear: String(jacobProfile.classYear),
    highSchool: jacobProfile.school,
    campName: "[Camp Name]",
    campDetail: "[Describe a specific moment or coaching point from the camp]",
    newFilmTitle: "2026 Offseason Highlights",
    seasonRecord: jacobProfile.seasonStats.teamRecord,
    seasonStats: `${jacobProfile.seasonStats.pancakeBlocks} pancake blocks, ${jacobProfile.seasonStats.sacks} sacks, ${jacobProfile.seasonStats.fumbleRecoveries} fumble recovery`,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Helper — map DB row to record type
// ---------------------------------------------------------------------------

function dbRowToRecord(row: typeof emailOutreach.$inferSelect): EmailOutreachRecord {
  return {
    id: row.id,
    coachId: row.coachId,
    coachName: row.coachName,
    schoolName: row.schoolName,
    coachEmail: row.coachEmail,
    templateType: row.templateType,
    subject: row.subject,
    body: row.body,
    status: (row.status ?? "draft") as EmailStatus,
    sentAt: row.sentAt?.toISOString() ?? null,
    openedAt: row.openedAt?.toISOString() ?? null,
    respondedAt: row.respondedAt?.toISOString() ?? null,
    sequenceId: row.sequenceId,
    stepNumber: row.stepNumber,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// generateEmail — Create a single email from a template
// ---------------------------------------------------------------------------

export async function generateEmail(
  opts: CreateEmailOptions
): Promise<EmailOutreachRecord> {
  const mergeVars = buildDefaultMergeVars(
    opts.coachName,
    opts.schoolName,
    opts.mergeVars
  );

  const template = getTemplateByType(opts.templateType);
  if (!template) {
    throw new Error(`Unknown email template type: ${opts.templateType}`);
  }

  const subject = fillMergeFields(template.subject, mergeVars);
  const body = fillMergeFields(template.body, mergeVars);
  const now = new Date();

  if (isDbConfigured()) {
    const [row] = await db
      .insert(emailOutreach)
      .values({
        coachId: opts.coachId ?? null,
        coachName: opts.coachName,
        schoolName: opts.schoolName,
        coachEmail: opts.coachEmail ?? null,
        templateType: opts.templateType,
        subject,
        body: `${body}\n\n${template.signature}`,
        status: opts.status ?? "draft",
        sequenceId: opts.sequenceId ?? null,
        stepNumber: opts.stepNumber ?? null,
      })
      .returning();

    return dbRowToRecord(row);
  }

  // In-memory fallback
  const record: EmailOutreachRecord = {
    id: `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    coachId: opts.coachId ?? null,
    coachName: opts.coachName,
    schoolName: opts.schoolName,
    coachEmail: opts.coachEmail ?? null,
    templateType: opts.templateType,
    subject,
    body: `${body}\n\n${template.signature}`,
    status: opts.status ?? "draft",
    sentAt: null,
    openedAt: null,
    respondedAt: null,
    sequenceId: opts.sequenceId ?? null,
    stepNumber: opts.stepNumber ?? null,
    createdAt: now.toISOString(),
  };

  inMemoryEmails.push(record);
  return record;
}

// ---------------------------------------------------------------------------
// createEmailSequence — Create a full multi-step email sequence for a coach
// ---------------------------------------------------------------------------

export async function createEmailSequence(
  config: EmailSequenceConfig
): Promise<EmailOutreachRecord[]> {
  const sequenceId = `seq-email-${Date.now()}-${(++sequenceCounter).toString().padStart(3, "0")}`;
  const mergeVars = buildDefaultMergeVars(
    config.coachName,
    config.schoolName,
    config.mergeVars
  );

  const records: EmailOutreachRecord[] = [];

  for (const step of EMAIL_SEQUENCE_STEPS) {
    const record = await generateEmail({
      coachId: config.coachId,
      coachName: config.coachName,
      schoolName: config.schoolName,
      coachEmail: config.coachEmail,
      templateType: step.templateType,
      mergeVars,
      status: step.stepNumber === 1 ? "queued" : "draft",
      sequenceId,
      stepNumber: step.stepNumber,
    });

    records.push(record);
  }

  return records;
}

// ---------------------------------------------------------------------------
// getEmailTemplates — Return all available email templates
// ---------------------------------------------------------------------------

export function getEmailTemplates(): EmailTemplate[] {
  return [...EMAIL_TEMPLATES];
}

// ---------------------------------------------------------------------------
// processEmailQueue — Send all queued emails that are ready
// In production, this would integrate with an email sending service.
// For now, it simulates sending by updating status to "sent".
// ---------------------------------------------------------------------------

export async function processEmailQueue(): Promise<ProcessEmailQueueResult> {
  const result: ProcessEmailQueueResult = {
    processed: 0,
    sent: 0,
    skipped: 0,
    errors: [],
    details: [],
  };

  const now = new Date();
  let queuedEmails: EmailOutreachRecord[] = [];

  if (isDbConfigured()) {
    const rows = await db
      .select()
      .from(emailOutreach)
      .where(eq(emailOutreach.status, "queued"));
    queuedEmails = rows.map(dbRowToRecord);
  } else {
    queuedEmails = inMemoryEmails.filter((e) => e.status === "queued");
  }

  for (const email of queuedEmails) {
    result.processed++;

    try {
      // Check if this is part of a sequence — if so, check if coach already responded
      if (email.sequenceId) {
        const hasResponse = await checkSequenceResponse(email.sequenceId);
        if (hasResponse) {
          result.skipped++;
          result.details.push({
            emailId: email.id,
            coachName: email.coachName,
            action: "skipped",
            reason: "Coach already responded to earlier email in sequence",
          });
          continue;
        }
      }

      // Check if coach email is available
      if (!email.coachEmail) {
        // In production, we would look up the coach email from a database.
        // For now, we still mark as sent (email drafted for manual sending).
        console.info(
          `[Email Queue] No email address for ${email.coachName} (${email.schoolName}) — marking as sent for manual delivery`
        );
      }

      // Mark as sent
      if (isDbConfigured()) {
        await db
          .update(emailOutreach)
          .set({
            status: "sent",
            sentAt: now,
          })
          .where(eq(emailOutreach.id, email.id));
      } else {
        const idx = inMemoryEmails.findIndex((e) => e.id === email.id);
        if (idx !== -1) {
          inMemoryEmails[idx] = {
            ...inMemoryEmails[idx],
            status: "sent",
            sentAt: now.toISOString(),
          };
        }
      }

      // Queue next step in sequence if applicable
      if (email.sequenceId && email.stepNumber !== null) {
        await queueNextSequenceStep(email.sequenceId, email.stepNumber);
      }

      result.sent++;
      result.details.push({
        emailId: email.id,
        coachName: email.coachName,
        action: "sent",
      });

      console.info(
        `[Email Queue] Sent to ${email.coachName} (${email.schoolName}): "${email.subject}"`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Email ${email.id} (${email.coachName}): ${msg}`);
      result.details.push({
        emailId: email.id,
        coachName: email.coachName,
        action: "error",
        reason: msg,
      });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// getEmailAnalytics — Aggregate analytics across all email outreach
// ---------------------------------------------------------------------------

export async function getEmailAnalytics(): Promise<EmailAnalytics> {
  let allEmails: EmailOutreachRecord[] = [];

  if (isDbConfigured()) {
    const rows = await db.select().from(emailOutreach);
    allEmails = rows.map(dbRowToRecord);
  } else {
    allEmails = [...inMemoryEmails];
  }

  const drafted = allEmails.filter((e) => e.status === "draft").length;
  const queued = allEmails.filter((e) => e.status === "queued").length;
  const sent = allEmails.filter(
    (e) => e.status === "sent" || e.status === "opened" || e.status === "responded"
  ).length;
  const opened = allEmails.filter(
    (e) => e.status === "opened" || e.status === "responded"
  ).length;
  const responded = allEmails.filter((e) => e.status === "responded").length;

  // Count unique active sequences
  const sequenceIds = new Set(
    allEmails
      .filter((e) => e.sequenceId && e.status !== "responded")
      .map((e) => e.sequenceId!)
  );

  // Template breakdown
  const templateMap = new Map<string, { count: number; responded: number }>();
  for (const email of allEmails) {
    const entry = templateMap.get(email.templateType) ?? { count: 0, responded: 0 };
    entry.count++;
    if (email.status === "responded") entry.responded++;
    templateMap.set(email.templateType, entry);
  }

  const templateBreakdown = Array.from(templateMap.entries()).map(
    ([templateType, stats]) => ({
      templateType,
      count: stats.count,
      responded: stats.responded,
    })
  );

  // Build recommendations
  const recommendations = buildEmailRecommendations(
    allEmails.length,
    sent,
    responded,
    opened
  );

  return {
    totalEmails: allEmails.length,
    drafted,
    queued,
    sent,
    opened,
    responded,
    responseRate: sent > 0 ? Math.round((responded / sent) * 100) : 0,
    openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
    activeSequences: sequenceIds.size,
    templateBreakdown,
    recommendations,
  };
}

// ---------------------------------------------------------------------------
// listEmails — Get all emails with optional filters
// ---------------------------------------------------------------------------

export async function listEmails(filters?: {
  status?: EmailStatus;
  coachName?: string;
  sequenceId?: string;
}): Promise<EmailOutreachRecord[]> {
  if (isDbConfigured()) {
    let query = db.select().from(emailOutreach);

    if (filters?.status) {
      query = query.where(eq(emailOutreach.status, filters.status)) as typeof query;
    }

    const rows = await query;
    let results = rows.map(dbRowToRecord);

    // Apply additional filters in-memory for simplicity
    if (filters?.coachName) {
      results = results.filter((e) =>
        e.coachName.toLowerCase().includes(filters.coachName!.toLowerCase())
      );
    }
    if (filters?.sequenceId) {
      results = results.filter((e) => e.sequenceId === filters.sequenceId);
    }

    return results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  let results = [...inMemoryEmails];
  if (filters?.status) {
    results = results.filter((e) => e.status === filters.status);
  }
  if (filters?.coachName) {
    results = results.filter((e) =>
      e.coachName.toLowerCase().includes(filters.coachName!.toLowerCase())
    );
  }
  if (filters?.sequenceId) {
    results = results.filter((e) => e.sequenceId === filters.sequenceId);
  }

  return results.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ---------------------------------------------------------------------------
// markEmailOpened — Update status when open tracking detects an open
// ---------------------------------------------------------------------------

export async function markEmailOpened(emailId: string): Promise<boolean> {
  const now = new Date();

  if (isDbConfigured()) {
    await db
      .update(emailOutreach)
      .set({ status: "opened", openedAt: now })
      .where(eq(emailOutreach.id, emailId));
    return true;
  }

  const idx = inMemoryEmails.findIndex((e) => e.id === emailId);
  if (idx !== -1) {
    inMemoryEmails[idx] = {
      ...inMemoryEmails[idx],
      status: "opened",
      openedAt: now.toISOString(),
    };
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// markEmailResponded — Update status when a coach response is detected
// ---------------------------------------------------------------------------

export async function markEmailResponded(emailId: string): Promise<boolean> {
  const now = new Date();

  if (isDbConfigured()) {
    await db
      .update(emailOutreach)
      .set({ status: "responded", respondedAt: now })
      .where(eq(emailOutreach.id, emailId));
    return true;
  }

  const idx = inMemoryEmails.findIndex((e) => e.id === emailId);
  if (idx !== -1) {
    inMemoryEmails[idx] = {
      ...inMemoryEmails[idx],
      status: "responded",
      respondedAt: now.toISOString(),
    };
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function checkSequenceResponse(sequenceId: string): Promise<boolean> {
  if (isDbConfigured()) {
    const rows = await db
      .select()
      .from(emailOutreach)
      .where(
        and(
          eq(emailOutreach.sequenceId, sequenceId),
          eq(emailOutreach.status, "responded")
        )
      );
    return rows.length > 0;
  }

  return inMemoryEmails.some(
    (e) => e.sequenceId === sequenceId && e.status === "responded"
  );
}

async function queueNextSequenceStep(
  sequenceId: string,
  currentStep: number
): Promise<void> {
  const nextStep = currentStep + 1;

  if (isDbConfigured()) {
    // Find the next draft email in this sequence
    const rows = await db
      .select()
      .from(emailOutreach)
      .where(
        and(
          eq(emailOutreach.sequenceId, sequenceId),
          eq(emailOutreach.stepNumber, nextStep),
          eq(emailOutreach.status, "draft")
        )
      );

    if (rows.length > 0) {
      await db
        .update(emailOutreach)
        .set({ status: "queued" })
        .where(eq(emailOutreach.id, rows[0].id));
    }
  } else {
    const nextEmail = inMemoryEmails.find(
      (e) =>
        e.sequenceId === sequenceId &&
        e.stepNumber === nextStep &&
        e.status === "draft"
    );
    if (nextEmail) {
      nextEmail.status = "queued";
    }
  }
}

function buildEmailRecommendations(
  total: number,
  sent: number,
  responded: number,
  opened: number
): string[] {
  const recs: string[] = [];

  if (total === 0) {
    recs.push(
      "Start your email outreach by creating sequences for Tier 3 (D2) coaches — they respond to email at high rates."
    );
    recs.push(
      "NCAA rules allow prospects to email coaches at any age. Email is often preferred over X DMs by coaches."
    );
    return recs;
  }

  if (sent > 0 && responded === 0) {
    recs.push(
      "No responses yet. Ensure your emails include a specific question for the coach — this doubles response rates."
    );
    recs.push(
      "Follow up on sent emails with a brief 2-3 sentence reminder after 7-10 days."
    );
  }

  const responseRate = sent > 0 ? (responded / sent) * 100 : 0;
  if (responseRate >= 25) {
    recs.push(
      `${Math.round(responseRate)}% response rate — strong performance. Prioritize relationship-building with responding coaches.`
    );
  } else if (responseRate >= 10 && sent >= 5) {
    recs.push(
      `${Math.round(responseRate)}% response rate — above cold outreach average. Consider A/B testing subject lines.`
    );
  }

  if (sent >= 5 && opened > 0) {
    const openRate = Math.round((opened / sent) * 100);
    if (openRate < 40) {
      recs.push(
        "Open rate below 40% — test shorter, more specific subject lines that reference the coach's school."
      );
    }
  }

  recs.push(
    "Include your Hudl link in every email — coaches watch film before responding."
  );
  recs.push(
    "Send emails Tuesday-Thursday mornings for the highest coach engagement rates."
  );

  return recs;
}

// ---------------------------------------------------------------------------
// Exports for use in API routes and analytics
// ---------------------------------------------------------------------------

export { EMAIL_SEQUENCE_STEPS };
