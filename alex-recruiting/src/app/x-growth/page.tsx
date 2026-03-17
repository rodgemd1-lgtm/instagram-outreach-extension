"use client";

import { useCallback, useEffect, useState } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { PostingHeatmap } from "@/components/posting-heatmap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GrowthSnapshot {
  id: string;
  snapshot_date: string;
  follower_count: number | null;
  coach_followers: number | null;
  engagement_rate: number | null;
  posts_this_week: number | null;
}

interface PostingWindow {
  id: string;
  day_of_week: number;
  hour_start: number;
  score: number;
  coach_overlap: number;
}

interface EngagementEvent {
  id: string;
  event_type: string;
  coach_name?: string;
  details?: string;
  timestamp: string;
}

interface CoachProfile {
  id: string;
  coach_name: string;
  school_name: string;
  division: string;
  dm_open_probability: number;
  interacts_with_recruits: boolean;
}

interface GrowthData {
  snapshots: GrowthSnapshot[];
  postingWindows: PostingWindow[];
  recentEngagement: EngagementEvent[];
  coachProfiles: CoachProfile[];
  summary: {
    currentFollowers: number | null;
    followerChange: number | null;
    coachFollowers: number | null;
    engagementRate: number | null;
    postsThisWeek: number | null;
  };
}

export default function XGrowthPage() {
  const [data, setData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/growth/analytics");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <span className="material-symbols-outlined text-[32px] animate-spin text-slate-400">progress_activity</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <SCPageHeader title="X GROWTH ENGINE" subtitle="Growth analytics unavailable" />
        <SCGlassCard variant="broadcast" className="py-12 text-center">
          <p className="text-sm text-red-400">{error ?? "No data available"}</p>
          <button
            onClick={() => void loadData()}
            className="mt-3 text-sm font-bold text-sc-primary hover:text-white transition-colors"
          >
            Try again
          </button>
        </SCGlassCard>
      </div>
    );
  }

  const { summary, snapshots, postingWindows, recentEngagement, coachProfiles } = data;

  const chartData = snapshots.map((s) => ({
    date: new Date(s.snapshot_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    followers: s.follower_count,
    coachFollowers: s.coach_followers,
  }));

  return (
    <div className="space-y-6">
      <SCPageHeader
        title="X GROWTH ENGINE"
        subtitle="Track follower growth, coach engagement, and posting performance across X."
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SCStatCard
          label="Followers"
          value={summary.currentFollowers != null ? String(summary.currentFollowers) : "--"}
          trend={summary.followerChange ? {
            value: `${summary.followerChange > 0 ? "+" : ""}${summary.followerChange}`,
            direction: summary.followerChange > 0 ? "up" : summary.followerChange < 0 ? "down" : "neutral",
          } : undefined}
          icon="group"
        />
        <SCStatCard
          label="Coach Followers"
          value={summary.coachFollowers != null ? String(summary.coachFollowers) : "--"}
          icon="verified"
        />
        <SCStatCard
          label="Engagement Rate"
          value={summary.engagementRate ? `${(summary.engagementRate * 100).toFixed(1)}%` : "--"}
          icon="trending_up"
        />
        <SCStatCard
          label="Posts This Week"
          value={summary.postsThisWeek != null ? String(summary.postsThisWeek) : "--"}
          icon="bar_chart"
        />
      </div>

      {/* Growth Chart */}
      <SCGlassCard variant="strong" className="p-5">
        <p className="text-sm font-bold text-white mb-4">Follower Growth</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} stroke="rgba(255,255,255,0.1)" />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} stroke="rgba(255,255,255,0.1)" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1313", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                labelStyle={{ color: "#94a3b8" }}
                itemStyle={{ color: "#fff" }}
              />
              <Line type="monotone" dataKey="followers" stroke="#c5050c" strokeWidth={2} dot={false} name="Total" />
              <Line type="monotone" dataKey="coachFollowers" stroke="#10b981" strokeWidth={2} dot={false} name="Coaches" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-[32px] text-slate-600">trending_up</span>
              <p className="mt-2 text-sm text-slate-500">No growth data yet</p>
              <p className="text-xs text-slate-600">Run the X Growth Scraper to collect follower data</p>
            </div>
          </div>
        )}
      </SCGlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Posting Heatmap */}
        <SCGlassCard variant="strong" className="p-5">
          <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-400">schedule</span>
            Posting Heatmap
          </p>
          {postingWindows.length > 0 ? (
            <PostingHeatmap windows={postingWindows} />
          ) : (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-[32px] text-slate-600">schedule</span>
              <p className="mt-2 text-sm text-slate-500">No posting window data</p>
              <p className="text-xs text-slate-600">The Timing Optimizer agent populates this</p>
            </div>
          )}
        </SCGlassCard>

        {/* Coach Engagement */}
        <SCGlassCard variant="strong" className="p-5">
          <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-400">forum</span>
            Top Coach Profiles
          </p>
          {coachProfiles.length > 0 ? (
            <div className="space-y-2">
              {coachProfiles.slice(0, 8).map((coach) => (
                <div
                  key={coach.id}
                  className="flex items-center justify-between rounded-lg border border-sc-border bg-white/5 p-3"
                >
                  <div>
                    <p className="text-sm font-bold text-white">{coach.coach_name}</p>
                    <p className="text-xs text-slate-500">{coach.school_name} &middot; {coach.division}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SCBadge variant={coach.dm_open_probability > 0.5 ? "success" : "default"}>
                      {(coach.dm_open_probability * 100).toFixed(0)}% DM open
                    </SCBadge>
                    {coach.interacts_with_recruits && (
                      <SCBadge variant="success">Recruits</SCBadge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-[32px] text-slate-600">verified</span>
              <p className="mt-2 text-sm text-slate-500">No coach profiles yet</p>
              <p className="text-xs text-slate-600">The Coach Intelligence agent builds these</p>
            </div>
          )}
        </SCGlassCard>
      </div>

      {/* Recent Engagement */}
      <SCGlassCard variant="strong" className="p-5">
        <p className="text-sm font-bold text-white mb-4">Recent Engagement</p>
        {recentEngagement.length > 0 ? (
          <div className="divide-y divide-sc-border">
            {recentEngagement.slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-center gap-3 py-3">
                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-slate-500">trending_up</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {event.event_type}{event.coach_name ? ` -- ${event.coach_name}` : ""}
                  </p>
                  <p className="text-xs text-slate-500">{event.details?.slice(0, 80)}</p>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {event.timestamp ? new Date(event.timestamp).toLocaleDateString() : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-[32px] text-slate-600">bar_chart</span>
            <p className="mt-2 text-sm text-slate-500">No engagement events recorded</p>
          </div>
        )}
      </SCGlassCard>
    </div>
  );
}
