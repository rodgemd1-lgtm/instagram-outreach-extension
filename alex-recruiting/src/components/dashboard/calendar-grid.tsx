"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PILLAR_CONFIG, ALL_PILLARS, type CalendarPillar } from "@/lib/dashboard/pillar-config";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CalendarPost {
  id: string;
  content: string;
  pillar: CalendarPillar;
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

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_PILLS = 3;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CalendarGrid({
  currentMonth,
  posts,
  onMonthChange,
  onDayClick,
  onPostClick,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  function postsForDay(day: Date): CalendarPost[] {
    return posts.filter((p) => {
      if (!p.scheduledFor) return false;
      return isSameDay(new Date(p.scheduledFor), day);
    });
  }

  return (
    <div className="space-y-4">
      {/* ---- Month navigation header ---- */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-dash-text">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="rounded-lg p-1.5 text-dash-muted hover:bg-dash-surface-raised hover:text-dash-text"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(new Date())}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-dash-muted hover:bg-dash-surface-raised hover:text-dash-text"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="rounded-lg p-1.5 text-dash-muted hover:bg-dash-surface-raised hover:text-dash-text"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ---- Calendar grid ---- */}
      <div className="rounded-xl border border-dash-border bg-dash-border overflow-hidden">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-px">
          {DAY_HEADERS.map((d) => (
            <div
              key={d}
              className="bg-dash-surface-raised px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-dash-muted"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px">
          {days.map((day) => {
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const dayPosts = postsForDay(day);
            const visible = dayPosts.slice(0, MAX_PILLS);
            const overflow = dayPosts.length - MAX_PILLS;

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onDayClick(day)}
                className={cn(
                  "min-h-[80px] md:min-h-[100px] bg-dash-bg p-1.5 text-left transition-colors hover:bg-dash-surface-raised/50",
                  !inMonth && "opacity-40"
                )}
              >
                {/* Day number */}
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                      today
                        ? "bg-dash-accent text-white"
                        : "text-dash-text"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Post pills */}
                <div className="mt-1 space-y-0.5">
                  {visible.map((post) => {
                    const cfg = PILLAR_CONFIG[post.pillar] ?? PILLAR_CONFIG.film;
                    return (
                      <div
                        key={post.id}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPostClick(post);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            e.preventDefault();
                            onPostClick(post);
                          }
                        }}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight",
                          cfg.bgClass,
                          cfg.textClass
                        )}
                        title={post.content}
                      >
                        <span className="md:hidden">
                          {cfg.label.charAt(0)}
                        </span>
                        <span className="hidden md:inline">
                          {post.content.length > 25
                            ? post.content.slice(0, 25) + "\u2026"
                            : post.content}
                        </span>
                      </div>
                    );
                  })}
                  {overflow > 0 && (
                    <span className="block text-[10px] font-medium text-dash-muted">
                      +{overflow} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Pillar legend ---- */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1">
        {ALL_PILLARS.map((p) => {
          const cfg = PILLAR_CONFIG[p];
          return (
            <div key={p} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: cfg.color }}
              />
              <span className="text-xs text-dash-muted">{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
