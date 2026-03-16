"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { PostingHeatmap } from "@/components/posting-heatmap";
import {
  Users,
  TrendingUp,
  BarChart3,
  Clock,
  RefreshCw,
  MessageCircle,
  UserCheck,
} from "lucide-react";
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

export function XGrowthDashboard() {
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
        <RefreshCw className="h-8 w-8 animate-spin text-[var(--app-muted)]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-rose-200">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-rose-600">{error ?? "No data available"}</p>
          <button
            onClick={() => void loadData()}
            className="mt-3 text-sm font-medium text-[var(--app-navy)] hover:underline"
          >
            Try again
          </button>
        </CardContent>
      </Card>
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
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Followers"
          value={summary.currentFollowers}
          change={summary.followerChange ? `${summary.followerChange > 0 ? "+" : ""}${summary.followerChange}` : null}
          changeType={summary.followerChange ? (summary.followerChange > 0 ? "up" : "down") : "neutral"}
          icon={Users}
        />
        <StatCard
          label="Coach Followers"
          value={summary.coachFollowers}
          icon={UserCheck}
        />
        <StatCard
          label="Engagement Rate"
          value={summary.engagementRate ? `${(summary.engagementRate * 100).toFixed(1)}%` : null}
          icon={TrendingUp}
        />
        <StatCard
          label="Posts This Week"
          value={summary.postsThisWeek}
          icon={BarChart3}
        />
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
          <CardTitle className="text-lg text-[var(--app-navy-strong)]">Follower Growth</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,40,75,0.08)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="rgba(15,40,75,0.3)" />
                <YAxis tick={{ fontSize: 11 }} stroke="rgba(15,40,75,0.3)" />
                <Tooltip />
                <Line type="monotone" dataKey="followers" stroke="#0F2850" strokeWidth={2} dot={false} name="Total" />
                <Line type="monotone" dataKey="coachFollowers" stroke="#16A34A" strokeWidth={2} dot={false} name="Coaches" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center">
              <div className="text-center">
                <TrendingUp className="mx-auto h-8 w-8 text-[#D1D5DB]" />
                <p className="mt-2 text-sm text-[var(--app-muted)]">No growth data yet</p>
                <p className="text-xs text-[#D1D5DB]">Run the X Growth Scraper to collect follower data</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Posting Heatmap */}
        <Card>
          <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
            <CardTitle className="flex items-center gap-2 text-lg text-[var(--app-navy-strong)]">
              <Clock className="h-4 w-4" />
              Posting Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {postingWindows.length > 0 ? (
              <PostingHeatmap windows={postingWindows} />
            ) : (
              <div className="py-12 text-center">
                <Clock className="mx-auto h-8 w-8 text-[#D1D5DB]" />
                <p className="mt-2 text-sm text-[var(--app-muted)]">No posting window data</p>
                <p className="text-xs text-[#D1D5DB]">The Timing Optimizer agent populates this</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coach Engagement */}
        <Card>
          <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
            <CardTitle className="flex items-center gap-2 text-lg text-[var(--app-navy-strong)]">
              <MessageCircle className="h-4 w-4" />
              Top Coach Profiles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {coachProfiles.length > 0 ? (
              coachProfiles.slice(0, 8).map((coach) => (
                <div
                  key={coach.id}
                  className="flex items-center justify-between rounded-lg border border-[rgba(15,40,75,0.08)] bg-white/74 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--app-navy-strong)]">{coach.coach_name}</p>
                    <p className="text-xs text-[var(--app-muted)]">{coach.school_name} &middot; {coach.division}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={coach.dm_open_probability > 0.5 ? "default" : "secondary"}>
                      {(coach.dm_open_probability * 100).toFixed(0)}% DM open
                    </Badge>
                    {coach.interacts_with_recruits && (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Recruits</Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <UserCheck className="mx-auto h-8 w-8 text-[#D1D5DB]" />
                <p className="mt-2 text-sm text-[var(--app-muted)]">No coach profiles yet</p>
                <p className="text-xs text-[#D1D5DB]">The Coach Intelligence agent builds these</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Engagement */}
      <Card>
        <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
          <CardTitle className="text-lg text-[var(--app-navy-strong)]">Recent Engagement</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {recentEngagement.length > 0 ? (
            <div className="divide-y divide-[#F3F4F6]">
              {recentEngagement.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center gap-3 py-3">
                  <div className="h-8 w-8 rounded-full bg-[#F5F5F4] flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-[#9CA3AF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--app-navy-strong)] truncate">
                      {event.event_type}{event.coach_name ? ` — ${event.coach_name}` : ""}
                    </p>
                    <p className="text-xs text-[var(--app-muted)]">
                      {event.details?.slice(0, 80)}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--app-muted)] whitespace-nowrap">
                    {event.timestamp ? new Date(event.timestamp).toLocaleDateString() : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-[#D1D5DB]" />
              <p className="mt-2 text-sm text-[var(--app-muted)]">No engagement events recorded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
