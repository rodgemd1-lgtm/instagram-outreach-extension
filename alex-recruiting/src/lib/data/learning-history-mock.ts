/**
 * Mock Learning History — 4 weeks of pre-seeded retrospectives
 *
 * Provides historical data so the outreach learnings dashboard
 * isn't empty on day 1. Covers weeks -4 through -1 leading up
 * to the current active week.
 */

export interface WeeklyRetrospective {
  week_number: number;
  week_start: string; // YYYY-MM-DD
  week_end: string; // YYYY-MM-DD
  what_worked: string[];
  what_didnt: string[];
  what_to_try: string[];
  metrics: {
    followers: number;
    posts_count: number;
    engagement_rate: number;
    dm_sent: number;
    dm_response_rate: number;
    follow_backs: number;
  };
  strategy_adjustments: string[];
  ab_test_results: Array<{ test: string; winner: string; confidence: number }>;
  generated_by: string;
}

export const learningHistoryMock: WeeklyRetrospective[] = [
  // Week -4: Cold start
  {
    week_number: -4,
    week_start: "2026-02-17",
    week_end: "2026-02-23",
    what_worked: [
      "Account created with optimized bio",
      "Profile photo with Pewaukee jersey gets attention",
    ],
    what_didnt: [
      "Zero followers — cold start problem",
      "No content to share yet",
    ],
    what_to_try: [
      "Start posting training content 3x/week",
      "Follow 10 recruiting media accounts",
    ],
    metrics: {
      followers: 0,
      posts_count: 0,
      engagement_rate: 0,
      dm_sent: 0,
      dm_response_rate: 0,
      follow_backs: 0,
    },
    strategy_adjustments: [
      "Focus on profile optimization before outreach",
    ],
    ab_test_results: [],
    generated_by: "ai",
  },

  // Week -3: First traction
  {
    week_number: -3,
    week_start: "2026-02-24",
    week_end: "2026-03-02",
    what_worked: [
      "Established posting cadence (MWF)",
      "Hashtag #RecruitJacob getting indexed",
      "First 12 followers from peer recruits",
    ],
    what_didnt: [
      "Morning posts getting low engagement",
      "Generic hashtags not driving discovery",
    ],
    what_to_try: [
      "Shift to 6pm posting time",
      "Use D3-specific hashtags",
      "Start following WIAC coaches",
    ],
    metrics: {
      followers: 12,
      posts_count: 3,
      engagement_rate: 2.1,
      dm_sent: 0,
      dm_response_rate: 0,
      follow_backs: 3,
    },
    strategy_adjustments: [
      "Move posting window to evening",
      "Replace generic hashtags with conference-specific ones",
    ],
    ab_test_results: [],
    generated_by: "ai",
  },

  // Week -2: Growing engagement
  {
    week_number: -2,
    week_start: "2026-03-03",
    week_end: "2026-03-09",
    what_worked: [
      "6pm posts getting 3x more engagement",
      "Film clips outperform text-only posts",
      "Started following WIAC coaches — 2 follow-backs already",
    ],
    what_didnt: [
      "Bench press video got 0 coach engagement",
      "Saturday posting time needs adjustment",
    ],
    what_to_try: [
      "Tag coaches in film breakdowns",
      "Reply to coach recruiting tweets",
      "A/B test DM templates",
    ],
    metrics: {
      followers: 28,
      posts_count: 7,
      engagement_rate: 3.4,
      dm_sent: 0,
      dm_response_rate: 0,
      follow_backs: 5,
    },
    strategy_adjustments: [
      "Prioritize film content over gym content",
      "Begin coach engagement via replies",
    ],
    ab_test_results: [
      { test: "Posting time: 6pm vs 8pm", winner: "6pm", confidence: 78 },
    ],
    generated_by: "ai",
  },

  // Week -1: First coach interactions
  {
    week_number: -1,
    week_start: "2026-03-10",
    week_end: "2026-03-16",
    what_worked: [
      "Coach Erickson followed back after @mention",
      "Film breakdown post got 47 impressions",
      "DM to Coach Venne got a reply",
    ],
    what_didnt: [
      "DM to Coach Erickson blocked (DMs restricted)",
      "Sunday motivation posts underperform",
    ],
    what_to_try: [
      "Use @mention strategy for coaches with restricted DMs",
      "Focus content on performance pillar — highest engagement",
      "Expand to CCIW coaches next week",
    ],
    metrics: {
      followers: 47,
      posts_count: 12,
      engagement_rate: 4.2,
      dm_sent: 3,
      dm_response_rate: 33,
      follow_backs: 8,
    },
    strategy_adjustments: [
      "Develop @mention fallback for coaches with restricted DMs",
      "Drop Sunday posting — reallocate to weekday slots",
      "Expand target list to CCIW conference",
    ],
    ab_test_results: [
      { test: "DM template: casual vs formal", winner: "casual", confidence: 65 },
      { test: "Film clips vs training photos", winner: "film_clips", confidence: 82 },
    ],
    generated_by: "ai",
  },
];
