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
  post: "border-[#2563EB]",
  dm: "border-[#F59E0B]",
  follow: "border-[#16A34A]",
  engagement: "border-[#D1D5DB]",
};

const dotColorMap: Record<ActivityType, string> = {
  post: "bg-[#2563EB]",
  dm: "bg-[#F59E0B]",
  follow: "bg-[#16A34A]",
  engagement: "bg-[#D1D5DB]",
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
    <div>
      {/* Filter tabs */}
      <div className="border-b border-[#E5E7EB] px-5 py-3">
        <div className="flex gap-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-1 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-[#0F1720] text-[#0F1720]"
                  : "text-[#9CA3AF] hover:text-[#6B7280]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-[#9CA3AF]">No activity in this category.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#E5E7EB]">
          {filtered.map((activity) => {
            const Icon = iconMap[activity.type];
            const isExpanded = expandedId === activity.id;

            return (
              <div key={activity.id}>
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : activity.id)
                  }
                  className={`flex w-full items-center gap-3 border-l-2 px-5 py-3 text-left transition-colors hover:bg-[#F9FAFB] ${borderColorMap[activity.type]}`}
                >
                  <div
                    className={`h-2 w-2 shrink-0 rounded-full ${dotColorMap[activity.type]}`}
                  />
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F4]">
                    <Icon className="h-3.5 w-3.5 text-[#6B7280]" />
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#0F1720]">
                    {activity.description}
                  </p>
                  <span className="shrink-0 font-mono text-xs text-[#9CA3AF]">
                    {timeAgo(activity.timestamp)}
                  </span>
                  {activity.detail && (
                    isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
                    )
                  )}
                </button>
                {isExpanded && activity.detail && (
                  <div className="border-l-2 border-[#E5E7EB] bg-[#F9FAFB] px-5 py-3 pl-[72px]">
                    <p className="text-xs leading-relaxed text-[#6B7280]">
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
