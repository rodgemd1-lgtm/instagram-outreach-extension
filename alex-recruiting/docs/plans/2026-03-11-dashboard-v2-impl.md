# Dashboard v2.0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace 4 placeholder dashboard pages with real, API-wired UI for managing X content, coaches, DM outreach, and analytics.

**Architecture:** Build on existing `/dashboard` shell (layout, sidebar, mobile nav, design tokens). All backend APIs exist — this is purely frontend. Components go in `src/components/dashboard/`, pages in `src/app/dashboard/`.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS with `dash-*` design tokens, Lucide icons, existing shadcn/ui components (`badge.tsx`, `select.tsx`, `dialog.tsx`, `button.tsx`, `input.tsx`)

**Design doc:** `docs/plans/2026-03-11-dashboard-v2-design.md`

**Key types (from `src/lib/types.ts`):**
- `Post` — id, content, pillar (ContentPillar), hashtags, mediaUrl, scheduledFor, bestTime, status (PostStatus), xPostId
- `Coach` — id, name, schoolName, division (DivisionTier), priorityTier, olNeedScore, xActivityScore, followStatus, dmStatus, lastEngaged, notes
- `DMMessage` — id, coachId, coachName, schoolName, templateType, content, status (DMStatus), sentAt, respondedAt
- `AnalyticsSnapshot` — date, totalFollowers, coachFollows, dmsSent, dmResponseRate, postsPublished, avgEngagementRate, profileVisits, auditScore

**API patterns:** GET returns `{ resource: T[], total: number }`. POST returns `{ resource: T }` with 201.

**Existing utilities (from `src/lib/utils.ts`):** `cn()`, `formatDate()`, `formatTime()`, `generateId()`, `truncate()`, `getPillarColor()`, `getPillarLabel()`, `getTierColor()`, `getStatusColor()`

**Existing UI components (from `src/components/ui/`):** `badge.tsx` (has tier1-3, draft/approved/posted/rejected/sent/responded variants), `button.tsx`, `input.tsx`, `select.tsx` (Radix), `dialog.tsx` (Radix), `card.tsx`, `textarea.tsx`, `table.tsx`, `tabs.tsx`

---

## Task 1: Shared SlideOver Component

**Files:**
- Create: `src/components/dashboard/slide-over.tsx`

**Steps:**

1. Create `slide-over.tsx` — a reusable right-side panel used by Post Composer, Coach Detail, and DM Composer:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string; // Tailwind width class, default "w-full max-w-lg"
}

export function SlideOver({ open, onClose, title, children, width = "w-full max-w-lg" }: SlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "relative flex h-full flex-col bg-dash-bg border-l border-dash-border shadow-2xl",
          "animate-in slide-in-from-right duration-300",
          width
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dash-border px-6 py-4">
          <h2 className="text-lg font-semibold text-dash-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-dash-muted hover:bg-dash-surface-raised hover:text-dash-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
```

2. Verify: `npm run build` in `alex-recruiting/` — should pass with no errors referencing slide-over.

---

## Task 2: Empty State Component

**Files:**
- Create: `src/components/dashboard/empty-state.tsx`

**Steps:**

1. Create `empty-state.tsx`:

```tsx
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-16 md:py-24">
      <Icon className="h-12 w-12 text-dash-muted/50" />
      <p className="mt-4 text-sm font-medium text-dash-muted">{title}</p>
      <p className="mt-1 max-w-xs text-center text-xs text-dash-muted/70">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-dash-accent px-4 py-2 text-sm font-medium text-white hover:bg-dash-accent-hover transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
```

---

## Task 3: Content Calendar Page (`/dashboard/calendar`)

**Files:**
- Rewrite: `src/app/dashboard/calendar/page.tsx`
- Create: `src/components/dashboard/calendar-grid.tsx`
- Create: `src/components/dashboard/post-composer.tsx`

**Steps:**

1. Create `calendar-grid.tsx` — month view with post pills:

```tsx
"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/types";

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
  posts: Post[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onDayClick: (date: Date) => void;
  onPostClick: (post: Post) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PILLAR_COLORS: Record<string, string> = {
  performance: "bg-dash-accent",
  work_ethic: "bg-dash-warning",
  character: "bg-dash-success",
  film: "bg-dash-danger",
  training: "bg-dash-accent",
  academic: "bg-dash-success",
  camp: "bg-dash-warning",
  lifestyle: "bg-dash-gold",
};

function getDaysInMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay(); // 0=Sun
  const totalDays = lastDay.getDate();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));
  // Pad end to complete last row
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function CalendarGrid({
  year, month, posts, onPrevMonth, onNextMonth, onToday, onDayClick, onPostClick,
}: CalendarGridProps) {
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const today = new Date();
  const monthLabel = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const postsByDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of posts) {
      const d = new Date(post.scheduledFor);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(post);
    }
    return map;
  }, [posts]);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-dash-text">{monthLabel}</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onToday} className="rounded-lg border border-dash-border px-3 py-1.5 text-xs font-medium text-dash-text-secondary hover:bg-dash-surface-raised transition-colors">
            Today
          </button>
          <button type="button" onClick={onPrevMonth} className="rounded-lg border border-dash-border p-1.5 text-dash-muted hover:bg-dash-surface-raised transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={onNextMonth} className="rounded-lg border border-dash-border p-1.5 text-dash-muted hover:bg-dash-surface-raised transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-dash-border">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-dash-muted">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-dash-border-subtle bg-dash-bg/50 md:min-h-[100px]" />;
          }

          const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const dayPosts = postsByDay.get(key) || [];
          const isToday = isSameDay(day, today);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[80px] border-b border-r border-dash-border-subtle p-1.5 text-left transition-colors hover:bg-dash-surface-raised md:min-h-[100px] md:p-2",
                isToday && "bg-dash-accent/5"
              )}
            >
              <span className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                isToday ? "bg-dash-accent text-white" : "text-dash-text-secondary"
              )}>
                {day.getDate()}
              </span>
              <div className="mt-1 flex flex-col gap-0.5">
                {dayPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); onPostClick(post); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onPostClick(post); } }}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-[10px] font-medium text-white cursor-pointer hover:opacity-80",
                      PILLAR_COLORS[post.pillar] || "bg-dash-muted"
                    )}
                  >
                    <span className="hidden md:inline">{post.content.slice(0, 30)}</span>
                    <span className="md:hidden">&bull;</span>
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <span className="text-[10px] text-dash-muted">+{dayPosts.length - 3} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

2. Create `post-composer.tsx` — slide-over panel for creating/editing posts:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Image as ImageIcon, Clock, Send, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { SlideOver } from "./slide-over";
import type { Post, ContentPillar, PostStatus } from "@/lib/types";

interface PostComposerProps {
  open: boolean;
  onClose: () => void;
  post?: Post | null; // null = new post
  defaultDate?: Date;
  onSaved: () => void; // refresh calendar after save
}

const PILLARS: { value: ContentPillar; label: string; color: string }[] = [
  { value: "performance", label: "Film", color: "bg-dash-danger" },
  { value: "work_ethic", label: "Training", color: "bg-dash-accent" },
  { value: "character", label: "Character", color: "bg-dash-success" },
];

const HASHTAG_SUGGESTIONS: Record<string, string[]> = {
  performance: ["#RecruitJacob", "#FilmDontLie", "#FridayNightLights", "#TrenchWork"],
  work_ethic: ["#GrindSeason", "#OffseasonWork", "#NoDaysOff", "#IronSharpensIron"],
  character: ["#TeamFirst", "#StudentAthlete", "#MoreThanAnAthlete", "#Classof2029"],
};

export function PostComposer({ open, onClose, post, defaultDate, onSaved }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [pillar, setPillar] = useState<ContentPillar>("performance");
  const [hashtags, setHashtags] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("08:00");
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);

  // Populate from existing post or defaults
  useEffect(() => {
    if (post) {
      setContent(post.content);
      setPillar(post.pillar);
      setHashtags(post.hashtags.join(", "));
      setMediaUrl(post.mediaUrl || "");
      if (post.scheduledFor) {
        const d = new Date(post.scheduledFor);
        setScheduledDate(d.toISOString().split("T")[0]);
        setScheduledTime(d.toTimeString().slice(0, 5));
      }
    } else {
      setContent("");
      setPillar("performance");
      setHashtags("");
      setMediaUrl("");
      if (defaultDate) {
        setScheduledDate(defaultDate.toISOString().split("T")[0]);
      } else {
        setScheduledDate(new Date().toISOString().split("T")[0]);
      }
      setScheduledTime("08:00");
    }
  }, [post, defaultDate, open]);

  const charCount = content.length;
  const isOverLimit = charCount > 280;

  const handleSave = useCallback(async (status: PostStatus) => {
    setSaving(true);
    try {
      const hashtagArray = hashtags.split(",").map((h) => h.trim()).filter(Boolean);
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      const body = {
        content,
        pillar,
        hashtags: hashtagArray,
        mediaUrl: mediaUrl || null,
        scheduledFor,
        bestTime: scheduledTime,
      };

      if (post) {
        // Update existing — use POST with id for now (API may need PATCH)
        await fetch(`/api/posts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to save post:", err);
    } finally {
      setSaving(false);
    }
  }, [content, pillar, hashtags, mediaUrl, scheduledDate, scheduledTime, post, onSaved, onClose]);

  const handlePostNow = useCallback(async () => {
    setPosting(true);
    try {
      // Create post first, then send
      const hashtagArray = hashtags.split(",").map((h) => h.trim()).filter(Boolean);
      const fullContent = [content, ...hashtagArray.map((h) => (h.startsWith("#") ? h : `#${h}`))].join(" ");

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: fullContent, pillar, hashtags: hashtagArray, mediaUrl: mediaUrl || null }),
      });
      const { post: newPost } = await res.json();

      if (newPost?.id) {
        await fetch(`/api/posts/${newPost.id}/send`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to post:", err);
    } finally {
      setPosting(false);
    }
  }, [content, pillar, hashtags, mediaUrl, onSaved, onClose]);

  return (
    <SlideOver open={open} onClose={onClose} title={post ? "Edit Post" : "New Post"}>
      <div className="space-y-5">
        {/* Content */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-dash-border bg-dash-surface p-3 font-mono text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
            placeholder="What's happening?"
          />
          <p className={cn("mt-1 text-right text-xs", isOverLimit ? "text-dash-danger font-semibold" : "text-dash-muted")}>
            {charCount}/280
          </p>
        </div>

        {/* Pillar selector */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">Content Pillar</label>
          <div className="flex gap-2">
            {PILLARS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => {
                  setPillar(p.value);
                  setHashtags(HASHTAG_SUGGESTIONS[p.value]?.join(", ") || "");
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                  pillar === p.value
                    ? `${p.color} text-white`
                    : "border border-dash-border text-dash-text-secondary hover:bg-dash-surface-raised"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hashtags */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">Hashtags</label>
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            className="w-full rounded-lg border border-dash-border bg-dash-surface px-3 py-2 text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
            placeholder="#RecruitJacob, #Classof2029"
          />
        </div>

        {/* Media URL */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">Media</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="flex-1 rounded-lg border border-dash-border bg-dash-surface px-3 py-2 text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
              placeholder="Image or video URL (optional)"
            />
            <button type="button" className="rounded-lg border border-dash-border p-2 text-dash-muted hover:bg-dash-surface-raised transition-colors">
              <ImageIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">Schedule</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="flex-1 rounded-lg border border-dash-border bg-dash-surface px-3 py-2 text-sm text-dash-text focus:border-dash-accent focus:outline-none"
            />
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-28 rounded-lg border border-dash-border bg-dash-surface px-3 py-2 text-sm text-dash-text focus:border-dash-accent focus:outline-none"
            />
          </div>
          <p className="mt-1 text-xs text-dash-muted">
            <Clock className="mr-1 inline h-3 w-3" />
            Best times: Tue/Thu 7-9am CT, Sat 10am CT
          </p>
        </div>

        {/* X Preview */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">Preview</label>
          <div className="rounded-xl border border-dash-border bg-dash-surface p-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dash-accent/20 text-sm font-bold text-dash-accent">
                JR
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-dash-text">Jacob Rodgers</span>
                  <span className="text-xs text-dash-muted">@jacob_rodgers79</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-dash-text-secondary">
                  {content || "Your post will appear here..."}
                </p>
                {hashtags && (
                  <p className="mt-1 text-sm text-dash-accent">
                    {hashtags.split(",").map((h) => h.trim()).filter(Boolean).map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-dash-border pt-4">
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving || !content}
            className="flex items-center gap-2 rounded-lg border border-dash-border px-4 py-2 text-sm font-medium text-dash-text-secondary hover:bg-dash-surface-raised transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("scheduled")}
            disabled={saving || !content || !scheduledDate}
            className="flex items-center gap-2 rounded-lg bg-dash-accent px-4 py-2 text-sm font-medium text-white hover:bg-dash-accent-hover transition-colors disabled:opacity-50"
          >
            <Clock className="h-4 w-4" />
            Schedule
          </button>
          <button
            type="button"
            onClick={handlePostNow}
            disabled={posting || !content || isOverLimit}
            className="flex items-center gap-2 rounded-lg bg-dash-success px-4 py-2 text-sm font-medium text-white hover:bg-dash-success/90 transition-colors disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Post Now
          </button>
        </div>
      </div>
    </SlideOver>
  );
}
```

3. Rewrite `src/app/dashboard/calendar/page.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { Post } from "@/lib/types";
import { CalendarGrid } from "@/components/dashboard/calendar-grid";
import { PostComposer } from "@/components/dashboard/post-composer";

export default function CalendarPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch { /* fallback to empty */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchPosts(); }, [fetchPosts]);

  const handlePrevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const handleToday = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  const handleDayClick = (date: Date) => {
    setSelectedPost(null);
    setSelectedDate(date);
    setComposerOpen(true);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setSelectedDate(undefined);
    setComposerOpen(true);
  };

  const handleNewPost = () => {
    setSelectedPost(null);
    setSelectedDate(new Date());
    setComposerOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-dash-text">Content Calendar</h1>
          <p className="mt-1 text-sm text-dash-muted">Plan, schedule, and publish X posts.</p>
        </div>
        <button
          type="button"
          onClick={handleNewPost}
          className="flex items-center gap-2 rounded-lg bg-dash-accent px-4 py-2 text-sm font-medium text-white hover:bg-dash-accent-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-dash-accent border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-xl border border-dash-border bg-dash-surface p-3 md:p-4">
          <CalendarGrid
            year={year}
            month={month}
            posts={posts}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
            onDayClick={handleDayClick}
            onPostClick={handlePostClick}
          />
        </div>
      )}

      <PostComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        post={selectedPost}
        defaultDate={selectedDate}
        onSaved={fetchPosts}
      />
    </div>
  );
}
```

4. Verify: `cd alex-recruiting && npm run build` — should pass.

5. Commit: `git add src/components/dashboard/calendar-grid.tsx src/components/dashboard/post-composer.tsx src/app/dashboard/calendar/page.tsx && git commit -m "feat: Content Calendar + Post Composer (v2.0 Phase 2)"`

---

## Task 4: Coach CRM Page (`/dashboard/coaches`)

**Files:**
- Rewrite: `src/app/dashboard/coaches/page.tsx`
- Create: `src/components/dashboard/coach-table.tsx`
- Create: `src/components/dashboard/coach-detail.tsx`

**Steps:**

1. Create `coach-table.tsx` — filterable, sortable table:

```tsx
"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Coach } from "@/lib/types";

interface CoachTableProps {
  coaches: Coach[];
  onCoachClick: (coach: Coach) => void;
}

type SortKey = "name" | "schoolName" | "division" | "priorityTier" | "olNeedScore" | "lastEngaged";
type SortDir = "asc" | "desc";

const DIVISION_OPTIONS = ["All", "D1 FBS", "D1 FCS", "D2", "D3", "NAIA"];
const TIER_OPTIONS = ["All", "Tier 1", "Tier 2", "Tier 3"];
const DM_STATUS_OPTIONS = ["All", "not_sent", "drafted", "sent", "responded"];

function getFollowBadgeVariant(status: string) {
  switch (status) {
    case "followed_back": return "default" as const;
    case "followed": return "secondary" as const;
    default: return "outline" as const;
  }
}

function getDmBadgeVariant(status: string) {
  switch (status) {
    case "responded": return "responded" as const;
    case "sent": return "sent" as const;
    case "drafted": return "draft" as const;
    default: return "outline" as const;
  }
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function CoachTable({ coaches, onCoachClick }: CoachTableProps) {
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("All");
  const [tier, setTier] = useState("All");
  const [dmStatus, setDmStatus] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("priorityTier");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    let result = coaches;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.schoolName.toLowerCase().includes(q));
    }
    if (division !== "All") result = result.filter((c) => c.division === division);
    if (tier !== "All") result = result.filter((c) => c.priorityTier === tier);
    if (dmStatus !== "All") result = result.filter((c) => c.dmStatus === dmStatus);

    result.sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [coaches, search, division, tier, dmStatus, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const selectClass = "rounded-lg border border-dash-border bg-dash-surface px-2 py-1.5 text-xs text-dash-text focus:border-dash-accent focus:outline-none";

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dash-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coaches or schools..."
            className="w-full rounded-lg border border-dash-border bg-dash-surface py-1.5 pl-8 pr-3 text-xs text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
          />
        </div>
        <select value={division} onChange={(e) => setDivision(e.target.value)} className={selectClass}>
          {DIVISION_OPTIONS.map((o) => <option key={o} value={o}>{o === "All" ? "All Divisions" : o}</option>)}
        </select>
        <select value={tier} onChange={(e) => setTier(e.target.value)} className={selectClass}>
          {TIER_OPTIONS.map((o) => <option key={o} value={o}>{o === "All" ? "All Tiers" : o}</option>)}
        </select>
        <select value={dmStatus} onChange={(e) => setDmStatus(e.target.value)} className={selectClass}>
          {DM_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o === "All" ? "All DM Status" : o.replace("_", " ")}</option>)}
        </select>
        <span className="text-xs text-dash-muted">{filtered.length} coaches</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-dash-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-dash-border bg-dash-surface-raised">
              {([["name", "Coach"], ["schoolName", "School"], ["division", "Division"], ["priorityTier", "Tier"], ["olNeedScore", "OL Need"]] as [SortKey, string][]).map(([key, label]) => (
                <th key={key} className="px-4 py-3">
                  <button type="button" onClick={() => toggleSort(key)} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-dash-muted hover:text-dash-text">
                    {label}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-dash-muted">Follow</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-dash-muted">DM</th>
              <th className="px-4 py-3">
                <button type="button" onClick={() => toggleSort("lastEngaged")} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-dash-muted hover:text-dash-text">
                  Engaged <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dash-border-subtle">
            {filtered.map((coach) => (
              <tr
                key={coach.id}
                onClick={() => onCoachClick(coach)}
                className="cursor-pointer transition-colors hover:bg-dash-surface-raised"
              >
                <td className="px-4 py-3 font-medium text-dash-text">{coach.name}</td>
                <td className="px-4 py-3 text-dash-text-secondary">{coach.schoolName}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{coach.division}</Badge></td>
                <td className="px-4 py-3"><Badge variant={coach.priorityTier === "Tier 1" ? "tier1" : coach.priorityTier === "Tier 2" ? "tier2" : "tier3"} className="text-[10px]">{coach.priorityTier}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div key={n} className={cn("h-2 w-2 rounded-full", n <= coach.olNeedScore ? "bg-dash-accent" : "bg-dash-border")} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant={getFollowBadgeVariant(coach.followStatus)} className="text-[10px]">{coach.followStatus.replace("_", " ")}</Badge></td>
                <td className="px-4 py-3"><Badge variant={getDmBadgeVariant(coach.dmStatus)} className="text-[10px]">{coach.dmStatus.replace("_", " ")}</Badge></td>
                <td className="px-4 py-3 text-xs text-dash-muted">{formatRelativeDate(coach.lastEngaged)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

2. Create `coach-detail.tsx` — slide-over detail panel:

```tsx
"use client";

import { useState, useCallback } from "react";
import { ExternalLink, UserPlus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SlideOver } from "./slide-over";
import type { Coach } from "@/lib/types";

interface CoachDetailProps {
  open: boolean;
  onClose: () => void;
  coach: Coach | null;
  onDraftDM: (coach: Coach) => void;
}

export function CoachDetail({ open, onClose, coach, onDraftDM }: CoachDetailProps) {
  const [notes, setNotes] = useState(coach?.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  const saveNotes = useCallback(async () => {
    if (!coach) return;
    setSavingNotes(true);
    try {
      await fetch(`/api/coaches/${coach.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
    } catch { /* silent */ }
    finally { setSavingNotes(false); }
  }, [coach, notes]);

  if (!coach) return null;

  const tierVariant = coach.priorityTier === "Tier 1" ? "tier1" : coach.priorityTier === "Tier 2" ? "tier2" : "tier3";

  return (
    <SlideOver open={open} onClose={onClose} title={coach.name}>
      <div className="space-y-6">
        {/* Header info */}
        <div>
          <p className="text-lg font-bold text-dash-text">{coach.schoolName}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">{coach.division}</Badge>
            <Badge variant={tierVariant}>{coach.priorityTier}</Badge>
            {coach.conference && <Badge variant="secondary">{coach.conference}</Badge>}
          </div>
          {coach.xHandle && (
            <a
              href={`https://x.com/${coach.xHandle}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-dash-accent hover:underline"
            >
              @{coach.xHandle} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-dash-border px-3 py-2 text-xs font-medium text-dash-text-secondary hover:bg-dash-surface-raised transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Follow on X
          </button>
          <button
            type="button"
            onClick={() => onDraftDM(coach)}
            className="flex items-center gap-2 rounded-lg bg-dash-accent px-3 py-2 text-xs font-medium text-white hover:bg-dash-accent-hover transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Draft DM
          </button>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-dash-border bg-dash-surface-raised p-3">
            <p className="text-xs text-dash-muted">OL Need</p>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={cn("h-3 w-3 rounded-full", n <= coach.olNeedScore ? "bg-dash-accent" : "bg-dash-border")} />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-dash-border bg-dash-surface-raised p-3">
            <p className="text-xs text-dash-muted">X Activity</p>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={cn("h-3 w-3 rounded-full", n <= coach.xActivityScore ? "bg-dash-warning" : "bg-dash-border")} />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-dash-border bg-dash-surface-raised p-3">
            <p className="text-xs text-dash-muted">Follow Status</p>
            <p className="mt-1 text-sm font-medium text-dash-text capitalize">{coach.followStatus.replace("_", " ")}</p>
          </div>
          <div className="rounded-lg border border-dash-border bg-dash-surface-raised p-3">
            <p className="text-xs text-dash-muted">DM Status</p>
            <p className="mt-1 text-sm font-medium text-dash-text capitalize">{coach.dmStatus.replace("_", " ")}</p>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={4}
            className="w-full rounded-lg border border-dash-border bg-dash-surface p-3 text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
            placeholder="Add notes about this coach..."
          />
          {savingNotes && <p className="mt-1 text-xs text-dash-muted">Saving...</p>}
        </div>
      </div>
    </SlideOver>
  );
}
```

3. Rewrite `src/app/dashboard/coaches/page.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import type { Coach } from "@/lib/types";
import { CoachTable } from "@/components/dashboard/coach-table";
import { CoachDetail } from "@/components/dashboard/coach-detail";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coaches");
      if (res.ok) {
        const data = await res.json();
        setCoaches(data.coaches || []);
      }
    } catch { /* fallback empty */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchCoaches(); }, [fetchCoaches]);

  const handleCoachClick = (coach: Coach) => {
    setSelectedCoach(coach);
    setDetailOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-dash-text">Coach CRM</h1>
        <p className="mt-1 text-sm text-dash-muted">
          {coaches.length} coaches tracked. Filter, sort, and manage relationships.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-dash-accent border-t-transparent" />
        </div>
      ) : coaches.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No coaches yet"
          description="Add coaches to start tracking relationships and outreach."
        />
      ) : (
        <CoachTable coaches={coaches} onCoachClick={handleCoachClick} />
      )}

      <CoachDetail
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        coach={selectedCoach}
        onDraftDM={(coach) => {
          setDetailOpen(false);
          // Navigate to outreach with coach pre-selected
          window.location.href = `/dashboard/outreach?coach=${coach.id}`;
        }}
      />
    </div>
  );
}
```

4. Verify: `npm run build` — should pass.

5. Commit: `git add src/components/dashboard/coach-table.tsx src/components/dashboard/coach-detail.tsx src/app/dashboard/coaches/page.tsx && git commit -m "feat: Coach CRM with filterable table + detail panel (v2.0 Phase 3)"`

---

## Task 5: DM Outreach Pipeline (`/dashboard/outreach`)

**Files:**
- Rewrite: `src/app/dashboard/outreach/page.tsx`
- Create: `src/components/dashboard/dm-kanban.tsx`
- Create: `src/components/dashboard/dm-composer.tsx`

**Steps:**

1. Create `dm-kanban.tsx` — 5-column pipeline board:

```tsx
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { DMMessage } from "@/lib/types";

interface DMKanbanProps {
  dms: DMMessage[];
  onCardClick: (dm: DMMessage) => void;
}

const COLUMNS = [
  { status: "drafted", label: "Queued", color: "border-t-dash-warning" },
  { status: "sent", label: "Sent", color: "border-t-dash-accent" },
  { status: "approved", label: "Approved", color: "border-t-dash-gold" },
  { status: "responded", label: "Replied", color: "border-t-dash-success" },
  { status: "no_response", label: "No Response", color: "border-t-dash-muted" },
] as const;

function formatTimeSince(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function DMKanban({ dms, onCardClick }: DMKanbanProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: "touch" }}>
      {COLUMNS.map((col) => {
        const columnDMs = dms.filter((dm) => dm.status === col.status);
        return (
          <div key={col.status} className="min-w-[240px] flex-1">
            {/* Column header */}
            <div className={cn("mb-3 rounded-t-lg border-t-2 px-3 py-2", col.color)}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-dash-text">
                  {col.label}
                </span>
                <span className="rounded-full bg-dash-surface-raised px-2 py-0.5 text-[10px] font-bold text-dash-muted">
                  {columnDMs.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {columnDMs.map((dm) => (
                <button
                  key={dm.id}
                  type="button"
                  onClick={() => onCardClick(dm)}
                  className="w-full rounded-lg border border-dash-border bg-dash-surface p-3 text-left transition-all hover:border-dash-accent/30 hover:bg-dash-surface-raised"
                >
                  <p className="text-sm font-medium text-dash-text">{dm.coachName}</p>
                  <p className="text-xs text-dash-muted">{dm.schoolName}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-dash-text-secondary">
                    {dm.content.slice(0, 80)}{dm.content.length > 80 ? "..." : ""}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{dm.templateType}</Badge>
                    <span className="text-[10px] text-dash-muted">{formatTimeSince(dm.sentAt || dm.createdAt)}</span>
                  </div>
                </button>
              ))}
              {columnDMs.length === 0 && (
                <div className="rounded-lg border border-dashed border-dash-border-subtle py-8 text-center text-xs text-dash-muted/50">
                  Empty
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

2. Create `dm-composer.tsx` — slide-over DM editor:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Save, CheckCircle } from "lucide-react";
import { SlideOver } from "./slide-over";
import type { Coach, DMMessage } from "@/lib/types";

interface DMComposerProps {
  open: boolean;
  onClose: () => void;
  coaches: Coach[];
  existingDM?: DMMessage | null;
  preselectedCoachId?: string | null;
  onSaved: () => void;
}

const TEMPLATES = [
  {
    type: "intro",
    label: "Intro",
    template: `Coach {coachName},\n\nMy name is Jacob Rodgers — Class of 2029 OL/DL out of Pewaukee HS, Wisconsin. I've been following {schoolName}'s program and love what you're building.\n\nI'd love to get on your radar. Here's my film: https://alex-recruiting.vercel.app/recruit\n\n6'4" 285 | 445 DL | 265 Bench | 350 Squat\n\nThank you for your time, Coach.`,
  },
  {
    type: "follow_up",
    label: "Follow-up",
    template: `Coach {coachName},\n\nI reached out a few weeks ago — wanted to follow up. I've been putting in work this spring and have updated film on my profile.\n\nWould love the chance to visit campus or attend a camp this summer if you have availability.\n\nhttps://alex-recruiting.vercel.app/recruit`,
  },
  {
    type: "value_add",
    label: "Value Add",
    template: `Coach {coachName},\n\nWanted to share an update — just posted new training film from this week. Numbers continue to climb (445 DL, 265 Bench, 350 Squat as a freshman).\n\nI'll be at IMG Lineman Camp late March. Would be great to connect.\n\nhttps://alex-recruiting.vercel.app/recruit`,
  },
  {
    type: "soft_close",
    label: "Soft Close",
    template: `Coach {coachName},\n\nI'm putting together my camp schedule for summer 2026. Does {schoolName} have any prospect camps or events I should know about?\n\nI'd love the opportunity to work out in front of your staff.\n\nThank you, Coach.`,
  },
];

export function DMComposer({ open, onClose, coaches, existingDM, preselectedCoachId, onSaved }: DMComposerProps) {
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [coachSearch, setCoachSearch] = useState("");
  const [templateType, setTemplateType] = useState("intro");
  const [content, setContent] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedCoach = coaches.find((c) => c.id === selectedCoachId);

  useEffect(() => {
    if (existingDM) {
      setSelectedCoachId(existingDM.coachId);
      setContent(existingDM.content);
      setTemplateType(existingDM.templateType);
    } else if (preselectedCoachId) {
      setSelectedCoachId(preselectedCoachId);
      applyTemplate("intro", coaches.find((c) => c.id === preselectedCoachId) || null);
    } else {
      setSelectedCoachId("");
      setContent("");
      setTemplateType("intro");
    }
    setReviewed(false);
  }, [existingDM, preselectedCoachId, open]); // eslint-disable-line react-hooks/exhaustive-deps

  function applyTemplate(type: string, coach: Coach | null) {
    const tpl = TEMPLATES.find((t) => t.type === type);
    if (!tpl || !coach) return;
    const filled = tpl.template
      .replace(/\{coachName\}/g, coach.name.split(" ").pop() || coach.name)
      .replace(/\{schoolName\}/g, coach.schoolName);
    setContent(filled);
    setTemplateType(type);
  }

  const handleCoachSelect = (coachId: string) => {
    setSelectedCoachId(coachId);
    const coach = coaches.find((c) => c.id === coachId);
    if (coach) applyTemplate(templateType, coach);
  };

  const handleSave = useCallback(async (status: "drafted" | "approved") => {
    if (!selectedCoach) return;
    setSaving(true);
    try {
      await fetch("/api/dms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: selectedCoach.id,
          coachName: selectedCoach.name,
          schoolName: selectedCoach.schoolName,
          templateType,
          content,
          sendNow: false,
        }),
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to save DM:", err);
    } finally {
      setSaving(false);
    }
  }, [selectedCoach, templateType, content, onSaved, onClose]);

  const filteredCoaches = coachSearch
    ? coaches.filter((c) => c.name.toLowerCase().includes(coachSearch.toLowerCase()) || c.schoolName.toLowerCase().includes(coachSearch.toLowerCase()))
    : coaches.slice(0, 20);

  return (
    <SlideOver open={open} onClose={onClose} title={existingDM ? "Edit DM" : "New DM"}>
      <div className="space-y-5">
        {/* Coach selector */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">To Coach</label>
          {selectedCoach ? (
            <div className="flex items-center justify-between rounded-lg border border-dash-border bg-dash-surface-raised p-3">
              <div>
                <p className="text-sm font-medium text-dash-text">{selectedCoach.name}</p>
                <p className="text-xs text-dash-muted">{selectedCoach.schoolName} &middot; {selectedCoach.division}</p>
              </div>
              <button type="button" onClick={() => setSelectedCoachId("")} className="text-xs text-dash-accent hover:underline">Change</button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={coachSearch}
                onChange={(e) => setCoachSearch(e.target.value)}
                placeholder="Search coaches..."
                className="w-full rounded-lg border border-dash-border bg-dash-surface px-3 py-2 text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
              />
              <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-dash-border bg-dash-surface">
                {filteredCoaches.map((coach) => (
                  <button
                    key={coach.id}
                    type="button"
                    onClick={() => handleCoachSelect(coach.id)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-dash-surface-raised"
                  >
                    <span className="text-sm text-dash-text">{coach.name}</span>
                    <span className="text-xs text-dash-muted">{coach.schoolName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Template picker */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">Template</label>
          <div className="flex gap-1.5">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.type}
                type="button"
                onClick={() => { setTemplateType(tpl.type); if (selectedCoach) applyTemplate(tpl.type, selectedCoach); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${templateType === tpl.type ? "bg-dash-accent text-white" : "border border-dash-border text-dash-text-secondary hover:bg-dash-surface-raised"}`}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">Message</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full rounded-lg border border-dash-border bg-dash-surface p-3 font-mono text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
            placeholder="Select a coach and template to generate a message..."
          />
          <p className="mt-1 text-right text-xs text-dash-muted">{content.length} chars</p>
        </div>

        {/* Family review gate */}
        <label className="flex items-center gap-3 rounded-lg border border-dash-border bg-dash-surface-raised p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
            className="h-4 w-4 rounded border-dash-border accent-dash-accent"
          />
          <div>
            <p className="text-sm font-medium text-dash-text">Dad has reviewed this message</p>
            <p className="text-xs text-dash-muted">Required before queueing</p>
          </div>
          {reviewed && <CheckCircle className="ml-auto h-4 w-4 text-dash-success" />}
        </label>

        {/* Actions */}
        <div className="flex gap-2 border-t border-dash-border pt-4">
          <button
            type="button"
            onClick={() => handleSave("drafted")}
            disabled={saving || !content || !selectedCoach}
            className="flex items-center gap-2 rounded-lg border border-dash-border px-4 py-2 text-sm font-medium text-dash-text-secondary hover:bg-dash-surface-raised transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("approved")}
            disabled={saving || !content || !selectedCoach || !reviewed}
            className="flex items-center gap-2 rounded-lg bg-dash-accent px-4 py-2 text-sm font-medium text-white hover:bg-dash-accent-hover transition-colors disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Approve & Queue
          </button>
        </div>
      </div>
    </SlideOver>
  );
}
```

3. Rewrite `src/app/dashboard/outreach/page.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Mail } from "lucide-react";
import type { Coach, DMMessage } from "@/lib/types";
import { DMKanban } from "@/components/dashboard/dm-kanban";
import { DMComposer } from "@/components/dashboard/dm-composer";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function OutreachPage() {
  const [dms, setDMs] = useState<DMMessage[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedDM, setSelectedDM] = useState<DMMessage | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dmsRes, coachesRes] = await Promise.allSettled([
        fetch("/api/dms"),
        fetch("/api/coaches"),
      ]);
      if (dmsRes.status === "fulfilled" && dmsRes.value.ok) {
        const data = await dmsRes.value.json();
        setDMs(data.dms || []);
      }
      if (coachesRes.status === "fulfilled" && coachesRes.value.ok) {
        const data = await coachesRes.value.json();
        setCoaches(data.coaches || []);
      }
    } catch { /* fallback */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  // Check for coach preselection from URL
  const preselectedCoachId = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("coach")
    : null;

  useEffect(() => {
    if (preselectedCoachId) setComposerOpen(true);
  }, [preselectedCoachId]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-dash-text">DM Outreach</h1>
          <p className="mt-1 text-sm text-dash-muted">
            Review, approve, and track coach outreach.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setSelectedDM(null); setComposerOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-dash-accent px-4 py-2 text-sm font-medium text-white hover:bg-dash-accent-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          New DM
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-dash-accent border-t-transparent" />
        </div>
      ) : dms.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No outreach yet"
          description="Start by drafting a DM to a coach from your CRM."
          action={{ label: "Draft First DM", onClick: () => setComposerOpen(true) }}
        />
      ) : (
        <DMKanban dms={dms} onCardClick={(dm) => { setSelectedDM(dm); setComposerOpen(true); }} />
      )}

      <DMComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        coaches={coaches}
        existingDM={selectedDM}
        preselectedCoachId={preselectedCoachId}
        onSaved={fetchData}
      />
    </div>
  );
}
```

4. Verify: `npm run build` — should pass.

5. Commit: `git add src/components/dashboard/dm-kanban.tsx src/components/dashboard/dm-composer.tsx src/app/dashboard/outreach/page.tsx && git commit -m "feat: DM Outreach pipeline with Kanban + composer (v2.0 Phase 4)"`

---

## Task 6: Analytics Page (`/dashboard/analytics`)

**Files:**
- Rewrite: `src/app/dashboard/analytics/page.tsx`
- Create: `src/components/dashboard/bar-chart.tsx`
- Create: `src/components/dashboard/funnel-chart.tsx`

**Steps:**

1. Create `bar-chart.tsx` — SVG horizontal bar chart:

```tsx
interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  maxValue?: number;
}

export function BarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-dash-text-secondary">{item.label}</span>
            <span className="text-xs font-bold tabular-nums text-dash-text">{item.value}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-dash-surface-raised">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min((item.value / max) * 100, 100)}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
```

2. Create `funnel-chart.tsx` — pipeline funnel visualization:

```tsx
interface FunnelChartProps {
  stages: { label: string; value: number; color: string }[];
}

export function FunnelChart({ stages }: FunnelChartProps) {
  const maxValue = stages[0]?.value || 1;

  return (
    <div className="space-y-2">
      {stages.map((stage, i) => {
        const widthPct = Math.max((stage.value / maxValue) * 100, 20);
        return (
          <div key={stage.label} className="flex items-center gap-3">
            <div className="w-24 text-right">
              <span className="text-xs font-medium text-dash-text-secondary">{stage.label}</span>
            </div>
            <div className="flex-1">
              <div
                className="flex h-8 items-center rounded px-3 transition-all duration-700"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: stage.color,
                }}
              >
                <span className="text-xs font-bold text-white">{stage.value}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

3. Rewrite `src/app/dashboard/analytics/page.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, TrendingUp, Users, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import type { Post, Coach, DMMessage, AnalyticsSnapshot } from "@/lib/types";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [dms, setDMs] = useState<DMMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, postsRes, coachesRes, dmsRes] = await Promise.allSettled([
        fetch("/api/analytics"),
        fetch("/api/posts"),
        fetch("/api/coaches"),
        fetch("/api/dms"),
      ]);

      if (analyticsRes.status === "fulfilled" && analyticsRes.value.ok) {
        const data = await analyticsRes.value.json();
        setAnalytics(data.current || null);
      }
      if (postsRes.status === "fulfilled" && postsRes.value.ok) {
        const data = await postsRes.value.json();
        setPosts(data.posts || []);
      }
      if (coachesRes.status === "fulfilled" && coachesRes.value.ok) {
        const data = await coachesRes.value.json();
        setCoaches(data.coaches || []);
      }
      if (dmsRes.status === "fulfilled" && dmsRes.value.ok) {
        const data = await dmsRes.value.json();
        setDMs(data.dms || []);
      }
    } catch { /* fallback */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  // Compute pillar distribution
  const pillarCounts = posts.reduce((acc, p) => {
    acc[p.pillar] = (acc[p.pillar] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pillarData = [
    { label: "Film", value: pillarCounts["performance"] || 0, color: "#EF4444" },
    { label: "Training", value: pillarCounts["work_ethic"] || 0, color: "#3B82F6" },
    { label: "Character", value: pillarCounts["character"] || 0, color: "#22C55E" },
  ];

  // Compute coach pipeline funnel
  const dmSent = dms.filter((d) => d.status === "sent" || d.status === "responded").length;
  const dmReplied = dms.filter((d) => d.status === "responded").length;
  const funnelData = [
    { label: "Prospected", value: coaches.length, color: "#3B82F6" },
    { label: "Contacted", value: dmSent, color: "#F59E0B" },
    { label: "Replied", value: dmReplied, color: "#22C55E" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 animate-fade-in">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-dash-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-dash-text">Analytics</h1>
        <p className="mt-1 text-sm text-dash-muted">Track growth, engagement, and recruiting pipeline.</p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard label="Followers" value={analytics?.totalFollowers ?? 0} icon={Users} change={`Target: ${50}`} changeType="neutral" />
        <StatCard label="Engagement" value={`${analytics?.avgEngagementRate ?? 0}%`} icon={TrendingUp} />
        <StatCard label="Profile Views" value={analytics?.profileVisits ?? 0} icon={Eye} />
        <StatCard label="DMs Replied" value={dmReplied} icon={MessageSquare} change={`${dmSent} sent`} changeType="neutral" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-dash-border bg-dash-surface p-5">
          <h3 className="mb-4 text-sm font-semibold text-dash-text">Posts by Pillar</h3>
          <BarChart data={pillarData} />
        </div>

        <div className="rounded-xl border border-dash-border bg-dash-surface p-5">
          <h3 className="mb-4 text-sm font-semibold text-dash-text">Coach Pipeline</h3>
          <FunnelChart stages={funnelData} />
        </div>
      </div>
    </div>
  );
}
```

4. Verify: `npm run build` — should pass.

5. Commit: `git add src/components/dashboard/bar-chart.tsx src/components/dashboard/funnel-chart.tsx src/app/dashboard/analytics/page.tsx && git commit -m "feat: Analytics dashboard with charts (v2.0 Phase 5)"`

---

## Task 7: Overview Page — Wire Real Data (`/dashboard`)

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**Steps:**

1. Update the overview page to fetch real data and compute dynamic action items. Replace the hardcoded `actionItems` array with computed items from API data. Add DM and post counts from API responses. Replace hardcoded events with computed upcoming items.

Key changes to `src/app/dashboard/page.tsx`:
- In `loadStats()`: also fetch `/api/dms` and `/api/posts` to get real counts
- Set `dmsSent` from DMs with status "sent"
- Set `postsThisWeek` from posts with status "posted" in last 7 days
- Replace `actionItems` with dynamically computed items:
  - Count DMs with status "drafted" → "X DM drafts need review"
  - Count posts with status "draft" → "Y posts need scheduling"
  - Find coaches with `lastEngaged` > 14 days ago → "Z coaches need follow-up"
- Keep upcoming events hardcoded for now (MVP)

2. Verify: `npm run build` — should pass.

3. Commit: `git add src/app/dashboard/page.tsx && git commit -m "feat: Wire dashboard overview to real API data"`

---

## Task 8: Build Verification & Mobile Check

**Steps:**

1. Run `npm run build` — must pass with zero errors.
2. Run `npm run dev` and verify all routes return 200:
   - `/dashboard` — overview with real stats
   - `/dashboard/calendar` — month grid with post pills
   - `/dashboard/coaches` — filterable table
   - `/dashboard/outreach` — Kanban pipeline
   - `/dashboard/analytics` — charts and stats
3. Test mobile viewport (375px) — sidebar hidden, bottom nav visible, tables scroll horizontally.
4. Commit any fixes.

---

## Parallel Agent Dispatch Plan

Tasks 1-2 (shared components) must complete first. Then Tasks 3-6 can run in parallel across 4 agents:

```
Batch 1 (sequential): Task 1 + Task 2 — Shared components
Batch 2 (parallel):   Task 3 (Calendar) | Task 4 (Coaches) | Task 5 (Outreach) | Task 6 (Analytics)
Batch 3 (sequential): Task 7 (Overview wiring) + Task 8 (Build verification)
```

Each parallel agent gets the shared components as context and works independently on its page + components.
