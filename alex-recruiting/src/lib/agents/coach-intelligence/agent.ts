import { BaseAgent } from "../base-agent";
import { AgentId, SkillDefinition } from "../types";
import { COACH_INTELLIGENCE_PROMPT } from "./prompts";
import { coachIntelligenceSkills } from "./skills";
import { db, isDbConfigured } from "@/lib/db";
import { coaches, coachBehaviorProfiles, competitorRecruits, posts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export class CoachIntelligenceAgent extends BaseAgent {
  readonly agentId: AgentId = "coach-intelligence";
  readonly name = "Coach Intelligence";
  readonly systemPrompt = COACH_INTELLIGENCE_PROMPT;
  readonly skills: SkillDefinition[] = coachIntelligenceSkills;

  async gatherContext(): Promise<Record<string, unknown>> {
    if (!isDbConfigured()) {
      return {
        message: "Database not configured. Running with limited context.",
        coachCount: 0,
        behaviorProfiles: [],
        competitors: [],
      };
    }

    const allCoaches = await db.select().from(coaches);
    const profiles = await db.select().from(coachBehaviorProfiles).orderBy(desc(coachBehaviorProfiles.lastUpdated)).limit(20);
    const competitors = await db.select().from(competitorRecruits).limit(10);
    const recentPosts = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(5);

    return {
      currentDate: new Date().toISOString(),
      jacobHandle: "@JacobRodge52987",
      coachCount: allCoaches.length,
      coachesWithHandles: allCoaches.filter((c) => c.xHandle).length,
      coachSummary: allCoaches.slice(0, 20).map((c) => ({
        name: c.name,
        school: c.schoolName,
        division: c.division,
        handle: c.xHandle,
        followStatus: c.followStatus,
        dmStatus: c.dmStatus,
        tier: c.priorityTier,
      })),
      recentBehaviorProfiles: profiles.slice(0, 10).map((p) => ({
        coach: p.coachName,
        school: p.schoolName,
        style: p.engagementStyle,
        dmProb: p.dmOpenProbability,
        lastUpdated: p.lastUpdated,
      })),
      competitors: competitors.map((c) => ({
        name: c.name,
        handle: c.xHandle,
        position: c.position,
        classYear: c.classYear,
      })),
      recentPostCount: recentPosts.length,
    };
  }
}
