"use client";

import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-sm text-slate-500">Recruiting scorecard — follower growth, coach follows, engagement rates, and target tracking</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
