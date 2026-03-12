"use client";

import { useState } from "react";
import { FileText, Mail, UserPlus, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

type ActivityType = "post" | "dm" | "follow" | "engagement";

interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  detail?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const iconMap: Record<ActivityType, typeof FileText> = {
  post: FileText,
  dm: Mail,
  follow: UserPlus,
  engagement: TrendingUp,
};

const borderColorMap: Record<ActivityType, string> = {
  post: "border-[#ff000c]",
  dm: "border-[#D4A853]",
  follow: "border-[#22C55E]",
  engagement: "border-white/20",
};

const dotColorMap: Record<ActivityType, string> = {
  post: "bg-[#ff000c]",
  dm: "bg-[#D4A853]",
  follow: "bg-[#22C55E]",
  engagement: "bg-white/20",
};

type FilterTab = "all" | "coaches" | "content" | "milestones";

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "coaches", label: "Coaches" },
  { id: "content", label: "Content" },
  { id: "milestones", label: "Milestones" },
];

const TAB_TYPE_MAP: Record<FilterTab, ActivityType[] | null> = {
  all: null,
  coaches: ["dm", "follow"],
  content: ["post"],
  milestones: ["engagement"],
};

function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allowedTypes = TAB_TYPE_MAP[activeTab];
  const filtered = allowedTypes
    ? activities.filter((a) => allowedTypes.includes(a.type))
    : activities;

  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0A0A]">
      {/* Header with filter tabs */}
      <div className="border-b border-white/5 px-6 py-4">
        <h3 className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
          Recent Activity
        </h3>
        <div className="flex gap-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-1 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-[#ff000c] text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-white/40">No activity in this category.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {filtered.map((activity) => {
            const Icon = iconMap[activity.type];
            const isExpanded = expandedId === activity.id;

            return (
              <div key={activity.id}>
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : activity.id)
                  }
                  className={`flex w-full items-center gap-3 border-l-2 px-6 py-3 text-left transition-colors hover:bg-white/[0.02] ${borderColorMap[activity.type]}`}
                >
                  <div
                    className={`h-2 w-2 shrink-0 rounded-full ${dotColorMap[activity.type]}`}
                  />
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.03]">
                    <Icon className="h-3.5 w-3.5 text-white/40" />
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                    {activity.description}
                  </p>
                  <span className="shrink-0 font-mono text-xs text-white/30">
                    {timeAgo(activity.timestamp)}
                  </span>
                  {activity.detail && (
                    isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 shrink-0 text-white/20" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/20" />
                    )
                  )}
                </button>
                {isExpanded && activity.detail && (
                  <div className="border-l-2 border-white/5 bg-white/[0.02] px-6 py-3 pl-[72px]">
                    <p className="text-xs leading-relaxed text-white/50">
                      {activity.detail}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
