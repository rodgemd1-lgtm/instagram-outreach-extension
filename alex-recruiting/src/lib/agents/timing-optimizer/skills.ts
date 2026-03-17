import { SkillDefinition, SkillContext, SkillResult } from "../types";
import { db, isDbConfigured } from "@/lib/db";
import { posts, coachBehaviorProfiles, postingWindows } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 7 && month <= 10) return "in_season";
  if (month >= 5 && month <= 6) return "camp";
  if (month >= 3 && month <= 4) return "evaluation";
  if (month === 11 || month <= 1) return "signing";
  return "offseason";
}

export const timingOptimizerSkills: SkillDefinition[] = [
  {
    id: "analyze_engagement_windows",
    name: "Analyze Engagement Windows",
    description: "Compute engagement rate by hour/day across historical posts",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { message: "DB not configured" } };
      }

      const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(100);

      // Group engagement by day of week and hour
      const windowScores: Record<string, { totalEngagement: number; count: number }> = {};

      for (const post of allPosts) {
        if (!post.scheduledFor && !post.createdAt) continue;
        const date = new Date(post.scheduledFor || post.createdAt!);
        const day = date.getDay();
        const hour = date.getHours();
        const key = `${day}-${hour}`;

        if (!windowScores[key]) windowScores[key] = { totalEngagement: 0, count: 0 };
        windowScores[key].totalEngagement += post.engagementRate ?? 0;
        windowScores[key].count++;
      }

      const topWindows = Object.entries(windowScores)
        .map(([key, val]) => {
          const [day, hour] = key.split("-").map(Number);
          return {
            day: DAY_NAMES[day],
            hour: `${hour}:00`,
            avgEngagement: val.count > 0 ? val.totalEngagement / val.count : 0,
            postCount: val.count,
          };
        })
        .sort((a, b) => b.avgEngagement - a.avgEngagement)
        .slice(0, 15);

      return {
        success: true,
        actions: [],
        data: { topWindows, totalPostsAnalyzed: allPosts.length },
      };
    },
  },
  {
    id: "map_coach_activity",
    name: "Map Coach Activity",
    description: "Overlay coach peak hours onto posting windows for overlap scoring",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { message: "DB not configured" } };
      }

      const profiles = await db.select().from(coachBehaviorProfiles);
      const hourCounts = new Array(24).fill(0);
      let totalCoaches = 0;

      for (const profile of profiles) {
        const peakHours = profile.peakActivityHours as number[] | null;
        if (!peakHours || !Array.isArray(peakHours)) continue;
        totalCoaches++;
        for (const hour of peakHours) {
          if (hour >= 0 && hour < 24) hourCounts[hour]++;
        }
      }

      const coachActivityMap = hourCounts.map((count, hour) => ({
        hour: `${hour}:00`,
        coachesActive: count,
        overlapPercent: totalCoaches > 0 ? Math.round((count / totalCoaches) * 100) : 0,
      }));

      return {
        success: true,
        actions: [],
        data: { coachActivityMap, totalCoachesAnalyzed: totalCoaches },
      };
    },
  },
  {
    id: "calculate_posting_window_scores",
    name: "Calculate Posting Window Scores",
    description: "Score all 168 hour-of-week slots and store in postingWindows table",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      if (!isDbConfigured()) {
        return { success: true, actions: [], data: { message: "DB not configured" } };
      }

      const season = getCurrentSeason();
      const profiles = await db.select().from(coachBehaviorProfiles);
      const allPosts = await db.select().from(posts).limit(200);

      // Calculate coach activity by hour
      const hourCounts = new Array(24).fill(0);
      let totalCoaches = 0;
      for (const p of profiles) {
        const peakHours = p.peakActivityHours as number[] | null;
        if (!peakHours || !Array.isArray(peakHours)) continue;
        totalCoaches++;
        for (const h of peakHours) {
          if (h >= 0 && h < 24) hourCounts[h]++;
        }
      }

      // Calculate engagement by day/hour
      const engagementMap: Record<string, number[]> = {};
      for (const post of allPosts) {
        const date = new Date(post.scheduledFor || post.createdAt!);
        const key = `${date.getDay()}-${date.getHours()}`;
        if (!engagementMap[key]) engagementMap[key] = [];
        engagementMap[key].push(post.engagementRate ?? 0);
      }

      // Build 168 window scores
      let windowCount = 0;
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const key = `${day}-${hour}`;
          const engagements = engagementMap[key] || [];
          const avgEng = engagements.length > 0 ? engagements.reduce((a, b) => a + b, 0) / engagements.length : 0;
          const coachOverlap = totalCoaches > 0 ? (hourCounts[hour] / totalCoaches) * 100 : 0;

          // Composite score: 40% coach overlap + 40% engagement + 20% time-of-day bonus
          let timeBonus = 0;
          if (hour >= 7 && hour <= 9) timeBonus = 20; // Morning prime
          else if (hour >= 12 && hour <= 14) timeBonus = 15; // Lunch
          else if (hour >= 17 && hour <= 19) timeBonus = 10; // Evening
          else if (hour >= 0 && hour <= 5) timeBonus = -10; // Late night penalty

          // Day-of-week bonus
          let dayBonus = 0;
          if (day >= 2 && day <= 4) dayBonus = 10; // Tue-Thu
          if (day === 0 || day === 6) dayBonus = -5; // Weekend slight penalty

          const score = Math.max(0, Math.min(100,
            coachOverlap * 0.4 + avgEng * 10 * 0.4 + (timeBonus + dayBonus) * 0.2
          ));

          await db.insert(postingWindows).values({
            dayOfWeek: day,
            hourStart: hour,
            hourEnd: hour + 1,
            score,
            coachOverlap,
            avgEngagement: avgEng,
            season,
          }).onConflictDoNothing();

          windowCount++;
        }
      }

      return {
        success: true,
        actions: [{
          actionType: "update_posting_windows" as const,
          title: "Posting windows updated",
          description: `Scored ${windowCount} time slots for ${season} season`,
          payload: { windowCount, season },
          priority: 2,
        }],
        data: { windowsScored: windowCount, season },
      };
    },
  },
  {
    id: "build_weekly_schedule",
    name: "Build Weekly Schedule",
    description: "Generate optimal 7-day posting plan for current week",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      const season = getCurrentSeason();
      const pillars = ["work_ethic", "performance", "performance", "character", "performance"];

      const schedule = [
        { day: "Monday", time: "7:30 AM CT", pillar: "work_ethic", suggestion: "Training video or gym session recap" },
        { day: "Tuesday", time: "3:00 PM CT", pillar: "performance", suggestion: "Film breakdown or practice clip (coaches review film Tue-Wed)" },
        { day: "Wednesday", time: "12:00 PM CT", pillar: "performance", suggestion: "Highlight clip or measurables update" },
        { day: "Thursday", time: "6:00 PM CT", pillar: "character", suggestion: "Academic achievement, team moment, or community event" },
        { day: "Friday", time: "8:00 AM CT", pillar: "performance", suggestion: season === "in_season" ? "Game day hype post" : "Film share or training session" },
      ];

      return {
        success: true,
        actions: [{
          actionType: "recommend_schedule" as const,
          title: "Weekly Posting Schedule",
          description: `Optimized ${season} schedule: ${schedule.length} posts across ${new Set(pillars).size} pillars`,
          payload: { schedule, season },
          priority: 3,
        }],
        data: { schedule, season },
      };
    },
  },
  {
    id: "recommend_post_time",
    name: "Recommend Post Time",
    description: "Given a draft post, recommend the best time to publish",
    requiresApproval: false,
    execute: async (context: SkillContext): Promise<SkillResult> => {
      const params = context.parameters as { pillar?: string } | undefined;
      const pillar = params?.pillar || "performance";

      if (!isDbConfigured()) {
        // Default recommendations based on pillar
        const defaults: Record<string, string> = {
          performance: "Tuesday 3:00 PM CT or Wednesday 12:00 PM CT",
          work_ethic: "Monday 7:30 AM CT",
          character: "Thursday 6:00 PM CT",
        };
        return {
          success: true,
          actions: [],
          data: { recommendation: defaults[pillar] || "Tuesday 3:00 PM CT", pillar },
        };
      }

      const windows = await db.select().from(postingWindows).orderBy(desc(postingWindows.score)).limit(5);

      const topWindow = windows[0];
      const recommendation = topWindow
        ? `${DAY_NAMES[topWindow.dayOfWeek]} ${topWindow.hourStart}:00 CT (score: ${topWindow.score?.toFixed(1)})`
        : "Tuesday 3:00 PM CT (default)";

      return {
        success: true,
        actions: [],
        data: { recommendation, topWindows: windows, pillar },
      };
    },
  },
  {
    id: "detect_seasonal_patterns",
    name: "Detect Seasonal Patterns",
    description: "Adjust posting strategy for in-season, camp, dead periods, evaluation",
    requiresApproval: false,
    execute: async (): Promise<SkillResult> => {
      const season = getCurrentSeason();

      const strategies: Record<string, { frequency: string; focus: string; avoid: string; bestDays: string[] }> = {
        in_season: {
          frequency: "4-5 posts/week",
          focus: "Game highlights, Friday Night Lights content, weekly film drops",
          avoid: "Posting during game time (Friday 7PM-10PM CT)",
          bestDays: ["Tuesday", "Wednesday", "Thursday", "Saturday"],
        },
        camp: {
          frequency: "5-6 posts/week",
          focus: "Camp attendance, training highlights, measurables updates",
          avoid: "Dead period restrictions — check NCAA calendar",
          bestDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
        evaluation: {
          frequency: "4-5 posts/week",
          focus: "Film shares, spring practice clips, combine results",
          avoid: "Over-posting on weekends when coaches are off",
          bestDays: ["Tuesday", "Wednesday", "Thursday"],
        },
        signing: {
          frequency: "3-4 posts/week",
          focus: "Official visits, school interest signals, commitment prep",
          avoid: "Rumors or speculation — stay professional",
          bestDays: ["Monday", "Tuesday", "Wednesday"],
        },
        offseason: {
          frequency: "3-4 posts/week",
          focus: "Training, academic achievements, community involvement",
          avoid: "Going silent — consistency matters even in offseason",
          bestDays: ["Monday", "Wednesday", "Friday"],
        },
      };

      const strategy = strategies[season] || strategies.offseason;

      return {
        success: true,
        actions: [],
        data: { season, strategy },
      };
    },
  },
];
