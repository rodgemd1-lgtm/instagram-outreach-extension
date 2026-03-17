"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";

export default function FollowerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <SCButton variant="ghost" size="sm" onClick={() => router.push("/connections")}>
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Connections
      </SCButton>

      {/* Profile Header */}
      <div className="flex items-start gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-sc-border bg-white/5 rotate-3">
          <span className="text-2xl font-black text-white/40">
            {id.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <SCPageHeader
            title={`@${id}`}
            subtitle="Follower Profile"
          />
          <div className="mt-2 flex gap-2">
            <SCBadge variant="default">Follower</SCBadge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Interaction Radar placeholder */}
        <SCGlassCard className="p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Interaction Radar</p>
          <div className="space-y-3">
            {[
              { label: "Posting", value: 40 },
              { label: "Engagement", value: 60 },
              { label: "Recruiting", value: 20 },
              { label: "Responsiveness", value: 50 },
              { label: "Visibility", value: 30 },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-mono text-white">{item.value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sc-primary/70 transition-all duration-700"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SCGlassCard>

        {/* Interaction Feed */}
        <SCGlassCard className="p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Interaction History</p>
          <p className="text-sm text-slate-500">
            No interaction data available yet for @{id}.
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Follow, like, or engage with this account to build interaction data.
          </p>
        </SCGlassCard>
      </div>
    </div>
  );
}
