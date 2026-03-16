"use client";

import { useState, useEffect, useCallback } from "react";
import { StudioPageHeader } from "@/components/studio-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  List,
  BarChart3,
  Check,
  Pencil,
  X,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PILLAR_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  performance: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  work_ethic: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  character: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  queued: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
  draft: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
  approved: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  rejected: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  posted: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
};

const PILLAR_LABELS: Record<string, string> = {
  performance: "Performance",
  work_ethic: "Work Ethic",
  character: "Character",
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PillarBadge({ pillar }: { pillar: string }) {
  const colors = PILLAR_COLORS[pillar] || PILLAR_COLORS.performance;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {PILLAR_LABELS[pillar] || pillar}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.queued;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {status}
    </span>
  );
}

function EmptyState({ onGenerate, loading }: { onGenerate: () => void; loading: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-[rgba(15,40,75,0.08)] bg-white/76 px-8 py-16 text-center shadow-sm">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(15,40,75,0.05)]">
        <Calendar className="h-7 w-7 text-[var(--app-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--app-navy-strong)]">
        No content queued yet
      </h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--app-muted)]">
        Click &quot;Generate Month&quot; to create 30 days of posts with pillar-balanced content,
        optimized timing, and varied post formulas.
      </p>
      <Button onClick={onGenerate} disabled={loading} className="mt-6 gap-2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? "Generating..." : "Generate Month"}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Calendar Tab
// ---------------------------------------------------------------------------

function CalendarView({
  posts,
}: {
  posts: QueuePost[];
}) {
  const [weekOffset, setWeekOffset] = useState(0);

  // Get the start of the current viewing window (Sunday of current week + offset)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + weekOffset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const days = getDaysInRange(startOfWeek, 35); // 5 weeks for the calendar grid

  // Group posts by date
  const postsByDate: Record<string, QueuePost[]> = {};
  for (const post of posts) {
    const key = getDateKey(post.scheduledFor);
    if (!postsByDate[key]) postsByDate[key] = [];
    postsByDate[key].push(post);
  }

  const weekLabel = `${startOfWeek.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;

  return (
    <div className="space-y-4">
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--app-navy-strong)]">{weekLabel}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--app-muted)]"
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

          // Count by pillar
          const pillarCounts: Record<string, number> = {};
          for (const p of dayPosts) {
            pillarCounts[p.pillar] = (pillarCounts[p.pillar] || 0) + 1;
          }

          return (
            <div
              key={dateKey}
              className={`min-h-[110px] rounded-[14px] border p-2 transition-colors ${
                isToday
                  ? "border-[var(--app-gold)] bg-[rgba(200,155,60,0.06)]"
                  : "border-[rgba(15,40,75,0.06)] bg-white/60 hover:bg-white/90"
              } ${!isCurrentMonth ? "opacity-40" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold ${
                    isToday ? "text-[var(--app-gold)]" : "text-[var(--app-navy-strong)]"
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayPosts.length > 0 && (
                  <span className="text-[10px] font-medium text-[var(--app-muted)]">
                    {dayPosts.length} post{dayPosts.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Pillar breakdown dots */}
              {dayPosts.length > 0 && (
                <div className="mt-2 space-y-1">
                  {Object.entries(pillarCounts).map(([pillar, count]) => {
                    const colors = PILLAR_COLORS[pillar] || PILLAR_COLORS.performance;
                    return (
                      <div key={pillar} className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                        <span className="text-[10px] text-[var(--app-muted)]">
                          {PILLAR_LABELS[pillar] || pillar} ({count})
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick preview of first post */}
              {dayPosts.length > 0 && (
                <div className="mt-2 line-clamp-2 text-[10px] leading-tight text-[var(--app-muted)]">
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

// ---------------------------------------------------------------------------
// List Tab
// ---------------------------------------------------------------------------

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
      <div className="flex flex-wrap items-center gap-3 rounded-[18px] border border-[rgba(15,40,75,0.08)] bg-white/76 px-4 py-3 shadow-sm">
        <Filter className="h-4 w-4 text-[var(--app-muted)]" />

        <select
          value={pillarFilter}
          onChange={(e) => onPillarFilter(e.target.value)}
          className="rounded-lg border border-[rgba(15,40,75,0.12)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--app-navy-strong)] outline-none focus:border-[var(--app-gold)]"
        >
          <option value="">All Pillars</option>
          <option value="performance">Performance</option>
          <option value="work_ethic">Work Ethic</option>
          <option value="character">Character</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value)}
          className="rounded-lg border border-[rgba(15,40,75,0.12)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--app-navy-strong)] outline-none focus:border-[var(--app-gold)]"
        >
          <option value="">All Statuses</option>
          <option value="queued">Queued</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="posted">Posted</option>
        </select>

        <span className="text-xs text-[var(--app-muted)]">
          {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
        </span>

        {/* Bulk Actions */}
        {someSelected && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--app-navy-strong)]">
              {selectedIds.size} selected
            </span>
            <Button
              variant="success"
              size="sm"
              className="gap-1.5"
              onClick={() => onApprove(Array.from(selectedIds))}
            >
              <Check className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={() => onReject(Array.from(selectedIds))}
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/76 shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-[40px_100px_80px_120px_1fr_100px_110px] items-center gap-3 border-b border-[rgba(15,40,75,0.06)] bg-[rgba(15,40,75,0.02)] px-4 py-3">
          <button onClick={onSelectAll} className="flex items-center justify-center">
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-[var(--app-navy-strong)]" />
            ) : (
              <Square className="h-4 w-4 text-[var(--app-muted)]" />
            )}
          </button>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
            Date
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
            Time
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
            Pillar
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
            Preview
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
            Status
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
            Actions
          </span>
        </div>

        {/* Rows */}
        {filteredPosts.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-[var(--app-muted)]">
            No posts match the current filters.
          </div>
        ) : (
          <div className="divide-y divide-[rgba(15,40,75,0.04)]">
            {filteredPosts.map((post) => {
              const isSelected = selectedIds.has(post.id);
              return (
                <div
                  key={post.id}
                  className={`grid grid-cols-[40px_100px_80px_120px_1fr_100px_110px] items-center gap-3 px-4 py-3 transition-colors ${
                    isSelected
                      ? "bg-[rgba(200,155,60,0.04)]"
                      : "hover:bg-[rgba(15,40,75,0.01)]"
                  }`}
                >
                  <button
                    onClick={() => onToggleSelect(post.id)}
                    className="flex items-center justify-center"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-[var(--app-navy-strong)]" />
                    ) : (
                      <Square className="h-4 w-4 text-[var(--app-muted)]" />
                    )}
                  </button>
                  <span className="text-xs font-medium text-[var(--app-navy-strong)]">
                    {formatDate(post.scheduledFor)}
                  </span>
                  <span className="text-xs text-[var(--app-muted)]">
                    {formatTime(post.scheduledFor)}
                  </span>
                  <PillarBadge pillar={post.pillar} />
                  <p className="truncate text-sm text-[var(--app-navy-strong)]">
                    {post.content.slice(0, 100)}
                  </p>
                  <StatusBadge status={post.status} />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onApprove([post.id])}
                      className="rounded-lg p-1.5 text-green-600 transition-colors hover:bg-green-50"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {}}
                      className="rounded-lg p-1.5 text-[var(--app-muted)] transition-colors hover:bg-[rgba(15,40,75,0.04)]"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onReject([post.id])}
                      className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                      title="Reject"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Analytics Tab
// ---------------------------------------------------------------------------

function AnalyticsView({ posts }: { posts: QueuePost[] }) {
  // Pillar distribution
  const pillarDist = { performance: 0, work_ethic: 0, character: 0 };
  for (const p of posts) {
    if (p.pillar in pillarDist) {
      pillarDist[p.pillar as keyof typeof pillarDist]++;
    }
  }
  const total = posts.length || 1;

  // Posts per day (next 30 days)
  const postsPerDay: Record<string, number> = {};
  for (const p of posts) {
    const key = getDateKey(p.scheduledFor);
    postsPerDay[key] = (postsPerDay[key] || 0) + 1;
  }

  const sortedDays = Object.entries(postsPerDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 30);

  const maxPostsInDay = Math.max(...sortedDays.map(([, c]) => c), 1);

  // Status breakdown
  const statusDist: Record<string, number> = {};
  for (const p of posts) {
    statusDist[p.status] = (statusDist[p.status] || 0) + 1;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Pillar Distribution */}
      <div className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/76 p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-muted)]">
          Pillar Distribution
        </h3>
        <p className="mt-1 text-xs text-[var(--app-muted)]">
          Target: 40% Performance, 40% Work Ethic, 20% Character
        </p>
        <div className="mt-6 space-y-4">
          {(["performance", "work_ethic", "character"] as const).map((pillar) => {
            const count = pillarDist[pillar];
            const pct = Math.round((count / total) * 100);
            const colors = PILLAR_COLORS[pillar];
            const targets: Record<string, number> = {
              performance: 40,
              work_ethic: 40,
              character: 20,
            };
            const target = targets[pillar];
            const isBalanced = Math.abs(pct - target) <= 10;

            return (
              <div key={pillar}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                    <span className="text-sm font-semibold text-[var(--app-navy-strong)]">
                      {PILLAR_LABELS[pillar]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--app-navy-strong)]">
                      {pct}%
                    </span>
                    <span className="text-xs text-[var(--app-muted)]">
                      ({count} posts)
                    </span>
                    {isBalanced ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <span className="text-[10px] text-amber-500">
                        target: {target}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[rgba(15,40,75,0.06)]">
                  <div
                    className={`h-full rounded-full transition-all ${colors.dot}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/76 p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-muted)]">
          Status Breakdown
        </h3>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {Object.entries(statusDist).map(([status, count]) => {
            const colors = STATUS_COLORS[status] || STATUS_COLORS.queued;
            return (
              <div
                key={status}
                className={`rounded-[14px] border p-4 ${colors.bg} ${colors.border}`}
              >
                <p className={`text-2xl font-bold ${colors.text}`}>{count}</p>
                <p className={`mt-1 text-xs font-semibold uppercase tracking-wider ${colors.text}`}>
                  {status}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Posts per Day Chart */}
      <div className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/76 p-6 shadow-sm lg:col-span-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-muted)]">
          Posts per Day
        </h3>
        <p className="mt-1 text-xs text-[var(--app-muted)]">
          Scheduled posts across the next 30 days
        </p>
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
                  className="relative w-full rounded-t-md bg-[var(--app-navy-strong)] transition-all group-hover:bg-[var(--app-gold)]"
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                  title={`${date}: ${count} posts`}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-[var(--app-navy-strong)] opacity-0 transition-opacity group-hover:opacity-100">
                    {count}
                  </span>
                </div>
                <span className="text-[8px] text-[var(--app-muted)]">
                  {sortedDays.length <= 15 ? dayLabel : ""}
                </span>
              </div>
            );
          })}
        </div>
        {sortedDays.length > 15 && (
          <div className="mt-2 flex justify-between text-[10px] text-[var(--app-muted)]">
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
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

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

  // Fetch posts from the queue API
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/content/queue");
      if (!res.ok) throw new Error("Failed to fetch queue");
      const data = await res.json();
      setPosts(data.posts || []);
      setCounts(
        data.counts || { queued: 0, draft: 0, approved: 0, rejected: 0, posted: 0 }
      );
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

  // Generate month of content
  const handleGenerateMonth = async () => {
    try {
      setGenerating(true);
      setActionMessage(null);
      const res = await fetch("/api/content/generate-month", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate content");
      const data = await res.json();

      if (data.success) {
        setActionMessage(`Generated ${data.generated} posts across 30 days.`);
        // If the DB returned posts inline (no DB configured), use them directly
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
          // Refresh from DB
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

  // Bulk approve
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

      // Optimistically update local state
      setPosts((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, status: "approved" } : p))
      );
      setSelectedIds(new Set());
      setActionMessage(`Approved ${data.updated || ids.length} post${ids.length !== 1 ? "s" : ""}.`);
    } catch (err) {
      console.error("Approve failed:", err);
      setActionMessage("Failed to approve posts.");
    }
  };

  // Bulk reject
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

      setPosts((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, status: "rejected" } : p))
      );
      setSelectedIds(new Set());
      setActionMessage(`Rejected ${data.updated || ids.length} post${ids.length !== 1 ? "s" : ""}.`);
    } catch (err) {
      console.error("Reject failed:", err);
      setActionMessage("Failed to reject posts.");
    }
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select all visible
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

  return (
    <div className="space-y-6">
      <StudioPageHeader
        icon="FileText"
        kicker="Trey + Content Engine"
        title="Content Queue -- 30-day post calendar with AI-generated, pillar-balanced content."
        description="Review, approve, and manage the content pipeline. Every post is engineered with behavioral psychology, optimized timing, and pillar diversity to maximize coach visibility."
        council={["Trey", "Sophie", "Susan"]}
      >
        <p className="font-semibold">Content engine rules:</p>
        <p className="mt-2 leading-6 text-[var(--app-muted)]">
          40% Performance, 40% Work Ethic, 20% Character. Every post uses one of five
          psychology-backed formulas. Quality over quantity -- only publish what strengthens the
          recruiting narrative.
        </p>
      </StudioPageHeader>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[rgba(15,40,75,0.08)] bg-white/76 px-4 py-2 shadow-sm">
            <span className="text-xs font-semibold text-[var(--app-muted)]">Queue:</span>
            <span className="text-sm font-bold text-[var(--app-navy-strong)]">
              {counts.queued + counts.draft}
            </span>
            <span className="text-xs text-[var(--app-muted)]">pending</span>
            <span className="mx-1 text-[var(--app-muted)]">|</span>
            <span className="text-sm font-bold text-green-600">{counts.approved}</span>
            <span className="text-xs text-[var(--app-muted)]">approved</span>
            <span className="mx-1 text-[var(--app-muted)]">|</span>
            <span className="text-sm font-bold text-blue-600">{counts.posted}</span>
            <span className="text-xs text-[var(--app-muted)]">posted</span>
          </div>
        </div>

        <Button onClick={handleGenerateMonth} disabled={generating} className="gap-2">
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {generating ? "Generating 30 Days..." : "Generate Month"}
        </Button>
      </div>

      {/* Action feedback message */}
      {actionMessage && (
        <div className="rounded-[14px] border border-[rgba(15,40,75,0.08)] bg-[rgba(200,155,60,0.06)] px-4 py-3 text-sm font-medium text-[var(--app-navy-strong)]">
          {actionMessage}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--app-muted)]" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState onGenerate={handleGenerateMonth} loading={generating} />
      ) : (
        <Tabs defaultValue="calendar">
          <TabsList>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <CalendarView posts={posts} />
          </TabsContent>

          <TabsContent value="list">
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
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsView posts={posts} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
