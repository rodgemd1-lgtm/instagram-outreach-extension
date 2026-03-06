import type { CompetitorRecruit } from "../types";

export interface CompetitorComparison {
  metric: string;
  jacob: string | number;
  competitor: string | number;
  advantage: "jacob" | "competitor" | "even";
}

export function compareWithCompetitor(
  competitor: CompetitorRecruit
): CompetitorComparison[] {
  return [
    {
      metric: "Follower Count",
      jacob: 0, // Will be populated from X API
      competitor: competitor.followerCount,
      advantage: 0 > competitor.followerCount ? "jacob" : competitor.followerCount > 0 ? "competitor" : "even",
    },
    {
      metric: "Post Cadence (per week)",
      jacob: 0,
      competitor: competitor.postCadence,
      advantage: "even",
    },
    {
      metric: "Engagement Rate",
      jacob: 0,
      competitor: competitor.engagementRate,
      advantage: "even",
    },
    {
      metric: "Height/Weight",
      jacob: "6'4\" 285",
      competitor: `${competitor.height} ${competitor.weight}`,
      advantage: "even",
    },
    {
      metric: "Class Year",
      jacob: 2029,
      competitor: competitor.classYear,
      advantage: "even",
    },
  ];
}

export function getCompetitorInsights(competitors: CompetitorRecruit[]): string[] {
  const insights: string[] = [];

  if (competitors.length === 0) return ["No competitor data available yet. Run competitor discovery to populate."];

  const avgFollowers = competitors.reduce((sum, c) => sum + c.followerCount, 0) / competitors.length;
  insights.push(`Average competitor follower count: ${Math.round(avgFollowers)}`);

  const avgCadence = competitors.reduce((sum, c) => sum + c.postCadence, 0) / competitors.length;
  insights.push(`Average posting cadence: ${avgCadence.toFixed(1)} posts/week`);

  const avgEngagement = competitors.reduce((sum, c) => sum + c.engagementRate, 0) / competitors.length;
  insights.push(`Average engagement rate: ${avgEngagement.toFixed(1)}%`);

  // Identify top content types across competitors
  const contentTypeCounts: Record<string, number> = {};
  for (const c of competitors) {
    for (const type of c.topContentTypes) {
      contentTypeCounts[type] = (contentTypeCounts[type] || 0) + 1;
    }
  }
  const topTypes = Object.entries(contentTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);
  if (topTypes.length > 0) {
    insights.push(`Most common content types among competitors: ${topTypes.join(", ")}`);
  }

  return insights;
}
