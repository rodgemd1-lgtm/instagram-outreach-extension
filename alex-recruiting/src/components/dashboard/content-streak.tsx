"use client";

import { Flame } from "lucide-react";

interface ContentStreakProps {
  days: number;
  className?: string;
}

export function ContentStreak({ days, className = "" }: ContentStreakProps) {
  const isActive = days > 0;

  return (
    <div className={`flex items-center gap-2 rounded-lg border border-white/5 bg-[#0A0A0A] px-3 py-2 ${className}`}>
      <Flame
        className={`h-4 w-4 ${isActive ? "text-[#F59E0B]" : "text-white/20"}`}
        fill={isActive ? "#F59E0B" : "none"}
      />
      <span className="font-mono text-sm font-bold text-white">{days}</span>
      <span className="text-[11px] uppercase tracking-[0.15em] text-white/40">
        day streak
      </span>
    </div>
  );
}
