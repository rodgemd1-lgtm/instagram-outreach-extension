import { BaseAgent } from "../base-agent";
import { AgentId, SkillDefinition } from "../types";
import { PLACEMENT_ANALYST_PROMPT } from "./prompts";
import { placementAnalystSkills } from "./skills";
import { db, isDbConfigured } from "@/lib/db";
import { schools, coaches, schoolFitScores, offerEvents, competitorRecruits } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export class PlacementAnalystAgent extends BaseAgent {
  readonly agentId: AgentId = "placement-analyst";
  readonly name = "Placement Analyst";
  readonly systemPrompt = PLACEMENT_ANALYST_PROMPT;
  readonly skills: SkillDefinition[] = placementAnalystSkills;

  async gatherContext(): Promise<Record<string, unknown>> {
    if (!isDbConfigured()) {
      return {
        message: "Database not configured. Running with limited context.",
        schoolCount: 0,
      };
    }

    const allSchools = await db.select().from(schools);
    const allCoaches = await db.select().from(coaches);
    const fitScores = await db.select().from(schoolFitScores).orderBy(desc(schoolFitScores.fitScore)).limit(10);
    const offers = await db.select().from(offerEvents).limit(20);
    const competitors = await db.select().from(competitorRecruits).limit(10);

    const schoolSummary = allSchools.map((s) => ({
      name: s.name,
      division: s.division,
      conference: s.conference,
      tier: s.priorityTier,
      olNeed: s.olNeedScore,
    }));

    const engagedSchools = allSchools.filter((s) => {
      const schoolCoaches = allCoaches.filter((c) => c.schoolId === s.id);
      return schoolCoaches.some((c) => c.followStatus === "followed_back" || c.dmStatus === "responded");
    }).map((s) => s.name);

    return {
      currentDate: new Date().toISOString(),
      totalSchools: allSchools.length,
      schoolsByTier: {
        tier1: allSchools.filter((s) => s.priorityTier === "Tier 1").length,
        tier2: allSchools.filter((s) => s.priorityTier === "Tier 2").length,
        tier3: allSchools.filter((s) => s.priorityTier === "Tier 3").length,
      },
      schoolSummary: schoolSummary.slice(0, 15),
      engagedSchools,
      currentFitScores: fitScores.map((f) => ({
        school: f.schoolName,
        score: f.fitScore,
        offerLikelihood: f.offerLikelihood,
      })),
      recentOfferEvents: offers.length,
      competitorCount: competitors.length,
    };
  }
}
