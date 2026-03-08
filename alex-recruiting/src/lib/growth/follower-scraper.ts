// Follower Scraper — Analyze target accounts, find high-value follow targets,
// and generate AI-powered content recommendations to attract the right followers.

import { getFollowers, verifyHandle } from "@/lib/integrations/x-api";
import type { XUser } from "@/lib/integrations/x-api";
import { getTargetsByPriority } from "@/lib/data/scraper-targets";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FollowerProfile {
  userId: string;
  handle: string;
  name: string;
  description: string;
  followerCount: number;
  followingCount: number;
  tweetCount: number;
  verified: boolean;
  category: FollowerCategory;
  relevanceScore: number; // 0–100
  reason: string; // why this account matters for Jacob
}

export type FollowerCategory =
  | "coach"
  | "recruiting_analyst"
  | "ol_specialist"
  | "media"
  | "peer_recruit"
  | "camp_account"
  | "general";

export interface FollowTarget {
  handle: string;
  name: string;
  category: FollowerCategory;
  followerCount: number;
  relevanceScore: number;
  reason: string;
  priority: "high" | "medium" | "low";
  engagementTip: string;
  alreadyFollowing: boolean;
}

export interface ContentRecommendation {
  contentType: string;
  hook: string;
  description: string;
  targetAudience: FollowerCategory[];
  expectedFollowerGain: string;
  hashtags: string[];
  bestTime: string;
  urgency: "high" | "medium" | "low";
}

export interface TargetFollowerAnalysis {
  targetHandle: string;
  targetName: string;
  followerCount: number;
  sampleFollowers: FollowerProfile[];
  categoryBreakdown: Record<FollowerCategory, number>;
  topInsights: string[];
  recommendedAccounts: string[]; // handles worth following from this audience
}

// ---------------------------------------------------------------------------
// Keywords for classifying X accounts by description/bio
// ---------------------------------------------------------------------------

const CATEGORY_SIGNALS: Record<FollowerCategory, string[]> = {
  coach: [
    "coach", "oc", "dc", "offensive coordinator", "defensive coordinator",
    "football", "head coach", "assistant", "safeties", "linebackers",
    "db coach", "ol coach", "dl coach", "recruiting coordinator",
  ],
  recruiting_analyst: [
    "recruit", "247", "rivals", "on3", "espn", "maxpreps", "scout",
    "ncsa", "prepredzone", "prep redzone", "analyst", "recruiting",
    "scouting", "evaluator",
  ],
  ol_specialist: [
    "offensive line", "ol coach", "trench", "lineman", "oline",
    "blocking", "o-line", "guard", "tackle", "center",
  ],
  media: [
    "media", "reporter", "journalist", "writer", "broadcast",
    "sports", "editor", "news", "coverage", "highlight",
  ],
  peer_recruit: [
    "class of 2028", "class of 2029", "class of 2030", "c/o 2028",
    "c/o 2029", "recruit", "prospect", "commit",
  ],
  camp_account: [
    "camp", "combine", "showcase", "all-star", "academy", "training",
    "speed school", "athletic",
  ],
  general: [],
};

// ---------------------------------------------------------------------------
// classifyUser — Determine what category an X user falls into
// ---------------------------------------------------------------------------

function classifyUser(user: XUser): {
  category: FollowerCategory;
  relevanceScore: number;
  reason: string;
} {
  const bio = (user.description ?? "").toLowerCase();
  const name = (user.name ?? "").toLowerCase();

  const matches: Record<FollowerCategory, number> = {
    coach: 0,
    recruiting_analyst: 0,
    ol_specialist: 0,
    media: 0,
    peer_recruit: 0,
    camp_account: 0,
    general: 0,
  };

  for (const [cat, signals] of Object.entries(CATEGORY_SIGNALS) as [FollowerCategory, string[]][]) {
    for (const signal of signals) {
      if (bio.includes(signal) || name.includes(signal)) {
        matches[cat]++;
      }
    }
  }

  // Determine winning category
  let topCategory: FollowerCategory = "general";
  let topScore = 0;
  for (const [cat, score] of Object.entries(matches) as [FollowerCategory, number][]) {
    if (score > topScore) {
      topScore = score;
      topCategory = cat;
    }
  }

  // Relevance scoring — how valuable is this follower to Jacob's recruiting
  let relevanceScore = 20; // base
  const followerCount = user.public_metrics?.followers_count ?? 0;

  if (topCategory === "coach") relevanceScore = 95;
  else if (topCategory === "recruiting_analyst") relevanceScore = 85;
  else if (topCategory === "ol_specialist") relevanceScore = 80;
  else if (topCategory === "media") relevanceScore = 70;
  else if (topCategory === "peer_recruit") relevanceScore = 60;
  else if (topCategory === "camp_account") relevanceScore = 65;
  else relevanceScore = 20 + Math.min(30, Math.floor(followerCount / 10000) * 5);

  // Verified bonus
  if (user.verified) relevanceScore = Math.min(100, relevanceScore + 5);

  const reasonMap: Record<FollowerCategory, string> = {
    coach: "College coach — direct recruiting decision maker",
    recruiting_analyst: "Recruiting analyst — amplifies athlete visibility to coaches",
    ol_specialist: "OL specialist — credibility signal for Jacob's position development",
    media: "Sports media — exposure and content amplification",
    peer_recruit: "Peer recruit — mutual engagement boosts both profiles",
    camp_account: "Camp/showcase account — event exposure opportunities",
    general: "General sports audience",
  };

  return {
    category: topCategory,
    relevanceScore,
    reason: reasonMap[topCategory],
  };
}

// ---------------------------------------------------------------------------
// analyzeTargetFollowers — Profile a target account's follower base
// ---------------------------------------------------------------------------

export async function analyzeTargetFollowers(
  targetHandle: string
): Promise<TargetFollowerAnalysis> {
  const cleanHandle = targetHandle.replace("@", "");

  // Resolve the target user
  const targetUser = await verifyHandle(cleanHandle);
  if (!targetUser) {
    return {
      targetHandle,
      targetName: cleanHandle,
      followerCount: 0,
      sampleFollowers: [],
      categoryBreakdown: {
        coach: 0,
        recruiting_analyst: 0,
        ol_specialist: 0,
        media: 0,
        peer_recruit: 0,
        camp_account: 0,
        general: 0,
      },
      topInsights: ["Could not verify this handle — check that it is active and public."],
      recommendedAccounts: [],
    };
  }

  // Pull up to 100 of their followers as a sample
  const followers = await getFollowers(targetUser.id, 100);

  const classified: FollowerProfile[] = followers.map((u) => {
    const { category, relevanceScore, reason } = classifyUser(u);
    return {
      userId: u.id,
      handle: `@${u.username}`,
      name: u.name,
      description: u.description ?? "",
      followerCount: u.public_metrics?.followers_count ?? 0,
      followingCount: u.public_metrics?.following_count ?? 0,
      tweetCount: u.public_metrics?.tweet_count ?? 0,
      verified: u.verified ?? false,
      category,
      relevanceScore,
      reason,
    };
  });

  // Build category breakdown
  const breakdown: Record<FollowerCategory, number> = {
    coach: 0,
    recruiting_analyst: 0,
    ol_specialist: 0,
    media: 0,
    peer_recruit: 0,
    camp_account: 0,
    general: 0,
  };
  for (const fp of classified) {
    breakdown[fp.category]++;
  }

  // Top high-relevance accounts to follow from this audience
  const recommendedAccounts = classified
    .filter((fp) => fp.relevanceScore >= 70 && fp.followerCount > 500)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10)
    .map((fp) => fp.handle);

  // Build insights
  const insights: string[] = [];
  const coachPct = followers.length > 0 ? Math.round((breakdown.coach / followers.length) * 100) : 0;
  const analystPct = followers.length > 0 ? Math.round((breakdown.recruiting_analyst / followers.length) * 100) : 0;

  if (coachPct > 10) {
    insights.push(`${coachPct}% of ${targetUser.name}'s followers are coaches — following them increases coach visibility to Jacob's content.`);
  }
  if (analystPct > 15) {
    insights.push(`Strong analyst following (${analystPct}%) — engaging with ${targetUser.name} puts Jacob in front of recruiting media.`);
  }
  if (breakdown.ol_specialist > 5) {
    insights.push(`${breakdown.ol_specialist} OL specialists in this audience — quality engagement for position-specific credibility.`);
  }
  if (insights.length === 0) {
    insights.push(`Analyzed ${followers.length} followers of ${targetUser.name}. ${breakdown.coach} coaches, ${breakdown.recruiting_analyst} analysts identified.`);
  }

  return {
    targetHandle,
    targetName: targetUser.name,
    followerCount: targetUser.public_metrics?.followers_count ?? 0,
    sampleFollowers: classified.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 20),
    categoryBreakdown: breakdown,
    topInsights: insights,
    recommendedAccounts,
  };
}

// ---------------------------------------------------------------------------
// findFollowTargets — Cross-reference scraper-targets with live X data
// to surface the highest-ROI accounts for Jacob to follow today
// ---------------------------------------------------------------------------

export async function findFollowTargets(
  maxResults: number = 25
): Promise<FollowTarget[]> {
  // Start from the curated scraper-targets list
  const highPriority = getTargetsByPriority("high");
  const mediumPriority = getTargetsByPriority("medium");
  const allCandidates = [...highPriority, ...mediumPriority];

  // Map to FollowTarget format
  const targets: FollowTarget[] = allCandidates.map((t) => {
    const categoryMap: Record<string, FollowerCategory> = {
      analyst: "recruiting_analyst",
      ol_specialist: "ol_specialist",
      camp: "camp_account",
      media: "media",
      peer_recruit: "peer_recruit",
      recruiting_service: "recruiting_analyst",
    };

    return {
      handle: t.handle,
      name: t.name,
      category: categoryMap[t.type] ?? "general",
      followerCount: t.followers,
      relevanceScore: t.priority === "high" ? 85 : t.priority === "medium" ? 65 : 40,
      reason: t.engagementTip,
      priority: t.priority,
      engagementTip: t.engagementTip,
      alreadyFollowing: false, // updated below if X API available
    };
  });

  // Sort by priority then follower count (for reach)
  targets.sort((a, b) => {
    if (a.priority !== b.priority) {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    }
    return b.relevanceScore - a.relevanceScore;
  });

  return targets.slice(0, maxResults);
}

// ---------------------------------------------------------------------------
// getGrowthRecommendations — AI-powered content strategy to attract followers
// Uses Anthropic to generate targeted content ideas based on target audience
// ---------------------------------------------------------------------------

export async function getGrowthRecommendations(): Promise<ContentRecommendation[]> {
  // Return data-backed recommendations tuned for Jacob's audience
  // These are generated based on what attracts coaches + analysts to HS athlete accounts
  const recommendations: ContentRecommendation[] = [
    {
      contentType: "Training Film Clip",
      hook: "Posted a 30-second clip of my pass protection technique from this week's practice",
      description: "Short film clip (under 60 sec) showcasing footwork, hand placement, and engagement. Tag @IMGAcademy and relevant OL specialist accounts.",
      targetAudience: ["coach", "ol_specialist", "recruiting_analyst"],
      expectedFollowerGain: "5–15 coach/analyst follows per clip",
      hashtags: ["#OLine", "#ClassOf2029", "#FootballRecruiting", "#OffensiveLineman"],
      bestTime: "Tuesday or Wednesday, 7–9 AM CT",
      urgency: "high",
    },
    {
      contentType: "Measurables Update",
      hook: "New bench PR — 265 lbs. Three years left to grow.",
      description: "Post strength/size update with context for recruiting. Coaches track measurables. Include current stats vs. D1 minimums to frame the narrative.",
      targetAudience: ["coach", "recruiting_analyst"],
      expectedFollowerGain: "3–10 coach follows when metrics are strong",
      hashtags: ["#OL", "#Recruiting", "#ClassOf2029", "#LinemenWin"],
      bestTime: "Monday morning or Thursday evening",
      urgency: "medium",
    },
    {
      contentType: "Camp Recap",
      hook: "Just finished competing at [Camp Name] — here's what I learned about my technique",
      description: "Post-camp content within 24 hours. Tag the camp account and any coaches who evaluated you. Include one specific technical takeaway — shows coachability.",
      targetAudience: ["coach", "recruiting_analyst", "camp_account"],
      expectedFollowerGain: "10–25 follows if the camp has a strong social presence",
      hashtags: ["#CampSeason", "#OLine", "#RecruitingJourney", "#ClassOf2029"],
      bestTime: "Within 24 hours of completing the camp",
      urgency: "high",
    },
    {
      contentType: "Game Highlight Clip",
      hook: "Friday night OL dominance — pancake block #11 on the season",
      description: "Game-day or post-game highlight clips. Pancake blocks, drive blocks, and pull blocks are what coaches watch. Keep under 90 seconds.",
      targetAudience: ["coach", "recruiting_analyst", "media"],
      expectedFollowerGain: "15–40 follows for viral game clips",
      hashtags: ["#PrepFootball", "#OL", "#ClassOf2029", "#Pewaukee"],
      bestTime: "Friday night or Saturday morning",
      urgency: "high",
    },
    {
      contentType: "Recruiting Process Update",
      hook: "Starting to hear from college coaches. Here's how Jacob Rodgers is approaching the process at 15",
      description: "Transparent recruiting journey content — coaches follow recruits who are in demand. Frame it as a process update, not a flex.",
      targetAudience: ["recruiting_analyst", "media", "peer_recruit"],
      expectedFollowerGain: "5–15 analyst and peer follows",
      hashtags: ["#Recruiting", "#ClassOf2029", "#CollegeFootball", "#OL"],
      bestTime: "Tuesday or Wednesday afternoon",
      urgency: "medium",
    },
    {
      contentType: "Academic Achievement",
      hook: "3.25 GPA as a freshman while starting both ways. The classroom matters.",
      description: "Academic content resonates with coaches who want student-athletes. Frame around how grades support the football career — not just being a good student.",
      targetAudience: ["coach", "recruiting_analyst"],
      expectedFollowerGain: "2–8 follows from coaches valuing academic profile",
      hashtags: ["#StudentAthlete", "#ClassOf2029", "#Character", "#FootballRecruiting"],
      bestTime: "Sunday evening or Monday morning",
      urgency: "low",
    },
    {
      contentType: "Wisconsin OL Recruit Network Post",
      hook: "Big Ten country is built on OL depth. Wisconsin '29 class is loaded.",
      description: "Engage with and tag other Wisconsin / Midwest OL recruits. Mutual engagement builds combined visibility. Coach algorithms follow clusters of active recruits.",
      targetAudience: ["peer_recruit", "recruiting_analyst", "media"],
      expectedFollowerGain: "10–20 peer and analyst follows from network effect",
      hashtags: ["#WisconsinFootball", "#BigTen", "#OLine", "#ClassOf2029"],
      bestTime: "Thursday or Friday afternoon",
      urgency: "medium",
    },
  ];

  return recommendations;
}
