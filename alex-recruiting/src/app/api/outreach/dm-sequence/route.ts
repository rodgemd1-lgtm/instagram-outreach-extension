import { NextResponse } from "next/server";
import { targetSchools } from "@/lib/data/target-schools";
import {
  getInitialDMs,
  getFollowUpSequence,
  fillDMTemplate,
} from "@/lib/data/cold-dms";
import { ncaaRules } from "@/lib/rec/knowledge/ncaa-rules";
import { isDbConfigured, db } from "@/lib/db";
import { dmSequences, dmMessages } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DMSequenceEntry {
  schoolId: string;
  schoolName: string;
  coachName: string;
  tier: string;
  division: string;
  conference: string;
  steps: DMStepMessage[];
  ncaaNote: string;
}

interface DMStepMessage {
  step: number;
  type: "introduction" | "value_add" | "follow_up";
  templateId: string;
  templateName: string;
  content: string;
  sendAfterDays: number;
  status: "drafted" | "pending";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NCSA_LINK = "https://www.ncsasports.org/mens-football/jacob-rodgers";

function getVarsForSchool(
  school: (typeof targetSchools)[0],
  coachLastName: string
): Record<string, string> {
  return {
    COACH_LAST_NAME: coachLastName,
    SCHOOL_NAME: school.name,
    NCSA_LINK,
    CAMP_NAME: "Elite Prospects Camp",
    SPECIFIC_DETAIL: `the way ${school.name} develops offensive linemen`,
    ACHIEVEMENT: "earned All-Conference honors and set a new bench press PR",
    SEASON_RECORD: "undefeated through 4 games",
    POSITION: "left tackle",
    GROWTH_UPDATE:
      "added 10 lbs of muscle while improving my 40-yard dash time",
    UPDATED_STATS: '6\'4", 285 with improved footwork and pass protection',
    SKILL_AREA: "hand placement and footwork in pass protection",
    CONTEXT: "our first three games this season",
    MASCOT: school.name.split(" ").pop() ?? "",
  };
}

function buildSequenceForSchool(
  school: (typeof targetSchools)[0]
): DMSequenceEntry {
  const coachName = `OL Coach - ${school.name}`;
  const coachLastName = "Coach";
  const tier = school.priorityTier as "Tier 1" | "Tier 2" | "Tier 3";
  const vars = getVarsForSchool(school, coachLastName);

  const steps: DMStepMessage[] = [];

  // Step 1: Introduction DM (from cold DM library matching tier)
  const initialDMs = getInitialDMs(tier);
  const selectedInitial = initialDMs[0];
  if (selectedInitial) {
    steps.push({
      step: 1,
      type: "introduction",
      templateId: selectedInitial.id,
      templateName: selectedInitial.name,
      content: fillDMTemplate(selectedInitial.template, vars),
      sendAfterDays: tier === "Tier 3" ? 0 : tier === "Tier 2" ? 14 : 30,
      status: "drafted",
    });
  }

  // Step 2: Value-add DM (Hudl link, stats, camp performance)
  const followUps = getFollowUpSequence();
  const followUp1 = followUps.find((dm) => dm.sequence === "follow_up_1");
  if (followUp1) {
    steps.push({
      step: 2,
      type: "value_add",
      templateId: followUp1.id,
      templateName: followUp1.name,
      content: fillDMTemplate(followUp1.template, vars),
      sendAfterDays: followUp1.daysSinceLast,
      status: "pending",
    });
  }

  // Step 3: Follow-up DM (reference specific program element)
  const followUp2 = followUps.find((dm) => dm.sequence === "follow_up_2");
  if (followUp2) {
    steps.push({
      step: 3,
      type: "follow_up",
      templateId: followUp2.id,
      templateName: followUp2.name,
      content: fillDMTemplate(followUp2.template, vars),
      sendAfterDays: followUp2.daysSinceLast,
      status: "pending",
    });
  }

  // NCAA timeline note
  const freshmanPhase = ncaaRules.classOf2029Timeline.find((t) =>
    t.year.includes("Freshman")
  );
  let ncaaNote = "";
  if (tier === "Tier 1") {
    ncaaNote =
      "FBS: Athlete-initiated DMs are allowed now, but meaningful coach replies typically open June 15 after sophomore year. Lead with camps, film updates, and profile-building.";
  } else if (tier === "Tier 2" && school.division === "D1 FCS") {
    ncaaNote =
      "FCS: Similar rules to FBS. Coach-initiated communication opens June 15 after sophomore year. D2 coaches may engage earlier.";
  } else if (tier === "Tier 3") {
    ncaaNote =
      "D2: Coaches can contact prospects after June 15 following sophomore year, but D2 coaches often engage informally earlier via social media. DM responses are common.";
  } else {
    ncaaNote =
      freshmanPhase?.actions[6] ??
      "Athlete-initiated DMs are allowed. Monitor for coach responses.";
  }

  return {
    schoolId: school.id,
    schoolName: school.name,
    coachName,
    tier: school.priorityTier,
    division: school.division,
    conference: school.conference,
    steps,
    ncaaNote,
  };
}

// ---------------------------------------------------------------------------
// POST /api/outreach/dm-sequence
// Generates a 3-touch DM sequence for every target school coach.
// ---------------------------------------------------------------------------

export async function POST() {
  const sequences: DMSequenceEntry[] = [];
  const allMessages: DMStepMessage[] = [];

  for (const school of targetSchools) {
    const sequence = buildSequenceForSchool(school);
    sequences.push(sequence);
    allMessages.push(...sequence.steps);

    // Try to store in DB
    if (isDbConfigured()) {
      try {
        // Insert DM sequence record
        await db
          .insert(dmSequences)
          .values({
            coachId: school.id,
            coachName: sequence.coachName,
            school: school.name,
            currentStep: 1,
            totalSteps: sequence.steps.length,
            status: "active",
            nextSendAt: new Date(
              Date.now() + (sequence.steps[0]?.sendAfterDays ?? 0) * 86400000
            ),
          });

        // Insert individual DM messages
        for (const step of sequence.steps) {
          await db.insert(dmMessages).values({
            coachName: sequence.coachName,
            schoolName: school.name,
            templateType: step.type,
            content: step.content,
            status: step.status === "drafted" ? "drafted" : "drafted",
          });
        }
      } catch (error) {
        console.error(
          `[POST /api/outreach/dm-sequence] DB error for ${school.name}:`,
          error
        );
      }
    }
  }

  // NCAA compliance summary
  const ncaaSummary = {
    currentPhase: "Freshman (2025-26) - Foundation Building",
    dmRules: ncaaRules.dmRules,
    keyDate: "June 15, 2027 - FBS coach-initiated communication opens",
    recommendation:
      "Focus athlete-initiated DMs on Tier 3 (D2) and Tier 2 (FCS/MAC) programs first. Tier 1 (FBS) programs should receive DMs with the understanding that meaningful replies may not come until after June 15, 2027.",
  };

  return NextResponse.json({
    success: true,
    sequences: sequences.length,
    totalMessages: allMessages.length,
    messages: allMessages,
    sequenceDetails: sequences,
    ncaaCompliance: ncaaSummary,
    generatedAt: new Date().toISOString(),
  });
}
