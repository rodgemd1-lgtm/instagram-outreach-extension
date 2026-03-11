// DM Sequence Engine — Automated multi-step DM outreach for coach recruiting pipeline
// Handles creation, scheduling, processing, pausing, and response detection for sequences

import { db, isDbConfigured } from "@/lib/db";
import { dmSequences } from "@/lib/db/schema";
import { eq, and, lte } from "drizzle-orm";
import {
  coldDMLibrary,
  fillDMTemplate,
  type DMTier,
} from "@/lib/data/cold-dms";
import { generateDMDraft } from "@/lib/integrations/anthropic";
import { jacobProfile } from "@/lib/data/jacob-profile";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { sendDM, verifyHandle } from "@/lib/integrations/x-api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DMSequenceStep {
  stepNumber: 1 | 2 | 3 | 4;
  sequenceType: "initial" | "follow_up_1" | "follow_up_2" | "follow_up_3";
  dayOffset: number; // days from sequence creation to send this step
  templateType: string;
  description: string;
}

export interface DMSequenceRecord {
  id: string;
  coachId: string;
  coachName: string;
  school: string;
  currentStep: number;
  totalSteps: number;
  status: "active" | "paused" | "completed" | "response_received";
  nextSendAt: string | null;
  lastSentAt: string | null;
  responseDetected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSequenceOptions {
  coachId: string;
  coachName: string;
  school: string;
  tier: DMTier;
  context?: Record<string, string>; // template variable overrides
  xHandle?: string; // for DM sending
  xUserId?: string; // Twitter user ID for DM API
}

export interface ProcessResult {
  processed: number;
  sent: number;
  skipped: number;
  errors: string[];
  details: Array<{
    sequenceId: string;
    coachName: string;
    step: number;
    action: "sent" | "skipped" | "error";
    reason?: string;
  }>;
}

// ---------------------------------------------------------------------------
// In-memory fallback store
// ---------------------------------------------------------------------------

const inMemorySequences: DMSequenceRecord[] = [];

// Sequence step schedule — mirrors the 4-step DM cadence from cold-dms.ts
const SEQUENCE_STEPS: DMSequenceStep[] = [
  {
    stepNumber: 1,
    sequenceType: "initial",
    dayOffset: 0,
    templateType: "initial_outreach",
    description: "Initial outreach — introduce Jacob and share film",
  },
  {
    stepNumber: 2,
    sequenceType: "follow_up_1",
    dayOffset: 3,
    templateType: "follow_up_film_update",
    description: "Follow-up if no response — updated film or achievement mention",
  },
  {
    stepNumber: 3,
    sequenceType: "follow_up_2",
    dayOffset: 7,
    templateType: "follow_up_value_add",
    description: "Second follow-up — camp mention or season update as value-add",
  },
  {
    stepNumber: 4,
    sequenceType: "follow_up_3",
    dayOffset: 14,
    templateType: "final_touchpoint",
    description: "Final respectful touchpoint — low-pressure close",
  },
];

// ---------------------------------------------------------------------------
// Helper — pick the best template for a given step + tier
// ---------------------------------------------------------------------------

function selectTemplate(
  stepNumber: number,
  tier: DMTier
): { id: string; template: string; name: string } | null {
  const step = SEQUENCE_STEPS.find((s) => s.stepNumber === stepNumber);
  if (!step) return null;

  const pool = coldDMLibrary.filter(
    (dm) =>
      dm.sequence === step.sequenceType &&
      (dm.tier === tier || dm.tier === "all")
  );

  if (pool.length === 0) {
    // Widen search to all tiers as fallback
    const fallback = coldDMLibrary.find((dm) => dm.sequence === step.sequenceType);
    if (!fallback) return null;
    return { id: fallback.id, template: fallback.template, name: fallback.name };
  }

  // Pick the most specific match first (prefer tier-matched over "all")
  const exact = pool.find((dm) => dm.tier === tier);
  const chosen = exact ?? pool[0];
  return { id: chosen.id, template: chosen.template, name: chosen.name };
}

// ---------------------------------------------------------------------------
// Helper — build template variable map for a sequence
// ---------------------------------------------------------------------------

function buildTemplateVars(
  coachName: string,
  school: string,
  overrides: Record<string, string> = {}
): Record<string, string> {
  const lastName = coachName.split(" ").pop() ?? coachName;
  return {
    COACH_LAST_NAME: lastName,
    COACH_NAME: coachName,
    SCHOOL_NAME: school,
    NCSA_LINK: jacobProfile.ncsaProfileUrl || "https://ncsa.com/jacob-rodgers",
    ATHLETE_NAME: jacobProfile.name,
    POSITION: `${jacobProfile.position}`,
    HEIGHT: jacobProfile.height,
    WEIGHT: jacobProfile.weight,
    CLASS: String(jacobProfile.classYear),
    HIGH_SCHOOL: jacobProfile.school,
    STATE: jacobProfile.state,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// createSequence — Create a new 4-step DM sequence for a coach
// ---------------------------------------------------------------------------

export async function createSequence(
  coachId: string,
  templateType: string,
  context: {
    coachName: string;
    school: string;
    tier?: DMTier;
    xHandle?: string;
    xUserId?: string;
    templateVars?: Record<string, string>;
  }
): Promise<DMSequenceRecord> {
  const { coachName, school } = context;

  const now = new Date();
  const nextSendAt = new Date(now); // Step 1 fires immediately (day 0)

  if (isDbConfigured()) {
    const [row] = await db
      .insert(dmSequences)
      .values({
        coachId,
        coachName,
        school,
        currentStep: 1,
        totalSteps: 4,
        status: "active",
        nextSendAt,
        lastSentAt: null,
        responseDetected: false,
      })
      .returning();

    return dbRowToRecord(row);
  }

  // In-memory fallback
  const record: DMSequenceRecord = {
    id: `seq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    coachId,
    coachName,
    school,
    currentStep: 1,
    totalSteps: 4,
    status: "active",
    nextSendAt: nextSendAt.toISOString(),
    lastSentAt: null,
    responseDetected: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  inMemorySequences.push(record);
  return record;
}

// ---------------------------------------------------------------------------
// processSequences — Find all due sequences and fire their current step
// ---------------------------------------------------------------------------

export async function processSequences(): Promise<ProcessResult> {
  const result: ProcessResult = {
    processed: 0,
    sent: 0,
    skipped: 0,
    errors: [],
    details: [],
  };

  const now = new Date();
  let dueSequences: DMSequenceRecord[] = [];

  if (isDbConfigured()) {
    const rows = await db
      .select()
      .from(dmSequences)
      .where(
        and(
          eq(dmSequences.status, "active"),
          eq(dmSequences.responseDetected, false),
          lte(dmSequences.nextSendAt, now)
        )
      );
    dueSequences = rows.map(dbRowToRecord);
  } else {
    dueSequences = inMemorySequences.filter(
      (s) =>
        s.status === "active" &&
        !s.responseDetected &&
        s.nextSendAt !== null &&
        new Date(s.nextSendAt) <= now
    );
  }

  for (const seq of dueSequences) {
    result.processed++;

    try {
      // Detect response before sending — pause if coach replied
      const responded = await detectResponse(seq.coachId);
      if (responded) {
        await pauseSequence(seq.id, "response_received");
        result.skipped++;
        result.details.push({
          sequenceId: seq.id,
          coachName: seq.coachName,
          step: seq.currentStep,
          action: "skipped",
          reason: "response detected — sequence paused",
        });
        continue;
      }

      // Step 4 is the last step — after sending, mark completed
      if (seq.currentStep > 4) {
        await markSequenceCompleted(seq.id);
        result.skipped++;
        result.details.push({
          sequenceId: seq.id,
          coachName: seq.coachName,
          step: seq.currentStep,
          action: "skipped",
          reason: "sequence already completed all steps",
        });
        continue;
      }

      // Fetch coach data first — we need the tier for template selection
      let coachHandle: string | null = null;
      let coachName = seq.coachName;
      let schoolName = seq.school;
      let coachTier: DMTier = "Tier 2"; // fallback if lookup fails

      if (isSupabaseConfigured()) {
        const supabase = createAdminClient();
        const { data: coachRow } = await supabase
          .from("coaches")
          .select("name, school_name, x_handle, priority_tier")
          .eq("id", seq.coachId)
          .maybeSingle();

        coachHandle = coachRow?.x_handle ?? null;
        coachName = coachRow?.name ?? coachName;
        schoolName = coachRow?.school_name ?? schoolName;
        if (coachRow?.priority_tier) {
          coachTier = coachRow.priority_tier as DMTier;
        }
      }

      // Select the appropriate template using the coach's actual tier
      const templateData = selectTemplate(seq.currentStep, coachTier);
      if (!templateData) {
        result.errors.push(`No template found for step ${seq.currentStep} (${coachTier}) in sequence ${seq.id}`);
        result.details.push({
          sequenceId: seq.id,
          coachName: seq.coachName,
          step: seq.currentStep,
          action: "error",
          reason: `no template available for step ${seq.currentStep} at ${coachTier}`,
        });
        continue;
      }

      // Build and fill the template
      const vars = buildTemplateVars(coachName, schoolName);
      const baseMessage = fillDMTemplate(templateData.template, vars);

      // Use Anthropic to personalize and tighten the message
      const personalizedMessage = await generateDMDraft(
        coachName,
        schoolName,
        templateData.name,
        `This is step ${seq.currentStep} of 4 in Jacob's DM sequence. Base template:\n${baseMessage}\n\nPersonalize this for a ${seq.currentStep === 1 ? "cold initial outreach" : `follow-up (step ${seq.currentStep})`}. Keep under 280 characters if possible. Be genuine and direct. Do not be sycophantic.`
      );

      if (!coachHandle) {
        result.skipped++;
        result.details.push({
          sequenceId: seq.id,
          coachName,
          step: seq.currentStep,
          action: "skipped",
          reason: "coach has no X handle on file",
        });
        continue;
      }

      const targetUser = await verifyHandle(coachHandle.replace("@", ""));
      if (!targetUser) {
        result.skipped++;
        result.details.push({
          sequenceId: seq.id,
          coachName,
          step: seq.currentStep,
          action: "skipped",
          reason: "coach X handle could not be resolved",
        });
        continue;
      }

      const sent = await sendDM(targetUser.id, personalizedMessage);
      if (!sent) {
        throw new Error("X DM delivery failed");
      }

      if (isSupabaseConfigured()) {
        const supabase = createAdminClient();
        await supabase.from("dm_messages").insert({
          coach_id: seq.coachId,
          coach_name: coachName,
          school_name: schoolName,
          template_type: templateData.id,
          content: personalizedMessage,
          status: "sent",
          sent_at: now.toISOString(),
          created_at: now.toISOString(),
        });
        await supabase
          .from("coaches")
          .update({
            dm_status: "sent",
            last_engaged: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("id", seq.coachId);
      }

      // Advance to next step and schedule it
      const nextStep = seq.currentStep + 1;
      const nextStepDef = SEQUENCE_STEPS.find((s) => s.stepNumber === nextStep);
      const dayOffsetDiff = nextStepDef
        ? nextStepDef.dayOffset - (SEQUENCE_STEPS.find((s) => s.stepNumber === seq.currentStep)?.dayOffset ?? 0)
        : 0;

      const nextSendAt =
        nextStep <= 4
          ? new Date(now.getTime() + dayOffsetDiff * 24 * 60 * 60 * 1000)
          : null;

      const newStatus = nextStep > 4 ? "completed" : "active";

      if (isDbConfigured()) {
        await db
          .update(dmSequences)
          .set({
            currentStep: nextStep,
            status: newStatus,
            lastSentAt: now,
            nextSendAt: nextSendAt,
            updatedAt: now,
          })
          .where(eq(dmSequences.id, seq.id));
      } else {
        const idx = inMemorySequences.findIndex((s) => s.id === seq.id);
        if (idx !== -1) {
          inMemorySequences[idx] = {
            ...inMemorySequences[idx],
            currentStep: nextStep,
            status: newStatus as DMSequenceRecord["status"],
            lastSentAt: now.toISOString(),
            nextSendAt: nextSendAt?.toISOString() ?? null,
            updatedAt: now.toISOString(),
          };
        }
      }

      result.sent++;
      result.details.push({
        sequenceId: seq.id,
        coachName: seq.coachName,
        step: seq.currentStep,
        action: "sent",
      });

      console.info(
        `[DM Sequence] Sent step ${seq.currentStep} to ${seq.coachName} (${seq.school}): "${personalizedMessage.slice(0, 60)}..."`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Sequence ${seq.id} (${seq.coachName}): ${msg}`);
      result.details.push({
        sequenceId: seq.id,
        coachName: seq.coachName,
        step: seq.currentStep,
        action: "error",
        reason: msg,
      });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// pauseSequence — Pause a sequence (e.g., coach responded, manual pause)
// ---------------------------------------------------------------------------

export async function pauseSequence(
  sequenceId: string,
  reason: "manual" | "response_received" = "manual"
): Promise<boolean> {
  const newStatus = reason === "response_received" ? "response_received" : "paused";

  if (isDbConfigured()) {
    await db
      .update(dmSequences)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(dmSequences.id, sequenceId));
    return true;
  }

  const idx = inMemorySequences.findIndex((s) => s.id === sequenceId);
  if (idx !== -1) {
    inMemorySequences[idx] = {
      ...inMemorySequences[idx],
      status: newStatus as DMSequenceRecord["status"],
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// resumeSequence — Resume a paused sequence
// ---------------------------------------------------------------------------

export async function resumeSequence(sequenceId: string): Promise<boolean> {
  if (isDbConfigured()) {
    await db
      .update(dmSequences)
      .set({
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(dmSequences.id, sequenceId));
    return true;
  }

  const idx = inMemorySequences.findIndex((s) => s.id === sequenceId);
  if (idx !== -1) {
    inMemorySequences[idx] = {
      ...inMemorySequences[idx],
      status: "active",
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// detectResponse — Check if a coach has replied to Jacob's DMs
// Pauses the active sequence for that coach if a response is detected.
// In production this would poll the X DM inbox or webhook.
// ---------------------------------------------------------------------------

export async function detectResponse(coachId: string): Promise<boolean> {
  // Production path: check the X API DM conversation with this coach's userId.
  // The X API v2 DM conversation endpoint requires user-context OAuth 2.0.
  // For now we check the db flag that the coach inbox monitoring agent sets.

  if (isDbConfigured()) {
    const rows = await db
      .select()
      .from(dmSequences)
      .where(
        and(
          eq(dmSequences.coachId, coachId),
          eq(dmSequences.responseDetected, true)
        )
      )
      .limit(1);
    return rows.length > 0;
  }

  const seq = inMemorySequences.find(
    (s) => s.coachId === coachId && s.responseDetected
  );
  return !!seq;
}

// ---------------------------------------------------------------------------
// markResponseDetected — Called externally when inbox monitoring detects reply
// ---------------------------------------------------------------------------

export async function markResponseDetected(coachId: string): Promise<void> {
  if (isDbConfigured()) {
    await db
      .update(dmSequences)
      .set({
        responseDetected: true,
        status: "response_received",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(dmSequences.coachId, coachId),
          eq(dmSequences.status, "active")
        )
      );
    return;
  }

  inMemorySequences
    .filter((s) => s.coachId === coachId && s.status === "active")
    .forEach((s) => {
      s.responseDetected = true;
      s.status = "response_received";
      s.updatedAt = new Date().toISOString();
    });
}

// ---------------------------------------------------------------------------
// listSequences — Get all sequences with optional status filter
// ---------------------------------------------------------------------------

export async function listSequences(
  statusFilter?: DMSequenceRecord["status"]
): Promise<DMSequenceRecord[]> {
  if (isDbConfigured()) {
    const rows = statusFilter
      ? await db
          .select()
          .from(dmSequences)
          .where(eq(dmSequences.status, statusFilter))
      : await db.select().from(dmSequences);
    return rows.map(dbRowToRecord);
  }

  return statusFilter
    ? inMemorySequences.filter((s) => s.status === statusFilter)
    : [...inMemorySequences];
}

// ---------------------------------------------------------------------------
// getSequenceById
// ---------------------------------------------------------------------------

export async function getSequenceById(
  sequenceId: string
): Promise<DMSequenceRecord | null> {
  if (isDbConfigured()) {
    const rows = await db
      .select()
      .from(dmSequences)
      .where(eq(dmSequences.id, sequenceId))
      .limit(1);
    return rows.length > 0 ? dbRowToRecord(rows[0]) : null;
  }

  return inMemorySequences.find((s) => s.id === sequenceId) ?? null;
}

// ---------------------------------------------------------------------------
// Helper — mark completed
// ---------------------------------------------------------------------------

async function markSequenceCompleted(sequenceId: string): Promise<void> {
  if (isDbConfigured()) {
    await db
      .update(dmSequences)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(dmSequences.id, sequenceId));
    return;
  }
  const idx = inMemorySequences.findIndex((s) => s.id === sequenceId);
  if (idx !== -1) {
    inMemorySequences[idx].status = "completed";
    inMemorySequences[idx].updatedAt = new Date().toISOString();
  }
}

// ---------------------------------------------------------------------------
// Helper — map DB row to record type
// ---------------------------------------------------------------------------

function dbRowToRecord(row: typeof dmSequences.$inferSelect): DMSequenceRecord {
  return {
    id: row.id,
    coachId: row.coachId,
    coachName: row.coachName,
    school: row.school,
    currentStep: row.currentStep ?? 1,
    totalSteps: row.totalSteps ?? 4,
    status: (row.status ?? "active") as DMSequenceRecord["status"],
    nextSendAt: row.nextSendAt?.toISOString() ?? null,
    lastSentAt: row.lastSentAt?.toISOString() ?? null,
    responseDetected: row.responseDetected ?? false,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Export SEQUENCE_STEPS for use in analytics
// ---------------------------------------------------------------------------

export { SEQUENCE_STEPS };
