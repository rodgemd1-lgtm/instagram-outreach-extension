"use client";

import { Flame, Zap, Target } from "lucide-react";

interface StreakIndicatorProps {
  type: "posting" | "outreach" | "activity";
  days: number;
  className?: string;
}

const CONFIG = {
  posting: { icon: Flame, label: "Post Streak", color: "#F59E0B" },
  outreach: { icon: Zap, label: "DM Streak", color: "#ff000c" },
  activity: { icon: Target, label: "Active", color: "#22C55E" },
};

export function StreakIndicator({ type, days, className = "" }: StreakIndicatorProps) {
  const { icon: Icon, label, color } = CONFIG[type];
  const isActive = days > 0;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-[#0A0A0A] px-3 py-1 ${className}`}>
      <Icon
        className="h-3.5 w-3.5"
        style={{ color: isActive ? color : "#3F3F46" }}
        fill={isActive ? color : "none"}
      />
      <span className="font-mono text-xs font-bold text-white">{days}</span>
      <span className="text-[10px] text-white/40">{label}</span>
    </div>
  );
}
