"use client";

import { useEffect, useMemo, useState } from "react";
import { addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import {
  SCPageHeader,
  SCGlassCard,
  SCBadge,
  SCButton,
} from "@/components/sc";
import { RECOMMENDED_POST_WINDOWS } from "@/lib/content-engine/posting-rhythm";
import { getPillarColor, getPillarLabel } from "@/lib/utils";
import type { Post } from "@/lib/types";

interface RecTask {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  createdAt: string;
}

interface Camp {
  id: string;
  name: string;
  school: string | null;
  date: string | null;
  registrationStatus: string;
}

function buildMonthGrid(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
  const days: Date[] = [];
  for (let cursor = start; cursor <= end; cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)) {
    days.push(new Date(cursor));
  }
  return days;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [tasks, setTasks] = useState<RecTask[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [postsResponse, tasksResponse, campsResponse] = await Promise.all([
          fetch("/api/posts", { cache: "no-store" }),
          fetch("/api/rec/tasks", { cache: "no-store" }),
          fetch("/api/camps", { cache: "no-store" }),
        ]);

        const postsData = await postsResponse.json();
        const tasksData = await tasksResponse.json();
        const campsData = await campsResponse.json();

        if (active) {
          setPosts(postsData.posts ?? []);
          setTasks(tasksData.tasks ?? []);
          setCamps(campsData.camps ?? []);
        }
      } catch (error) {
        console.error("Failed to load content calendar:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const monthGrid = useMemo(() => buildMonthGrid(currentDate), [currentDate]);
  const scheduledPosts = useMemo(
    () => posts.filter((post) => post.scheduledFor).sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()),
    [posts]
  );

  const upcomingRecommendations = useMemo(() => {
    const start = new Date();
    const recs: Array<{ date: Date; pillar: Post["pillar"]; label: string; bestTime: string }> = [];

    for (let i = 0; i < 21; i++) {
      const candidate = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const match = RECOMMENDED_POST_WINDOWS.find((window) => window.weekday === candidate.getDay());
      if (!match) continue;
      recs.push({
        date: candidate,
        pillar: match.pillar,
        label: match.label,
        bestTime: match.bestTime,
      });
    }

    return recs.slice(0, 9);
  }, []);

  return (
    <div className="space-y-6">
      <SCPageHeader
        kicker="30-Day Ops"
        title="RECRUITING CALENDAR"
        subtitle="30-day operations calendar combining posts, camps, and execution tasks"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <SCButton variant="ghost" size="sm" onClick={() => setCurrentDate((date) => addMonths(date, -1))}>
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </SCButton>
          <h2 className="text-lg font-bold text-white">{format(currentDate, "MMMM yyyy")}</h2>
          <SCButton variant="ghost" size="sm" onClick={() => setCurrentDate((date) => addMonths(date, 1))}>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </SCButton>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>{scheduledPosts.length} scheduled posts</span>
          <span>{camps.filter((camp) => camp.date && new Date(camp.date) >= new Date()).length} upcoming camps</span>
          <span>{tasks.filter((task) => task.status !== "completed").length} open tasks</span>
          <span>Cadence: ~3 posts/week</span>
        </div>
      </div>

      <SCGlassCard className="overflow-hidden">
        <div className="grid grid-cols-7 border-b border-sc-border">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="px-3 py-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {monthGrid.map((day) => {
            const dayPosts = scheduledPosts.filter((post) => post.scheduledFor && isSameDay(new Date(post.scheduledFor), day));
            const dayCamps = camps.filter((camp) => camp.date && isSameDay(new Date(camp.date), day));
            const recommendation = RECOMMENDED_POST_WINDOWS.find((window) => window.weekday === day.getDay());
            const isCurrentMonth = isSameMonth(day, currentDate);
            const today = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[90px] border-r border-b border-sc-border p-2 align-top ${
                  !isCurrentMonth ? "bg-white/[0.02] text-slate-600" : ""
                } ${today ? "bg-sc-primary/5 border-sc-primary/20" : ""}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className={`text-sm ${today ? "font-black text-sc-primary" : "text-slate-400"}`}>
                    {format(day, "d")}
                  </span>
                  {dayPosts.length > 0 && (
                    <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
                  )}
                </div>

                <div className="space-y-2">
                  {dayPosts.map((post) => (
                    <div key={post.id} className="rounded-md bg-white/5 border border-sc-border p-2 text-[10px]">
                      <div className="mb-1 flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${getPillarColor(post.pillar)}`} />
                        <span className="font-bold text-slate-300">{getPillarLabel(post.pillar)}</span>
                      </div>
                      <p className="line-clamp-2 text-slate-500">{post.content}</p>
                      <p className="mt-1 text-slate-600">{post.bestTime || format(new Date(post.scheduledFor), "p")}</p>
                    </div>
                  ))}

                  {dayCamps.map((camp) => (
                    <div key={camp.id} className="rounded-md border border-yellow-500/20 bg-yellow-500/5 p-2 text-[10px] text-yellow-400">
                      <div className="font-bold">{camp.name}</div>
                      <p className="mt-1 text-yellow-500/60">
                        {camp.school ? `${camp.school} · ` : ""}
                        {camp.registrationStatus.replace(/_/g, " ")}
                      </p>
                    </div>
                  ))}

                  {dayPosts.length === 0 && dayCamps.length === 0 && recommendation && isCurrentMonth ? (
                    <div className="rounded-md border border-dashed border-sc-border p-2 text-[10px] text-slate-600">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                        <span className="font-bold">{recommendation.label}</span>
                      </div>
                      <p className="mt-1">{recommendation.bestTime}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </SCGlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SCGlassCard className="p-5">
          <h3 className="text-sm font-bold text-white mb-3">Next Recommended Publishing Windows</h3>
          <div className="space-y-3">
            {upcomingRecommendations.map((entry) => (
              <div key={`${entry.date.toISOString()}-${entry.label}`} className="flex items-center gap-3 rounded-lg border border-sc-border bg-white/5 p-3">
                <div className={`h-2.5 w-2.5 rounded-full ${getPillarColor(entry.pillar)}`} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{entry.label}</p>
                  <p className="text-xs text-slate-500">
                    {format(entry.date, "EEE, MMM d")} · {entry.bestTime}
                  </p>
                </div>
                <SCBadge variant="default">{getPillarLabel(entry.pillar)}</SCBadge>
              </div>
            ))}
          </div>
        </SCGlassCard>

        <SCGlassCard className="p-5">
          <h3 className="text-sm font-bold text-white mb-3">Open Execution Tasks</h3>
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-slate-500">Loading tasks...</div>
            ) : tasks.filter((task) => task.status !== "completed").length === 0 ? (
              <div className="text-sm text-slate-500">No open recruiting tasks in the system.</div>
            ) : (
              tasks
                .filter((task) => task.status !== "completed")
                .slice(0, 8)
                .map((task) => (
                  <div key={task.id} className="rounded-lg border border-sc-border bg-white/5 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-white">{task.title}</p>
                      <SCBadge variant="default">{task.status.replace("_", " ")}</SCBadge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{format(new Date(task.createdAt), "MMM d, yyyy")}</p>
                  </div>
                ))
            )}
          </div>
        </SCGlassCard>
      </div>
    </div>
  );
}
