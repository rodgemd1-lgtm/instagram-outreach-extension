"use client";

import { useState, useEffect, useCallback } from "react";
import { SCPageHeader, SCGlassCard, SCButton, SCBadge, SCTabs } from "@/components/sc";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface QueuePost {
  id: string;
  content: string;
  pillar: string;
  hashtags: string[];
  mediaUrl: string | null;
  scheduledFor: string | null;
  bestTime: string | null;
  status: string;
  xPostId: string | null;
  impressions: number;
  engagements: number;
  engagementRate: number;
  createdAt: string | null;
  updatedAt: string | null;
}

interface QueueCounts {
  queued: number;
  draft: number;
  approved: number;
  rejected: number;
  posted: number;
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const PILLAR_COLORS: Record<string, { dot: string; badge: "info" | "warning" | "success" }> = {
  performance: { dot: "bg-blue-500", badge: "info" },
  work_ethic: { dot: "bg-yellow-500", badge: "warning" },
  character: { dot: "bg-emerald-500", badge: "success" },
};

const STATUS_BADGE: Record<string, "default" | "success" | "danger" | "info" | "warning"> = {
  queued: "default",
  draft: "default",
  approved: "success",
  rejected: "danger",
  posted: "info",
};

const PILLAR_LABELS: Record<string, string> = {
  performance: "Performance",
  work_ethic: "Work Ethic",
  character: "Character",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatDate(iso: string | null): string {
  if (!iso) return "--";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(iso: string | null): string {
  if (!iso) return "--";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getDateKey(iso: string | null): string {
  if (!iso) return "unscheduled";
  return new Date(iso).toISOString().slice(0, 10);
}

function getDaysInRange(startDate: Date, days: number): Date[] {
  const result: Date[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    result.push(d);
  }
  return result;
}

/* ------------------------------------------------------------------ */
/* Calendar View                                                       */
/* ------------------------------------------------------------------ */

function CalendarView({ posts }: { posts: QueuePost[] }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + weekOffset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const days = getDaysInRange(startOfWeek, 35);

  const postsByDate: Record<string, QueuePost[]> = {};
  for (const post of posts) {
    const key = getDateKey(post.scheduledFor);
    if (!postsByDate[key]) postsByDate[key] = [];
    postsByDate[key].push(post);
  }

  const weekLabel = `${startOfWeek.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white">{weekLabel}</h3>
        <div className="flex items-center gap-2">
          <SCButton variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </SCButton>
          <SCButton variant="secondary" size="sm" onClick={() => setWeekOffset(0)}>
            Today
          </SCButton>
          <SCButton variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </SCButton>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date) => {
          const dateKey = date.toISOString().slice(0, 10);
          const dayPosts = postsByDate[dateKey] || [];
          const isToday = dateKey === now.toISOString().slice(0, 10);
          const isCurrentMonth =
            date.getMonth() === startOfWeek.getMonth() ||
            date.getMonth() === new Date(startOfWeek.getTime() + 34 * 86400000).getMonth();

          const pillarCounts: Record<string, number> = {};
          for (const p of dayPosts) {
            pillarCounts[p.pillar] = (pillarCounts[p.pillar] || 0) + 1;
          }

          return (
            <div
              key={dateKey}
              className={cn(
                "min-h-[110px] rounded-lg border p-2 transition-colors",
                isToday
                  ? "border-sc-primary bg-sc-primary/10"
                  : "border-sc-border bg-white/5 hover:bg-white/10",
                !isCurrentMonth && "opacity-40"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-black",
                    isToday ? "text-sc-primary" : "text-white"
                  )}
                >
                  {date.getDate()}
                </span>
                {dayPosts.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-500">
                    {dayPosts.length} post{dayPosts.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {dayPosts.length > 0 && (
                <div className="mt-2 space-y-1">
                  {Object.entries(pillarCounts).map(([pillar, count]) => {
                    const colors = PILLAR_COLORS[pillar] || PILLAR_COLORS.performance;
                    return (
                      <div key={pillar} className="flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
                        <span className="text-[10px] text-slate-500">
                          {PILLAR_LABELS[pillar] || pillar} ({count})
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {dayPosts.length > 0 && (
                <div className="mt-2 line-clamp-2 text-[10px] leading-tight text-slate-500">
                  {dayPosts[0].content.slice(0, 60)}...
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* List View                                                           */
/* ------------------------------------------------------------------ */

function ListView({
  posts,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onApprove,
  onReject,
  pillarFilter,
  statusFilter,
  onPillarFilter,
  onStatusFilter,
}: {
  posts: QueuePost[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onApprove: (ids: string[]) => void;
  onReject: (ids: string[]) => void;
  pillarFilter: string;
  statusFilter: string;
  onPillarFilter: (v: string) => void;
  onStatusFilter: (v: string) => void;
}) {
  const filteredPosts = posts.filter((p) => {
    if (pillarFilter && p.pillar !== pillarFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  const allSelected = filteredPosts.length > 0 && filteredPosts.every((p) => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0;

  return (
    <div className="space-y-4">
      {/* Filter Row */}
      <SCGlassCard className="flex flex-wrap items-center gap-3 p-4">
        <span className="material-symbols-outlined text-[18px] text-slate-500">filter_alt</span>

        <select
          value={pillarFilter}
          onChange={(e) => onPillarFilter(e.target.value)}
          className="rounded-lg border border-sc-border bg-white/5 px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sc-primary"
        >
          <option value="">All Pillars</option>
          <option value="performance">Performance</option>
          <option value="work_ethic">Work Ethic</option>
          <option value="character">Character</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value)}
          className="rounded-lg border border-sc-border bg-white/5 px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-sc-primary"
        >
          <option value="">All Statuses</option>
          <option value="queued">Queued</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="posted">Posted</option>
        </select>

        <span className="text-xs text-slate-500">
          {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
        </span>

        {someSelected && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-bold text-white">{selectedIds.size} selected</span>
            <SCButton
              variant="primary"
              size="sm"
              onClick={() => onApprove(Array.from(selectedIds))}
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              Approve
            </SCButton>
            <SCButton
              variant="danger"
              size="sm"
              onClick={() => onReject(Array.from(selectedIds))}
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              Reject
            </SCButton>
          </div>
        )}
      </SCGlassCard>

      {/* Table */}
      <SCGlassCard className="overflow-hidden rounded-xl">
        {/* Header */}
        <div className="grid grid-cols-[40px_100px_80px_120px_1fr_100px_110px] items-center gap-3 border-b border-sc-border bg-sc-surface/50 px-4 py-3">
          <button onClick={onSelectAll} className="flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] text-slate-500">
              {allSelected ? "check_box" : "check_box_outline_blank"}
            </span>
          </button>
          {["Date", "Time", "Pillar", "Preview", "Status", "Actions"].map((h) => (
            <span
              key={h}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {filteredPosts.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            No posts match the current filters.
          </div>
        ) : (
          <div className="divide-y divide-sc-border">
            {filteredPosts.map((post) => {
              const isSelected = selectedIds.has(post.id);
              const pillarColors = PILLAR_COLORS[post.pillar] || PILLAR_COLORS.performance;
              return (
                <div
                  key={post.id}
                  className={cn(
                    "grid grid-cols-[40px_100px_80px_120px_1fr_100px_110px] items-center gap-3 px-4 py-3 transition-colors",
                    isSelected ? "bg-sc-primary/5" : "hover:bg-white/5"
                  )}
                >
                  <button
                    onClick={() => onToggleSelect(post.id)}
                    className="flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[18px] text-slate-500">
                      {isSelected ? "check_box" : "check_box_outline_blank"}
                    </span>
                  </button>
                  <span className="text-xs font-bold text-white">
                    {formatDate(post.scheduledFor)}
                  </span>
                  <span className="text-xs text-slate-400">{formatTime(post.scheduledFor)}</span>
                  <SCBadge variant={pillarColors.badge}>
                    {PILLAR_LABELS[post.pillar] || post.pillar}
                  </SCBadge>
                  <p className="truncate text-sm text-slate-300">{post.content.slice(0, 100)}</p>
                  <SCBadge variant={STATUS_BADGE[post.status] || "default"}>{post.status}</SCBadge>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onApprove([post.id])}
                      className="rounded-lg p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/10"
                      title="Approve"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </button>
                    <a
                      href={`/create?editPostId=${post.id}`}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </a>
                    <button
                      onClick={() => onReject([post.id])}
                      className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-500/10"
                      title="Reject"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SCGlassCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Analytics View                                                      */
/* ------------------------------------------------------------------ */

function AnalyticsView({ posts }: { posts: QueuePost[] }) {
  const pillarDist = { performance: 0, work_ethic: 0, character: 0 };
  for (const p of posts) {
    if (p.pillar in pillarDist) {
      pillarDist[p.pillar as keyof typeof pillarDist]++;
    }
  }
  const total = posts.length || 1;

  const postsPerDay: Record<string, number> = {};
  for (const p of posts) {
    const key = getDateKey(p.scheduledFor);
    postsPerDay[key] = (postsPerDay[key] || 0) + 1;
  }

  const sortedDays = Object.entries(postsPerDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 30);

  const maxPostsInDay = Math.max(...sortedDays.map(([, c]) => c), 1);

  const statusDist: Record<string, number> = {};
  for (const p of posts) {
    statusDist[p.status] = (statusDist[p.status] || 0) + 1;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Pillar Distribution */}
      <SCGlassCard className="p-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Pillar Distribution
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Target: 40% Performance, 40% Work Ethic, 20% Character
        </p>
        <div className="mt-6 space-y-4">
          {(["performance", "work_ethic", "character"] as const).map((pillar) => {
            const count = pillarDist[pillar];
            const pct = Math.round((count / total) * 100);
            const colors = PILLAR_COLORS[pillar];
            const targets: Record<string, number> = { performance: 40, work_ethic: 40, character: 20 };
            const target = targets[pillar];
            const isBalanced = Math.abs(pct - target) <= 10;

            return (
              <div key={pillar}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full", colors.dot)} />
                    <span className="text-sm font-bold text-white">{PILLAR_LABELS[pillar]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{pct}%</span>
                    <span className="text-xs text-slate-500">({count} posts)</span>
                    {isBalanced ? (
                      <span className="material-symbols-outlined text-[16px] text-emerald-400">
                        check_circle
                      </span>
                    ) : (
                      <span className="text-[10px] text-yellow-500">target: {target}%</span>
                    )}
                  </div>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className={cn("h-full rounded-full transition-all", colors.dot)}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SCGlassCard>

      {/* Status Breakdown */}
      <SCGlassCard className="p-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Status Breakdown
        </h3>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {Object.entries(statusDist).map(([status, count]) => (
            <div
              key={status}
              className="rounded-lg border border-sc-border bg-white/5 p-4"
            >
              <p className="text-2xl font-black text-white">{count}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                {status}
              </p>
            </div>
          ))}
        </div>
      </SCGlassCard>

      {/* Posts per Day Chart */}
      <SCGlassCard className="p-6 lg:col-span-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Posts per Day
        </h3>
        <p className="mt-1 text-xs text-slate-500">Scheduled posts across the next 30 days</p>
        <div className="mt-6 flex items-end gap-1" style={{ height: "140px" }}>
          {sortedDays.map(([date, count]) => {
            const heightPct = (count / maxPostsInDay) * 100;
            const dayLabel = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
              month: "numeric",
              day: "numeric",
            });
            return (
              <div key={date} className="group flex flex-1 flex-col items-center gap-1">
                <div
                  className="relative w-full rounded-t-md bg-sc-primary transition-all group-hover:bg-white"
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                  title={`${date}: ${count} posts`}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {count}
                  </span>
                </div>
                <span className="text-[8px] text-slate-500">
                  {sortedDays.length <= 15 ? dayLabel : ""}
                </span>
              </div>
            );
          })}
        </div>
        {sortedDays.length > 15 && (
          <div className="mt-2 flex justify-between text-[10px] text-slate-500">
            <span>
              {sortedDays[0]
                ? new Date(sortedDays[0][0] + "T12:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : ""}
            </span>
            <span>
              {sortedDays[sortedDays.length - 1]
                ? new Date(sortedDays[sortedDays.length - 1][0] + "T12:00:00").toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" }
                  )
                : ""}
            </span>
          </div>
        )}
      </SCGlassCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                           */
/* ------------------------------------------------------------------ */

export default function ContentQueuePage() {
  const [posts, setPosts] = useState<QueuePost[]>([]);
  const [counts, setCounts] = useState<QueueCounts>({
    queued: 0,
    draft: 0,
    approved: 0,
    rejected: 0,
    posted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pillarFilter, setPillarFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("calendar");

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/content/queue");
      if (!res.ok) throw new Error("Failed to fetch queue");
      const data = await res.json();
      setPosts(data.posts || []);
      setCounts(data.counts || { queued: 0, draft: 0, approved: 0, rejected: 0, posted: 0 });
    } catch (err) {
      console.error("Failed to load content queue:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleGenerateMonth = async () => {
    try {
      setGenerating(true);
      setActionMessage(null);
      const res = await fetch("/api/content/generate-month", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate content");
      const data = await res.json();

      if (data.success) {
        setActionMessage(`Generated ${data.generated} posts across 30 days.`);
        if (data.posts && data.posts.length > 0 && posts.length === 0) {
          setPosts(
            data.posts.map((p: Record<string, unknown>) => ({
              id: p.id as string,
              content: p.content as string,
              pillar: p.pillar as string,
              hashtags: (p.hashtags as string[]) || [],
              mediaUrl: null,
              scheduledFor: p.scheduledFor as string,
              bestTime: p.bestTime as string,
              status: p.status as string,
              xPostId: null,
              impressions: 0,
              engagements: 0,
              engagementRate: 0,
              createdAt: p.createdAt as string,
              updatedAt: null,
            }))
          );
        } else {
          await fetchPosts();
        }
      }
    } catch (err) {
      console.error("Generate month failed:", err);
      setActionMessage("Failed to generate content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (ids: string[]) => {
    try {
      setActionMessage(null);
      const res = await fetch("/api/content/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: "approve" }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      const data = await res.json();
      setPosts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, status: "approved" } : p)));
      setSelectedIds(new Set());
      setActionMessage(`Approved ${data.updated || ids.length} post${ids.length !== 1 ? "s" : ""}.`);
    } catch (err) {
      console.error("Approve failed:", err);
      setActionMessage("Failed to approve posts.");
    }
  };

  const handleReject = async (ids: string[]) => {
    try {
      setActionMessage(null);
      const res = await fetch("/api/content/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: "reject" }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      const data = await res.json();
      setPosts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, status: "rejected" } : p)));
      setSelectedIds(new Set());
      setActionMessage(`Rejected ${data.updated || ids.length} post${ids.length !== 1 ? "s" : ""}.`);
    } catch (err) {
      console.error("Reject failed:", err);
      setActionMessage("Failed to reject posts.");
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    const visiblePosts = posts.filter((p) => {
      if (pillarFilter && p.pillar !== pillarFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      return true;
    });
    const allSelected = visiblePosts.every((p) => selectedIds.has(p.id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visiblePosts.map((p) => p.id)));
    }
  };

  const tabs = [
    { label: "Calendar", value: "calendar" },
    { label: "List View", value: "list" },
    { label: "Analytics", value: "analytics" },
  ];

  return (
    <div className="space-y-8">
      <SCPageHeader
        title="SOCIAL SENTIMENT ENGINE"
        kicker="Content Queue"
        subtitle="30-day post calendar with AI-generated, pillar-balanced content."
        actions={
          <SCButton onClick={handleGenerateMonth} disabled={generating}>
            <span className="material-symbols-outlined text-[18px]">
              {generating ? "sync" : "auto_awesome"}
            </span>
            {generating ? "Generating 30 Days..." : "Generate Month"}
          </SCButton>
        }
      />

      {/* Status Bar */}
      <SCGlassCard className="flex flex-wrap items-center gap-4 p-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Queue:
        </span>
        <span className="text-sm font-black text-white">{counts.queued + counts.draft}</span>
        <span className="text-xs text-slate-500">pending</span>
        <span className="text-slate-600">|</span>
        <span className="text-sm font-black text-emerald-400">{counts.approved}</span>
        <span className="text-xs text-slate-500">approved</span>
        <span className="text-slate-600">|</span>
        <span className="text-sm font-black text-blue-400">{counts.posted}</span>
        <span className="text-xs text-slate-500">posted</span>
      </SCGlassCard>

      {/* Action feedback message */}
      {actionMessage && (
        <SCGlassCard variant="broadcast" className="px-4 py-3">
          <p className="text-sm font-bold text-white">{actionMessage}</p>
        </SCGlassCard>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-[32px] text-slate-500">
            progress_activity
          </span>
        </div>
      ) : posts.length === 0 ? (
        /* Empty State */
        <SCGlassCard className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <span className="material-symbols-outlined mb-4 text-[48px] text-slate-600">
            calendar_month
          </span>
          <h3 className="text-lg font-black text-white">No content queued yet</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            Click &quot;Generate Month&quot; to create 30 days of posts with pillar-balanced content,
            optimized timing, and varied post formulas.
          </p>
          <SCButton onClick={handleGenerateMonth} disabled={generating} className="mt-6">
            <span className="material-symbols-outlined text-[18px]">
              {generating ? "sync" : "auto_awesome"}
            </span>
            {generating ? "Generating..." : "Generate Month"}
          </SCButton>
        </SCGlassCard>
      ) : (
        <>
          <SCTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "calendar" && <CalendarView posts={posts} />}
          {activeTab === "list" && (
            <ListView
              posts={posts}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onApprove={handleApprove}
              onReject={handleReject}
              pillarFilter={pillarFilter}
              statusFilter={statusFilter}
              onPillarFilter={setPillarFilter}
              onStatusFilter={setStatusFilter}
            />
          )}
          {activeTab === "analytics" && <AnalyticsView posts={posts} />}
        </>
      )}
    </div>
  );
}
