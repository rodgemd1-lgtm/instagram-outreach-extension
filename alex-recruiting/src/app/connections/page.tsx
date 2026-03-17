"use client";

import { useState, useMemo } from "react";
import {
  SCPageHeader,
  SCGlassCard,
  SCStatCard,
  SCBadge,
  SCButton,
} from "@/components/sc";
import { scraperTargets } from "@/lib/data/scraper-targets";

type TypeFilter =
  | "All"
  | "Recruiting Analysts"
  | "OL Specialists"
  | "Camps/Showcases"
  | "Media/Influencers"
  | "Peer Recruits"
  | "Recruiting Services";

type RegionFilter = "All" | "Wisconsin" | "Midwest" | "National";
type PriorityFilter = "All" | "High" | "Medium" | "Low";

const typeFilterMap: Record<TypeFilter, string> = {
  All: "",
  "Recruiting Analysts": "analyst",
  "OL Specialists": "ol_specialist",
  "Camps/Showcases": "camp",
  "Media/Influencers": "media",
  "Peer Recruits": "peer_recruit",
  "Recruiting Services": "recruiting_service",
};

const priorityFilterMap: Record<PriorityFilter, string> = {
  All: "",
  High: "high",
  Medium: "medium",
  Low: "low",
};

const TYPE_FILTERS: TypeFilter[] = [
  "All", "Recruiting Analysts", "OL Specialists", "Camps/Showcases",
  "Media/Influencers", "Peer Recruits", "Recruiting Services",
];

const REGION_FILTERS: RegionFilter[] = ["All", "Wisconsin", "Midwest", "National"];
const PRIORITY_FILTERS: PriorityFilter[] = ["All", "High", "Medium", "Low"];

const DAILY_CHECKLIST = [
  { id: "follow", label: "Follow 3-5 new accounts per day", icon: "person_add" },
  { id: "like", label: "Like 10+ posts from coaches and analysts", icon: "favorite" },
  { id: "comment", label: "Comment on 5 coach posts (use Comment Templates)", icon: "chat" },
  { id: "retweet", label: "Retweet 2 relevant recruiting posts", icon: "repeat" },
  { id: "dm", label: "Send 1 cold DM per day", icon: "send" },
];

function getPriorityVariant(priority: string): "danger" | "warning" | "success" | "default" {
  switch (priority) {
    case "high": case "High": return "danger";
    case "medium": case "Medium": return "warning";
    case "low": case "Low": return "success";
    default: return "default";
  }
}

function formatFollowers(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
  if (count >= 1000) return (count / 1000).toFixed(1) + "K";
  return count.toString();
}

function ConnectionStrategyPanel() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const completedCount = checked.size;
  const totalCount = DAILY_CHECKLIST.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <SCGlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-sc-primary">target</span>
          Daily Engagement Strategy
        </h3>
        <SCBadge variant={percentage === 100 ? "success" : percentage > 50 ? "info" : "default"}>
          {completedCount}/{totalCount} done
        </SCBadge>
      </div>

      <div className="w-full bg-white/5 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            percentage === 100 ? "bg-emerald-500" : "bg-sc-primary shadow-[0_0_8px_rgba(197,5,12,0.5)]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="space-y-2">
        {DAILY_CHECKLIST.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={`w-full flex items-center gap-3 rounded-lg p-2.5 text-left transition-all ${
                isChecked
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-white/5 border border-sc-border hover:border-sc-primary/30"
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${isChecked ? "text-emerald-500" : "text-slate-500"}`}>
                {isChecked ? "check_box" : "check_box_outline_blank"}
              </span>
              <span className={`material-symbols-outlined text-[14px] flex-shrink-0 ${isChecked ? "text-emerald-500" : "text-slate-500"}`}>
                {item.icon}
              </span>
              <span className={`text-sm ${isChecked ? "text-emerald-400 line-through" : "text-slate-300"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </SCGlassCard>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ConnectionCard({ target }: { target: any }) {
  return (
    <SCGlassCard className="p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-sc-primary to-red-700 flex items-center justify-center text-xs font-black text-white">
            {(target.name || "?")
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{target.name}</p>
            <p className="text-xs text-slate-500 truncate">
              {target.handle ? `@${target.handle.replace("@", "")}` : ""}
            </p>
          </div>
        </div>
        <SCBadge variant={getPriorityVariant(target.priority)}>{target.priority}</SCBadge>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <SCBadge variant="info">{target.type}</SCBadge>
        {target.region && (
          <SCBadge variant="default">
            <span className="material-symbols-outlined text-[10px] mr-0.5">location_on</span>
            {target.region}
          </SCBadge>
        )}
        {target.followers && (
          <SCBadge variant="default">
            <span className="material-symbols-outlined text-[10px] mr-0.5">group</span>
            {formatFollowers(target.followers)}
          </SCBadge>
        )}
      </div>

      {target.engagementTip && (
        <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 p-2.5 mb-3">
          <div className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-yellow-500 mt-0.5 flex-shrink-0">auto_awesome</span>
            <p className="text-[11px] text-yellow-400/80 leading-relaxed">{target.engagementTip}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <SCButton variant="primary" size="sm" className="flex-1">
          <span className="material-symbols-outlined text-[14px]">person_add</span>
          Follow
        </SCButton>
        <SCButton variant="secondary" size="sm" className="flex-1">
          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          View on X
        </SCButton>
      </div>
    </SCGlassCard>
  );
}

export default function ConnectionsPage() {
  const [activeType, setActiveType] = useState<TypeFilter>("All");
  const [activeRegion, setActiveRegion] = useState<RegionFilter>("All");
  const [activePriority, setActivePriority] = useState<PriorityFilter>("All");

  const targets = scraperTargets;

  const filteredItems = useMemo(() => {
    return targets.filter((target) => {
      if (activeType !== "All" && target.type !== typeFilterMap[activeType]) return false;
      if (activeRegion !== "All" && target.region !== activeRegion) return false;
      if (activePriority !== "All" && target.priority !== priorityFilterMap[activePriority]) return false;
      return true;
    });
  }, [targets, activeType, activeRegion, activePriority]);

  const priorityQueue = useMemo(() => {
    return [...targets].filter((t) => t.priority === "high").slice(0, 10);
  }, [targets]);

  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    targets.forEach((t) => {
      byType[t.type] = (byType[t.type] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    });
    return { total: targets.length, byType, byPriority };
  }, [targets]);

  return (
    <div className="space-y-6">
      <SCPageHeader
        kicker="Network Growth"
        title="CONNECTIONS"
        subtitle="Find and connect with the right people on X"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SCStatCard label="Total Targets" value={String(stats.total)} icon="group" />
        <SCGlassCard className="p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">By Type</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(stats.byType).slice(0, 4).map(([type, count]) => (
              <SCBadge key={type} variant="default">{type.slice(0, 12)}: {count}</SCBadge>
            ))}
          </div>
        </SCGlassCard>
        <SCGlassCard className="col-span-2 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">By Priority</p>
          <div className="flex gap-3">
            {Object.entries(stats.byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center gap-1.5">
                <SCBadge variant={getPriorityVariant(priority)}>{count}</SCBadge>
                <span className="text-xs text-slate-500">{priority}</span>
              </div>
            ))}
          </div>
        </SCGlassCard>
      </div>

      <ConnectionStrategyPanel />

      {/* Priority Queue */}
      {priorityQueue.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[20px] text-red-500">priority_high</span>
            <h2 className="text-lg font-bold text-white">Priority Queue</h2>
            <SCBadge variant="danger">Must Connect</SCBadge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {priorityQueue.map((target) => (
              <SCGlassCard key={target.id} className="p-3 border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-[10px] font-black text-white">
                    {(target.name || "?")
                      .split(" ")
                      .map((w: string) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{target.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {target.handle ? `@${target.handle.replace("@", "")}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <SCBadge variant="info">{target.type}</SCBadge>
                  {target.followers && (
                    <SCBadge variant="default">{formatFollowers(target.followers)}</SCBadge>
                  )}
                </div>
              </SCGlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Account Type</p>
          <div className="flex flex-wrap gap-1.5">
            {TYPE_FILTERS.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeType === type
                    ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                    : "bg-white/5 border border-sc-border text-slate-500 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Region</p>
          <div className="flex gap-1.5">
            {REGION_FILTERS.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setActiveRegion(region)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeRegion === region
                    ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                    : "bg-white/5 border border-sc-border text-slate-500 hover:text-white"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Priority</p>
          <div className="flex gap-1.5">
            {PRIORITY_FILTERS.map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => setActivePriority(priority)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activePriority === priority
                    ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                    : "bg-white/5 border border-sc-border text-slate-500 hover:text-white"
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Connection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((target) => (
          <ConnectionCard key={target.id} target={target} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <SCGlassCard className="py-12 text-center">
          <span className="material-symbols-outlined text-[40px] text-white/10">search</span>
          <p className="text-sm text-slate-500 mt-3">No connections match your current filters</p>
          <SCButton
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => {
              setActiveType("All");
              setActiveRegion("All");
              setActivePriority("All");
            }}
          >
            Reset Filters
          </SCButton>
        </SCGlassCard>
      )}
    </div>
  );
}
