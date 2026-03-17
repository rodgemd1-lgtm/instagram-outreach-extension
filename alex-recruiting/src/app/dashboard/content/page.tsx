"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { isSameDay, format, subDays, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";
import { toCalendarPillar, PILLAR_CONFIG, type CalendarPillar } from "@/lib/dashboard/pillar-config";

interface CalendarPost {
  id: string;
  content: string;
  pillar: CalendarPillar;
  scheduledFor: string;
  status: string;
}

/* ------------------------------------------------------------------ */
/*  Pillar balance targets                                             */
/* ------------------------------------------------------------------ */

const PILLAR_TARGETS: { pillar: CalendarPillar; label: string; target: number; color: string }[] = [
  { pillar: "film",     label: "Film",     target: 40, color: PILLAR_CONFIG.film.color },
  { pillar: "training", label: "Training", target: 40, color: PILLAR_CONFIG.training.color },
  { pillar: "academic", label: "Academic", target: 20, color: PILLAR_CONFIG.academic.color },
];

/* ------------------------------------------------------------------ */
/*  Streak helper                                                      */
/* ------------------------------------------------------------------ */

function computeStreak(posts: CalendarPost[]): number {
  const postDates = new Set(
    posts
      .filter((p) => p.scheduledFor && (p.status === "posted" || p.status === "scheduled"))
      .map((p) => startOfDay(new Date(p.scheduledFor)).toISOString())
  );
  if (postDates.size === 0) return 0;
  let streak = 0;
  let day = startOfDay(new Date());
  while (postDates.has(day.toISOString())) {
    streak++;
    day = subDays(day, 1);
  }
  return streak;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ContentPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);

  /* composer state */
  const [composerOpen, setComposerOpen] = useState(false);
  const [editPost, setEditPost] = useState<CalendarPost | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  /* mobile day detail */
  const [mobileDay, setMobileDay] = useState<Date | null>(null);

  /* ---- Fetch posts ---- */
  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      if (!res.ok) return;
      const data = await res.json();
      const mapped: CalendarPost[] = (data.posts ?? []).map(
        (p: { id: string; content: string; pillar: string; scheduledFor?: string; status: string }) => ({
          id: p.id,
          content: p.content,
          pillar: toCalendarPillar(p.pillar) as CalendarPillar,
          scheduledFor: p.scheduledFor ?? "",
          status: p.status,
        })
      );
      setPosts(mapped);
    } catch {
      /* network error */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /* ---- Streak ---- */
  const streak = useMemo(() => computeStreak(posts), [posts]);

  /* ---- Pillar balance ---- */
  const pillarStats = useMemo(() => {
    const now = new Date();
    const monthPosts = posts.filter((p) => {
      if (!p.scheduledFor) return false;
      const d = new Date(p.scheduledFor);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const total = monthPosts.length || 1;
    const counts: Record<string, number> = { film: 0, training: 0, academic: 0 };
    for (const p of monthPosts) {
      if (p.pillar in counts) counts[p.pillar]++;
    }
    return PILLAR_TARGETS.map((t) => ({
      ...t,
      actual: Math.round((counts[t.pillar] / total) * 100),
      count: counts[t.pillar],
    }));
  }, [posts]);

  /* ---- Next suggested post ---- */
  const suggestion = useMemo(() => {
    let maxGap = -Infinity;
    let suggestedPillar = pillarStats[0];
    for (const ps of pillarStats) {
      const gap = ps.target - ps.actual;
      if (gap > maxGap) { maxGap = gap; suggestedPillar = ps; }
    }
    if (maxGap <= 0) return null;
    return { pillar: suggestedPillar.label, actual: suggestedPillar.actual, target: suggestedPillar.target };
  }, [pillarStats]);

  /* ---- Monthly stats ---- */
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const monthPosts = posts.filter((p) => {
      if (!p.scheduledFor) return false;
      const d = new Date(p.scheduledFor);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalPosts = monthPosts.length;
    const avgPerWeek = totalPosts > 0 ? Math.round((totalPosts / 4.3) * 10) / 10 : 0;
    const pillarCounts: Record<string, number> = {};
    for (const p of monthPosts) {
      pillarCounts[p.pillar] = (pillarCounts[p.pillar] || 0) + 1;
    }
    let bestPillar = "\u2014";
    let bestCount = 0;
    for (const [pillar, count] of Object.entries(pillarCounts)) {
      if (count > bestCount) { bestCount = count; bestPillar = PILLAR_CONFIG[pillar as CalendarPillar]?.label ?? pillar; }
    }
    return { totalPosts, avgPerWeek, bestPillar };
  }, [posts]);

  /* ---- Calendar grid data ---- */
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return days;
  }, [currentMonth]);

  const startDayOfWeek = getDay(startOfMonth(currentMonth));

  /* ---- Handlers ---- */
  function handleDayClick(date: Date) {
    setMobileDay((prev) => (prev && isSameDay(prev, date) ? null : date));
    setSelectedDate(date);
    setEditPost(null);
    setComposerOpen(true);
  }

  function handlePostClick(post: CalendarPost) {
    setEditPost(post);
    setSelectedDate(null);
    setComposerOpen(true);
  }

  function handleNewPost() {
    setEditPost(null);
    setSelectedDate(new Date());
    setComposerOpen(true);
  }

  /* ---- Mobile day detail ---- */
  const mobileDayPosts = mobileDay
    ? posts.filter((p) => p.scheduledFor && isSameDay(new Date(p.scheduledFor), mobileDay))
    : [];

  return (
    <div className="space-y-6">
      {/* ---- Page header ---- */}
      <SCPageHeader
        title="CONTENT ENGINE"
        subtitle="Plan, create, and schedule X/Twitter content."
        actions={
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <SCGlassCard className="flex items-center gap-2 px-3 py-2">
                <span className="material-symbols-outlined text-[18px] text-yellow-500">local_fire_department</span>
                <span className="font-mono text-sm font-bold text-white">{streak}</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400">day streak</span>
              </SCGlassCard>
            )}
            <SCButton onClick={handleNewPost}>
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Post
            </SCButton>
          </div>
        }
      />

      {/* ---- Loading state ---- */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined text-[24px] text-slate-500 animate-spin">progress_activity</span>
        </div>
      ) : (
        <>
          {/* ---- Stats row ---- */}
          <div className="grid grid-cols-3 gap-3">
            <SCStatCard label="Posts This Month" value={String(monthlyStats.totalPosts)} icon="article" />
            <SCStatCard label="Avg / Week" value={String(monthlyStats.avgPerWeek)} icon="calendar_month" />
            <SCStatCard label="Top Pillar" value={monthlyStats.bestPillar} icon="trophy" />
          </div>

          {/* ---- Pillar Balance ---- */}
          <SCGlassCard className="p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Pillar Balance</p>
            <div className="space-y-2.5">
              {pillarStats.map((ps) => (
                <div key={ps.pillar} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-medium text-slate-400">{ps.label}</span>
                  <div className="relative flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(ps.actual, 100)}%`, backgroundColor: ps.color, opacity: 0.8 }}
                    />
                    <div className="absolute inset-y-0 w-0.5 bg-slate-500" style={{ left: `${ps.target}%` }} />
                  </div>
                  <span className="w-16 text-right font-mono text-xs text-slate-400">
                    {ps.actual}%<span className="text-slate-600"> / {ps.target}%</span>
                  </span>
                </div>
              ))}
            </div>
          </SCGlassCard>

          {/* ---- Suggestion ---- */}
          {suggestion && (
            <SCGlassCard variant="broadcast" className="p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Next Suggested Post</p>
              <p className="text-sm text-slate-300">
                Your <span className="font-bold text-white">{suggestion.pillar}</span> content
                is at {suggestion.actual}% (target: {suggestion.target}%). Consider posting a{" "}
                {suggestion.pillar.toLowerCase()} piece to rebalance your content mix.
              </p>
            </SCGlassCard>
          )}

          {/* ---- Pillar distribution ---- */}
          <SCGlassCard className="p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Distribution</p>
            <div className="flex gap-4">
              {pillarStats.map((ps) => (
                <div key={ps.pillar} className="flex-1 text-center">
                  <div className="text-2xl font-black text-white">{ps.count}</div>
                  <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: ps.color }}>{ps.label}</div>
                </div>
              ))}
            </div>
          </SCGlassCard>

          {/* ---- Calendar grid ---- */}
          <SCGlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <SCButton variant="ghost" size="sm" onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}>
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </SCButton>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                {format(currentMonth, "MMMM yyyy")}
              </h3>
              <SCButton variant="ghost" size="sm" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </SCButton>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} className="text-center text-[10px] uppercase tracking-widest text-slate-500 py-1">{d}</div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {calendarDays.map((day) => {
                const dayPosts = posts.filter(p => p.scheduledFor && isSameDay(new Date(p.scheduledFor), day));
                const isToday = isSameDay(day, new Date());
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    className={`relative rounded-lg p-2 text-left transition-colors min-h-[60px] ${
                      isToday ? "ring-1 ring-sc-primary/50 bg-sc-primary/5" : "hover:bg-white/5"
                    }`}
                  >
                    <span className={`text-xs font-bold ${isToday ? "text-sc-primary" : "text-slate-400"}`}>
                      {format(day, "d")}
                    </span>
                    {dayPosts.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-0.5">
                        {dayPosts.slice(0, 3).map((post) => {
                          const cfg = PILLAR_CONFIG[post.pillar];
                          return (
                            <button
                              key={post.id}
                              onClick={(e) => { e.stopPropagation(); handlePostClick(post); }}
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: cfg?.color || "#666" }}
                            />
                          );
                        })}
                        {dayPosts.length > 3 && (
                          <span className="text-[8px] text-slate-500">+{dayPosts.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </SCGlassCard>

          {/* ---- Mobile day detail panel ---- */}
          {mobileDay && (
            <SCGlassCard className="p-4 md:hidden">
              <h3 className="text-sm font-bold text-white">
                {format(mobileDay, "EEEE, MMMM d")}
              </h3>
              {mobileDayPosts.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">No posts scheduled</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {mobileDayPosts.map((post) => {
                    const cfg = PILLAR_CONFIG[post.pillar];
                    return (
                      <li key={post.id}>
                        <button
                          type="button"
                          onClick={() => handlePostClick(post)}
                          className="w-full rounded-lg border border-sc-border p-2.5 text-left transition-colors hover:bg-white/5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                            <span className="text-[10px] font-bold text-slate-400">{cfg.label}</span>
                          </div>
                          <p className="mt-1 text-xs text-white line-clamp-2">{post.content}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </SCGlassCard>
          )}
        </>
      )}

      {/* ---- Composer slide-over ---- */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setComposerOpen(false)} />
          <div className="relative w-full max-w-lg bg-sc-bg border-l border-sc-border overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-black text-white">
                {editPost ? "Edit Post" : "New Post"}
              </h2>
              <SCButton variant="ghost" size="sm" onClick={() => setComposerOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </SCButton>
            </div>
            <SCGlassCard className="p-4">
              <p className="text-sm text-slate-400">
                {editPost ? `Editing: ${editPost.content.slice(0, 100)}...` : `Selected date: ${selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Today"}`}
              </p>
            </SCGlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
