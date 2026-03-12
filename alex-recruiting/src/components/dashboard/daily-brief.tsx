"use client";

import { DashboardTypewriter } from "./typewriter";

export function DailyBrief() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Calculate days until Wisconsin Spring Camp (Apr 12, 2026)
  const campDate = new Date("2026-04-12");
  const daysUntilCamp = Math.ceil(
    (campDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const briefText = `2 coaches engaged this week. Film highlight update due Friday. Wisconsin Spring Camp is in ${daysUntilCamp} days.`;

  return (
    <div className="relative mb-8 rounded-xl border border-white/5 bg-gradient-to-br from-[#080808] to-[#0A0A0A] p-6 md:p-8">
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[#ff000c]" />
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
        {dateStr}
      </p>
      <div className="mt-3">
        <DashboardTypewriter
          text={briefText}
          className="text-base md:text-lg text-white/80 leading-relaxed font-light"
          delay={500}
        />
      </div>
    </div>
  );
}
