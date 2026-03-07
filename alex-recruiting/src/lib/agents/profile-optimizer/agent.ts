import { BaseAgent } from "../base-agent";
import { AgentId, SkillDefinition } from "../types";
import { PROFILE_OPTIMIZER_PROMPT } from "./prompts";
import { profileOptimizerSkills } from "./skills";
import { db, isDbConfigured } from "@/lib/db";
import { profileAudits, posts, coaches, competitorRecruits } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { verifyHandle } from "@/lib/integrations/x-api";

export class ProfileOptimizerAgent extends BaseAgent {
  readonly agentId: AgentId = "profile-optimizer";
  readonly name = "Profile Optimizer";
  readonly systemPrompt = PROFILE_OPTIMIZER_PROMPT;
  readonly skills: SkillDefinition[] = profileOptimizerSkills;

  async gatherContext(): Promise<Record<string, unknown>> {
    const jacobUser = await verifyHandle("JacobRodge52987");

    if (!isDbConfigured()) {
      return {
        message: "Database not configured. Running with limited context.",
        jacobProfile: jacobUser ? {
          name: jacobUser.name,
          bio: jacobUser.description,
          followers: jacobUser.public_metrics?.followers_count,
          tweets: jacobUser.public_metrics?.tweet_count,
        } : null,
      };
    }

    const audits = await db.select().from(profileAudits).orderBy(desc(profileAudits.date)).limit(3);
    const recentPosts = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(10);
    const coachList = await db.select().from(coaches);
    const competitors = await db.select().from(competitorRecruits).limit(5);

    return {
      currentDate: new Date().toISOString(),
      currentMonth: new Date().getMonth(),
      jacobProfile: jacobUser ? {
        name: jacobUser.name,
        bio: jacobUser.description,
        followers: jacobUser.public_metrics?.followers_count,
        tweets: jacobUser.public_metrics?.tweet_count,
        hasPhoto: !!jacobUser.profile_image_url,
      } : null,
      recentAudits: audits.map((a) => ({
        date: a.date,
        score: a.totalScore,
        recommendations: a.recommendations,
      })),
      recentPostCount: recentPosts.length,
      coachFollowBacks: coachList.filter((c) => c.followStatus === "followed_back").length,
      totalCoaches: coachList.length,
      competitors: competitors.map((c) => ({
        name: c.name,
        followers: c.followerCount,
        engagementRate: c.engagementRate,
      })),
    };
  }
}
