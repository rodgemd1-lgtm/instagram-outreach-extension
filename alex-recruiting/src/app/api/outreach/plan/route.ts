import { NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import { coaches } from "@/lib/db/schema";
import { targetSchools } from "@/lib/data/target-schools";
import { ncaaRules } from "@/lib/rec/knowledge/ncaa-rules";
import { eq } from "drizzle-orm";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OutreachStage =
  | "research"
  | "follow"
  | "engage"
  | "dm"
  | "response"
  | "relationship";

interface OutreachCoach {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
  division: string;
  conference: string;
  priorityTier: string;
  xHandle: string;
  stage: OutreachStage;
  nextAction: string;
  nextActionDate: string;
  priorityScore: number;
  lastActionDate: string | null;
  dmTimeline: string;
}

interface OutreachPlan {
  stages: Record<OutreachStage, OutreachCoach[]>;
  stats: {
    total: number;
    dmsDrafted: number;
    dmsSent: number;
    responses: number;
    followRate: string;
  };
  ncaaNote: string;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStageForTier(tier: string): OutreachStage {
  switch (tier) {
    case "Tier 1":
      return "research";
    case "Tier 2":
      return "follow";
    case "Tier 3":
      return "dm";
    default:
      return "research";
  }
}

function getNextAction(stage: OutreachStage, tier: string): string {
  switch (stage) {
    case "research":
      return "Research coaching staff and follow official account";
    case "follow":
      return tier === "Tier 2"
        ? "Follow OL coach and engage with 3-5 posts"
        : "Follow the program account and coaching staff";
    case "engage":
      return "Like and reply to 3 coach posts before sending DM";
    case "dm":
      return "Send personalized introduction DM with film link";
    case "response":
      return "Reply within 12 hours and schedule follow-up";
    case "relationship":
      return "Send monthly film update and engage with program content";
    default:
      return "Research the program";
  }
}

function getPriorityScore(tier: string, division: string): number {
  let score = 50;
  if (tier === "Tier 3") score += 30;
  else if (tier === "Tier 2") score += 20;
  else if (tier === "Tier 1") score += 10;

  if (division === "D2") score += 15;
  else if (division === "D1 FCS") score += 10;
  else if (division === "D1 FBS") score += 5;

  return score;
}

function getNextActionDate(stage: OutreachStage, tier: string): string {
  const now = new Date();
  let daysFromNow = 0;

  switch (tier) {
    case "Tier 3":
      daysFromNow = stage === "dm" ? 1 : 0;
      break;
    case "Tier 2":
      daysFromNow = stage === "follow" ? 3 : stage === "engage" ? 14 : 30;
      break;
    case "Tier 1":
      daysFromNow =
        stage === "research" ? 7 : stage === "follow" ? 14 : 30;
      break;
  }

  const target = new Date(now.getTime() + daysFromNow * 86400000);
  return target.toISOString().split("T")[0];
}

function mapFollowStatusToStage(
  followStatus: string | null,
  dmStatus: string | null
): OutreachStage {
  if (dmStatus === "responded") return "response";
  if (dmStatus === "sent" || dmStatus === "approved") return "response";
  if (dmStatus === "drafted") return "dm";
  if (followStatus === "followed_back") return "engage";
  if (followStatus === "followed") return "follow";
  return "research";
}

function emptyPlan(): OutreachPlan {
  return {
    stages: {
      research: [],
      follow: [],
      engage: [],
      dm: [],
      response: [],
      relationship: [],
    },
    stats: {
      total: 0,
      dmsDrafted: 0,
      dmsSent: 0,
      responses: 0,
      followRate: "0%",
    },
    ncaaNote:
      "Class of 2029: Athlete-initiated DMs are allowed now. FBS coach-initiated communication opens June 15, 2027. D2 coaches may engage earlier.",
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// GET /api/outreach/plan
// Returns the current outreach plan by querying coaches grouped by stage.
// ---------------------------------------------------------------------------

export async function GET() {
  if (isDbConfigured()) {
    try {
      const allCoaches = await db.select().from(coaches);

      // If Drizzle returns 0 coaches, the real data may be in Supabase — fall through
      if (allCoaches.length > 0) {
        const plan = emptyPlan();
        let dmsDrafted = 0;
        let dmsSent = 0;
        let responses = 0;
        let followed = 0;

        for (const c of allCoaches) {
          const stage = mapFollowStatusToStage(c.followStatus, c.dmStatus);

          if (c.dmStatus === "drafted") dmsDrafted++;
          if (c.dmStatus === "sent") dmsSent++;
          if (c.dmStatus === "responded") responses++;
          if (
            c.followStatus === "followed" ||
            c.followStatus === "followed_back"
          )
            followed++;

          const school = targetSchools.find((s) => s.id === c.schoolId);

          const outreachCoach: OutreachCoach = {
            id: c.id,
            name: c.name ?? "",
            schoolId: c.schoolId ?? "",
            schoolName: c.schoolName,
            division: c.division,
            conference: c.conference ?? "",
            priorityTier: c.priorityTier,
            xHandle: c.xHandle ?? "",
            stage,
            nextAction: getNextAction(stage, c.priorityTier),
            nextActionDate: getNextActionDate(stage, c.priorityTier),
            priorityScore: getPriorityScore(c.priorityTier, c.division),
            lastActionDate: c.lastEngaged
              ? new Date(c.lastEngaged).toISOString().split("T")[0]
              : null,
            dmTimeline: school?.dmTimeline ?? "",
          };

          plan.stages[stage].push(outreachCoach);
        }

        plan.stats = {
          total: allCoaches.length,
          dmsDrafted,
          dmsSent,
          responses,
          followRate:
            allCoaches.length > 0
              ? `${Math.round((followed / allCoaches.length) * 100)}%`
              : "0%",
        };

        return NextResponse.json(plan);
      }
      // allCoaches.length === 0: fall through to Supabase to find coaches there
    } catch (error) {
      console.error("[GET /api/outreach/plan] Drizzle error:", error);
      // Fall through to Supabase fallback
    }
  }

  // ── Supabase fallback (if Drizzle fails but Supabase is configured) ──
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from("coaches").select("*");

      if (!error && data && data.length > 0) {
        const plan = emptyPlan();
        let dmsDrafted = 0;
        let dmsSent = 0;
        let responses = 0;
        let followed = 0;

        for (const c of data) {
          const followStatus = c.follow_status ?? "not_followed";
          const dmStatus = c.dm_status ?? "not_sent";
          const priorityTier = c.priority_tier ?? "Tier 1";
          const division = c.division ?? "";
          const stage = mapFollowStatusToStage(followStatus, dmStatus);

          if (dmStatus === "drafted") dmsDrafted++;
          if (dmStatus === "sent") dmsSent++;
          if (dmStatus === "responded") responses++;
          if (followStatus === "followed" || followStatus === "followed_back") followed++;

          const school = targetSchools.find((s) => s.id === c.school_id);

          const outreachCoach: OutreachCoach = {
            id: c.id,
            name: c.name ?? "",
            schoolId: c.school_id ?? "",
            schoolName: c.school_name ?? "",
            division,
            conference: c.conference ?? "",
            priorityTier,
            xHandle: c.x_handle ?? "",
            stage,
            nextAction: getNextAction(stage, priorityTier),
            nextActionDate: getNextActionDate(stage, priorityTier),
            priorityScore: getPriorityScore(priorityTier, division),
            lastActionDate: c.last_engaged
              ? new Date(c.last_engaged).toISOString().split("T")[0]
              : null,
            dmTimeline: school?.dmTimeline ?? "",
          };

          plan.stages[stage].push(outreachCoach);
        }

        plan.stats = {
          total: data.length,
          dmsDrafted,
          dmsSent,
          responses,
          followRate:
            data.length > 0
              ? `${Math.round((followed / data.length) * 100)}%`
              : "0%",
        };

        return NextResponse.json(plan);
      }
    } catch (supaError) {
      console.error("[GET /api/outreach/plan] Supabase fallback error:", supaError);
    }
  }

  // Return structured empty data when no DB
  return NextResponse.json(emptyPlan());
}

// ---------------------------------------------------------------------------
// POST /api/outreach/plan
// Generates a full outreach plan for all 17 target schools.
// ---------------------------------------------------------------------------

export async function POST() {
  const now = new Date().toISOString();
  const generatedCoaches: OutreachCoach[] = [];

  const ncaaNote =
    ncaaRules.classOf2029Timeline.find((t) =>
      t.year.includes("Freshman")
    )?.actions[6] ??
    "Athlete-initiated DMs are allowed. FBS coach-initiated communication opens June 15 after sophomore year.";

  for (const school of targetSchools) {
    const stage = getStageForTier(school.priorityTier);
    const priorityScore = getPriorityScore(
      school.priorityTier,
      school.division
    );

    const coachEntry: OutreachCoach = {
      id: school.id,
      name: `OL Coach - ${school.name}`,
      schoolId: school.id,
      schoolName: school.name,
      division: school.division,
      conference: school.conference,
      priorityTier: school.priorityTier,
      xHandle: school.officialXHandle,
      stage,
      nextAction: getNextAction(stage, school.priorityTier),
      nextActionDate: getNextActionDate(stage, school.priorityTier),
      priorityScore,
      lastActionDate: null,
      dmTimeline: school.dmTimeline,
    };

    generatedCoaches.push(coachEntry);

    // Attempt to store in DB
    if (isDbConfigured()) {
      try {
        const existing = await db
          .select()
          .from(coaches)
          .where(eq(coaches.schoolId, school.id));

        if (existing.length === 0) {
          await db.insert(coaches).values({
            name: coachEntry.name,
            title: "Offensive Line Coach",
            schoolId: school.id,
            schoolName: school.name,
            division: school.division,
            conference: school.conference,
            xHandle: school.officialXHandle,
            dmOpen: school.priorityTier === "Tier 3",
            followStatus: stage === "follow" ? "not_followed" : "not_followed",
            dmStatus: "not_sent",
            priorityTier: school.priorityTier,
            olNeedScore: 3,
            xActivityScore: 3,
            notes: school.whyJacob,
          });
        }
      } catch (error) {
        console.error(
          `[POST /api/outreach/plan] DB insert error for ${school.name}:`,
          error
        );
      }
    }
  }

  // Build plan from generated coaches
  const plan: OutreachPlan = {
    stages: {
      research: generatedCoaches.filter((c) => c.stage === "research"),
      follow: generatedCoaches.filter((c) => c.stage === "follow"),
      engage: generatedCoaches.filter((c) => c.stage === "engage"),
      dm: generatedCoaches.filter((c) => c.stage === "dm"),
      response: [],
      relationship: [],
    },
    stats: {
      total: generatedCoaches.length,
      dmsDrafted: 0,
      dmsSent: 0,
      responses: 0,
      followRate: "0%",
    },
    ncaaNote,
    generatedAt: now,
  };

  return NextResponse.json({
    success: true,
    coaches: generatedCoaches.length,
    plan,
  });
}
