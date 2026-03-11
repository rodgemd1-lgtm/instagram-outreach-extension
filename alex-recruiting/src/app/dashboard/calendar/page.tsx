"use client";

import { useState, useEffect, useCallback } from "react";
import { isSameDay, format } from "date-fns";
import { Plus, Loader2 } from "lucide-react";
import { CalendarGrid, type CalendarPost } from "@/components/dashboard/calendar-grid";
import { PostComposer } from "@/components/dashboard/post-composer";
import { toCalendarPillar, PILLAR_CONFIG, type CalendarPillar } from "@/lib/dashboard/pillar-config";

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CalendarPage() {
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

  /* ---- Handlers ---- */
  function handleDayClick(date: Date) {
    /* On mobile, toggle day detail panel; on all sizes, open composer */
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
    <div className="animate-fade-in">
      {/* ---- Page header ---- */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-dash-text">
            Content Calendar
          </h1>
          <p className="mt-1 text-sm text-dash-muted">
            Schedule and manage X posts across 5 content pillars.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNewPost}
          className="flex items-center gap-1.5 rounded-lg bg-dash-accent px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-dash-accent/90"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      {/* ---- Loading state ---- */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-dash-muted" />
        </div>
      ) : (
        <>
          {/* ---- Calendar grid ---- */}
          <CalendarGrid
            currentMonth={currentMonth}
            posts={posts}
            onMonthChange={setCurrentMonth}
            onDayClick={handleDayClick}
            onPostClick={handlePostClick}
          />

          {/* ---- Mobile day detail panel ---- */}
          {mobileDay && (
            <div className="mt-4 rounded-xl border border-dash-border bg-dash-bg p-4 md:hidden">
              <h3 className="text-sm font-semibold text-dash-text">
                {format(mobileDay, "EEEE, MMMM d")}
              </h3>
              {mobileDayPosts.length === 0 ? (
                <p className="mt-2 text-xs text-dash-muted">No posts scheduled</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {mobileDayPosts.map((post) => {
                    const cfg = PILLAR_CONFIG[post.pillar];
                    return (
                      <li key={post.id}>
                        <button
                          type="button"
                          onClick={() => handlePostClick(post)}
                          className="w-full rounded-lg border border-dash-border p-2.5 text-left transition-colors hover:bg-dash-surface-raised"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ backgroundColor: cfg.color }}
                            />
                            <span className="text-[11px] font-medium text-dash-muted">
                              {cfg.label}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-dash-text line-clamp-2">
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
