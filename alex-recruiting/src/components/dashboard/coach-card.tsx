"use client";

import { MessageSquare, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EngagementMeter } from "./engagement-meter";
import type { Coach } from "@/lib/types";

interface CoachCardProps {
  coach: Coach;
  engagementScore: number;
  onView: (coach: Coach) => void;
  onDM: (coach: Coach) => void;
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getTierBorderColor(tier: string): string {
  switch (tier) {
    case "Tier 1":
      return "border-l-[#ff000c]";
    case "Tier 2":
      return "border-l-[#D4A853]";
    default:
      return "border-l-white/20";
  }
}

export function CoachCard({ coach, engagementScore, onView, onDM }: CoachCardProps) {
  const tierVariant =
    coach.priorityTier === "Tier 1"
      ? "tier1"
      : coach.priorityTier === "Tier 2"
        ? "tier2"
        : "tier3";

  return (
    <div
      className={`group relative rounded-xl border border-white/5 bg-[#0A0A0A] border-l-2 ${getTierBorderColor(coach.priorityTier)} p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(255,0,12,0.08)] hover:border-white/10`}
    >
      {/* School + Tier */}
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wider truncate pr-2">
          {coach.schoolName}
        </p>
        <Badge variant={tierVariant} className="text-[10px] shrink-0">
          {coach.priorityTier}
        </Badge>
      </div>

      {/* Coach name + title */}
      <p className="text-sm font-semibold text-white truncate">{coach.name}</p>
      <p className="text-xs text-white/40 truncate mt-0.5">{coach.title}</p>

      {/* Engagement meter */}
      <div className="mt-3">
        <EngagementMeter score={engagementScore} />
      </div>

      {/* Last engaged */}
      <p className="mt-2 text-[11px] text-white/30">
        Engaged: {formatRelativeDate(coach.lastEngaged)}
      </p>

      {/* Quick actions */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDM(coach);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-[#ff000c] px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-[#cc000a] transition-colors"
        >
          <MessageSquare className="h-3 w-3" />
          DM
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView(coach);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-white/60 hover:bg-white/10 transition-colors"
        >
          <Eye className="h-3 w-3" />
          View
        </button>
      </div>
    </div>
  );
}
