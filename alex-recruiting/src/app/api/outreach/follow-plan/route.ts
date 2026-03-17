import { NextResponse } from "next/server";
import { targetSchools } from "@/lib/data/target-schools";
import { getActiveCompetitors } from "@/lib/rec/knowledge/competitor-intel";
import { xPlaybook } from "@/lib/rec/knowledge/x-playbook";
import { isDbConfigured, db } from "@/lib/db";
import { engagementActions } from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DailyFollow {
  day: number; // day number from start
  date: string;
  accounts: {
    handle: string;
    name: string;
    category: "school" | "coach" | "peer_recruit" | "media";
    schoolId?: string;
    tier?: string;
  }[];
}

interface EngagementTask {
  type: "like" | "reply" | "retweet";
  target: string;
  targetName: string;
  frequency: string;
  notes: string;
}

interface TimelineEntry {
  week: number;
  phase: string;
  actions: string[];
}

interface FollowPlan {
  dailyFollows: DailyFollow[];
  engagementTasks: EngagementTask[];
  timeline: TimelineEntry[];
  summary: {
    totalAccounts: number;
    schoolAccounts: number;
    coachAccounts: number;
    peerRecruitAccounts: number;
    daysToComplete: number;
    dailyFollowTarget: string;
  };
  strategy: string[];
}

// ---------------------------------------------------------------------------
// POST /api/outreach/follow-plan
// Generates a systematic follow plan with daily targets and engagement tasks.
// ---------------------------------------------------------------------------

export async function POST() {
  const dailyFollows: DailyFollow[] = [];
  const allAccounts: DailyFollow["accounts"][0][] = [];

  // 1. Build account list from target schools (official + coaching staff)
  for (const school of targetSchools) {
    allAccounts.push({
      handle: school.officialXHandle,
      name: `${school.name} Football`,
      category: "school",
      schoolId: school.id,
      tier: school.priorityTier,
    });

    // Add coaching staff placeholders per school
    const coachRoles = [
      "OL Coach",
      "Recruiting Coordinator",
      "Head Coach",
    ];
    for (const role of coachRoles) {
      allAccounts.push({
        handle: `${school.officialXHandle}_${role.replace(/\s/g, "").toLowerCase()}`,
        name: `${role} - ${school.name}`,
        category: "coach",
        schoolId: school.id,
        tier: school.priorityTier,
      });
    }
  }

  // 2. Add peer recruit follows from competitor intel
  const activeCompetitors = getActiveCompetitors();
  for (const comp of activeCompetitors) {
    if (comp.xHandle) {
      allAccounts.push({
        handle: comp.xHandle,
        name: `${comp.name} (${comp.position}, ${comp.school})`,
        category: "peer_recruit",
      });
    }
  }

  // 3. Add recruiting media accounts
  const mediaAccounts = [
    { handle: "@Rivals", name: "Rivals" },
    { handle: "@247Sports", name: "247Sports" },
    { handle: "@On3Recruits", name: "On3 Recruits" },
    { handle: "@WiscoFBRecruiting", name: "Wisconsin FB Recruiting" },
    { handle: "@NCSASports", name: "NCSA Sports" },
  ];
  for (const media of mediaAccounts) {
    allAccounts.push({
      handle: media.handle,
      name: media.name,
      category: "media",
    });
  }

  // 4. Sort: Tier 3 schools first (immediate DMs), then Tier 2, then Tier 1, then peers/media
  const tierOrder: Record<string, number> = {
    "Tier 3": 0,
    "Tier 2": 1,
    "Tier 1": 2,
  };
  const categoryOrder: Record<string, number> = {
    school: 0,
    coach: 1,
    peer_recruit: 2,
    media: 3,
  };

  allAccounts.sort((a, b) => {
    const tierA = tierOrder[a.tier ?? ""] ?? 3;
    const tierB = tierOrder[b.tier ?? ""] ?? 3;
    if (tierA !== tierB) return tierA - tierB;
    return (categoryOrder[a.category] ?? 9) - (categoryOrder[b.category] ?? 9);
  });

  // 5. Distribute into daily follow targets (3-5 per day)
  const DAILY_TARGET = 4;
  const startDate = new Date();
  let dayIndex = 0;

  for (let i = 0; i < allAccounts.length; i += DAILY_TARGET) {
    const batch = allAccounts.slice(i, i + DAILY_TARGET);
    const date = new Date(startDate.getTime() + dayIndex * 86400000);

    dailyFollows.push({
      day: dayIndex + 1,
      date: date.toISOString().split("T")[0],
      accounts: batch,
    });

    dayIndex++;
  }

  // 6. Build engagement tasks
  const engagementTasks: EngagementTask[] = [
    {
      type: "like",
      target: "coach posts",
      targetName: "Target school coaching staff posts",
      frequency: "5 per day",
      notes:
        "Like coach posts about recruiting, team wins, and OL content. Each like is a recruiting signal under the Click Don't Type rule.",
    },
    {
      type: "reply",
      target: "coach posts",
      targetName: "Target school coach tweets about OL or recruiting",
      frequency: "2 per day",
      notes:
        "Reply with thoughtful, brief comments. Example: 'Great win Coach! The OL play was impressive.' Keep it professional.",
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

  // 7. Build weekly timeline
  const timeline: TimelineEntry[] = [
    {
      week: 1,
      phase: "Foundation Follows",
      actions: [
        "Follow all 17 target school official accounts",
        "Follow Tier 3 (D2) coaching staff handles",
        "Like 5 coach posts per day from Tier 3 schools",
        "Send first DMs to Tier 3 coaches (they expect freshman outreach)",
      ],
    },
    {
      week: 2,
      phase: "Tier 2 FCS Follows",
      actions: [
        "Follow Tier 2 FCS school coaching staff (MVFC programs)",
        "Engage with SDSU, NDSU, Illinois State, Youngstown State coach content",
        "Reply to 2 coach posts per day",
        "Retweet 1 program post per day",
      ],
    },
    {
      week: 3,
      phase: "Tier 2 MAC Follows",
      actions: [
        "Follow Tier 2 MAC school coaching staff",
        "Engage with NIU, WMU, Ball State, CMU coach content",
        "Continue daily engagement cadence (5 likes, 2 replies, 1 retweet)",
        "Follow peer Class of 2029 OL recruits",
      ],
    },
    {
      week: 4,
      phase: "Tier 1 Follows + Media",
      actions: [
        "Follow Tier 1 school coaching staff (Wisconsin, Iowa, Northwestern, Iowa State)",
        "Follow recruiting media accounts (Rivals, 247, On3)",
        "Monitor follow-backs from coaches (strong signal)",
        "Begin planning DM sequences for Tier 2 coaches",
      ],
    },
    {
      week: 5,
      phase: "Sustained Engagement",
      actions: [
        "Maintain daily engagement: 5 likes, 2 replies, 1 retweet",
        "Track which coaches have followed back",
        "Send trigger DMs to coaches who followed back",
        "Continue posting original content (3-5x/week minimum)",
      ],
    },
  ];

  // 8. Try to store plan in DB
  if (isDbConfigured()) {
    try {
      // Store a sample of engagement actions
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

  const plan: FollowPlan = {
    dailyFollows,
    engagementTasks,
    timeline,
    summary: {
      totalAccounts: allAccounts.length,
      schoolAccounts: allAccounts.filter((a) => a.category === "school").length,
      coachAccounts: allAccounts.filter((a) => a.category === "coach").length,
      peerRecruitAccounts: allAccounts.filter(
        (a) => a.category === "peer_recruit"
      ).length,
      daysToComplete: dailyFollows.length,
      dailyFollowTarget: `${DAILY_TARGET} accounts/day`,
    },
    strategy: xPlaybook.followStrategy.orderOfOperations,
  };

  return NextResponse.json({ success: true, plan });
}
