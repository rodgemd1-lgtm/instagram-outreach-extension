"use client";

import { useEffect, useState } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCBadge } from "@/components/sc/sc-badge";

export default function DashboardAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/coaches").then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch("/api/posts").then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ])
      .then(([analyticsData, coachData, postData]) => {
        setAnalytics(analyticsData);
        const c = Array.isArray(coachData) ? coachData : coachData?.coaches || [];
        setCoaches(c);
        const p = Array.isArray(postData) ? postData : postData?.posts || [];

        const acts: any[] = [];
        c.slice(0, 5).forEach((coach: any, i: number) => {
          if (coach.followStatus) {
            acts.push({
              id: `follow-${i}`,
              type: "follow",
              description: `Followed ${coach.name} at ${coach.schoolName}`,
              timestamp: coach.updatedAt || coach.createdAt || new Date().toISOString(),
            });
          }
        });
        p.slice(0, 5).forEach((post: any, i: number) => {
          acts.push({
            id: `post-${i}`,
            type: "post",
            description: `Published: "${(post.content || post.caption || "").slice(0, 50)}..."`,
            timestamp: post.createdAt || post.date || new Date().toISOString(),
          });
        });
        acts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(acts.slice(0, 10));
      })
      .finally(() => setLoading(false));
  }, []);

  const totalCoaches = coaches.length;
  const followed = coaches.filter(
    (c: any) => c.followStatus === "following" || c.followStatus === "followed" || c.followStatus === "followed_back"
  ).length;
  const dmd = coaches.filter(
    (c: any) => c.dmStatus === "sent" || c.dmStatus === "responded" || c.dmStatus === "no_response"
  ).length;
  const replied = coaches.filter((c: any) => c.dmStatus === "responded").length;

  const funnelStages = [
    { label: "Total Coaches", count: totalCoaches },
    { label: "Followed", count: followed },
    { label: "DM Sent", count: dmd },
    { label: "Replied", count: replied },
  ];

  return (
    <div className="space-y-8">
      <SCPageHeader
        title="ANALYTICS"
        subtitle="Real-time recruiting progression metrics"
        kicker="Pipeline Intel"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SCStatCard
          label="Profile Views"
          value={analytics?.current?.profileVisits != null ? String(analytics.current.profileVisits) : "--"}
          icon="visibility"
        />
        <SCStatCard
          label="Engagement Rate"
          value={
            analytics?.current?.avgEngagementRate
              ? `${analytics.current.avgEngagementRate}%`
              : "--"
          }
          icon="trending_up"
        />
        <SCStatCard
          label="Coach Responses"
          value={replied > 0 ? String(replied) : "--"}
          icon="mail"
        />
        <SCStatCard
          label="Total Coaches"
          value={totalCoaches > 0 ? String(totalCoaches) : "--"}
          icon="group"
        />
      </div>

      {/* Pipeline Funnel */}
      <SCGlassCard className="overflow-hidden">
        <div className="px-6 py-4 border-b border-sc-border flex items-center gap-3">
          <span className="material-symbols-outlined text-sc-primary">funnel_chart</span>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            Recruiting Pipeline
          </h2>
        </div>
        <div className="p-6">
          {totalCoaches > 0 ? (
            <div className="flex items-end gap-3 h-40">
              {funnelStages.map((stage, i) => {
                const maxCount = Math.max(...funnelStages.map((s) => s.count), 1);
                const height = Math.max(20, (stage.count / maxCount) * 100);
                return (
                  <div key={stage.label} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-lg font-black text-white">{stage.count}</span>
                    <div
                      className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${height}%`,
                        backgroundColor:
                          i === 0
                            ? "rgba(255,255,255,0.1)"
                            : i === 1
                              ? "rgba(59,130,246,0.5)"
                              : i === 2
                                ? "rgba(245,158,11,0.5)"
                                : "rgba(22,163,74,0.5)",
                      }}
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-[40px] text-slate-600 block mb-3">group</span>
              <p className="text-sm font-medium text-slate-400">Empty pipeline</p>
              <p className="text-xs text-slate-600 mt-1">Add targets to view funnel metrics</p>
            </div>
          )}
        </div>
      </SCGlassCard>

      {/* Activity Log */}
      <SCGlassCard className="overflow-hidden">
        <div className="px-6 py-4 border-b border-sc-border flex items-center gap-3">
          <span className="material-symbols-outlined text-sc-primary">timeline</span>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            Activity Log
          </h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-1/4 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="divide-y divide-sc-border">
            {activities.map((item) => (
              <div key={item.id} className="px-6 py-3 flex items-center gap-3 hover:bg-sc-primary/5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-slate-500">
                    {item.type === "follow" ? "person_add" : "article"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.description}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[32px] text-slate-600 block mb-2">timeline</span>
            <p className="text-sm text-slate-400">No activity recorded</p>
            <p className="text-xs text-slate-600 mt-1">System events will appear here</p>
          </div>
        )}
      </SCGlassCard>
    </div>
  );
}
