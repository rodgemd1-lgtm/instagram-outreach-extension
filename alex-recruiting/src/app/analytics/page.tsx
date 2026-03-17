"use client";

import { useState, useEffect } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCTable } from "@/components/sc/sc-table";
import { SCBadge } from "@/components/sc/sc-badge";

interface AnalyticsData {
  current: {
    totalFollowers: number;
    coachFollows: number;
    dmsSent: number;
    dmResponseRate: number;
    postsPublished: number;
    avgEngagementRate: number;
    profileVisits: number;
    auditScore: number;
  };
  targets: {
    month1: Record<string, number>;
    month3: Record<string, number>;
    month6: Record<string, number>;
  };
}

const metricConfig = [
  { key: "totalFollowers", label: "Total Followers", targetKey: "followers", icon: "group" },
  { key: "coachFollows", label: "Coach Follows", targetKey: "coachFollows", icon: "person_check" },
  { key: "dmsSent", label: "DMs Sent", targetKey: "dmsSent", icon: "mail" },
  { key: "dmResponseRate", label: "DM Response Rate", targetKey: "dmResponseRate", suffix: "%", icon: "target" },
  { key: "postsPublished", label: "Posts Published", targetKey: "posts", icon: "article" },
  { key: "avgEngagementRate", label: "Avg Engagement", targetKey: "engagementRate", suffix: "%", icon: "trending_up" },
  { key: "profileVisits", label: "Profile Visits", targetKey: "profileVisits", icon: "visibility" },
  { key: "auditScore", label: "Audit Score", targetKey: "auditScore", suffix: "/10", icon: "verified_user" },
] as const;

type TimelineRow = {
  metric: string;
  current: string;
  month1: string;
  month3: string;
  month6: string;
  [key: string]: unknown;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <SCPageHeader title="SCOUT LEADERBOARD" kicker="Live Intel" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SCGlassCard key={i} className="p-5">
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
            </SCGlassCard>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-8">
        <SCPageHeader title="SCOUT LEADERBOARD" kicker="Live Intel" />
        <SCGlassCard className="p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-slate-600 block mb-3">analytics</span>
          <p className="text-slate-400">Unable to load analytics data.</p>
          <p className="text-xs text-slate-600 mt-1">Check your API connection and try again.</p>
        </SCGlassCard>
      </div>
    );
  }

  const topMetrics = [
    {
      label: "Commit Conversion",
      value: data.current.dmResponseRate > 0 ? `${data.current.dmResponseRate}%` : "--",
      icon: "target",
      trend: data.current.dmResponseRate > 0
        ? { value: `${data.current.dmResponseRate}% response`, direction: "up" as const }
        : undefined,
    },
    {
      label: "Discovery Velocity",
      value: data.current.postsPublished > 0 ? String(data.current.postsPublished) : "--",
      icon: "speed",
      trend: data.current.postsPublished > 0
        ? { value: `${data.current.postsPublished} posts`, direction: "up" as const }
        : undefined,
    },
    {
      label: "Eval Accuracy",
      value: data.current.auditScore > 0 ? `${data.current.auditScore}/10` : "--",
      icon: "verified_user",
      trend: data.current.auditScore >= 7
        ? { value: "on target", direction: "up" as const }
        : data.current.auditScore > 0
          ? { value: "needs work", direction: "down" as const }
          : undefined,
    },
  ];

  // Build leaderboard table data from metric cards
  const leaderboardData: TimelineRow[] = metricConfig.map((metric) => {
    const current = data.current[metric.key as keyof typeof data.current] || 0;
    const s = metric.suffix || "";
    return {
      metric: metric.label,
      current: `${current}${s}`,
      month1: `${data.targets.month1[metric.targetKey] || 0}${s}`,
      month3: `${data.targets.month3[metric.targetKey] || 0}${s}`,
      month6: `${data.targets.month6[metric.targetKey] || 0}${s}`,
    };
  });

  // Add constitution violations row
  leaderboardData.push({
    metric: "Constitution Violations",
    current: "0",
    month1: "0",
    month3: "0",
    month6: "0",
  });

  const tableColumns = [
    {
      key: "metric",
      header: "Metric",
      render: (row: TimelineRow) => (
        <span className="font-semibold text-white">{row.metric}</span>
      ),
    },
    {
      key: "current",
      header: "Current",
      align: "center" as const,
      render: (row: TimelineRow) => (
        <span className="font-bold text-white">{row.current}</span>
      ),
    },
    {
      key: "month1",
      header: "Month 1",
      align: "center" as const,
      render: (row: TimelineRow) => (
        <span className="text-blue-400">{row.month1}</span>
      ),
    },
    {
      key: "month3",
      header: "Month 3",
      align: "center" as const,
      render: (row: TimelineRow) => (
        <span className="text-purple-400">{row.month3}</span>
      ),
    },
    {
      key: "month6",
      header: "Month 6",
      align: "center" as const,
      render: (row: TimelineRow) => (
        <span className="text-emerald-400">{row.month6}</span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <SCPageHeader
        title="SCOUT LEADERBOARD"
        kicker="Live Intel"
        subtitle="Recruiting scorecard — follower growth, coach follows, engagement rates, and target tracking"
      />

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {topMetrics.map((m) => (
          <SCStatCard
            key={m.label}
            label={m.label}
            value={m.value}
            icon={m.icon}
            trend={m.trend}
          />
        ))}
      </div>

      {/* Full Metrics Grid */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-sc-primary">monitoring</span>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            Performance Metrics
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metricConfig.map((metric) => {
            const value = data.current[metric.key as keyof typeof data.current] || 0;
            const target1 = data.targets.month1[metric.targetKey] || 1;
            const s = metric.suffix || "";
            const progressPct = Math.min(100, Math.round((value / target1) * 100));

            return (
              <SCStatCard
                key={metric.key}
                label={metric.label}
                value={`${value}${s}`}
                icon={metric.icon}
                progress={progressPct}
              />
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table: Recruiting Scorecard Timeline */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-sc-primary">leaderboard</span>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            Recruiting Scorecard — Target Timeline
          </h2>
        </div>
        <SCTable<TimelineRow>
          columns={tableColumns}
          data={leaderboardData}
        />
      </div>

      {/* Lead Scout Profiles // Top Finds */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-sc-primary">person_search</span>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            Lead Scout Profiles // Top Finds
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Engagement Card */}
          <SCGlassCard className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400">trending_up</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Engagement</p>
                <p className="text-xl font-black text-white">
                  {data.current.avgEngagementRate > 0 ? `${data.current.avgEngagementRate}%` : "--"}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Average engagement rate across all published content</p>
          </SCGlassCard>

          {/* Follower Growth Card */}
          <SCGlassCard className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-400">group_add</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Followers</p>
                <p className="text-xl font-black text-white">
                  {data.current.totalFollowers > 0 ? String(data.current.totalFollowers) : "--"}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Total follower count with coach follow breakdown</p>
          </SCGlassCard>

          {/* Profile Score Card */}
          <SCGlassCard className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sc-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-sc-primary">shield</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Profile Score</p>
                <p className="text-xl font-black text-white">
                  {data.current.auditScore > 0 ? `${data.current.auditScore}/10` : "--"}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {data.current.auditScore >= 7
                ? "Profile is strong and recruit-ready"
                : "Keep improving your profile for maximum visibility"}
            </p>
          </SCGlassCard>
        </div>
      </div>
    </div>
  );
}
