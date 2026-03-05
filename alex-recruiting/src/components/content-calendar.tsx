"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn, getPillarColor, getPillarLabel } from "@/lib/utils";
import { weeklyCalendar } from "@/lib/data/weekly-calendar";

export function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  // Generate calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function getDaySchedule(day: number) {
    const date = new Date(year, month, day);
    const dayName = date.toLocaleString("default", { weekday: "long" });
    return weeklyCalendar.find((w) => w.day === dayName);
  }

  const isToday = (day: number) => {
    const now = new Date();
    return day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{monthName}</h2>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4 mr-4">
            {["performance", "work_ethic", "character"].map((pillar) => (
              <div key={pillar} className="flex items-center gap-1.5">
                <div className={cn("h-2.5 w-2.5 rounded-full", getPillarColor(pillar))} />
                <span className="text-xs text-slate-600">{getPillarLabel(pillar)}</span>
              </div>
            ))}
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="px-3 py-2 text-center text-xs font-medium text-slate-500 border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const schedule = day ? getDaySchedule(day) : null;
              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[120px] border-r border-b last:border-r-0 p-2",
                    !day && "bg-slate-50",
                    isToday(day || 0) && "bg-blue-50"
                  )}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("text-sm", isToday(day) ? "font-bold text-blue-600" : "text-slate-700")}>
                          {day}
                        </span>
                      </div>
                      {schedule && (
                        <div className={cn("rounded p-1.5 mt-1", `${getPillarColor(schedule.pillar)}/10`)}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <div className={cn("h-1.5 w-1.5 rounded-full", getPillarColor(schedule.pillar))} />
                            <span className="text-[10px] font-medium text-slate-600">
                              {getPillarLabel(schedule.pillar).split(" ")[0]}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-2">{schedule.contentType}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{schedule.bestTime}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Posting Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {weeklyCalendar.map((entry) => (
              <div key={entry.day} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                <span className="w-20 text-sm font-medium">{entry.day}</span>
                <div className={cn("h-2 w-2 rounded-full shrink-0", getPillarColor(entry.pillar))} />
                <span className="text-sm text-slate-600 flex-1">{entry.contentType}</span>
                <span className="text-xs text-slate-400">{entry.bestTime}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
