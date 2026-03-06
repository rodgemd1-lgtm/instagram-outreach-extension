"use client";

import { CompetitorMap } from "@/components/competitor-map";

export default function CompetitorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Competitor Tracking</h1>
        <p className="text-sm text-slate-500">Monitor 2029 OL recruits in the Wisconsin/Midwest region — follower growth, posting cadence, engagement</p>
      </div>
      <CompetitorMap />
    </div>
  );
}
