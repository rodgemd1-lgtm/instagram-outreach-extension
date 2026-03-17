import { NextResponse } from "next/server";

export async function GET() {
  // Real-time monitoring data — populated by Amplify + X API
  return NextResponse.json({
    alerts: [],
    recentFollows: [],
    recentEngagements: [],
    trendingHashtags: [],
    lastUpdated: new Date().toISOString(),
    status: "Monitoring configured — waiting for account setup",
  });
}
