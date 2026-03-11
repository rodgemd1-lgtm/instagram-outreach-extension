# Dashboard v2.0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build 4 real dashboard pages (Calendar, Coaches, Outreach, Analytics) and wire the Overview page to live data. Replace all placeholder pages.

**Architecture:** Build on existing `/dashboard` layout shell. Each page is a new `page.tsx` replacing its placeholder + supporting components in `src/components/dashboard/`. All data comes from existing API routes — no backend changes.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS (dash-* tokens), Lucide icons, date-fns, Recharts (already installed)

**Existing API Routes (DO NOT MODIFY):**
- `GET/POST /api/posts` — posts with `{posts, total}` response
- `POST /api/posts/[id]/send` — publish to X
- `GET/POST /api/coaches` — coaches with `{coaches, total}` response, supports `?tier=&division=&followStatus=` params
- `GET/POST /api/dms` — DMs with `{dms, total}` response
- `GET /api/analytics` — `{current, history, targets}` response
- `GET /api/content/queue` — `{posts, total, counts}` response

**Key Types (from `src/lib/types.ts`):**
- `ContentPillar = "performance" | "work_ethic" | "character"`
- `PostStatus = "draft" | "approved" | "scheduled" | "posted" | "rejected"`
- `DMStatus = "not_sent" | "drafted" | "approved" | "sent" | "responded" | "no_response"`
- `FollowStatus = "not_followed" | "followed" | "followed_back" | "unfollowed"`
- `PriorityTier = "Tier 1" | "Tier 2" | "Tier 3"`
- `DivisionTier = "D1 FBS" | "D1 FCS" | "D2" | "D3" | "NAIA"`

**Design Tokens (Tailwind):**
- Background: `bg-dash-bg` / `bg-dash-surface` / `bg-dash-surface-raised`
- Border: `border-dash-border` / `border-dash-border-subtle`
- Text: `text-dash-text` / `text-dash-text-secondary` / `text-dash-muted`
- Accent: `text-dash-accent` / `bg-dash-accent`
- Status: `dash-success` (green), `dash-warning` (orange), `dash-danger` (red), `dash-gold` (gold)
- Card pattern: `rounded-xl border border-dash-border bg-dash-surface`
- Animation: `animate-fade-in` class exists

---

## Batch 1: Shared Foundations (Sequential)

### Task 1: Shared UI Components

**Files:**
- Create: `src/components/dashboard/slide-over.tsx`
- Create: `src/components/dashboard/badge.tsx`
- Create: `src/components/dashboard/empty-state.tsx`

**Step 1: Create slide-over component**

Create `src/components/dashboard/slide-over.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}

export function SlideOver({ open, onClose, title, subtitle, children, wide }: SlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative flex h-full flex-col bg-dash-bg ${wide ? "w-full max-w-2xl" : "w-full max-w-md"}`}
      >
        <div className="flex items-center justify-between border-b border-dash-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-dash-text">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-dash-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-dash-muted hover:bg-dash-surface-raised hover:text-dash-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
```

**Step 2: Create badge component**

Create `src/components/dashboard/badge.tsx`:

```tsx
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "accent" | "muted";

const variants: Record<BadgeVariant, string> = {
  default: "bg-dash-surface-raised text-dash-text-secondary",
  success: "bg-dash-success/15 text-dash-success",
  warning: "bg-dash-warning/15 text-dash-warning",
  danger: "bg-dash-danger/15 text-dash-danger",
  accent: "bg-dash-accent/15 text-dash-accent",
  muted: "bg-dash-surface-raised text-dash-muted",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
```

**Step 3: Create empty-state component**

Create `src/components/dashboard/empty-state.tsx`:

```tsx
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-16">
      <Icon className="h-10 w-10 text-dash-muted/40" />
      <p className="mt-4 text-sm font-medium text-dash-muted">{title}</p>
      {description && <p className="mt-1 max-w-xs text-center text-xs text-dash-muted/70">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-dash-accent px-4 py-2 text-xs font-semibold text-white hover:bg-dash-accent-hover"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
```

**Step 4: Verify build**

Run: `cd /Users/mikerodgers/Desktop/alex-recruiting-project/alex-recruiting && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to new files

**Step 5: Commit**

```bash
git add src/components/dashboard/slide-over.tsx src/components/dashboard/badge.tsx src/components/dashboard/empty-state.tsx
git commit -m "feat(dashboard): add shared UI components — slide-over, badge, empty-state"
```

---

### Task 2: Extend Content Pillar Types

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/dashboard/pillar-config.ts`

**Step 1: Add v2 pillar config**

Create `src/lib/dashboard/pillar-config.ts`. This maps the 5-category calendar system to colors and labels without changing the backend ContentPillar type:

```tsx
export type CalendarPillar = "film" | "training" | "academic" | "camp" | "lifestyle";

export const PILLAR_CONFIG: Record<CalendarPillar, { label: string; color: string; bgClass: string; textClass: string }> = {
  film:      { label: "Film",      color: "#EF4444", bgClass: "bg-dash-danger/20",  textClass: "text-dash-danger" },
  training:  { label: "Training",  color: "#3B82F6", bgClass: "bg-dash-accent/20",  textClass: "text-dash-accent" },
  academic:  { label: "Academic",  color: "#22C55E", bgClass: "bg-dash-success/20", textClass: "text-dash-success" },
  camp:      { label: "Camp",      color: "#F59E0B", bgClass: "bg-dash-warning/20", textClass: "text-dash-warning" },
  lifestyle: { label: "Lifestyle", color: "#D4A853", bgClass: "bg-dash-gold/20",    textClass: "text-dash-gold" },
};

/** Map backend ContentPillar to CalendarPillar for display */
export function toCalendarPillar(backendPillar: string): CalendarPillar {
  switch (backendPillar) {
    case "performance": return "film";
    case "work_ethic": return "training";
    case "character": return "lifestyle";
    default: return backendPillar as CalendarPillar;
  }
}

/** Map CalendarPillar back to backend ContentPillar for API calls */
export function toBackendPillar(calendarPillar: CalendarPillar): string {
  switch (calendarPillar) {
    case "film": return "performance";
    case "training": return "work_ethic";
    case "academic": return "character";
    case "camp": return "character";
    case "lifestyle": return "character";
  }
}

export const ALL_PILLARS: CalendarPillar[] = ["film", "training", "academic", "camp", "lifestyle"];
```

**Step 2: Commit**

```bash
git add src/lib/dashboard/pillar-config.ts
git commit -m "feat(dashboard): add calendar pillar config with color mapping"
```

---

## Batch 2: Four Pages in Parallel

> **PARALLEL EXECUTION:** Tasks 3, 4, 5, and 6 are fully independent. Launch 4 agents simultaneously.

### Task 3: Content Calendar Page (Agent A)

**Files:**
- Create: `src/components/dashboard/calendar-grid.tsx`
- Create: `src/components/dashboard/post-composer.tsx`
- Replace: `src/app/dashboard/calendar/page.tsx`

**Step 1: Create calendar grid component**

Create `src/components/dashboard/calendar-grid.tsx`:

```tsx
"use client";

import { useMemo } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isSameDay, isToday, addMonths, subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PILLAR_CONFIG, toCalendarPillar, type CalendarPillar } from "@/lib/dashboard/pillar-config";

export interface CalendarPost {
  id: string;
  content: string;
  pillar: string;
  scheduledFor: string;
  status: string;
}

interface CalendarGridProps {
  currentMonth: Date;
  posts: CalendarPost[];
  onMonthChange: (date: Date) => void;
  onDayClick: (date: Date) => void;
  onPostClick: (post: CalendarPost) => void;
}

export function CalendarGrid({ currentMonth, posts, onMonthChange, onDayClick, onPostClick }: CalendarGridProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, CalendarPost[]>();
    for (const post of posts) {
      const key = format(new Date(post.scheduledFor), "yyyy-MM-dd");
      const arr = map.get(key) || [];
      arr.push(post);
      map.set(key, arr);
    }
    return map;
  }, [posts]);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-dash-text">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="rounded-lg p-2 text-dash-muted hover:bg-dash-surface-raised hover:text-dash-text"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(new Date())}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-dash-muted hover:bg-dash-surface-raised hover:text-dash-text"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="rounded-lg p-2 text-dash-muted hover:bg-dash-surface-raised hover:text-dash-text"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="mb-1 grid grid-cols-7 gap-px">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-dash-muted">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-px rounded-xl border border-dash-border bg-dash-border overflow-hidden">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayPosts = postsByDay.get(key) || [];
          const inMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onDayClick(day)}
              className={`min-h-[80px] md:min-h-[100px] bg-dash-surface p-1.5 text-left transition-colors hover:bg-dash-surface-raised ${
                !inMonth ? "opacity-40" : ""
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isToday(day)
                    ? "bg-dash-accent text-white"
                    : "text-dash-text-secondary"
                }`}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 flex flex-col gap-0.5">
                {dayPosts.slice(0, 3).map((post) => {
                  const pillar = toCalendarPillar(post.pillar);
                  const cfg = PILLAR_CONFIG[pillar] || PILLAR_CONFIG.film;
                  return (
                    <div
                      key={post.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPostClick(post);
                      }}
                      className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${cfg.bgClass} ${cfg.textClass} cursor-pointer hover:opacity-80`}
                    >
                      <span className="hidden md:inline">{post.content.slice(0, 25)}</span>
                      <span className="md:hidden">{cfg.label.slice(0, 1)}</span>
                    </div>
                  );
                })}
                {dayPosts.length > 3 && (
                  <span className="text-[10px] text-dash-muted">+{dayPosts.length - 3}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Pillar legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {Object.entries(PILLAR_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full`} style={{ backgroundColor: cfg.color }} />
            <span className="text-xs text-dash-muted">{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Create post composer component**

Create `src/components/dashboard/post-composer.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Image, Send, Save } from "lucide-react";
import { format } from "date-fns";
import { SlideOver } from "./slide-over";
import { Badge } from "./badge";
import {
  PILLAR_CONFIG,
  ALL_PILLARS,
  toCalendarPillar,
  toBackendPillar,
  type CalendarPillar,
} from "@/lib/dashboard/pillar-config";

interface PostComposerProps {
  open: boolean;
  onClose: () => void;
  /** Pre-fill with existing post for editing */
  editPost?: {
    id: string;
    content: string;
    pillar: string;
    hashtags?: string[];
    mediaUrl?: string | null;
    scheduledFor: string;
    status: string;
  } | null;
  /** Pre-fill date when clicking a calendar day */
  defaultDate?: Date | null;
  onSaved: () => void;
}

const HASHTAG_SUGGESTIONS: Record<CalendarPillar, string[]> = {
  film: ["#2029Recruit", "#OL", "#OffensiveLine", "#FootballRecruiting", "#WI"],
  training: ["#WorkEthic", "#OLTraining", "#Grind", "#2029Recruit"],
  academic: ["#StudentAthlete", "#HonorRoll", "#Academics"],
  camp: ["#Camp", "#Showcase", "#Compete", "#2029Recruit"],
  lifestyle: ["#BeyondTheField", "#Athlete", "#TeamFirst"],
};

export function PostComposer({ open, onClose, editPost, defaultDate, onSaved }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [pillar, setPillar] = useState<CalendarPillar>("film");
  const [hashtags, setHashtags] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("08:00");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);

  useEffect(() => {
    if (editPost) {
      setContent(editPost.content);
      setPillar(toCalendarPillar(editPost.pillar));
      setHashtags(editPost.hashtags?.join(", ") || "");
      setMediaUrl(editPost.mediaUrl || "");
      setScheduledDate(format(new Date(editPost.scheduledFor), "yyyy-MM-dd"));
      setScheduledTime(format(new Date(editPost.scheduledFor), "HH:mm"));
      setStatus(editPost.status);
      setPostId(editPost.id);
    } else {
      setContent("");
      setPillar("film");
      setHashtags("");
      setMediaUrl("");
      setScheduledDate(defaultDate ? format(defaultDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
      setScheduledTime("08:00");
      setStatus("draft");
      setPostId(null);
    }
  }, [editPost, defaultDate, open]);

  const charCount = content.length;
  const charColor = charCount > 260 ? "text-dash-danger" : charCount > 200 ? "text-dash-warning" : "text-dash-muted";

  async function handleSave(newStatus: string) {
    setSaving(true);
    try {
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      const body = {
        content,
        pillar: toBackendPillar(pillar),
        hashtags: hashtags.split(",").map((h) => h.trim()).filter(Boolean),
        mediaUrl: mediaUrl || null,
        scheduledFor,
        status: newStatus,
      };

      if (postId) {
        await fetch(`/api/posts/${postId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }

      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handlePostNow() {
    setSaving(true);
    try {
      let id = postId;
      if (!id) {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            pillar: toBackendPillar(pillar),
            hashtags: hashtags.split(",").map((h) => h.trim()).filter(Boolean),
            mediaUrl: mediaUrl || null,
            scheduledFor: new Date().toISOString(),
          }),
        });
        const data = await res.json();
        id = data.post?.id;
      }
      if (id) {
        await fetch(`/api/posts/${id}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: content, mediaUrl: mediaUrl || undefined }),
        });
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <SlideOver open={open} onClose={onClose} title={postId ? "Edit Post" : "New Post"} subtitle="Compose and schedule an X post">
      {/* Pillar selector */}
      <div className="mb-5">
        <label className="mb-2 block text-xs font-medium text-dash-muted">Content Pillar</label>
        <div className="flex flex-wrap gap-2">
          {ALL_PILLARS.map((p) => {
            const cfg = PILLAR_CONFIG[p];
            const active = pillar === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPillar(p);
                  setHashtags(HASHTAG_SUGGESTIONS[p].join(", "));
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active ? `${cfg.bgClass} ${cfg.textClass}` : "bg-dash-surface-raised text-dash-muted hover:text-dash-text"
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-dash-muted">Content</label>
          <span className={`text-xs font-mono ${charColor}`}>{charCount}/280</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 280))}
          rows={4}
          className="w-full resize-none rounded-lg border border-dash-border bg-dash-surface-raised px-3 py-2.5 text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
          placeholder="What's happening with Jacob's recruiting journey?"
        />
      </div>

      {/* Hashtags */}
      <div className="mb-5">
        <label className="mb-2 block text-xs font-medium text-dash-muted">Hashtags</label>
        <input
          type="text"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          className="w-full rounded-lg border border-dash-border bg-dash-surface-raised px-3 py-2 text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
          placeholder="#2029Recruit, #OL"
        />
      </div>

      {/* Media URL */}
      <div className="mb-5">
        <label className="mb-2 block text-xs font-medium text-dash-muted">
          <Image className="mr-1 inline h-3.5 w-3.5" />
          Media URL (optional)
        </label>
        <input
          type="text"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          className="w-full rounded-lg border border-dash-border bg-dash-surface-raised px-3 py-2 text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
          placeholder="https://..."
        />
      </div>

      {/* Schedule */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-xs font-medium text-dash-muted">
            <Calendar className="mr-1 inline h-3.5 w-3.5" />
            Date
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full rounded-lg border border-dash-border bg-dash-surface-raised px-3 py-2 text-sm text-dash-text focus:border-dash-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-dash-muted">
            <Clock className="mr-1 inline h-3.5 w-3.5" />
            Time
          </label>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full rounded-lg border border-dash-border bg-dash-surface-raised px-3 py-2 text-sm text-dash-text focus:border-dash-accent focus:outline-none"
          />
        </div>
      </div>

      <p className="mb-6 text-[11px] text-dash-muted/60">
        Tip: Coaches are most active 7-9am CT on Tue/Wed/Thu.
      </p>

      {/* Status indicator */}
      {postId && (
        <div className="mb-5">
          <Badge variant={status === "posted" ? "success" : status === "scheduled" ? "accent" : "muted"}>
            {status}
          </Badge>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 border-t border-dash-border pt-5">
        <button
          type="button"
          onClick={() => handleSave("draft")}
          disabled={saving || !content}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dash-border px-4 py-2 text-xs font-semibold text-dash-text-secondary hover:bg-dash-surface-raised disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" />
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => handleSave("scheduled")}
          disabled={saving || !content || !scheduledDate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-dash-accent px-4 py-2 text-xs font-semibold text-white hover:bg-dash-accent-hover disabled:opacity-40"
        >
          <Calendar className="h-3.5 w-3.5" />
          Schedule
        </button>
        <button
          type="button"
          onClick={handlePostNow}
          disabled={saving || !content}
          className="inline-flex items-center gap-1.5 rounded-lg bg-dash-success px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
          Post Now
        </button>
      </div>
    </SlideOver>
  );
}
```

**Step 3: Replace calendar page**

Replace `src/app/dashboard/calendar/page.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { format, isSameDay } from "date-fns";
import { Plus } from "lucide-react";
import { CalendarGrid, type CalendarPost } from "@/components/dashboard/calendar-grid";
import { PostComposer } from "@/components/dashboard/post-composer";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editPost, setEditPost] = useState<CalendarPost | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  function handleDayClick(date: Date) {
    setEditPost(null);
    setSelectedDate(date);
    setComposerOpen(true);
  }

  function handlePostClick(post: CalendarPost) {
    setEditPost(post);
    setSelectedDate(null);
    setComposerOpen(true);
  }

  // Posts for the selected day (shown below calendar on mobile)
  const dayPosts = selectedDate
    ? posts.filter((p) => isSameDay(new Date(p.scheduledFor), selectedDate))
    : [];

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
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
          onClick={() => {
            setEditPost(null);
            setSelectedDate(new Date());
            setComposerOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-dash-accent px-4 py-2 text-xs font-semibold text-white hover:bg-dash-accent-hover"
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
        <CalendarGrid
          currentMonth={currentMonth}
          posts={posts}
          onMonthChange={setCurrentMonth}
          onDayClick={handleDayClick}
          onPostClick={handlePostClick}
        />
      )}

      {/* Day detail — shows on mobile when a day is tapped */}
      {selectedDate && dayPosts.length > 0 && (
        <div className="mt-6 rounded-xl border border-dash-border bg-dash-surface p-4 md:hidden">
          <h3 className="mb-3 text-sm font-semibold text-dash-text">
            {format(selectedDate, "EEEE, MMM d")}
          </h3>
          <div className="space-y-2">
            {dayPosts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => handlePostClick(post)}
                className="w-full rounded-lg border border-dash-border-subtle bg-dash-surface-raised p-3 text-left"
              >
                <p className="text-sm text-dash-text line-clamp-2">{post.content}</p>
                <p className="mt-1 text-[10px] text-dash-muted">
                  {format(new Date(post.scheduledFor), "h:mm a")} · {post.status}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <PostComposer
        open={composerOpen}
        onClose={() => { setComposerOpen(false); setEditPost(null); setSelectedDate(null); }}
        editPost={editPost}
        defaultDate={selectedDate}
        onSaved={fetchPosts}
      />
    </div>
  );
}
```

**Step 4: Build check**

Run: `cd /Users/mikerodgers/Desktop/alex-recruiting-project/alex-recruiting && npx tsc --noEmit --pretty 2>&1 | tail -5`
Expected: No errors

**Step 5: Commit**

```bash
git add src/components/dashboard/calendar-grid.tsx src/components/dashboard/post-composer.tsx src/app/dashboard/calendar/page.tsx
git commit -m "feat(dashboard): content calendar with month grid + post composer"
```

---

### Task 4: Coach CRM Page (Agent B)

**Files:**
- Create: `src/components/dashboard/coach-table.tsx`
- Create: `src/components/dashboard/coach-filters.tsx`
- Create: `src/components/dashboard/coach-detail.tsx`
- Replace: `src/app/dashboard/coaches/page.tsx`

**Step 1: Create coach filters component**

Create `src/components/dashboard/coach-filters.tsx`:

```tsx
"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface CoachFiltersProps {
  onFilterChange: (filters: CoachFilterValues) => void;
}

export interface CoachFilterValues {
  search: string;
  division: string;
  tier: string;
  dmStatus: string;
}

const DIVISIONS = ["All", "D1 FBS", "D1 FCS", "D2", "D3", "NAIA"];
const TIERS = ["All", "Tier 1", "Tier 2", "Tier 3"];
const DM_STATUSES = ["All", "not_sent", "drafted", "sent", "responded"];

export function CoachFilters({ onFilterChange }: CoachFiltersProps) {
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("All");
  const [tier, setTier] = useState("All");
  const [dmStatus, setDmStatus] = useState("All");

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilterChange({ search, division, tier, dmStatus });
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, division, tier, dmStatus, onFilterChange]);

  const selectClass = "rounded-lg border border-dash-border bg-dash-surface-raised px-3 py-2 text-xs text-dash-text focus:border-dash-accent focus:outline-none";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dash-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coaches or schools..."
          className="w-full rounded-lg border border-dash-border bg-dash-surface-raised py-2 pl-9 pr-3 text-xs text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
        />
      </div>
      <select value={division} onChange={(e) => setDivision(e.target.value)} className={selectClass}>
        {DIVISIONS.map((d) => <option key={d} value={d}>{d === "All" ? "All Divisions" : d}</option>)}
      </select>
      <select value={tier} onChange={(e) => setTier(e.target.value)} className={selectClass}>
        {TIERS.map((t) => <option key={t} value={t}>{t === "All" ? "All Tiers" : t}</option>)}
      </select>
      <select value={dmStatus} onChange={(e) => setDmStatus(e.target.value)} className={selectClass}>
        {DM_STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All DM Status" : s.replace("_", " ")}</option>)}
      </select>
    </div>
  );
}
```

**Step 2: Create coach table component**

Create `src/components/dashboard/coach-table.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "./badge";
import type { CoachFilterValues } from "./coach-filters";

export interface CoachRow {
  id: string;
  name: string;
  schoolName: string;
  division: string;
  conference: string;
  priorityTier: string;
  olNeedScore: number;
  xActivityScore: number;
  followStatus: string;
  dmStatus: string;
  lastEngaged: string | null;
  xHandle: string;
  notes: string;
}

interface CoachTableProps {
  coaches: CoachRow[];
  filters: CoachFilterValues;
  onRowClick: (coach: CoachRow) => void;
}

type SortField = "name" | "schoolName" | "division" | "priorityTier" | "olNeedScore" | "dmStatus" | "lastEngaged";

const TIER_VARIANT = { "Tier 1": "danger", "Tier 2": "warning", "Tier 3": "muted" } as const;
const DIV_VARIANT = { "D1 FBS": "danger", "D1 FCS": "warning", "D2": "accent", "D3": "success", "NAIA": "muted" } as const;
const DM_VARIANT = { "not_sent": "muted", "drafted": "warning", "approved": "accent", "sent": "accent", "responded": "success", "no_response": "danger" } as const;
const FOLLOW_VARIANT = { "not_followed": "muted", "followed": "accent", "followed_back": "success", "unfollowed": "danger" } as const;

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function CoachTable({ coaches, filters, onRowClick }: CoachTableProps) {
  const [sortField, setSortField] = useState<SortField>("priorityTier");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const perPage = 25;

  const filtered = useMemo(() => {
    return coaches.filter((c) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.schoolName.toLowerCase().includes(q)) return false;
      }
      if (filters.division !== "All" && c.division !== filters.division) return false;
      if (filters.tier !== "All" && c.priorityTier !== filters.tier) return false;
      if (filters.dmStatus !== "All" && c.dmStatus !== filters.dmStatus) return false;
      return true;
    });
  }, [coaches, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField] ?? "";
      const bVal = b[sortField] ?? "";
      const cmp = typeof aVal === "number" ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const paginated = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
    setPage(0);
  }

  const th = (label: string, field: SortField, className = "") => (
    <th className={`px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-dash-muted ${className}`}>
      <button type="button" onClick={() => toggleSort(field)} className="inline-flex items-center gap-1 hover:text-dash-text">
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    </th>
  );

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-dash-border">
        <table className="w-full min-w-[700px]">
          <thead className="border-b border-dash-border bg-dash-surface">
            <tr>
              {th("Name", "name")}
              {th("School", "schoolName")}
              {th("Div", "division", "w-[80px]")}
              {th("Tier", "priorityTier", "w-[60px]")}
              <th className="w-[80px] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-dash-muted">OL Need</th>
              <th className="w-[80px] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-dash-muted">Follow</th>
              {th("DM", "dmStatus", "w-[90px]")}
              {th("Engaged", "lastEngaged", "w-[90px]")}
            </tr>
          </thead>
          <tbody className="divide-y divide-dash-border-subtle">
            {paginated.map((coach) => (
              <tr
                key={coach.id}
                onClick={() => onRowClick(coach)}
                className="cursor-pointer bg-dash-surface transition-colors hover:bg-dash-surface-raised"
              >
                <td className="px-3 py-3 text-sm font-medium text-dash-text">{coach.name}</td>
                <td className="px-3 py-3 text-sm text-dash-text-secondary">{coach.schoolName}</td>
                <td className="px-3 py-3">
                  <Badge variant={(DIV_VARIANT as Record<string, string>)[coach.division] as "accent" || "muted"}>{coach.division}</Badge>
                </td>
                <td className="px-3 py-3">
                  <Badge variant={(TIER_VARIANT as Record<string, string>)[coach.priorityTier] as "danger" || "muted"}>
                    {coach.priorityTier.replace("Tier ", "T")}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`h-2 w-2 rounded-full ${n <= coach.olNeedScore ? "bg-dash-accent" : "bg-dash-surface-raised"}`}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Badge variant={(FOLLOW_VARIANT as Record<string, string>)[coach.followStatus] as "accent" || "muted"}>
                    {coach.followStatus.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <Badge variant={(DM_VARIANT as Record<string, string>)[coach.dmStatus] as "accent" || "muted"}>
                    {coach.dmStatus.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-xs text-dash-muted">
                  {formatRelativeDate(coach.lastEngaged)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-dash-muted">
            {sorted.length} coaches · Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-dash-muted hover:bg-dash-surface-raised disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-dash-muted hover:bg-dash-surface-raised disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Create coach detail slide-over**

Create `src/components/dashboard/coach-detail.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ExternalLink, Mail, UserPlus } from "lucide-react";
import { SlideOver } from "./slide-over";
import { Badge } from "./badge";
import type { CoachRow } from "./coach-table";

interface CoachDetailProps {
  open: boolean;
  onClose: () => void;
  coach: CoachRow | null;
}

export function CoachDetail({ open, onClose, coach }: CoachDetailProps) {
  const [notes, setNotes] = useState(coach?.notes || "");
  const [saving, setSaving] = useState(false);

  if (!coach) return null;

  async function saveNotes() {
    if (!coach) return;
    setSaving(true);
    try {
      await fetch(`/api/coaches/${coach.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SlideOver open={open} onClose={onClose} title={coach.name} subtitle={`${coach.schoolName} · ${coach.division}`}>
      {/* Quick actions */}
      <div className="mb-6 flex flex-wrap gap-2">
        {coach.xHandle && (
          <a
            href={`https://x.com/${coach.xHandle}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-dash-border px-3 py-2 text-xs font-medium text-dash-text-secondary hover:bg-dash-surface-raised"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on X
          </a>
        )}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-dash-border px-3 py-2 text-xs font-medium text-dash-text-secondary hover:bg-dash-surface-raised"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Follow on X
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-dash-accent px-3 py-2 text-xs font-semibold text-white hover:bg-dash-accent-hover"
        >
          <Mail className="h-3.5 w-3.5" />
          Draft DM
        </button>
      </div>

      {/* Info grid */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {[
          { label: "Conference", value: coach.conference || "—" },
          { label: "X Handle", value: coach.xHandle ? `@${coach.xHandle}` : "—" },
          { label: "OL Need", value: `${coach.olNeedScore}/5` },
          { label: "X Activity", value: `${coach.xActivityScore}/5` },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-dash-border-subtle bg-dash-surface-raised px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-dash-muted">{item.label}</p>
            <p className="mt-0.5 text-sm font-medium text-dash-text">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Status badges */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-medium text-dash-muted">Status</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">{coach.priorityTier}</Badge>
          <Badge variant="default">{coach.followStatus.replace(/_/g, " ")}</Badge>
          <Badge variant="default">DM: {coach.dmStatus.replace(/_/g, " ")}</Badge>
        </div>
      </div>

      {/* Notes */}
      <div>
        <p className="mb-2 text-xs font-medium text-dash-muted">Notes</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          rows={4}
          className="w-full resize-none rounded-lg border border-dash-border bg-dash-surface-raised px-3 py-2.5 text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
          placeholder="Add notes about this coach..."
        />
        {saving && <p className="mt-1 text-[10px] text-dash-muted">Saving...</p>}
      </div>
    </SlideOver>
  );
}
```

**Step 4: Replace coaches page**

Replace `src/app/dashboard/coaches/page.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { CoachTable, type CoachRow } from "@/components/dashboard/coach-table";
import { CoachFilters, type CoachFilterValues } from "@/components/dashboard/coach-filters";
import { CoachDetail } from "@/components/dashboard/coach-detail";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<CoachRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CoachFilterValues>({ search: "", division: "All", tier: "All", dmStatus: "All" });
  const [selectedCoach, setSelectedCoach] = useState<CoachRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.division !== "All") params.set("division", filters.division);
      if (filters.tier !== "All") params.set("tier", filters.tier);
      const res = await fetch(`/api/coaches?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCoaches(data.coaches || (Array.isArray(data) ? data : []));
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filters.division, filters.tier]);

  useEffect(() => { fetchCoaches(); }, [fetchCoaches]);

  function handleRowClick(coach: CoachRow) {
    setSelectedCoach(coach);
    setDetailOpen(true);
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-dash-text">Coach CRM</h1>
        <p className="mt-1 text-sm text-dash-muted">
          {coaches.length} coaches tracked · Sort, filter, and manage relationships.
        </p>
      </div>

      <div className="mb-4">
        <CoachFilters onFilterChange={setFilters} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-dash-accent border-t-transparent" />
        </div>
      ) : coaches.length === 0 ? (
        <EmptyState icon={Users} title="No coaches found" description="Add coaches via the API or scrape tool." />
      ) : (
        <CoachTable coaches={coaches} filters={filters} onRowClick={handleRowClick} />
      )}

      <CoachDetail
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedCoach(null); }}
        coach={selectedCoach}
      />
    </div>
  );
}
```

**Step 5: Build check + Commit**

Run: `npx tsc --noEmit --pretty 2>&1 | tail -5`

```bash
git add src/components/dashboard/coach-table.tsx src/components/dashboard/coach-filters.tsx src/components/dashboard/coach-detail.tsx src/app/dashboard/coaches/page.tsx
git commit -m "feat(dashboard): coach CRM with sortable table, filters, and detail panel"
```

---

### Task 5: DM Outreach Pipeline (Agent C)

**Files:**
- Create: `src/components/dashboard/dm-kanban.tsx`
- Create: `src/components/dashboard/dm-composer.tsx`
- Replace: `src/app/dashboard/outreach/page.tsx`

**Step 1: Create DM kanban board**

Create `src/components/dashboard/dm-kanban.tsx`:

```tsx
"use client";

import { Badge } from "./badge";

export interface DMCard {
  id: string;
  coachId: string;
  coachName: string;
  schoolName: string;
  content: string;
  templateType: string;
  status: string;
  sentAt: string | null;
  respondedAt: string | null;
  createdAt: string;
}

interface DMKanbanProps {
  dms: DMCard[];
  coaches: { id: string; priorityTier: string }[];
  onCardClick: (dm: DMCard) => void;
}

const COLUMNS = [
  { key: "drafted", label: "Queued", variant: "muted" as const },
  { key: "approved", label: "Approved", variant: "accent" as const },
  { key: "sent", label: "Sent", variant: "accent" as const },
  { key: "responded", label: "Replied", variant: "success" as const },
  { key: "no_response", label: "No Response", variant: "warning" as const },
];

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function DMKanban({ dms, coaches, onCardClick }: DMKanbanProps) {
  const coachTierMap = new Map(coaches.map((c) => [c.id, c.priorityTier]));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: "touch" }}>
      {COLUMNS.map((col) => {
        const colDMs = dms.filter((dm) => {
          if (col.key === "drafted") return dm.status === "drafted" || dm.status === "not_sent";
          return dm.status === col.key;
        });

        return (
          <div key={col.key} className="w-64 shrink-0 md:w-72">
            {/* Column header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-dash-text">{col.label}</h3>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-dash-surface-raised text-[10px] font-bold text-dash-muted">
                  {colDMs.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {colDMs.map((dm) => {
                const tier = coachTierMap.get(dm.coachId);
                return (
                  <button
                    key={dm.id}
                    type="button"
                    onClick={() => onCardClick(dm)}
                    className="w-full rounded-xl border border-dash-border bg-dash-surface p-3 text-left transition-colors hover:bg-dash-surface-raised"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-dash-text">{dm.coachName}</p>
                      {tier && (
                        <Badge variant={tier === "Tier 1" ? "danger" : tier === "Tier 2" ? "warning" : "muted"}>
                          {tier.replace("Tier ", "T")}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-dash-muted">{dm.schoolName}</p>
                    <p className="mt-2 text-xs text-dash-text-secondary line-clamp-2">{dm.content}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-dash-muted">{dm.templateType}</span>
                      <span className="text-[10px] text-dash-muted">
                        {timeAgo(dm.sentAt || dm.createdAt)}
                      </span>
                    </div>
                  </button>
                );
              })}
              {colDMs.length === 0 && (
                <div className="rounded-xl border border-dashed border-dash-border py-8 text-center">
                  <p className="text-xs text-dash-muted/50">Empty</p>
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

**Step 2: Create DM composer**

Create `src/components/dashboard/dm-composer.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Send, Save, CheckCircle, Search } from "lucide-react";
import { SlideOver } from "./slide-over";
import { Badge } from "./badge";

interface Coach {
  id: string;
  name: string;
  schoolName: string;
  xHandle: string;
  priorityTier: string;
}

interface DMComposerProps {
  open: boolean;
  onClose: () => void;
  coaches: Coach[];
  editDM?: { id: string; coachId: string; coachName: string; schoolName: string; content: string; templateType: string; status: string } | null;
  onSaved: () => void;
}

const TEMPLATES = [
  {
    key: "intro",
    label: "Introduction",
    template: `Coach {LAST_NAME}, my name is Jacob Rodgers. I'm a Class of 2029 OL from Pewaukee High School in Wisconsin (6'4", 285). I've been following {SCHOOL} football and admire how your program develops offensive linemen. I'd love to be on your radar — here's my film: https://recruit-match.ncsasports.org/clientrms/athlete_profiles/13603435. Excited to keep working and hopefully connect!`,
  },
  {
    key: "postCamp",
    label: "Post-Camp",
    template: `Coach {LAST_NAME}, just got back from camp and wanted to stay on your radar. I'm Jacob Rodgers, 2029 OL from Pewaukee HS, WI. Would love the opportunity to talk more about {SCHOOL}. Updated film: https://recruit-match.ncsasports.org/clientrms/athlete_profiles/13603435`,
  },
  {
    key: "postFollow",
    label: "After Follow",
    template: `Coach {LAST_NAME}, thank you for the follow! I've had {SCHOOL} on my radar. I'm Jacob Rodgers, 2029 OL, 6'4" 285, from Pewaukee HS in Wisconsin. Would love the opportunity to learn more about {SCHOOL}. Full film: https://recruit-match.ncsasports.org/clientrms/athlete_profiles/13603435`,
  },
  {
    key: "valueAdd",
    label: "Value Add",
    template: `Coach {LAST_NAME}, wanted to share some updated film and measurables. I'm continuing to develop — 445 lb deadlift, 265 bench, and training 5x/week. Would love feedback on my film: https://recruit-match.ncsasports.org/clientrms/athlete_profiles/13603435`,
  },
];

export function DMComposer({ open, onClose, coaches, editDM, onSaved }: DMComposerProps) {
  const [coachSearch, setCoachSearch] = useState("");
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [template, setTemplate] = useState("intro");
  const [content, setContent] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editDM) {
      const coach = coaches.find((c) => c.id === editDM.coachId);
      setSelectedCoach(coach || null);
      setContent(editDM.content);
      setTemplate(editDM.templateType);
    } else {
      setSelectedCoach(null);
      setContent("");
      setTemplate("intro");
      setCoachSearch("");
    }
    setReviewed(false);
  }, [editDM, coaches, open]);

  function applyTemplate(templateKey: string) {
    setTemplate(templateKey);
    const tmpl = TEMPLATES.find((t) => t.key === templateKey);
    if (!tmpl || !selectedCoach) return;
    const lastName = selectedCoach.name.split(" ").pop() || selectedCoach.name;
    setContent(
      tmpl.template
        .replace(/\{LAST_NAME\}/g, lastName)
        .replace(/\{SCHOOL\}/g, selectedCoach.schoolName)
    );
  }

  function selectCoach(coach: Coach) {
    setSelectedCoach(coach);
    setCoachSearch("");
    // Re-apply template with new coach
    const tmpl = TEMPLATES.find((t) => t.key === template);
    if (tmpl) {
      const lastName = coach.name.split(" ").pop() || coach.name;
      setContent(
        tmpl.template
          .replace(/\{LAST_NAME\}/g, lastName)
          .replace(/\{SCHOOL\}/g, coach.schoolName)
      );
    }
  }

  const filteredCoaches = coachSearch
    ? coaches.filter((c) =>
        c.name.toLowerCase().includes(coachSearch.toLowerCase()) ||
        c.schoolName.toLowerCase().includes(coachSearch.toLowerCase())
      ).slice(0, 8)
    : [];

  async function handleSave(status: string) {
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
          templateType: template,
          content,
          sendNow: status === "sent",
          xHandle: selectedCoach.xHandle,
        }),
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <SlideOver open={open} onClose={onClose} title="Compose DM" subtitle="Draft and approve outreach messages" wide>
      {/* Coach selector */}
      <div className="mb-5">
        <label className="mb-2 block text-xs font-medium text-dash-muted">Coach</label>
        {selectedCoach ? (
          <div className="flex items-center justify-between rounded-lg border border-dash-border bg-dash-surface-raised px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-dash-text">{selectedCoach.name}</p>
              <p className="text-xs text-dash-muted">{selectedCoach.schoolName} · @{selectedCoach.xHandle}</p>
            </div>
            <button type="button" onClick={() => setSelectedCoach(null)} className="text-xs text-dash-muted hover:text-dash-text">
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dash-muted" />
            <input
              type="text"
              value={coachSearch}
              onChange={(e) => setCoachSearch(e.target.value)}
              placeholder="Search coach by name or school..."
              className="w-full rounded-lg border border-dash-border bg-dash-surface-raised py-2.5 pl-9 pr-3 text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
            />
            {filteredCoaches.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-dash-border bg-dash-surface shadow-lg">
                {filteredCoaches.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCoach(c)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-dash-surface-raised"
                  >
                    <div>
                      <p className="text-sm text-dash-text">{c.name}</p>
                      <p className="text-xs text-dash-muted">{c.schoolName}</p>
                    </div>
                    <Badge variant="muted">{c.priorityTier.replace("Tier ", "T")}</Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template picker */}
      <div className="mb-5">
        <label className="mb-2 block text-xs font-medium text-dash-muted">Template</label>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => applyTemplate(t.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                template === t.key ? "bg-dash-accent text-white" : "bg-dash-surface-raised text-dash-muted hover:text-dash-text"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="mb-5">
        <label className="mb-2 block text-xs font-medium text-dash-muted">Message</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full resize-none rounded-lg border border-dash-border bg-dash-surface-raised px-3 py-2.5 text-sm leading-relaxed text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
          placeholder="Compose your DM..."
        />
        <p className="mt-1 text-[10px] text-dash-muted">{content.length} chars</p>
      </div>

      {/* Family review gate */}
      <div className="mb-6 rounded-lg border border-dash-border bg-dash-surface-raised px-4 py-3">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
            className="h-4 w-4 rounded border-dash-border accent-dash-accent"
          />
          <div>
            <p className="text-sm font-medium text-dash-text">Mike has reviewed this message</p>
            <p className="text-[10px] text-dash-muted">Required before sending any DM</p>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 border-t border-dash-border pt-5">
        <button
          type="button"
          onClick={() => handleSave("drafted")}
          disabled={saving || !content || !selectedCoach}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dash-border px-4 py-2 text-xs font-semibold text-dash-text-secondary hover:bg-dash-surface-raised disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" />
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => handleSave("approved")}
          disabled={saving || !content || !selectedCoach || !reviewed}
          className="inline-flex items-center gap-1.5 rounded-lg bg-dash-accent px-4 py-2 text-xs font-semibold text-white hover:bg-dash-accent-hover disabled:opacity-40"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Approve &amp; Queue
        </button>
        <button
          type="button"
          onClick={() => handleSave("sent")}
          disabled={saving || !content || !selectedCoach || !reviewed}
          className="inline-flex items-center gap-1.5 rounded-lg bg-dash-success px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
          Send Now
        </button>
      </div>
    </SlideOver>
  );
}
```

**Step 3: Replace outreach page**

Replace `src/app/dashboard/outreach/page.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, Plus } from "lucide-react";
import { DMKanban, type DMCard } from "@/components/dashboard/dm-kanban";
import { DMComposer } from "@/components/dashboard/dm-composer";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function OutreachPage() {
  const [dms, setDMs] = useState<DMCard[]>([]);
  const [coaches, setCoaches] = useState<{ id: string; name: string; schoolName: string; xHandle: string; priorityTier: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editDM, setEditDM] = useState<DMCard | null>(null);

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
        setCoaches(data.coaches || (Array.isArray(data) ? data : []));
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function handleCardClick(dm: DMCard) {
    setEditDM(dm);
    setComposerOpen(true);
  }

  const totalQueued = dms.filter((d) => d.status === "drafted" || d.status === "not_sent").length;
  const totalSent = dms.filter((d) => d.status === "sent").length;
  const totalReplied = dms.filter((d) => d.status === "responded").length;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-dash-text">DM Outreach</h1>
          <p className="mt-1 text-sm text-dash-muted">
            {totalQueued} queued · {totalSent} sent · {totalReplied} replied
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEditDM(null); setComposerOpen(true); }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-dash-accent px-4 py-2 text-xs font-semibold text-white hover:bg-dash-accent-hover"
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
          title="No outreach messages yet"
          description="Start by composing your first DM to a coach."
          action={{ label: "Compose DM", onClick: () => { setEditDM(null); setComposerOpen(true); } }}
        />
      ) : (
        <DMKanban dms={dms} coaches={coaches} onCardClick={handleCardClick} />
      )}

      <DMComposer
        open={composerOpen}
        onClose={() => { setComposerOpen(false); setEditDM(null); }}
        coaches={coaches}
        editDM={editDM}
        onSaved={fetchData}
      />
    </div>
  );
}
```

**Step 4: Build check + Commit**

Run: `npx tsc --noEmit --pretty 2>&1 | tail -5`

```bash
git add src/components/dashboard/dm-kanban.tsx src/components/dashboard/dm-composer.tsx src/app/dashboard/outreach/page.tsx
git commit -m "feat(dashboard): DM outreach pipeline with kanban board and composer"
```

---

### Task 6: Analytics Page + Overview Wiring (Agent D)

**Files:**
- Create: `src/components/dashboard/pillar-chart.tsx`
- Create: `src/components/dashboard/pipeline-funnel.tsx`
- Create: `src/components/dashboard/activity-feed.tsx`
- Replace: `src/app/dashboard/analytics/page.tsx`
- Modify: `src/app/dashboard/page.tsx`

**Step 1: Create pillar chart (uses Recharts — already installed)**

Create `src/components/dashboard/pillar-chart.tsx`:

```tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PILLAR_CONFIG, toCalendarPillar } from "@/lib/dashboard/pillar-config";

interface PillarChartProps {
  posts: { pillar: string }[];
}

export function PillarChart({ posts }: PillarChartProps) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    const p = toCalendarPillar(post.pillar);
    counts.set(p, (counts.get(p) || 0) + 1);
  }

  const data = Object.entries(PILLAR_CONFIG).map(([key, cfg]) => ({
    name: cfg.label,
    count: counts.get(key) || 0,
    color: cfg.color,
  }));

  return (
    <div className="rounded-xl border border-dash-border bg-dash-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-dash-text">Posts by Pillar</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#A1A1AA", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
            <Tooltip
              contentStyle={{ background: "#1A1D27", border: "1px solid #2A2D37", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#E4E4E7" }}
              itemStyle={{ color: "#A1A1AA" }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

**Step 2: Create pipeline funnel**

Create `src/components/dashboard/pipeline-funnel.tsx`:

```tsx
"use client";

interface PipelineFunnelProps {
  stages: { label: string; count: number; color: string }[];
}

export function PipelineFunnel({ stages }: PipelineFunnelProps) {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="rounded-xl border border-dash-border bg-dash-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-dash-text">Coach Pipeline</h3>
      <div className="space-y-3">
        {stages.map((stage) => {
          const pct = Math.max((stage.count / maxCount) * 100, 4);
          return (
            <div key={stage.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-dash-muted">{stage.label}</span>
                <span className="text-xs font-semibold text-dash-text">{stage.count}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-dash-surface-raised">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: stage.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 3: Create activity feed**

Create `src/components/dashboard/activity-feed.tsx`:

```tsx
"use client";

import { FileText, Mail, UserPlus, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Activity {
  id: string;
  type: "post" | "dm" | "follow" | "engagement";
  description: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ICONS: Record<string, LucideIcon> = {
  post: FileText,
  dm: Mail,
  follow: UserPlus,
  engagement: TrendingUp,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="rounded-xl border border-dash-border bg-dash-surface">
      <div className="border-b border-dash-border px-5 py-4">
        <h3 className="text-sm font-semibold text-dash-text">Recent Activity</h3>
      </div>
      <div className="divide-y divide-dash-border-subtle">
        {activities.length === 0 && (
          <p className="px-5 py-8 text-center text-xs text-dash-muted/50">No recent activity</p>
        )}
        {activities.map((act) => {
          const Icon = ICONS[act.type] || TrendingUp;
          return (
            <div key={act.id} className="flex items-start gap-3 px-5 py-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-dash-surface-raised">
                <Icon className="h-3.5 w-3.5 text-dash-muted" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-dash-text-secondary">{act.description}</p>
                <p className="mt-0.5 text-[10px] text-dash-muted">{timeAgo(act.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 4: Replace analytics page**

Replace `src/app/dashboard/analytics/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { BarChart3, Eye, Mail, TrendingUp, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { PillarChart } from "@/components/dashboard/pillar-chart";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

interface AnalyticsData {
  totalFollowers: number;
  avgEngagementRate: number;
  profileVisits: number;
  dmResponseRate: number;
  dmsSent: number;
  postsPublished: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [posts, setPosts] = useState<{ pillar: string }[]>([]);
  const [coaches, setCoaches] = useState<{ dmStatus: string; followStatus: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [analyticsRes, postsRes, coachesRes] = await Promise.allSettled([
          fetch("/api/analytics"),
          fetch("/api/posts"),
          fetch("/api/coaches"),
        ]);

        if (analyticsRes.status === "fulfilled" && analyticsRes.value.ok) {
          const data = await analyticsRes.value.json();
          setAnalytics(data.current || data);
        }

        if (postsRes.status === "fulfilled" && postsRes.value.ok) {
          const data = await postsRes.value.json();
          setPosts(data.posts || []);
        }

        if (coachesRes.status === "fulfilled" && coachesRes.value.ok) {
          const data = await coachesRes.value.json();
          setCoaches(data.coaches || (Array.isArray(data) ? data : []));
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pipelineStages = [
    { label: "Total Coaches", count: coaches.length, color: "#3B82F6" },
    { label: "DM Sent", count: coaches.filter((c) => ["sent", "responded", "approved"].includes(c.dmStatus)).length, color: "#F59E0B" },
    { label: "Replied", count: coaches.filter((c) => c.dmStatus === "responded").length, color: "#22C55E" },
    { label: "Mutual Follow", count: coaches.filter((c) => c.followStatus === "followed_back").length, color: "#D4A853" },
  ];

  // Synthesize activity from posts and DM data
  const activities = posts
    .filter((p: Record<string, unknown>) => (p as Record<string, unknown>).status === "posted")
    .slice(0, 10)
    .map((p: Record<string, unknown>, i: number) => ({
      id: `post-${i}`,
      type: "post" as const,
      description: `Published ${(p as Record<string, unknown>).pillar || "content"} post`,
      timestamp: ((p as Record<string, unknown>).updatedAt || (p as Record<string, unknown>).createdAt || new Date().toISOString()) as string,
    }));

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-dash-text">Analytics</h1>
        <p className="mt-1 text-sm text-dash-muted">Track growth, engagement, and outreach performance.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-dash-accent border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <StatCard
              label="Followers"
              value={analytics?.totalFollowers ?? 0}
              icon={Users}
            />
            <StatCard
              label="Engagement"
              value={`${(analytics?.avgEngagementRate ?? 0).toFixed(1)}%`}
              icon={TrendingUp}
            />
            <StatCard
              label="Profile Views"
              value={analytics?.profileVisits ?? 0}
              icon={Eye}
            />
            <StatCard
              label="DM Response"
              value={`${analytics?.dmResponseRate ?? 0}%`}
              icon={Mail}
            />
          </div>

          {/* Charts grid */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <PillarChart posts={posts} />
            <PipelineFunnel stages={pipelineStages} />
          </div>

          {/* Activity feed */}
          <ActivityFeed activities={activities} />
        </>
      )}
    </div>
  );
}
```

**Step 5: Wire Overview page to real data**

Modify `src/app/dashboard/page.tsx`. Update the `loadStats` function and action items to use real API data:

In the existing `loadStats` function, replace the hardcoded `dmsSent: 0` and `postsThisWeek: 0` with real API calls. Add after the existing `Promise.allSettled`:

```tsx
// Add these fetches to the existing Promise.allSettled array:
const [analyticsRes, coachesRes, postsRes, dmsRes] = await Promise.allSettled([
  fetch("/api/analytics"),
  fetch("/api/coaches"),
  fetch("/api/posts"),
  fetch("/api/dms"),
]);

// Posts this week
let postsThisWeek = 0;
if (postsRes.status === "fulfilled" && postsRes.value.ok) {
  const data = await postsRes.value.json();
  const weekAgo = Date.now() - 7 * 86400000;
  postsThisWeek = (data.posts || []).filter(
    (p: Record<string, unknown>) => p.status === "posted" && new Date(p.updatedAt as string).getTime() > weekAgo
  ).length;
}

// DMs sent
let dmsSent = 0;
if (dmsRes.status === "fulfilled" && dmsRes.value.ok) {
  const data = await dmsRes.value.json();
  dmsSent = (data.dms || []).filter((d: Record<string, unknown>) => d.status === "sent").length;
}
```

Then update `setStats` to use `postsThisWeek` and `dmsSent` instead of the hardcoded `0` values.

**Step 6: Build check + Commit**

Run: `npx tsc --noEmit --pretty 2>&1 | tail -5`

```bash
git add src/components/dashboard/pillar-chart.tsx src/components/dashboard/pipeline-funnel.tsx src/components/dashboard/activity-feed.tsx src/app/dashboard/analytics/page.tsx src/app/dashboard/page.tsx
git commit -m "feat(dashboard): analytics page with charts + wire overview to live data"
```

---

## Batch 3: Verification (Sequential)

### Task 7: Build Verification + Final Check

**Step 1: Full build**

Run: `cd /Users/mikerodgers/Desktop/alex-recruiting-project/alex-recruiting && npm run build 2>&1 | tail -20`
Expected: Build succeeds with no errors. Warnings about unused vars are OK.

**Step 2: Fix any build errors**

If TypeScript errors occur, fix them. Common issues:
- Missing imports (lucide-react icons, date-fns functions)
- Type mismatches on API response shapes — cast with `as` or adjust types
- `cn` utility import: `import { cn } from "@/lib/utils"`

**Step 3: Start dev server and verify pages load**

Start dev server, then verify each route returns 200:
- `/dashboard` — Overview with real stat values
- `/dashboard/calendar` — Month grid with post pills
- `/dashboard/coaches` — Sortable table with 183 coaches
- `/dashboard/outreach` — Kanban columns
- `/dashboard/analytics` — Stat cards + charts

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(dashboard): v2.0 — content calendar, coach CRM, DM outreach, analytics

Complete dashboard rebuild with 4 real pages replacing placeholders:
- Content Calendar with month grid + post composer
- Coach CRM with sortable table, filters, and detail panel
- DM Outreach pipeline with kanban board and composer
- Analytics with Recharts visualizations and pipeline funnel
- Overview page wired to live API data"
```
