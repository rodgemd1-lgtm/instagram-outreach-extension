"use client";

import { Eye, Film, UserPlus, Trophy, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Signal {
  id: string;
  type: "coach" | "content" | "milestone" | "system";
  text: string;
  time: string;
  urgency: "high" | "medium" | "low";
}

const signals: Signal[] = [
  {
    id: "1",
    type: "coach",
    text: "Coach Wallace viewed your profile",
    time: "2h ago",
    urgency: "high",
  },
  {
    id: "2",
    type: "content",
    text: "Training video reached 500 views",
    time: "5h ago",
    urgency: "medium",
  },
  {
    id: "3",
    type: "coach",
    text: "New follow from @CoachJohnson_FB",
    time: "1d ago",
    urgency: "high",
  },
  {
    id: "4",
    type: "milestone",
    text: "7-day posting streak achieved!",
    time: "1d ago",
    urgency: "low",
  },
  {
    id: "5",
    type: "system",
    text: "Profile completeness increased to 85%",
    time: "2d ago",
    urgency: "low",
  },
];

const typeBorderColors: Record<Signal["type"], string> = {
  coach: "#ff000c",
  content: "#D4A853",
  milestone: "#22C55E",
  system: "#3B82F6",
};

const typeIcons: Record<Signal["type"], LucideIcon> = {
  coach: Eye,
  content: Film,
  milestone: Trophy,
  system: Settings,
};

const urgencyDotColors: Record<Signal["urgency"], string> = {
  high: "bg-[#EF4444]",
  medium: "bg-[#D4A853]",
  low: "bg-white/20",
};

export function SignalFeed() {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0A0A]">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-[#ff000c]" />
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Signal Feed
          </h2>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-white/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
          </span>
          Live
        </span>
      </div>
      <div className="divide-y divide-white/5">
        {signals.map((signal) => {
          const Icon = typeIcons[signal.type];
          return (
            <div
              key={signal.id}
              className="flex items-start gap-3 border-l-2 px-5 py-3.5 transition-colors hover:bg-[#111111]"
              style={{ borderLeftColor: typeBorderColors[signal.type] }}
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/5">
                <Icon className="h-3.5 w-3.5 text-white/40" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-white/80">{signal.text}</p>
                <p className="mt-0.5 font-mono text-[10px] text-white/30">
                  {signal.time}
                </p>
              </div>
              <div className="mt-1.5 shrink-0">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${urgencyDotColors[signal.urgency]}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
