import { NextResponse } from "next/server";
import type { AnalyticsSnapshot } from "@/lib/types";

// Sample analytics data — will be populated from X API + Amplify
const sampleAnalytics: AnalyticsSnapshot[] = [
  {
    date: new Date().toISOString(),
    totalFollowers: 0,
    coachFollows: 0,
    dmsSent: 0,
    dmResponseRate: 0,
    postsPublished: 0,
    avgEngagementRate: 0,
    profileVisits: 0,
    auditScore: 0,
  },
];

// Target metrics from Appendix B
const targets = {
  month1: { followers: 50, coachFollows: 5, dmsSent: 5, dmResponseRate: 20, posts: 16, engagementRate: 3, profileVisits: 100, auditScore: 7 },
  month3: { followers: 200, coachFollows: 20, dmsSent: 15, dmResponseRate: 30, posts: 60, engagementRate: 5, profileVisits: 500, auditScore: 8 },
  month6: { followers: 500, coachFollows: 40, dmsSent: 30, dmResponseRate: 40, posts: 120, engagementRate: 7, profileVisits: 2000, auditScore: 9 },
};

export async function GET() {
  return NextResponse.json({
    current: sampleAnalytics[sampleAnalytics.length - 1],
    history: sampleAnalytics,
    targets,
  });
}
