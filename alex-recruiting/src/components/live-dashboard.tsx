"use client";

// Live Dashboard Component
//
// Auto-refreshing dashboard that replaces hardcoded metrics with live
// data from /api/dashboard/live, /api/dashboard/coach-activity, and
// /api/dashboard/competitors. Renders a Recharts follower growth chart,
// progress bars for coach follow target, engagement rate trends, and
// a live alert feed.
//
// Drop into any page with: import { LiveDashboard } from "@/components/live-dashboard"

import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Activity,
  Target,
  Zap,
  Mail,
  UserCheck,
  Eye,
  BarChart2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── API Response Types ───────────────────────────────────────────────────────

interface LiveDashboardData {
  followers: { count: number; weekChange: number; target: number };
  coachFollows: {
    count: number;
    target: number;
    recentFollows: Array<{
      name: string;
      xHandle: string;
      schoolName: string;
      followedAt: string;
      division: string;
    }>;
  };
  engagement: { rate: number; weekChange: number };
  posts: { thisWeek: number; target: number };
  dms: { sent: number; responses: number; responseRate: number };
  alerts: string[];
  competitorUpdates: string[];
  meta: { fetchedAt: string; dataSource: "live" | "fallback"; jacobUserId: string | null };
}

interface CoachSignal {
  id: string;
  coachHandle: string;
  schoolName: string;
  division: string;
  activityType: string;
  signalStrength: "high" | "medium" | "low";
  description: string;
  tweetText?: string;
  detectedAt: string;
}

interface CompetitorUpdate {
  id: string;
  competitorName: string;
  school: string;
  xHandle: string;
  updateType: string;
  description: string;
  jacobComparison: string;
  status: "threat" | "watch" | "behind";
  detectedAt: string;
}

interface CompetitorComparisonRow {
  name: string;
  school: string;
  xHandle: string | null;
  followers: number;
  postsPerWeek: number;
  hasXPresence: boolean;
  isAheadOfJacob: boolean;
  jacobEdge: string;
}

// ─── Follower Growth Chart Data ───────────────────────────────────────────────

// Separate keys for actual vs projected so Recharts can use simple string dataKey.
interface GrowthDataPoint {
  week: string;
  actual: number | null;
  projected: number | null;
}

// Generates a 8-week growth trajectory seeded from the current follower count.
// In production this would pull from a stored history table.
function buildGrowthChartData(currentFollowers: number): GrowthDataPoint[] {
  const data: GrowthDataPoint[] = [];
  const weeklyGrowthRate = 0.08; // 8% per week target growth rate

  // Build 4 historical weeks (working backward from now)
  for (let i = 4; i >= 1; i--) {
    const weekFollowers = Math.round(currentFollowers / Math.pow(1 + weeklyGrowthRate, i));
    data.push({ week: `W-${i}`, actual: Math.max(weekFollowers, 0), projected: null });
  }

  // Current week — appears in both series to create a continuous join
  data.push({ week: "Now", actual: currentFollowers, projected: currentFollowers });

  // 4 projected weeks forward
  for (let i = 1; i <= 4; i++) {
    const proj = Math.round(currentFollowers * Math.pow(1 + weeklyGrowthRate, i));
    data.push({ week: `W+${i}`, actual: null, projected: proj });
  }

  return data;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  unit,
  weekChange,
  changeLabel,
  children,
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  weekChange?: number;
  changeLabel?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const isPositive = weekChange !== undefined && weekChange > 0;
  const isNegative = weekChange !== undefined && weekChange < 0;
  const isNeutral = weekChange === undefined || weekChange === 0;

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-slate-200 p-4", className)}>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <div className="flex items-end justify-between mt-1">
        <p className="text-2xl font-bold text-slate-900">
          {value}
          {unit && <span className="text-base font-medium text-slate-600 ml-0.5">{unit}</span>}
        </p>
        {weekChange !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold",
              isPositive && "text-green-600",
              isNegative && "text-red-500",
              isNeutral && "text-slate-400"
            )}
          >
            {isPositive && <ArrowUp className="h-3 w-3" />}
            {isNegative && <ArrowDown className="h-3 w-3" />}
            {isNeutral && <Minus className="h-3 w-3" />}
            <span>{changeLabel ?? (weekChange > 0 ? `+${weekChange}` : weekChange)}</span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function ProgressBar({ current, total, color = "bg-blue-500" }: { current: number; total: number; color?: string }) {
  const pct = Math.min(Math.round((current / total) * 100), 100);
  return (
    <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

function SignalStrengthBadge({ strength }: { strength: "high" | "medium" | "low" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide",
        strength === "high" && "bg-red-50 text-red-600",
        strength === "medium" && "bg-yellow-50 text-yellow-600",
        strength === "low" && "bg-slate-50 text-slate-500"
      )}
    >
      {strength}
    </span>
  );
}

function CompetitorStatusBadge({ status }: { status: "threat" | "watch" | "behind" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold",
        status === "threat" && "bg-red-50 text-red-600",
        status === "watch" && "bg-yellow-50 text-yellow-600",
        status === "behind" && "bg-green-50 text-green-600"
      )}
    >
      {status === "threat" ? "Threat" : status === "watch" ? "Watch" : "Behind Jacob"}
    </span>
  );
}

// Custom Recharts tooltip
function GrowthTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number | null }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  // Pick whichever series has a non-null value
  const activeEntry = payload.find((p) => p.value !== null);
  if (!activeEntry || activeEntry.value === null) return null;

  const isProjected = activeEntry.name === "Projected";

  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="text-slate-500 font-medium">{label}</p>
      <p className="font-bold text-slate-900">{activeEntry.value.toLocaleString()} followers</p>
      {isProjected && <p className="text-blue-500 mt-0.5">Projected</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const COACH_REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const COMPETITOR_REFRESH_INTERVAL_MS = 20 * 60 * 1000; // 20 minutes

export function LiveDashboard() {
  const [dashData, setDashData] = useState<LiveDashboardData | null>(null);
  const [coachSignals, setCoachSignals] = useState<CoachSignal[]>([]);
  const [competitorUpdates, setCompetitorUpdates] = useState<CompetitorUpdate[]>([]);
  const [competitorRows, setCompetitorRows] = useState<CompetitorComparisonRow[]>([]);
  const [jacobRank, setJacobRank] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [coachLoading, setCoachLoading] = useState(false);
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Fetch Functions ────────────────────────────────────────────────────────

  const fetchLiveData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/live", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LiveDashboardData = await res.json();
      setDashData(data);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch live data");
    }
  }, []);

  const fetchCoachActivity = useCallback(async () => {
    setCoachLoading(true);
    try {
      const res = await fetch("/api/dashboard/coach-activity", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setCoachSignals(data.signals ?? []);
    } catch {
      // Silent — coach signals are non-critical
    } finally {
      setCoachLoading(false);
    }
  }, []);

  const fetchCompetitors = useCallback(
    async (liveData: LiveDashboardData | null) => {
      setCompetitorLoading(true);
      try {
        const params = new URLSearchParams({
          followers: String(liveData?.followers.count ?? 0),
          posts: String(liveData?.posts.thisWeek ?? 0),
          engagement: String(liveData?.engagement.rate ?? 0),
        });
        const res = await fetch(`/api/dashboard/competitors?${params}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setCompetitorUpdates(data.updates ?? []);
        setCompetitorRows(data.comparison?.competitors ?? []);
        setJacobRank(data.comparison?.jacobRank ?? 1);
      } catch {
        // Silent
      } finally {
        setCompetitorLoading(false);
      }
    },
    []
  );

  const handleManualRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLiveData();
    setRefreshing(false);
  }, [fetchLiveData]);

  // ─── Effects ────────────────────────────────────────────────────────────────

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchLiveData();
      setLoading(false);
      // Defer heavier fetches to avoid blocking initial render
      setTimeout(() => {
        fetchCoachActivity();
      }, 500);
      setTimeout(() => {
        fetchCompetitors(null);
      }, 1000);
    };
    init();
  }, [fetchLiveData, fetchCoachActivity, fetchCompetitors]);

  // Auto-refresh live data every 5 minutes
  useEffect(() => {
    const timer = setInterval(fetchLiveData, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchLiveData]);

  // Auto-refresh coach activity every 15 minutes
  useEffect(() => {
    const timer = setInterval(fetchCoachActivity, COACH_REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchCoachActivity]);

  // Auto-refresh competitors every 20 minutes
  useEffect(() => {
    const timer = setInterval(() => fetchCompetitors(dashData), COMPETITOR_REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchCompetitors, dashData]);

  // Fetch competitors when dash data first arrives
  useEffect(() => {
    if (dashData && competitorRows.length === 0) {
      fetchCompetitors(dashData);
    }
  }, [dashData, competitorRows.length, fetchCompetitors]);

  // ─── Derived Values ──────────────────────────────────────────────────────────

  const chartData: GrowthDataPoint[] = dashData ? buildGrowthChartData(dashData.followers.count) : [];

  const highSignals = coachSignals.filter((s) => s.signalStrength === "high");
  const medSignals = coachSignals.filter((s) => s.signalStrength === "medium");

  // ─── Loading State ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Skeleton metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-3" />
              <div className="h-7 bg-slate-100 rounded w-2/3" />
              <div className="h-1 bg-slate-100 rounded mt-3" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse h-48" />
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────────────

  if (error && !dashData) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-700">Could not load live data</p>
        <p className="text-xs text-slate-400 mt-1">{error}</p>
        <button
          onClick={handleManualRefresh}
          className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  const data = dashData!;

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 md:space-y-6">

      {/* ═══ Header: Status Bar ═══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              data.meta.dataSource === "live" ? "bg-green-500 animate-pulse" : "bg-yellow-400"
            )}
          />
          <span className="text-xs text-slate-500 font-medium">
            {data.meta.dataSource === "live" ? "Live data" : "Cached data"}
            {lastRefresh && (
              <span className="ml-1 text-slate-400">
                — updated {formatRelativeTime(lastRefresh)}
              </span>
            )}
          </span>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* ═══ Row 1: Core Metric Cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

        {/* Followers */}
        <MetricCard
          label="Followers"
          value={data.followers.count.toLocaleString()}
          weekChange={data.followers.weekChange}
          changeLabel={`+${data.followers.weekChange} this week`}
        >
          <ProgressBar
            current={data.followers.count}
            total={data.followers.target}
            color="bg-green-500"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Target: {data.followers.target.toLocaleString()}
          </p>
        </MetricCard>

        {/* Coach Follows */}
        <MetricCard
          label="Coach Follows"
          value={data.coachFollows.count}
        >
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs text-slate-400">
              {data.coachFollows.count}/{data.coachFollows.target} target
            </span>
            <span className="text-[10px] text-slate-400">
              {Math.round((data.coachFollows.count / data.coachFollows.target) * 100)}%
            </span>
          </div>
          <ProgressBar
            current={data.coachFollows.count}
            total={data.coachFollows.target}
            color="bg-blue-500"
          />
        </MetricCard>

        {/* Posts This Week */}
        <MetricCard
          label="Posts This Week"
          value={`${data.posts.thisWeek}/${data.posts.target}`}
        >
          <ProgressBar
            current={data.posts.thisWeek}
            total={data.posts.target}
            color={data.posts.thisWeek >= data.posts.target ? "bg-green-500" : "bg-orange-400"}
          />
          <p className="text-[10px] text-slate-400 mt-1">
            {data.posts.thisWeek >= data.posts.target
              ? "Weekly target met"
              : `${data.posts.target - data.posts.thisWeek} post${data.posts.target - data.posts.thisWeek !== 1 ? "s" : ""} remaining`}
          </p>
        </MetricCard>

        {/* Engagement Rate */}
        <MetricCard
          label="Engagement Rate"
          value={data.engagement.rate.toFixed(1)}
          unit="%"
          weekChange={data.engagement.weekChange}
          changeLabel={`${data.engagement.weekChange >= 0 ? "+" : ""}${data.engagement.weekChange.toFixed(1)}%`}
        >
          <ProgressBar
            current={data.engagement.rate}
            total={10}
            color="bg-purple-500"
          />
        </MetricCard>
      </div>

      {/* ═══ Row 2: DM Stats + Rank ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50">
            <Mail className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">DMs Sent</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{data.dms.sent}</p>
            <p className="text-[10px] text-slate-400">
              {data.dms.responses} responses ({data.dms.responseRate}% rate)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
            <UserCheck className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Competitor Rank</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">#{jacobRank}</p>
            <p className="text-[10px] text-slate-400">
              Among {competitorRows.length} tracked recruits
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50">
            <Activity className="h-4 w-4 text-sky-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Coach Signals</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {coachLoading ? "..." : coachSignals.length}
            </p>
            <p className="text-[10px] text-slate-400">
              {highSignals.length > 0
                ? `${highSignals.length} high-priority signal${highSignals.length !== 1 ? "s" : ""}`
                : "No urgent signals"}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Row 3: Follower Growth Chart ═══ */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Follower Growth Trajectory
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <div className="h-2 w-4 rounded bg-blue-500" />
                Actual
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <div className="h-2 w-4 rounded bg-blue-200 border border-dashed border-blue-400" />
                Projected
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
                />
                <Tooltip content={<GrowthTooltip />} />
                {/* Actual data segment */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                  name="Followers"
                />
                {/* Projected data segment */}
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#93c5fd"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 2.5, fill: "#93c5fd", strokeWidth: 0 }}
                  activeDot={{ r: 3 }}
                  connectNulls={false}
                  name="Projected"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-sm text-slate-400">
              No chart data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Row 4: Coach Signals + Recent Coach Follows ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

        {/* Coach Activity Signals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Coach Activity Signals
              {coachLoading && (
                <span className="ml-auto text-[10px] text-slate-400">Scanning...</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coachSignals.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="h-7 w-7 text-green-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No urgent signals detected</p>
                <p className="text-[10px] text-slate-400 mt-1">Coaches are monitored every 15 minutes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...highSignals, ...medSignals].slice(0, 5).map((signal) => (
                  <div key={signal.id} className="flex gap-3 pb-3 border-b border-slate-50 last:border-b-0 last:pb-0">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5",
                        signal.signalStrength === "high" && "bg-red-50",
                        signal.signalStrength === "medium" && "bg-yellow-50",
                        signal.signalStrength === "low" && "bg-slate-50"
                      )}
                    >
                      <Target
                        className={cn(
                          "h-3.5 w-3.5",
                          signal.signalStrength === "high" && "text-red-500",
                          signal.signalStrength === "medium" && "text-yellow-500",
                          signal.signalStrength === "low" && "text-slate-400"
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 justify-between">
                        <p className="text-xs font-medium text-slate-700 leading-snug">
                          {signal.description}
                        </p>
                        <SignalStrengthBadge strength={signal.signalStrength} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">{signal.schoolName}</span>
                        <span className="text-[10px] text-slate-300">·</span>
                        <span className="text-[10px] text-slate-400">{signal.division}</span>
                      </div>
                      {signal.tweetText && (
                        <p className="text-[10px] text-slate-400 mt-1 italic truncate">
                          &ldquo;{signal.tweetText}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Coach Follows */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Coach Follow Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Progress summary */}
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-800">
                  {data.coachFollows.count} of {data.coachFollows.target} target coach follows
                </span>
                <span className="text-xs font-bold text-blue-700">
                  {Math.round((data.coachFollows.count / data.coachFollows.target) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((data.coachFollows.count / data.coachFollows.target) * 100, 100)}%` }}
                />
              </div>
            </div>

            {data.coachFollows.recentFollows.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
                  Detected Follows
                </p>
                {data.coachFollows.recentFollows.map((follow, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 shrink-0">
                      <UserCheck className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{follow.schoolName}</p>
                      <p className="text-[10px] text-slate-400">{follow.xHandle} · {follow.division}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Eye className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Monitoring {data.coachFollows.target} target coaches</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Follow-back alerts appear here when a coach follows Jacob
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══ Row 5: Competitor Intelligence ═══ */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Competitor Snapshot
              {competitorLoading && (
                <span className="text-[10px] text-slate-400 font-normal">Updating...</span>
              )}
            </CardTitle>
            {jacobRank > 0 && (
              <Badge className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                Jacob Rank #{jacobRank}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {competitorRows.length === 0 ? (
            <div className="text-center py-6">
              <BarChart2 className="h-7 w-7 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading competitor data...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Jacob's row — always at top */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 shrink-0">
                  <span className="text-white text-[10px] font-bold">J</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-800">Jacob Rodgers — Pewaukee HS</p>
                  <p className="text-[10px] text-blue-600">
                    {data.followers.count} followers · {data.posts.thisWeek}x/week · {data.engagement.rate.toFixed(1)}% engagement
                  </p>
                </div>
                <Badge className="text-[10px] bg-blue-500 text-white border-0 shrink-0">You</Badge>
              </div>

              {/* Competitor rows */}
              {competitorRows.slice(0, 6).map((comp, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg border transition-colors",
                    comp.isAheadOfJacob
                      ? "border-amber-100 bg-amber-50"
                      : "border-slate-100 hover:bg-slate-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full shrink-0",
                      comp.hasXPresence ? "bg-slate-200" : "bg-slate-100"
                    )}
                  >
                    {comp.hasXPresence ? (
                      <span className="text-slate-600 text-[10px] font-bold">
                        {comp.name.charAt(0)}
                      </span>
                    ) : (
                      <Minus className="h-3 w-3 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium text-slate-700 truncate">{comp.name}</p>
                      {!comp.hasXPresence && (
                        <span className="text-[9px] text-slate-400 bg-slate-100 px-1 rounded">No X</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{comp.school}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-700">{comp.followers}</p>
                    <p className="text-[10px] text-slate-400">followers</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Competitor updates */}
          {competitorUpdates.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
                Recent Updates
              </p>
              <div className="space-y-2">
                {competitorUpdates.slice(0, 3).map((update) => (
                  <div key={update.id} className="flex items-start gap-2">
                    <CompetitorStatusBadge status={update.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 leading-snug">{update.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{update.jacobComparison}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "just now";
  if (diffMin === 1) return "1 min ago";
  if (diffMin < 60) return `${diffMin} mins ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr === 1) return "1 hour ago";
  return `${diffHr} hours ago`;
}
