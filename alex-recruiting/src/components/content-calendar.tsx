"use client";

import { useEffect, useMemo, useState } from "react";
import { addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { RECOMMENDED_POST_WINDOWS } from "@/lib/content-engine/posting-rhythm";
import { cn, getPillarColor, getPillarLabel } from "@/lib/utils";
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

export function ContentCalendar() {
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate((date) => addMonths(date, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate((date) => addMonths(date, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>{scheduledPosts.length} scheduled posts</span>
          <span>{camps.filter((camp) => camp.date && new Date(camp.date) >= new Date()).length} upcoming camps</span>
          <span>{tasks.filter((task) => task.status !== "completed").length} open tasks</span>
          <span>Cadence: ~3 posts/week</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="px-3 py-2 text-center text-xs font-medium text-slate-500">
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
                  className={cn(
                    "min-h-[90px] border-r border-b p-2 align-top",
                    !isCurrentMonth && "bg-slate-50 text-slate-300",
                    today && "bg-blue-50"
                  )}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={cn("text-sm", today ? "font-bold text-blue-600" : "text-slate-700")}>
                      {format(day, "d")}
                    </span>
                    {dayPosts.length > 0 ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    {dayPosts.map((post) => (
                      <div key={post.id} className={cn("rounded-md p-2 text-[10px]", `${getPillarColor(post.pillar)}/10`)}>
                        <div className="mb-1 flex items-center gap-1">
                          <span className={cn("h-1.5 w-1.5 rounded-full", getPillarColor(post.pillar))} />
                          <span className="font-medium text-slate-700">{getPillarLabel(post.pillar)}</span>
                        </div>
                        <p className="line-clamp-2 text-slate-600">{post.content}</p>
                        <p className="mt-1 text-slate-400">{post.bestTime || format(new Date(post.scheduledFor), "p")}</p>
                      </div>
                    ))}

                    {dayCamps.map((camp) => (
                      <div key={camp.id} className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[10px] text-amber-900">
                        <div className="font-medium">{camp.name}</div>
                        <p className="mt-1 text-amber-700">
                          {camp.school ? `${camp.school} · ` : ""}
                          {camp.registrationStatus.replace(/_/g, " ")}
                        </p>
                      </div>
                    ))}

                    {dayPosts.length === 0 && dayCamps.length === 0 && recommendation && isCurrentMonth ? (
                      <div className="rounded-md border border-dashed border-slate-200 p-2 text-[10px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          <span className="font-medium">{recommendation.label}</span>
                        </div>
                        <p className="mt-1">{recommendation.bestTime}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next Recommended Publishing Windows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingRecommendations.map((entry) => (
              <div key={`${entry.date.toISOString()}-${entry.label}`} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                <div className={cn("h-2.5 w-2.5 rounded-full", getPillarColor(entry.pillar))} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{entry.label}</p>
                  <p className="text-xs text-slate-500">
                    {format(entry.date, "EEE, MMM d")} · {entry.bestTime}
                  </p>
                </div>
                <Badge variant="secondary">{getPillarLabel(entry.pillar)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open Execution Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-sm text-slate-500">Loading tasks...</div>
            ) : tasks.filter((task) => task.status !== "completed").length === 0 ? (
              <div className="text-sm text-slate-500">No open recruiting tasks in the system.</div>
            ) : (
              tasks
                .filter((task) => task.status !== "completed")
                .slice(0, 8)
                .map((task) => (
                  <div key={task.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900">{task.title}</p>
                      <Badge variant="secondary">{task.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{format(new Date(task.createdAt), "MMM d, yyyy")}</p>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
