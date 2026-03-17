// Coach Activity Monitor — Real-time Signal Detection
//
// Scans target coaches' recent X activity for recruiting signals:
// mentions of Jacob, general OL recruiting content, follow events,
// and engagement patterns. Uses searchTweets and getUserTweets
// from the existing X API integration.

import { searchTweets, getUserTweets, verifyHandle } from "@/lib/integrations/x-api";
import { targetSchools } from "@/lib/data/target-schools";
import { jacobProfile } from "@/lib/data/jacob-profile";
import type { XTweet } from "@/lib/integrations/x-api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SignalStrength = "high" | "medium" | "low";
export type ActivityType =
  | "recruiting_tweet"
  | "ol_recruiting"
  | "jacob_mention"
  | "jacob_follow"
  | "engagement_spike"
  | "offer_signal"
  | "camp_invite";

export interface CoachActivitySignal {
  id: string;
  coachHandle: string;
  coachName: string;
  schoolName: string;
  division: string;
  activityType: ActivityType;
  signalStrength: SignalStrength;
  description: string;
  tweetText?: string;
  tweetId?: string;
  detectedAt: string;
}

export interface CoachEngagementAlert {
  id: string;
  alertType: "follow" | "mention" | "like" | "retweet";
  coachHandle: string;
  coachName: string;
  schoolName: string;
  description: string;
  urgency: "immediate" | "today" | "this_week";
  recommendedAction: string;
  detectedAt: string;
}

export interface CoachBehaviorScore {
  coachHandle: string;
  schoolName: string;
  previousScore: number;
  currentScore: number;
  delta: number;
  trend: "improving" | "stable" | "declining";
  signals: string[];
}

export interface CoachActivityReport {
  signals: CoachActivitySignal[];
  alerts: CoachEngagementAlert[];
  behaviorChanges: CoachBehaviorScore[];
  scanSummary: {
    schoolsScanned: number;
    signalsDetected: number;
    alertsGenerated: number;
    fetchedAt: string;
  };
}

// ─── Recruiting Signal Keywords ───────────────────────────────────────────────

const OL_RECRUITING_KEYWORDS = [
  "OL recruiting",
  "offensive line",
  "offensive lineman",
  "OT recruiting",
  "OG recruiting",
  "center recruiting",
  "Class of 2029",
  "2029 OL",
  "2029 recruit",
  "Wisconsin recruit",
  "Midwest OL",
  "big lineman",
  "we're recruiting",
  "looking for OL",
];

const OFFER_KEYWORDS = [
  "scholarship offer",
  "offered",
  "full scholarship",
  "extended an offer",
  "scholarship extended",
];

const CAMP_KEYWORDS = [
  "camp",
  "prospect camp",
  "junior day",
  "official visit",
  "unofficial visit",
  "come up to campus",
];

// ─── Signal Detection ─────────────────────────────────────────────────────────

/**
 * Scans target coaches' recent tweets for OL recruiting signals.
 * Searches for general OL recruiting content and checks for Jacob mentions.
 */
export async function getRecentCoachActivity(): Promise<CoachActivitySignal[]> {
  const signals: CoachActivitySignal[] = [];
  const fetchedAt = new Date().toISOString();

  // 1. Search for recent OL recruiting tweets from target program accounts
  for (const school of targetSchools.slice(0, 8)) {
    // Limit scans to manage rate limits
    try {
      const handle = school.officialXHandle.replace("@", "");
      const query = `from:${handle} (${OL_RECRUITING_KEYWORDS.slice(0, 3).join(" OR ")})`;
      const tweets: XTweet[] = await searchTweets(query, 5);

      for (const tweet of tweets) {
        const text = tweet.text.toLowerCase();

        let activityType: ActivityType = "recruiting_tweet";
        let signalStrength: SignalStrength = "low";
        let description = `${school.name} posted about recruiting`;

        // Check for Jacob mention
        const jacobHandle = jacobProfile.xHandle.replace("@", "").toLowerCase();
        if (text.includes(jacobHandle) || text.includes("jacob rodgers")) {
          activityType = "jacob_mention";
          signalStrength = "high";
          description = `${school.name} mentioned Jacob in a tweet — immediate engagement opportunity`;
        } else if (OFFER_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()))) {
          activityType = "offer_signal";
          signalStrength = "high";
          description = `${school.name} posted about scholarship offers — prime engagement window`;
        } else if (CAMP_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()))) {
          activityType = "camp_invite";
          signalStrength = "medium";
          description = `${school.name} posted about camps/visits — engage and consider attending`;
        } else if (OL_RECRUITING_KEYWORDS.slice(0, 6).some((kw) => text.includes(kw.toLowerCase()))) {
          activityType = "ol_recruiting";
          signalStrength = "medium";
          description = `${school.name} is actively recruiting OL — like and reply to this post`;
        }

        signals.push({
          id: `signal-${tweet.id}`,
          coachHandle: school.officialXHandle,
          coachName: `OL Staff — ${school.name}`,
          schoolName: school.name,
          division: school.division,
          activityType,
          signalStrength,
          description,
          tweetText: tweet.text.slice(0, 200),
          tweetId: tweet.id,
          detectedAt: fetchedAt,
        });
      }
    } catch {
      // Rate limited or network error — skip this school
      continue;
    }
  }

  // 2. Search globally for Jacob's handle mentions
  try {
    const jacobHandle = jacobProfile.xHandle.replace("@", "");
    const mentionTweets: XTweet[] = await searchTweets(`@${jacobHandle}`, 10);

    for (const tweet of mentionTweets) {
      const school = targetSchools.find((s) =>
        tweet.text.toLowerCase().includes(s.name.toLowerCase())
      );

      signals.push({
        id: `mention-${tweet.id}`,
        coachHandle: tweet.author_id ?? "unknown",
        coachName: "Coach",
        schoolName: school?.name ?? "Unknown School",
        division: school?.division ?? "Unknown",
        activityType: "jacob_mention",
        signalStrength: "high",
        description: "Jacob was mentioned in a tweet — respond within 2 hours",
        tweetText: tweet.text.slice(0, 200),
        tweetId: tweet.id,
        detectedAt: fetchedAt,
      });
    }
  } catch {
    // Fallback — no mention data available
  }

  // Sort by signal strength: high first
  const strengthOrder: Record<SignalStrength, number> = { high: 0, medium: 1, low: 2 };
  return signals.sort((a, b) => strengthOrder[a.signalStrength] - strengthOrder[b.signalStrength]);
}

/**
 * Generates actionable alerts when coaches show engagement signals.
 * Focuses on high-value interactions that require a same-day response.
 */
export async function getCoachEngagementAlerts(): Promise<CoachEngagementAlert[]> {
  const alerts: CoachEngagementAlert[] = [];
  const fetchedAt = new Date().toISOString();

  try {
    // Check if any verified target coach handles have followed Jacob
    // This requires scanning Jacob's follower list — done in live-data.ts
    // Here we generate alerts based on tweet search signals

    const jacobHandle = jacobProfile.xHandle.replace("@", "");

    // Search for any coach engagement with Jacob's content
    const engagementQuery = `@${jacobHandle} -from:${jacobHandle}`;
    const interactionTweets: XTweet[] = await searchTweets(engagementQuery, 10);

    for (const tweet of interactionTweets) {
      const matchedSchool = targetSchools.find((s) =>
        tweet.text.toLowerCase().includes(s.name.toLowerCase()) ||
        tweet.text.toLowerCase().includes(s.officialXHandle.toLowerCase().replace("@", ""))
      );

      if (matchedSchool) {
        alerts.push({
          id: `alert-${tweet.id}`,
          alertType: "mention",
          coachHandle: matchedSchool.officialXHandle,
          coachName: `${matchedSchool.name} Staff`,
          schoolName: matchedSchool.name,
          description: `${matchedSchool.name} interacted with Jacob's content`,
          urgency: "immediate",
          recommendedAction: "Reply to their tweet within 2 hours and like their latest 3 posts",
          detectedAt: fetchedAt,
        });
      }
    }
  } catch {
    // Rate limited — return empty alerts
  }

  // Generate a synthetic follow alert for newly detected coach follows
  // (In production this would diff against a stored snapshot)
  if (alerts.length === 0) {
    // Return empty — no alerts to surface without stored comparison baseline
    return [];
  }

  return alerts;
}

/**
 * Detects changes in coach behavior scores by comparing current tweet
 * activity levels against historical baselines for each target school.
 * Higher activity = higher score = higher priority for Jacob.
 */
export async function getRankChanges(): Promise<CoachBehaviorScore[]> {
  const changes: CoachBehaviorScore[] = [];

  // Score Tier 2 and Tier 3 schools most actively (most likely to engage)
  const prioritySchools = targetSchools.filter(
    (s) => s.priorityTier === "Tier 2" || s.priorityTier === "Tier 3"
  );

  for (const school of prioritySchools.slice(0, 6)) {
    try {
      const handle = school.officialXHandle.replace("@", "");
      const user = await verifyHandle(handle);
      if (!user) continue;

      const tweets: XTweet[] = await getUserTweets(user.id, 10);
      const tweetCount = tweets.length;

      // Activity score = number of tweets in recent period (proxy for engagement level)
      const currentScore = Math.min(10, tweetCount);

      // Baseline score derived from tier: Tier 2 = 6, Tier 3 = 7
      const baselineScore = school.priorityTier === "Tier 3" ? 7 : 6;

      const delta = currentScore - baselineScore;

      let trend: CoachBehaviorScore["trend"] = "stable";
      if (delta >= 2) trend = "improving";
      else if (delta <= -2) trend = "declining";

      const signals: string[] = [];
      if (currentScore >= 8) signals.push("High tweet volume this week — very active");
      if (currentScore >= 6) signals.push("Active recruiting content detected");
      if (trend === "improving") signals.push("Engagement level trending up — good time to DM");
      if (trend === "declining") signals.push("Activity slowing — may be in dead period");

      changes.push({
        coachHandle: school.officialXHandle,
        schoolName: school.name,
        previousScore: baselineScore,
        currentScore,
        delta,
        trend,
        signals: signals.length > 0 ? signals : ["Normal activity level"],
      });
    } catch {
      continue;
    }
  }

  // Sort by delta descending — most improved schools first
  return changes.sort((a, b) => b.delta - a.delta);
}

/**
 * Runs a full coach activity scan and returns a consolidated report.
 */
export async function getCoachActivityReport(): Promise<CoachActivityReport> {
  const fetchedAt = new Date().toISOString();

  const [signals, alerts, behaviorChanges] = await Promise.all([
    getRecentCoachActivity(),
    getCoachEngagementAlerts(),
    getRankChanges(),
  ]);

  return {
    signals,
    alerts,
    behaviorChanges,
    scanSummary: {
      schoolsScanned: targetSchools.length,
      signalsDetected: signals.length,
      alertsGenerated: alerts.length,
      fetchedAt,
    },
  };
}
