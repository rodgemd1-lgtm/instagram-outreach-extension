import { NextResponse } from "next/server";
import {
  peerFollowTargets,
  getTargetsForWeek,
  getScheduledTargets,
  followScheduleSummary,
  type PeerFollowTarget,
} from "@/lib/data/peer-follow-targets";
import { isDbConfigured, db } from "@/lib/db";
import { engagementActions } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WeeklyFollowBatch {
  week: number;
  startDate: string;
  endDate: string;
  targets: {
    handle: string;
    name: string;
    category: string;
    priority: number;
    engagement: string;
  }[];
  dailyBreakdown: { day: string; follows: number }[];
}

interface EngagementTask {
  type: "like" | "reply" | "retweet";
  target: string;
  targetName: string;
  frequency: string;
  notes: string;
}

interface FollowPlan {
  weeklyBatches: WeeklyFollowBatch[];
  engagementTasks: EngagementTask[];
  summary: {
    totalTargets: number;
    scheduledTargets: number;
    followsPerWeek: string;
    weeksInPlan: number;
    categoryCounts: Record<string, number>;
    phaseBreakdown: typeof followScheduleSummary.phases;
  };
  strategy: string[];
}

// ---------------------------------------------------------------------------
// POST /api/outreach/follow-plan
// Generates a 26-week systematic follow plan with 7-8 follows per week.
// ---------------------------------------------------------------------------

export async function POST() {
  const scheduled = getScheduledTargets();
  const weeklyBatches: WeeklyFollowBatch[] = [];

  // Build weekly batches for 26 weeks
  const planStart = new Date();
  const FOLLOWS_PER_WEEK = 8; // target 7-8 per week

  for (let week = 1; week <= 26; week++) {
    const weekTargets = getTargetsForWeek(week);

    // Limit to FOLLOWS_PER_WEEK per week; overflow gets pushed to later weeks
    const batch = weekTargets.slice(0, FOLLOWS_PER_WEEK);

    const weekStart = new Date(planStart.getTime() + (week - 1) * 7 * 86400000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);

    // Distribute follows across the week (Mon-Sat, skip Sunday)
    const dailyBreakdown: { day: string; follows: number }[] = [];
    const daysInWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let remaining = batch.length;
    for (const day of daysInWeek) {
      const today = Math.min(Math.ceil(remaining / (daysInWeek.length - dailyBreakdown.length)), 2);
      dailyBreakdown.push({ day, follows: Math.min(today, remaining) });
      remaining -= Math.min(today, remaining);
      if (remaining <= 0) break;
    }

    weeklyBatches.push({
      week,
      startDate: weekStart.toISOString().split("T")[0],
      endDate: weekEnd.toISOString().split("T")[0],
      targets: batch.map((t) => ({
        handle: t.handle,
        name: t.name,
        category: t.category,
        priority: t.follow_priority,
        engagement: t.engagement_strategy,
      })),
      dailyBreakdown,
    });
  }

  // Engagement tasks — daily cadence alongside follows
  const engagementTasks: EngagementTask[] = [
    {
      type: "like",
      target: "coach posts",
      targetName: "Target school coaching staff posts",
      frequency: "5 per day",
      notes:
        "Like coach posts about recruiting, team wins, and OL content. Each like is a recruiting signal under the Click Dont Type rule.",
    },
    {
      type: "reply",
      target: "coach posts",
      targetName: "Target school coach tweets about OL or recruiting",
      frequency: "2 per day",
      notes:
        "Reply with thoughtful, brief comments. Keep it professional and genuine.",
    },
    {
      type: "retweet",
      target: "program content",
      targetName: "Target school official account content",
      frequency: "1 per day",
      notes:
        "Retweet program highlights, game day content, and recruiting announcements. Shows genuine interest in the program.",
    },
    {
      type: "like",
      target: "peer recruit posts",
      targetName: "Class of 2029 OL peer recruit content",
      frequency: "3 per day",
      notes:
        "Engage with peer recruits to build the network. Coaches see who you interact with.",
    },
  ];

  // Store plan actions in DB if configured
  if (isDbConfigured()) {
    try {
      const sampleActions = engagementTasks.map((task) => ({
        targetHandle: task.target,
        targetCategory: task.type,
        actionType: `planned_${task.type}`,
        content: `${task.frequency}: ${task.notes}`,
      }));

      for (const action of sampleActions) {
        await db.insert(engagementActions).values(action);
      }
    } catch (error) {
      console.error(
        "[POST /api/outreach/follow-plan] DB store error:",
        error
      );
    }
  }

  // Category counts
  const categoryCounts: Record<string, number> = {};
  for (const t of peerFollowTargets) {
    categoryCounts[t.category] = (categoryCounts[t.category] ?? 0) + 1;
  }

  const plan: FollowPlan = {
    weeklyBatches,
    engagementTasks,
    summary: {
      totalTargets: peerFollowTargets.length,
      scheduledTargets: scheduled.length,
      followsPerWeek: "7-8",
      weeksInPlan: 26,
      categoryCounts,
      phaseBreakdown: followScheduleSummary.phases,
    },
    strategy: [
      "Follow D2/D3 coaches first — they have the highest follow-back and DM-open rates",
      "FCS coaches next — MVFC and Pioneer programs actively recruit Wisconsin OL",
      "FBS follows are aspirational signals — coaches see the follow even if they dont follow back",
      "Media follows build visibility in recruiting circles when you engage with their content",
      "HS community follows show youre embedded in Wisconsin football — coaches check this",
      "Strength/training follows signal dedication to development — coaches value this",
      "7-8 follows per week avoids spam flags while building steady network growth",
      "Pair each follow with engagement (likes, replies) within 24 hours for maximum signal",
    ],
  };

  return NextResponse.json({ success: true, plan });
}
