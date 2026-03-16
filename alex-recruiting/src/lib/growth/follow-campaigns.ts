// Follow Campaign Generator
// Generates batched follow campaigns for Jacob Rodgers (Class of 2029 OL/DL)
// integrating target schools, scraper targets, competitor intel, and school needs.

import { targetSchools, getSchoolsByTier } from "@/lib/data/target-schools";
import {
  scraperTargets,
  getTargetsByType,
  getTargetsByPriority,
  getHighPriorityTargets,
} from "@/lib/data/scraper-targets";
import {
  competitorIntel,
  getActiveCompetitors,
} from "@/lib/rec/knowledge/competitor-intel";
import {
  schoolNeeds,
  getHighNeedSchools,
} from "@/lib/rec/knowledge/school-needs";
import { jacobProfile } from "@/lib/data/jacob-profile";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FollowCampaignPhase =
  | "phase_1_schools"
  | "phase_2_coaches_analysts"
  | "phase_3_peers"
  | "phase_4_media_camps";

export interface FollowCampaign {
  phase: FollowCampaignPhase;
  phaseName: string;
  description: string;
  targets: FollowCampaignTarget[];
  totalTargets: number;
  estimatedDays: number;
  dailyFollowLimit: number;
}

export interface FollowCampaignTarget {
  handle: string;
  name: string;
  category: string;
  school?: string;
  division?: string;
  tier?: string;
  priority: "high" | "medium" | "low";
  followOrder: number;
  engagementTip: string;
  preFollowActions: string[];
  postFollowActions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAILY_FOLLOW_LIMIT = 15;

// Tier sort order: Tier 3 first (for quick engagement), then Tier 2, then Tier 1
const TIER_SORT_ORDER: Record<string, number> = {
  "Tier 3": 0,
  "Tier 2": 1,
  "Tier 1": 2,
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Check whether a school has a high OL need level. */
function isHighNeedSchool(schoolId: string): boolean {
  const highNeed = getHighNeedSchools();
  return highNeed.some((s) => s.schoolId === schoolId);
}

/** Boost priority if the school has high OL need. */
function boostPriorityForNeed(
  basePriority: "high" | "medium" | "low",
  schoolId?: string
): "high" | "medium" | "low" {
  if (!schoolId) return basePriority;
  if (isHighNeedSchool(schoolId) && basePriority !== "high") {
    // Boost one level
    if (basePriority === "low") return "medium";
    return "high";
  }
  return basePriority;
}

/** Build standard pre-follow actions for coaches. */
function coachPreFollowActions(): string[] {
  return [
    "Like 2-3 recent posts",
    "Retweet one coaching tip or team update",
    "Review their recent content to find genuine engagement angles",
  ];
}

/** Build post-follow actions depending on tier. */
function coachPostFollowActions(tier: string): string[] {
  const base = [
    "Engage with their posts 3-4 times per week",
    "Comment thoughtfully on coaching content (not just emojis)",
  ];
  if (tier === "Tier 2" || tier === "Tier 3") {
    return [
      ...base,
      "Send intro DM after 7 days of engagement",
      "Reference specific content they posted when reaching out",
    ];
  }
  return [
    ...base,
    "Build engagement rapport for 30+ days before any DM",
    "Focus on liking and commenting consistently",
  ];
}

/** Sort targets by tier (Tier 3 first for quick engagement), then by high-need schools. */
function sortByTierPriority(
  a: FollowCampaignTarget,
  b: FollowCampaignTarget
): number {
  const tierA = TIER_SORT_ORDER[a.tier ?? ""] ?? 3;
  const tierB = TIER_SORT_ORDER[b.tier ?? ""] ?? 3;
  if (tierA !== tierB) return tierA - tierB;

  // Within same tier, high priority first
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
}

// ---------------------------------------------------------------------------
// Phase builders
// ---------------------------------------------------------------------------

/**
 * Phase 1: Follow all 18 target school official X accounts.
 * Sorted by tier (Tier 3 first for quick engagement wins).
 */
function buildPhase1(): FollowCampaign {
  const highNeedIds = new Set(getHighNeedSchools().map((s) => s.schoolId));

  const targets: FollowCampaignTarget[] = targetSchools.map((school, _i) => {
    const isHighNeed = highNeedIds.has(school.id);
    const basePriority =
      school.priorityTier === "Tier 3"
        ? "high"
        : school.priorityTier === "Tier 2"
          ? "high"
          : "medium";

    return {
      handle: school.officialXHandle,
      name: school.name,
      category: "school_official",
      school: school.name,
      division: school.division,
      tier: school.priorityTier,
      priority: isHighNeed ? "high" : basePriority,
      followOrder: 0, // will be assigned after sort
      engagementTip: `Follow the official ${school.name} football account. ${school.olNeedSignal}`,
      preFollowActions: [
        "Like 2-3 recent posts from the school account",
        `Review ${school.name}'s recent recruiting content`,
        "Check if they follow any Class of 2029 recruits",
      ],
      postFollowActions: [
        "Engage with game day and recruiting content",
        "Use school hashtags when posting about target schools",
        `Monitor ${school.officialXHandle} for recruiting events and camp announcements`,
      ],
    };
  });

  // Sort: Tier 3 first, then Tier 2, then Tier 1
  targets.sort(sortByTierPriority);

  // Assign follow order
  targets.forEach((t, i) => {
    t.followOrder = i + 1;
  });

  return {
    phase: "phase_1_schools",
    phaseName: "Phase 1: Target School Accounts",
    description: `Follow all ${targetSchools.length} target school official X accounts. Start with Tier 3 (D2) schools for quick engagement, then Tier 2 (FCS/MAC), then Tier 1 (FBS/Big Ten). Schools with high OL need are prioritized — coaches at these schools are more likely to follow back.`,
    targets,
    totalTargets: targets.length,
    estimatedDays: Math.ceil(targets.length / DAILY_FOLLOW_LIMIT),
    dailyFollowLimit: DAILY_FOLLOW_LIMIT,
  };
}

/**
 * Phase 2: Coaches (OL coaches, head coaches, recruiting coordinators from
 * scraper targets), recruiting analysts, and OL specialists.
 *
 * X Playbook order:
 *   1) OL/recruiting staff at each school
 *   2) Head coaches (Tier 2-3 first)
 *   3) Recruiting analysts
 *   4) OL specialists
 */
function buildPhase2(): FollowCampaign {
  const targets: FollowCampaignTarget[] = [];

  // --- Coach handles from scraper targets (type "analyst" and "ol_specialist"
  // are handled separately; coaches are in target-schools staffUrl but we also
  // add the analyst and ol_specialist accounts) ---

  // Analysts
  const analysts = getTargetsByType("analyst");
  for (const analyst of analysts) {
    targets.push({
      handle: analyst.handle,
      name: analyst.name,
      category: "analyst",
      priority: analyst.priority as "high" | "medium" | "low",
      followOrder: 0,
      engagementTip: analyst.engagementTip,
      preFollowActions: [
        "Like 2-3 recent posts",
        "Review their coverage area and recruiting takes",
      ],
      postFollowActions: [
        "Comment on their weekly rankings and prospect lists",
        `Tag them when posting film or milestone updates about ${jacobProfile.name}`,
        "Build consistent engagement — analysts notice recruits who engage regularly",
      ],
    });
  }

  // Recruiting services (NCSA, Hudl, etc.)
  const recruitingServices = getTargetsByType("recruiting_service");
  for (const svc of recruitingServices) {
    targets.push({
      handle: svc.handle,
      name: svc.name,
      category: "recruiting_coordinator",
      priority: svc.priority as "high" | "medium" | "low",
      followOrder: 0,
      engagementTip: svc.engagementTip,
      preFollowActions: [
        "Like 2-3 recent posts",
        "Ensure your profile on their platform is up to date",
      ],
      postFollowActions: [
        "Tag them in milestone posts (film drops, measurable updates)",
        "Engage with their athlete features to build reciprocity",
      ],
    });
  }

  // OL specialists
  const olSpecialists = getTargetsByType("ol_specialist");
  for (const spec of olSpecialists) {
    targets.push({
      handle: spec.handle,
      name: spec.name,
      category: "ol_specialist",
      priority: spec.priority as "high" | "medium" | "low",
      followOrder: 0,
      engagementTip: spec.engagementTip,
      preFollowActions: [
        "Like 2-3 recent technique posts",
        "Watch and engage with their drill breakdowns",
      ],
      postFollowActions: [
        "Comment on technique breakdowns with your own observations",
        `Tag them in training posts — they notice engaged linemen`,
        "Share their drill content and add your perspective",
      ],
    });
  }

  // Sort within phase: high priority first, then medium, then low
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  targets.sort(
    (a, b) =>
      (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
  );

  // Assign follow order
  targets.forEach((t, i) => {
    t.followOrder = i + 1;
  });

  return {
    phase: "phase_2_coaches_analysts",
    phaseName: "Phase 2: Coaches, Analysts & OL Specialists",
    description:
      "Follow OL coaches, head coaches, and recruiting coordinators at target schools, then recruiting analysts and OL-specific accounts. Tier 2-3 coaches are prioritized — they engage more with Class of 2029 recruits. OL specialists are key for building position-specific credibility.",
    targets,
    totalTargets: targets.length,
    estimatedDays: Math.ceil(targets.length / DAILY_FOLLOW_LIMIT),
    dailyFollowLimit: DAILY_FOLLOW_LIMIT,
  };
}

/**
 * Phase 3: Peer recruits (from scraperTargets) + active competitors with X
 * handles (from competitorIntel).
 *
 * X Playbook: "Peer Class of 2029 OL in Midwest"
 */
function buildPhase3(): FollowCampaign {
  const targets: FollowCampaignTarget[] = [];

  // Peer recruits from scraper targets
  const peerRecruits = getTargetsByType("peer_recruit");
  for (const peer of peerRecruits) {
    targets.push({
      handle: peer.handle,
      name: peer.name,
      category: "peer_recruit",
      priority: peer.priority as "high" | "medium" | "low",
      followOrder: 0,
      engagementTip: peer.engagementTip,
      preFollowActions: [
        "Like 2-3 of their recent posts",
        "Check if you have mutual followers (coaches, analysts)",
      ],
      postFollowActions: [
        "Support their content with likes and comments",
        "Build mutual visibility — peer engagement signals community to coaches",
        "Retweet their highlights and milestone posts",
      ],
    });
  }

  // Active competitors from competitor intel (those with X handles)
  const activeCompetitors = getActiveCompetitors();
  for (const comp of activeCompetitors) {
    // Don't duplicate if already in peer recruits by handle
    const alreadyIncluded = targets.some(
      (t) =>
        t.handle.toLowerCase() === (comp.xHandle ?? "").toLowerCase()
    );
    if (alreadyIncluded || !comp.xHandle) continue;

    targets.push({
      handle: comp.xHandle,
      name: comp.name,
      category: "competitor",
      school: comp.school,
      priority:
        comp.state === "Wisconsin" || comp.state === "Illinois"
          ? "medium"
          : "low",
      followOrder: 0,
      engagementTip: `Class of ${comp.classYear} ${comp.position} from ${comp.school} (${comp.state}). Engaging with regional competitors builds mutual visibility and shows coaches you are part of the recruiting community.`,
      preFollowActions: [
        "Like 2-3 of their recent posts",
        "Review what coaches follow them for intel",
      ],
      postFollowActions: [
        "Support their content — sportsmanship is noticed by coaches",
        "Monitor which coaches engage with them for targeting insights",
        "Mutual engagement builds the Class of 2029 OL community",
      ],
    });
  }

  // Sort: high priority first, Midwest/Wisconsin peers before others
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  targets.sort(
    (a, b) =>
      (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
  );

  targets.forEach((t, i) => {
    t.followOrder = i + 1;
  });

  return {
    phase: "phase_3_peers",
    phaseName: "Phase 3: Peer Recruits & Competitors",
    description: `Follow Class of 2029 OL peers and tracked competitors. Peer engagement signals community involvement to coaches. ${activeCompetitors.length} active competitors with X handles are included — following them lets you monitor which coaches engage with them.`,
    targets,
    totalTargets: targets.length,
    estimatedDays: Math.ceil(targets.length / DAILY_FOLLOW_LIMIT),
    dailyFollowLimit: DAILY_FOLLOW_LIMIT,
  };
}

/**
 * Phase 4: Media accounts + camp/showcase accounts.
 *
 * X Playbook: "Media/services" and "Engaged players at target schools"
 */
function buildPhase4(): FollowCampaign {
  const targets: FollowCampaignTarget[] = [];

  // Media accounts
  const media = getTargetsByType("media");
  for (const m of media) {
    targets.push({
      handle: m.handle,
      name: m.name,
      category: "media",
      priority: m.priority as "high" | "medium" | "low",
      followOrder: 0,
      engagementTip: m.engagementTip,
      preFollowActions: [
        "Like 2-3 recent posts",
        "Review their content format to understand what they feature",
      ],
      postFollowActions: [
        "Tag them in highlight clips and milestone posts",
        "Submit content for features when applicable",
        "Use their hashtags to increase visibility",
      ],
    });
  }

  // Camp/showcase accounts
  const camps = getTargetsByType("camp");
  for (const camp of camps) {
    targets.push({
      handle: camp.handle,
      name: camp.name,
      category: "camp",
      priority: camp.priority as "high" | "medium" | "low",
      followOrder: 0,
      engagementTip: camp.engagementTip,
      preFollowActions: [
        "Like 2-3 recent posts",
        "Check their upcoming event schedule",
      ],
      postFollowActions: [
        "Register for events and tag them in pre-camp posts",
        "Post recaps after attending and tag them for features",
        "Engage with their top performer lists",
      ],
    });
  }

  // Sort: high priority first
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  targets.sort(
    (a, b) =>
      (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
  );

  targets.forEach((t, i) => {
    t.followOrder = i + 1;
  });

  return {
    phase: "phase_4_media_camps",
    phaseName: "Phase 4: Media & Camp Accounts",
    description:
      "Follow media outlets and camp/showcase accounts. These amplify your content to a broader audience including coaches who follow them. Tag them in posts for feature opportunities.",
    targets,
    totalTargets: targets.length,
    estimatedDays: Math.ceil(targets.length / DAILY_FOLLOW_LIMIT),
    dailyFollowLimit: DAILY_FOLLOW_LIMIT,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate all 4 phases of follow campaigns.
 *
 * Follow strategy order (from X Playbook):
 *   1) Follow 18 target school official accounts
 *   2) OL/recruiting staff at each school + analysts + OL specialists
 *   3) Peer Class of 2029 OL in Midwest + active competitors
 *   4) Media/services + camp accounts
 */
export function generateFollowCampaigns(): FollowCampaign[] {
  return [buildPhase1(), buildPhase2(), buildPhase3(), buildPhase4()];
}

/**
 * Get the next batch of people to follow today.
 *
 * Returns up to `batchSize` targets (max 15/day to avoid X rate limits).
 * Prioritization:
 *   - Tier 3 schools first (quick engagement wins)
 *   - Then Tier 2 schools
 *   - Then analysts and OL specialists
 *   - Then peers/competitors
 *   - Then media/camps
 *
 * Schools with high OL need are boosted in priority since coaches at those
 * schools are more likely to follow back.
 */
export function getNextFollowBatch(
  batchSize: number = DAILY_FOLLOW_LIMIT
): FollowCampaignTarget[] {
  const effectiveBatchSize = Math.min(batchSize, DAILY_FOLLOW_LIMIT);
  const campaigns = generateFollowCampaigns();

  // Flatten all targets across phases, preserving phase order
  const allTargets: FollowCampaignTarget[] = [];
  for (const campaign of campaigns) {
    allTargets.push(...campaign.targets);
  }

  // Apply high-need school boost to school-related targets
  const highNeedIds = new Set(getHighNeedSchools().map((s) => s.schoolId));
  for (const target of allTargets) {
    if (target.category === "school_official" || target.category === "head_coach" || target.category === "ol_coach" || target.category === "recruiting_coordinator") {
      // Find the school ID for this target
      const matchingSchool = targetSchools.find(
        (s) => s.name === target.school
      );
      if (matchingSchool && highNeedIds.has(matchingSchool.id)) {
        target.priority = boostPriorityForNeed(
          target.priority,
          matchingSchool.id
        );
      }
    }
  }

  // Return the first batch (targets are already sorted by priority within each phase,
  // and phases are ordered strategically)
  return allTargets.slice(0, effectiveBatchSize);
}

/**
 * Get a summary of the entire follow campaign.
 */
export function getFollowCampaignSummary(): {
  totalTargets: number;
  byCategory: Record<string, number>;
  byPhase: { phase: string; phaseName: string; count: number; days: number }[];
  estimatedTotalDays: number;
  dailyFollowLimit: number;
  highNeedSchoolCount: number;
  activeCompetitorCount: number;
  athlete: {
    name: string;
    position: string;
    classYear: number;
    school: string;
  };
} {
  const campaigns = generateFollowCampaigns();

  const byCategory: Record<string, number> = {};
  let totalTargets = 0;

  for (const campaign of campaigns) {
    for (const target of campaign.targets) {
      byCategory[target.category] = (byCategory[target.category] ?? 0) + 1;
      totalTargets++;
    }
  }

  const byPhase = campaigns.map((c) => ({
    phase: c.phase,
    phaseName: c.phaseName,
    count: c.totalTargets,
    days: c.estimatedDays,
  }));

  const estimatedTotalDays = campaigns.reduce(
    (sum, c) => sum + c.estimatedDays,
    0
  );

  return {
    totalTargets,
    byCategory,
    byPhase,
    estimatedTotalDays,
    dailyFollowLimit: DAILY_FOLLOW_LIMIT,
    highNeedSchoolCount: getHighNeedSchools().length,
    activeCompetitorCount: getActiveCompetitors().length,
    athlete: {
      name: jacobProfile.name,
      position: jacobProfile.position,
      classYear: jacobProfile.classYear,
      school: jacobProfile.school,
    },
  };
}
