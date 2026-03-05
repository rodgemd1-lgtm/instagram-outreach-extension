"use client";

import { DMCampaign } from "@/components/dm-campaign";

export default function DMsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">DM Campaigns</h1>
        <p className="text-sm text-slate-500">Personalized DM campaigns by tier — Tier 3 first, then FCS, then MAC, then Big Ten</p>
      </div>
      <DMCampaign />
    </div>
  );
}
