"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { isSameDay, format, subDays, startOfDay } from "date-fns";
import { Plus, Loader2, Flame } from "lucide-react";
import { CalendarGrid, type CalendarPost } from "@/components/dashboard/calendar-grid";
import { PostComposer } from "@/components/dashboard/post-composer";
import { PillarChart } from "@/components/dashboard/pillar-chart";
import { toCalendarPillar, PILLAR_CONFIG, type CalendarPillar } from "@/lib/dashboard/pillar-config";

/* ------------------------------------------------------------------ */
/*  Pillar balance targets                                             */
/* ------------------------------------------------------------------ */

const PILLAR_TARGETS: { pillar: CalendarPillar; label: string; target: number; color: string }[] = [
  { pillar: "film",     label: "Film",     target: 40, color: PILLAR_CONFIG.film.color },
  { pillar: "training", label: "Training", target: 40, color: PILLAR_CONFIG.training.color },
  { pillar: "academic", label: "Academic", target: 20, color: PILLAR_CONFIG.academic.color },
];

/* ------------------------------------------------------------------ */
/*  Streak helper — count consecutive days with posts ending today     */
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
      /* network error -- keep existing posts */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /* ---- Streak ---- */
  const streak = useMemo(() => computeStreak(posts), [posts]);

  /* ---- Pillar balance calculations ---- */
  const pillarStats = useMemo(() => {
    const now = new Date();
    const monthPosts = posts.filter((p) => {
      if (!p.scheduledFor) return false;
      const d = new Date(p.scheduledFor);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const total = monthPosts.length || 1; // avoid division by zero
    const counts: Record<string, number> = { film: 0, training: 0, academic: 0 };

    for (const p of monthPosts) {
      if (p.pillar in counts) {
        counts[p.pillar]++;
      }
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
      if (gap > maxGap) {
        maxGap = gap;
        suggestedPillar = ps;
      }
    }

    if (maxGap <= 0) return null;

    return {
      pillar: suggestedPillar.label,
      actual: suggestedPillar.actual,
      target: suggestedPillar.target,
    };
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

    // Average posts per week (assume ~4.3 weeks per month)
    const avgPerWeek = totalPosts > 0 ? Math.round((totalPosts / 4.3) * 10) / 10 : 0;

    // Best performing pillar by count
    const pillarCounts: Record<string, number> = {};
    for (const p of monthPosts) {
      pillarCounts[p.pillar] = (pillarCounts[p.pillar] || 0) + 1;
    }
    let bestPillar = "\u2014";
    let bestCount = 0;
    for (const [pillar, count] of Object.entries(pillarCounts)) {
      if (count > bestCount) {
        bestCount = count;
        bestPillar = PILLAR_CONFIG[pillar as CalendarPillar]?.label ?? pillar;
      }
    }

    return { totalPosts, avgPerWeek, bestPillar };
  }, [posts]);

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

  function handleSaved() {
    fetchPosts();
  }

  /* ---- Mobile day detail ---- */
  const mobileDayPosts = mobileDay
    ? posts.filter((p) => p.scheduledFor && isSameDay(new Date(p.scheduledFor), mobileDay))
    : [];

  return (
    <div className="animate-fade-in bg-[#FAFAFA] text-[#0F1720] min-h-screen -m-6 p-6">
      {/* ---- Page header ---- */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-[#0F1720]">
            Content Engine
          </h1>
          {streak > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2">
              <Flame
                className="h-4 w-4 text-[#F59E0B]"
                fill="#F59E0B"
              />
              <span className="font-mono text-sm font-bold text-[#0F1720]">{streak}</span>
              <span className="text-[11px] uppercase tracking-[0.15em] text-[#9CA3AF]">
                day streak
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleNewPost}
          className="flex items-center gap-1.5 rounded-lg bg-[#0F1720] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1F2937]"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      <p className="mb-6 -mt-4 text-sm text-[#9CA3AF]">
        Plan, create, and schedule X/Twitter content.
      </p>

      {/* ---- Loading state ---- */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-[#9CA3AF]" />
        </div>
      ) : (
        <>
          {/* ---- Pillar Balance Gauge ---- */}
          <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-4">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9CA3AF]">
              Pillar Balance
            </h2>
            <div className="space-y-2.5">
              {pillarStats.map((ps) => (
                <div key={ps.pillar} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-medium text-[#6B7280]">
                    {ps.label}
                  </span>
                  <div className="relative flex-1 h-2 rounded-full bg-[#F5F5F4] overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(ps.actual, 100)}%`,
                        backgroundColor: ps.color,
                        opacity: 0.8,
                      }}
                    />
                    {/* target marker */}
                    <div
                      className="absolute inset-y-0 w-0.5 bg-[#9CA3AF]"
                      style={{ left: `${ps.target}%` }}
                    />
                  </div>
                  <span className="w-16 text-right font-mono text-xs text-[#6B7280]">
                    {ps.actual}%
                    <span className="text-[#9CA3AF]"> / {ps.target}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Next Suggested Post ---- */}
          {suggestion && (
            <div className="mb-6 rounded-lg border border-[#E5E7EB] bg-white p-4 border-l-2 border-l-[#0F1720]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9CA3AF] mb-1">
                Next Suggested Post
              </p>
              <p className="text-sm text-[#6B7280]">
                Your <span className="font-semibold text-[#0F1720]">{suggestion.pillar}</span> content
                is at {suggestion.actual}% (target: {suggestion.target}%). Consider posting a{" "}
                {suggestion.pillar.toLowerCase()} piece to rebalance your content mix.
              </p>
            </div>
          )}

          {/* ---- Stats row ---- */}
          <div className="mb-6 flex gap-3">
            <div className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-center">
              <div className="font-mono text-lg font-bold text-[#0F1720]">
                {monthlyStats.totalPosts}
              </div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-[#9CA3AF] mt-0.5">
                Posts this month
              </div>
            </div>
            <div className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-center">
              <div className="font-mono text-lg font-bold text-[#0F1720]">
                {monthlyStats.avgPerWeek}
              </div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-[#9CA3AF] mt-0.5">
                Avg / week
              </div>
            </div>
            <div className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-center">
              <div className="text-lg font-bold text-[#0F1720]">
                {monthlyStats.bestPillar}
              </div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-[#9CA3AF] mt-0.5">
                Top pillar
              </div>
            </div>
          </div>

          {/* ---- Pillar distribution chart ---- */}
          <div className="mb-6">
            <PillarChart posts={posts} />
          </div>

          {/* ---- Calendar grid ---- */}
          <div>
            <CalendarGrid
              currentMonth={currentMonth}
              posts={posts}
              onMonthChange={setCurrentMonth}
              onDayClick={handleDayClick}
              onPostClick={handlePostClick}
            />
          </div>

          {/* ---- Mobile day detail panel ---- */}
          {mobileDay && (
            <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-4 md:hidden">
              <h3 className="text-sm font-semibold text-[#0F1720]">
                {format(mobileDay, "EEEE, MMMM d")}
              </h3>
              {mobileDayPosts.length === 0 ? (
                <p className="mt-2 text-xs text-[#9CA3AF]">No posts scheduled</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {mobileDayPosts.map((post) => {
                    const cfg = PILLAR_CONFIG[post.pillar];
                    return (
                      <li key={post.id}>
                        <button
                          type="button"
                          onClick={() => handlePostClick(post)}
                          className="w-full rounded-lg border border-[#E5E7EB] p-2.5 text-left transition-colors hover:bg-[#F5F5F4]"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ backgroundColor: cfg.color }}
                            />
                            <span className="text-[11px] font-medium text-[#9CA3AF]">
                              {cfg.label}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#0F1720] line-clamp-2">
                            {post.content}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {/* ---- Post composer slide-over ---- */}
      <PostComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        editPost={editPost}
        defaultDate={selectedDate}
        onSaved={handleSaved}
      />
    </div>
  );
}
