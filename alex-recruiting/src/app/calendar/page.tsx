"use client";

import { ContentCalendar } from "@/components/content-calendar";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Calendar</h1>
        <p className="text-sm text-slate-500">30-day visual calendar with pillar rotation, scheduling, and post status tracking</p>
      </div>
      <ContentCalendar />
    </div>
  );
}
