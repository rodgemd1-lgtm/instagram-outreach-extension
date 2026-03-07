import { BaseAgent } from "../base-agent";
import { AgentId, SkillDefinition } from "../types";
import { TIMING_OPTIMIZER_PROMPT } from "./prompts";
import { timingOptimizerSkills } from "./skills";
import { db, isDbConfigured } from "@/lib/db";
import { posts, coachBehaviorProfiles, postingWindows } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export class TimingOptimizerAgent extends BaseAgent {
  readonly agentId: AgentId = "timing-optimizer";
  readonly name = "Timing Optimizer";
  readonly systemPrompt = TIMING_OPTIMIZER_PROMPT;
  readonly skills: SkillDefinition[] = timingOptimizerSkills;

  async gatherContext(): Promise<Record<string, unknown>> {
    if (!isDbConfigured()) {
      return {
        message: "Database not configured. Running with limited context.",
        season: this.getCurrentSeason(),
      };
    }

    const recentPosts = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(50);
    const behaviorProfiles = await db.select().from(coachBehaviorProfiles).limit(20);
    const currentWindows = await db.select().from(postingWindows).orderBy(desc(postingWindows.score)).limit(10);

    return {
      currentDate: new Date().toISOString(),
      season: this.getCurrentSeason(),
      recentPostCount: recentPosts.length,
      postsWithEngagement: recentPosts.filter((p) => (p.engagementRate ?? 0) > 0).length,
      avgEngagement: recentPosts.length > 0
        ? recentPosts.reduce((s, p) => s + (p.engagementRate ?? 0), 0) / recentPosts.length
        : 0,
      coachProfileCount: behaviorProfiles.length,
      currentTopWindows: currentWindows.map((w) => ({
        day: w.dayOfWeek,
        hour: w.hourStart,
        score: w.score,
      })),
    };
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 7 && month <= 10) return "in_season";
    if (month >= 5 && month <= 6) return "camp";
    if (month >= 3 && month <= 4) return "evaluation";
    if (month === 11 || month <= 1) return "signing";
    return "offseason";
  }
}
