// Coach Behavior Prediction System
// Analyzes coach X/Twitter activity, engagement patterns, and recruiting behavior
// to predict optimal outreach timing and strategy.

import type {
  CoachBehaviorProfile,
  CoachEngagementStyle,
  MonthlyActivity,
  ApproachStrategy,
  ContactWindow,
} from "../types/recruiting-intelligence";
import type { Coach, DivisionTier } from "../types";
import type { XTweet, XUser } from "../integrations/x-api";

// ============ BEHAVIOR ANALYSIS ============

// Build a coach behavior profile from their tweet history and engagement data
export function analyzeCoachBehavior(
  coach: Partial<Coach>,
  tweets: XTweet[],
  xUser: XUser | null,
  followsRecruit: boolean,
  hasRespondedToDM: boolean
): CoachBehaviorProfile {
  const engagementStyle = classifyEngagementStyle(tweets, xUser, followsRecruit, hasRespondedToDM);
  const seasonality = analyzeSeasonality(tweets);
  const peakHours = analyzePeakHours(tweets);
  const tweetFrequency = calculateTweetFrequency(tweets);
  const commonHashtags = extractCommonHashtags(tweets);
  const interactionTypes = analyzeInteractionTypes(tweets);
  const interactsWithRecruits = detectRecruitInteraction(tweets);

  const dmOpenProbability = estimateDMOpenProbability(coach, engagementStyle);
  const followBackProbability = estimateFollowBackProbability(coach, engagementStyle);

  const bestApproach = determineBestApproach(coach, engagementStyle, dmOpenProbability);
  const optimalWindow = determineOptimalContactWindow(coach, seasonality, peakHours);

  return {
    coachId: coach.id || "",
    coachName: coach.name || "",
    schoolName: coach.schoolName || "",
    division: coach.division || "",
    conference: coach.conference || "",

    avgResponseTime: hasRespondedToDM ? estimateResponseTime(engagementStyle) : null,
    dmOpenProbability,
    followBackProbability,
    engagementStyle,

    recruitingSeasonality: seasonality,
    preferredContactMethod: inferContactMethod(engagementStyle, dmOpenProbability),
    typicalOfferTimeline: getTypicalOfferTimeline(coach.division || "D1 FBS"),
    positionNeedLevel: coach.olNeedScore || 0,

    tweetFrequency,
    peakActivityHours: peakHours,
    commonHashtags,
    interactsWithRecruits,
    interactionTypes,

    bestApproachStrategy: bestApproach,
    optimalContactWindow: optimalWindow,

    lastUpdated: Date.now(),
  };
}

// ============ ENGAGEMENT STYLE CLASSIFICATION ============

function classifyEngagementStyle(
  tweets: XTweet[],
  xUser: XUser | null,
  followsRecruit: boolean,
  hasRespondedToDM: boolean
): CoachEngagementStyle {
  const tweetCount = tweets.length;
  const totalEngagement = tweets.reduce(
    (sum, t) => sum + (t.public_metrics?.like_count || 0) + (t.public_metrics?.retweet_count || 0),
    0
  );

  // Check for recruit interaction signals
  const recruitMentions = tweets.filter(
    (t) => /(?:recruit|commit|offer|class of|blessed)/i.test(t.text)
  ).length;

  const repliesGiven = tweets.filter((t) => t.text.startsWith("@")).length;
  const replyRatio = tweetCount > 0 ? repliesGiven / tweetCount : 0;

  if (hasRespondedToDM || (followsRecruit && replyRatio > 0.3)) {
    return "highly_responsive";
  }

  if (recruitMentions > tweetCount * 0.2 && replyRatio > 0.15) {
    return "selective";
  }

  if (tweetCount > 0 && replyRatio < 0.05) {
    return "broadcast_only";
  }

  if (tweetCount < 5 && !xUser?.public_metrics) {
    return "quiet_evaluator";
  }

  if (tweetCount === 0) {
    return "unknown";
  }

  return "selective";
}

// ============ TEMPORAL ANALYSIS ============

function analyzeSeasonality(tweets: XTweet[]): MonthlyActivity[] {
  const monthCounts = new Array(12).fill(0);
  const monthActions: string[][] = Array.from({ length: 12 }, () => []);

  for (const tweet of tweets) {
    if (!tweet.created_at) continue;
    const month = new Date(tweet.created_at).getMonth();
    monthCounts[month]++;

    // Categorize tweet content
    if (/offer/i.test(tweet.text)) monthActions[month].push("offers");
    if (/camp/i.test(tweet.text)) monthActions[month].push("camps");
    if (/visit/i.test(tweet.text)) monthActions[month].push("visits");
    if (/commit/i.test(tweet.text)) monthActions[month].push("commitments");
    if (/film|highlight/i.test(tweet.text)) monthActions[month].push("film_review");
    if (/game\s?day|friday/i.test(tweet.text)) monthActions[month].push("game_coverage");
  }

  const maxCount = Math.max(...monthCounts, 1);

  return monthCounts.map((count, i) => ({
    month: i + 1,
    activityLevel: Math.round((count / maxCount) * 5),
    typicalActions: [...new Set(monthActions[i])],
  }));
}

function analyzePeakHours(tweets: XTweet[]): number[] {
  const hourCounts = new Array(24).fill(0);

  for (const tweet of tweets) {
    if (!tweet.created_at) continue;
    const hour = new Date(tweet.created_at).getHours();
    hourCounts[hour]++;
  }

  const maxCount = Math.max(...hourCounts, 1);
  const threshold = maxCount * 0.5;

  return hourCounts
    .map((count, hour) => (count >= threshold ? hour : -1))
    .filter((h) => h >= 0);
}

function calculateTweetFrequency(tweets: XTweet[]): number {
  if (tweets.length < 2) return tweets.length;

  const dates = tweets
    .filter((t) => t.created_at)
    .map((t) => new Date(t.created_at).getTime())
    .sort();

  if (dates.length < 2) return tweets.length;

  const spanMs = dates[dates.length - 1] - dates[0];
  const spanWeeks = spanMs / (7 * 24 * 60 * 60 * 1000);

  return spanWeeks > 0 ? Math.round((tweets.length / spanWeeks) * 10) / 10 : tweets.length;
}

function extractCommonHashtags(tweets: XTweet[]): string[] {
  const hashtagCounts: Record<string, number> = {};

  for (const tweet of tweets) {
    const hashtags = tweet.text.match(/#\w+/g) || [];
    for (const tag of hashtags) {
      const lower = tag.toLowerCase();
      hashtagCounts[lower] = (hashtagCounts[lower] || 0) + 1;
    }
  }

  return Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);
}

function analyzeInteractionTypes(tweets: XTweet[]): ("like" | "retweet" | "reply" | "follow")[] {
  const types: Set<"like" | "retweet" | "reply" | "follow"> = new Set();

  for (const tweet of tweets) {
    if (tweet.text.startsWith("@")) types.add("reply");
    if (tweet.text.startsWith("RT @")) types.add("retweet");
  }

  // If they have any engagement, they likely also like
  if (types.size > 0) types.add("like");

  return [...types];
}

function detectRecruitInteraction(tweets: XTweet[]): boolean {
  return tweets.some(
    (t) =>
      /(?:recruit|prospect|class of 20\d{2}|commit|offer)/i.test(t.text) &&
      (t.text.startsWith("@") || t.text.includes("RT @"))
  );
}

// ============ PROBABILITY ESTIMATES ============

function estimateDMOpenProbability(
  coach: Partial<Coach>,
  style: CoachEngagementStyle
): number {
  // Base probability by division
  const divisionBase: Record<string, number> = {
    "D2": 0.8,
    "NAIA": 0.85,
    "D3": 0.7,
    "D1 FCS": 0.5,
    "D1 FBS": 0.2,
  };

  let prob = divisionBase[coach.division || ""] || 0.3;

  // Adjust by engagement style
  if (style === "highly_responsive") prob += 0.2;
  else if (style === "selective") prob += 0.05;
  else if (style === "broadcast_only") prob -= 0.1;
  else if (style === "quiet_evaluator") prob -= 0.15;

  // Known DM status
  if (coach.dmOpen === true) prob = Math.max(prob, 0.95);

  return Math.max(0, Math.min(1, Math.round(prob * 100) / 100));
}

function estimateFollowBackProbability(
  coach: Partial<Coach>,
  style: CoachEngagementStyle
): number {
  const divisionBase: Record<string, number> = {
    "D2": 0.6,
    "NAIA": 0.7,
    "D3": 0.5,
    "D1 FCS": 0.3,
    "D1 FBS": 0.1,
  };

  let prob = divisionBase[coach.division || ""] || 0.2;

  if (style === "highly_responsive") prob += 0.2;
  else if (style === "selective") prob += 0.05;

  // OL need boosts follow-back probability
  if ((coach.olNeedScore || 0) >= 4) prob += 0.1;

  return Math.max(0, Math.min(1, Math.round(prob * 100) / 100));
}

function estimateResponseTime(style: CoachEngagementStyle): number {
  // Returns estimated hours to respond
  const responseTimes: Record<CoachEngagementStyle, number> = {
    highly_responsive: 12,
    selective: 48,
    broadcast_only: 168, // 1 week
    quiet_evaluator: 336, // 2 weeks
    unknown: 72,
  };
  return responseTimes[style];
}

// ============ STRATEGY DETERMINATION ============

function determineBestApproach(
  coach: Partial<Coach>,
  style: CoachEngagementStyle,
  dmOpenProb: number
): ApproachStrategy {
  // D2/NAIA + responsive = DM first
  if (
    (coach.division === "D2" || coach.division === "NAIA") &&
    (style === "highly_responsive" || dmOpenProb > 0.7)
  ) {
    return {
      method: "dm_first",
      reasoning: `${coach.division} coaches with open DMs respond well to direct outreach`,
      steps: [
        "Follow the coach's account",
        "Like 2-3 of their recent posts over 3-5 days",
        "Send a personalized DM with Hudl link and measurables",
        "Follow up with film share if no response in 7 days",
      ],
      estimatedResponseRate: 0.6,
      timeToFirstResponse: "3-7 days",
    };
  }

  // FCS coaches = engage first, then DM
  if (coach.division === "D1 FCS") {
    return {
      method: "engage_first",
      reasoning: "FCS coaches prefer to see organic engagement before DM",
      steps: [
        "Follow the coach and school football account",
        "Engage with their content for 2-3 weeks (likes, genuine replies)",
        "Share relevant film/training content and tag the school",
        "Send DM after establishing familiarity",
      ],
      estimatedResponseRate: 0.35,
      timeToFirstResponse: "2-4 weeks",
    };
  }

  // FBS coaches = camp invite + film share
  if (coach.division === "D1 FBS") {
    return {
      method: "camp_invite",
      reasoning: "D1 FBS coaches evaluate through camps and film; direct DMs rarely work",
      steps: [
        "Follow coach and school accounts",
        "Register for the school's prospect camp",
        "Post about attending and tag the school",
        "Have high school coach send film and recommendation",
        "Send a thank-you DM after camp attendance",
      ],
      estimatedResponseRate: 0.15,
      timeToFirstResponse: "After camp attendance",
    };
  }

  // Default = engage first
  return {
    method: "engage_first",
    reasoning: "Standard approach: build visibility through engagement, then reach out",
    steps: [
      "Follow the coach's account",
      "Engage with their content regularly",
      "Share film and training content",
      "Send a personalized DM after 2 weeks of engagement",
    ],
    estimatedResponseRate: 0.3,
    timeToFirstResponse: "2-3 weeks",
  };
}

function determineOptimalContactWindow(
  coach: Partial<Coach>,
  seasonality: MonthlyActivity[],
  peakHours: number[]
): ContactWindow {
  // Find months with highest activity
  const sortedMonths = [...seasonality].sort((a, b) => b.activityLevel - a.activityLevel);
  const bestMonths = sortedMonths.slice(0, 4).map((m) => m.month);

  // Default peak days (Tuesday-Thursday are best for coach DMs)
  const bestDays = [2, 3, 4]; // Tue, Wed, Thu

  // Use peak hours from data, or default to morning/early afternoon
  const bestHours = peakHours.length > 0 ? peakHours : [8, 9, 10, 11, 14, 15];

  // Build reasoning
  const reasonParts: string[] = [];

  if (coach.division === "D1 FBS" || coach.division === "D1 FCS") {
    reasonParts.push("Avoid dead period (late June-July) and game weeks (Friday-Saturday)");
  }

  if (bestMonths.includes(1) || bestMonths.includes(2)) {
    reasonParts.push("High activity in January/February (NSD period)");
  }

  if (bestMonths.includes(6) || bestMonths.includes(7)) {
    reasonParts.push("Active during summer camp season (June-July)");
  }

  reasonParts.push(`Peak activity hours: ${bestHours.map((h) => `${h}:00`).join(", ")}`);

  return {
    bestMonths,
    bestDayOfWeek: bestDays,
    bestHourOfDay: bestHours,
    reasoning: reasonParts.join(". ") + ".",
  };
}

function inferContactMethod(
  style: CoachEngagementStyle,
  dmOpenProb: number
): "dm" | "reply" | "camp_invite" | "unknown" {
  if (dmOpenProb > 0.7 && style === "highly_responsive") return "dm";
  if (style === "broadcast_only") return "reply";
  if (style === "quiet_evaluator") return "camp_invite";
  if (dmOpenProb > 0.5) return "dm";
  return "unknown";
}

function getTypicalOfferTimeline(division: string): string {
  const timelines: Record<string, string> = {
    "D1 FBS": "Junior spring through senior fall. Elite prospects: sophomore summer.",
    "D1 FCS": "Junior year. Active recruiting starts sophomore spring.",
    "D2": "Junior/senior year. Some programs offer sophomores.",
    "D3": "Senior year spring. No athletic scholarships but early interest.",
    "NAIA": "Senior year spring. Some programs recruit juniors.",
  };
  return timelines[division] || "Varies by program";
}

// ============ BATCH ANALYSIS ============

// Analyze multiple coaches and rank by predicted response likelihood
export function rankCoachesByResponseLikelihood(
  profiles: CoachBehaviorProfile[]
): CoachBehaviorProfile[] {
  return [...profiles].sort((a, b) => {
    // Composite score: DM open probability + follow-back probability + engagement style weight
    const styleWeights: Record<CoachEngagementStyle, number> = {
      highly_responsive: 1.0,
      selective: 0.6,
      broadcast_only: 0.3,
      quiet_evaluator: 0.2,
      unknown: 0.4,
    };

    const scoreA = a.dmOpenProbability * 0.4 + a.followBackProbability * 0.3 + styleWeights[a.engagementStyle] * 0.3;
    const scoreB = b.dmOpenProbability * 0.4 + b.followBackProbability * 0.3 + styleWeights[b.engagementStyle] * 0.3;

    return scoreB - scoreA;
  });
}

// Get actionable insights for a specific coach
export function getCoachInsights(profile: CoachBehaviorProfile): string[] {
  const insights: string[] = [];

  if (profile.dmOpenProbability > 0.7) {
    insights.push(`DMs likely open (${Math.round(profile.dmOpenProbability * 100)}% probability)`);
  }

  if (profile.followBackProbability > 0.5) {
    insights.push(`High follow-back likelihood (${Math.round(profile.followBackProbability * 100)}%)`);
  }

  if (profile.engagementStyle === "highly_responsive") {
    insights.push("This coach actively engages with recruits on X");
  }

  if (profile.positionNeedLevel >= 4) {
    insights.push(`High OL need (${profile.positionNeedLevel}/5) — strong position match`);
  }

  if (profile.bestApproachStrategy.method === "dm_first") {
    insights.push(`Recommended: Send DM directly. Expected response: ${profile.bestApproachStrategy.timeToFirstResponse}`);
  } else if (profile.bestApproachStrategy.method === "camp_invite") {
    insights.push("Recommended: Attend a camp before DM outreach");
  }

  if (profile.optimalContactWindow.bestMonths.length > 0) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const bestMonthNames = profile.optimalContactWindow.bestMonths.map((m) => monthNames[m - 1]);
    insights.push(`Best months to reach out: ${bestMonthNames.join(", ")}`);
  }

  return insights;
}
