// Engagement Strategy — Daily engagement plans, action tracking, and ROI measurement
// Powers the "growth engine" by scheduling who to engage with and how

import { db, isDbConfigured } from "@/lib/db";
import { engagementActions } from "@/lib/db/schema";
import { gte, desc } from "drizzle-orm";
import {
  getTargetsByType,
  type ScraperTarget,
  type TargetType,
} from "@/lib/data/scraper-targets";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EngagementActionType =
  | "like"
  | "reply"
  | "retweet"
  | "quote_tweet"
  | "follow"
  | "dm";

export interface EngagementAction {
  id: string;
  targetHandle: string;
  targetCategory: string;
  actionType: EngagementActionType;
  content?: string; // for reply/quote tweet, the text used
  resultFollowerGain?: number; // populated later when auditing
  createdAt: string;
}

export interface DailyEngagementItem {
  targetHandle: string;
  targetName: string;
  targetCategory: string;
  followerCount: number;
  priority: "high" | "medium" | "low";
  suggestedActions: SuggestedAction[];
  engagementTip: string;
  rationale: string; // why this account today
}

export interface SuggestedAction {
  action: EngagementActionType;
  description: string;
  suggestedContent?: string;
  effort: "low" | "medium" | "high"; // how much work this takes
  expectedImpact: string;
}

export interface EngagementROIEntry {
  period: string;
  actionType: EngagementActionType;
  targetCategory: string;
  actionsPerformed: number;
  estimatedFollowerGain: number;
  roi: number; // followers gained per action
}

export interface TrackActionInput {
  targetHandle: string;
  targetCategory?: string;
  actionType: EngagementActionType;
  content?: string;
  resultFollowerGain?: number;
}

// ---------------------------------------------------------------------------
// In-memory fallback store
// ---------------------------------------------------------------------------

const inMemoryActions: EngagementAction[] = [];

// Engagement rotation — ensures coverage across all categories
// Weights: coaches first, then analysts, OL specialists, media, camps, peers
const DAILY_ROTATION: { type: TargetType; count: number; label: string }[] = [
  { type: "analyst", count: 4, label: "Recruiting Analysts" },
  { type: "ol_specialist", count: 3, label: "OL Specialists" },
  { type: "camp", count: 3, label: "Camp Accounts" },
  { type: "media", count: 3, label: "Media Accounts" },
  { type: "peer_recruit", count: 3, label: "Peer Recruits" },
  { type: "recruiting_service", count: 2, label: "Recruiting Services" },
];

// Day-of-week rotation ensures we don't spam the same accounts every day
function getDayRotationOffset(): number {
  return new Date().getDay(); // 0=Sunday
}

// ---------------------------------------------------------------------------
// getDailyEngagementPlan — 10–20 accounts to engage with today + actions
// ---------------------------------------------------------------------------

export async function getDailyEngagementPlan(): Promise<{
  date: string;
  totalAccounts: number;
  estimatedTimeMinutes: number;
  items: DailyEngagementItem[];
  dailyGoal: string;
  strategicFocus: string;
}> {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayOffset = getDayRotationOffset();
  const items: DailyEngagementItem[] = [];

  // Get already-engaged handles in the past 3 days to avoid repetition
  const recentlyEngaged = await getRecentlyEngagedHandles(3);

  for (const rotation of DAILY_ROTATION) {
    const typeTargets = getTargetsByType(rotation.type).filter(
      (t) => !recentlyEngaged.has(t.handle)
    );

    // Rotate which targets we pick each day
    const rotatedTargets = rotateArray(typeTargets, dayOffset);
    const selected = rotatedTargets.slice(0, rotation.count);

    for (const target of selected) {
      items.push(buildEngagementItem(target, dayOfWeek));
    }
  }

  // Sort: high priority first, then by follower count (reach)
  items.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) return order[a.priority] - order[b.priority];
    return b.followerCount - a.followerCount;
  });

  const capped = items.slice(0, 18); // Max 18 to keep it actionable

  const strategicFocus = getDailyStrategicFocus(dayOfWeek);
  const estimatedTimeMinutes = capped.reduce((sum, item) => {
    const effortMap = { high: 5, medium: 3, low: 2 };
    const maxEffort = Math.max(
      ...item.suggestedActions.map((a) => effortMap[a.effort])
    );
    return sum + maxEffort;
  }, 0);

  return {
    date: today.toISOString().split("T")[0],
    totalAccounts: capped.length,
    estimatedTimeMinutes,
    items: capped,
    dailyGoal: "Build authentic relationships with recruiting decision makers — quality engagement beats volume.",
    strategicFocus,
  };
}

// ---------------------------------------------------------------------------
// trackEngagementAction — Log what was done
// ---------------------------------------------------------------------------

export async function trackEngagementAction(
  action: TrackActionInput
): Promise<EngagementAction> {
  const now = new Date();

  if (isDbConfigured()) {
    const [row] = await db
      .insert(engagementActions)
      .values({
        targetHandle: action.targetHandle,
        targetCategory: action.targetCategory ?? "general",
        actionType: action.actionType,
        content: action.content ?? null,
        resultFollowerGain: action.resultFollowerGain ?? null,
        createdAt: now,
      })
      .returning();

    return {
      id: row.id,
      targetHandle: row.targetHandle,
      targetCategory: row.targetCategory ?? "general",
      actionType: row.actionType as EngagementActionType,
      content: row.content ?? undefined,
      resultFollowerGain: row.resultFollowerGain ?? undefined,
      createdAt: row.createdAt?.toISOString() ?? now.toISOString(),
    };
  }

  const record: EngagementAction = {
    id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    targetHandle: action.targetHandle,
    targetCategory: action.targetCategory ?? "general",
    actionType: action.actionType,
    content: action.content,
    resultFollowerGain: action.resultFollowerGain,
    createdAt: now.toISOString(),
  };
  inMemoryActions.push(record);
  return record;
}

// ---------------------------------------------------------------------------
// measureEngagementROI — Which activities drove the most follower growth
// ---------------------------------------------------------------------------

export async function measureEngagementROI(): Promise<{
  byActionType: EngagementROIEntry[];
  byCategory: EngagementROIEntry[];
  topPerforming: string[];
  insights: string[];
}> {
  let actions: EngagementAction[] = [];

  if (isDbConfigured()) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const rows = await db
        .select()
        .from(engagementActions)
        .where(gte(engagementActions.createdAt, thirtyDaysAgo))
        .orderBy(desc(engagementActions.createdAt));

      actions = rows.map((r) => ({
        id: r.id,
        targetHandle: r.targetHandle,
        targetCategory: r.targetCategory ?? "general",
        actionType: r.actionType as EngagementActionType,
        content: r.content ?? undefined,
        resultFollowerGain: r.resultFollowerGain ?? undefined,
        createdAt: r.createdAt?.toISOString() ?? "",
      }));
    } catch (err) {
      console.error("[Engagement ROI] DB error:", err);
    }
  } else {
    actions = [...inMemoryActions];
  }

  // Group by action type
  const actionTypeGroups = groupBy(actions, (a) => a.actionType);
  const byActionType: EngagementROIEntry[] = Object.entries(actionTypeGroups).map(
    ([type, acts]) => {
      const totalGain = acts.reduce(
        (sum, a) => sum + (a.resultFollowerGain ?? 0),
        0
      );
      return {
        period: "last_30_days",
        actionType: type as EngagementActionType,
        targetCategory: "all",
        actionsPerformed: acts.length,
        estimatedFollowerGain: totalGain,
        roi: acts.length > 0 ? parseFloat((totalGain / acts.length).toFixed(2)) : 0,
      };
    }
  );

  // Group by category
  const categoryGroups = groupBy(actions, (a) => a.targetCategory);
  const byCategory: EngagementROIEntry[] = Object.entries(categoryGroups).map(
    ([cat, acts]) => {
      const totalGain = acts.reduce(
        (sum, a) => sum + (a.resultFollowerGain ?? 0),
        0
      );
      return {
        period: "last_30_days",
        actionType: "like", // mixed
        targetCategory: cat,
        actionsPerformed: acts.length,
        estimatedFollowerGain: totalGain,
        roi: acts.length > 0 ? parseFloat((totalGain / acts.length).toFixed(2)) : 0,
      };
    }
  );

  // Top performing action types
  const topPerforming = byActionType
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 3)
    .map((e) => `${e.actionType} (${e.roi} followers/action)`);

  const insights = buildROIInsights(byActionType, byCategory, actions.length);

  return { byActionType, byCategory, topPerforming, insights };
}

// ---------------------------------------------------------------------------
// getRecentlyEngagedHandles — Avoid hammering the same accounts
// ---------------------------------------------------------------------------

async function getRecentlyEngagedHandles(daysCutoff: number): Promise<Set<string>> {
  const handles = new Set<string>();
  const cutoff = new Date(Date.now() - daysCutoff * 24 * 60 * 60 * 1000);

  if (isDbConfigured()) {
    try {
      const rows = await db
        .select()
        .from(engagementActions)
        .where(gte(engagementActions.createdAt, cutoff));
      rows.forEach((r) => handles.add(r.targetHandle));
    } catch {
      // fall through to empty set
    }
  } else {
    inMemoryActions
      .filter((a) => new Date(a.createdAt) >= cutoff)
      .forEach((a) => handles.add(a.targetHandle));
  }

  return handles;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildEngagementItem(
  target: ScraperTarget,
  dayOfWeek: number
): DailyEngagementItem {
  const suggestedActions = buildSuggestedActions(target, dayOfWeek);

  const rationales: Record<string, string> = {
    analyst: "Recruiting analysts amplify athlete profiles to coaches — consistent engagement builds recognition.",
    ol_specialist: "OL specialists validate Jacob's technique development. Their engagement signals credibility to coaches.",
    camp: "Camp accounts reach coaches directly. Tagging them in training content is a high-ROI touchpoint.",
    media: "Media engagement drives organic discovery from coach and analyst audiences.",
    peer_recruit: "Peer recruit networks create mutual visibility. Coaches track clusters of active recruits.",
    recruiting_service: "Recruiting services like NCSA and Hudl feature athletes who engage with their content.",
  };

  return {
    targetHandle: target.handle,
    targetName: target.name,
    targetCategory: target.type,
    followerCount: target.followers,
    priority: target.priority,
    suggestedActions,
    engagementTip: target.engagementTip,
    rationale: rationales[target.type] ?? "Relevant audience for Jacob's recruiting journey.",
  };
}

function buildSuggestedActions(
  target: ScraperTarget,
  dayOfWeek: number
): SuggestedAction[] {
  const actions: SuggestedAction[] = [];

  // Always suggest a like on recent content — lowest friction
  actions.push({
    action: "like",
    description: `Like their most recent post about recruiting or ${target.type === "ol_specialist" ? "OL technique" : "football"}.`,
    effort: "low",
    expectedImpact: "Adds Jacob to their notifications — recognition building.",
  });

  // Type-specific actions
  if (target.type === "analyst" || target.type === "recruiting_service") {
    actions.push({
      action: "reply",
      description: "Reply to their most recent recruiting content with a genuine, non-promotional observation.",
      suggestedContent: "Add value — share a perspective on the recruit class, regional talent, or position trends.",
      effort: "medium",
      expectedImpact: "Analysts notice engaged athletes — can lead to features and shoutouts.",
    });
  }

  if (target.type === "ol_specialist") {
    actions.push({
      action: "reply",
      description: "Comment on their technique breakdown with a question or affirmation from personal experience.",
      suggestedContent: "e.g., 'Working on this exact drill at practice — the hand placement tip really clicked for me.'",
      effort: "medium",
      expectedImpact: "OL specialists engage back with athletes who demonstrate coachability.",
    });
  }

  if (target.type === "camp" && (dayOfWeek === 1 || dayOfWeek === 2)) {
    // Monday/Tuesday — good time to engage camp content before the week builds
    actions.push({
      action: "retweet",
      description: "Retweet their camp announcement or highlight reel with a comment about competing there.",
      effort: "low",
      expectedImpact: "Camp accounts often repost athletes who engage — multiplies reach.",
    });
  }

  if (target.type === "peer_recruit" && target.priority === "high") {
    actions.push({
      action: "reply",
      description: "Leave a genuine supportive comment on their most recent highlight or update post.",
      suggestedContent: "e.g., 'Big week for you — keep grinding. See you on the field.'",
      effort: "low",
      expectedImpact: "Builds mutual support network — their followers see Jacob's name.",
    });
  }

  if (target.followers > 50000) {
    actions.push({
      action: "quote_tweet",
      description: "Quote tweet their high-performing content with Jacob's perspective added.",
      suggestedContent: "Add a personal angle — how this applies to Jacob's development or recruiting journey.",
      effort: "high",
      expectedImpact: "Quote tweets reach both audiences — high-leverage when the original post is viral.",
    });
  }

  return actions;
}

function getDailyStrategicFocus(dayOfWeek: number): string {
  const focuses: Record<number, string> = {
    0: "Sunday — lighter engagement day. Focus on quality replies to high-value analysts and OL specialists.", // Sunday
    1: "Monday — set the week's tone. Engage with camp announcements and recruiting analyst content.", // Monday
    2: "Tuesday — peak coach activity day. Prioritize content that puts Jacob's film and measurables in front of coaches.", // Tuesday
    3: "Wednesday — mid-week momentum. Double down on OL specialist and recruiting service engagement.", // Wednesday
    4: "Thursday — pre-game week engagement. React to recruiting news and peer recruit content to build community.", // Thursday
    5: "Friday — game day energy. Post and engage around Friday night football. Tag local media accounts.", // Friday
    6: "Saturday — film and recap day. Tag camp accounts in training content and share weekend highlight clips.", // Saturday
  };

  return focuses[dayOfWeek] ?? "Standard engagement rotation across all categories.";
}

function rotateArray<T>(arr: T[], offset: number): T[] {
  if (arr.length === 0) return arr;
  const n = offset % arr.length;
  return [...arr.slice(n), ...arr.slice(0, n)];
}

function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

function buildROIInsights(
  byActionType: EngagementROIEntry[],
  byCategory: EngagementROIEntry[],
  totalActions: number
): string[] {
  const insights: string[] = [];

  if (totalActions === 0) {
    insights.push("No engagement actions tracked yet — start logging your daily engagement to build ROI data.");
    return insights;
  }

  const topAction = byActionType.sort((a, b) => b.roi - a.roi)[0];
  if (topAction) {
    insights.push(`${topAction.actionType} actions have the highest ROI — ${topAction.roi} followers per action on average.`);
  }

  const topCategory = byCategory.sort((a, b) => b.roi - a.roi)[0];
  if (topCategory) {
    insights.push(`Engaging with ${topCategory.targetCategory} accounts drives the most follower growth (${topCategory.roi} followers/action).`);
  }

  if (totalActions >= 20) {
    insights.push(`${totalActions} actions tracked this month — strong data foundation for optimizing strategy.`);
  } else {
    insights.push(`${totalActions} actions tracked. Log at least 30 actions to generate statistically meaningful ROI data.`);
  }

  return insights;
}
