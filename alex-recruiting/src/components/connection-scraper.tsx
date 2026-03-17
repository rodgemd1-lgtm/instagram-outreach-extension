"use client";

import { useState, useMemo } from "react";
import {
  Search,
  UserPlus,
  ExternalLink,
  CheckSquare,
  Square,
  Users,
  Globe,
  Star,
  TrendingUp,
  MapPin,
  Radio,
  Sparkles,
  Target,
  Heart,
  MessageSquare,
  Repeat2,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { scraperTargets } from "@/lib/data/scraper-targets";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  "All": "",
  "Recruiting Analysts": "analyst",
  "OL Specialists": "ol_specialist",
  "Camps/Showcases": "camp",
  "Media/Influencers": "media",
  "Peer Recruits": "peer_recruit",
  "Recruiting Services": "recruiting_service",
};

const priorityFilterMap: Record<PriorityFilter, string> = {
  "All": "",
  "High": "high",
  "Medium": "medium",
  "Low": "low",
};

// ─── Constants ───────────────────────────────────────────────────────────────

const TYPE_FILTERS: TypeFilter[] = [
  "All",
  "Recruiting Analysts",
  "OL Specialists",
  "Camps/Showcases",
  "Media/Influencers",
  "Peer Recruits",
  "Recruiting Services",
];

const REGION_FILTERS: RegionFilter[] = ["All", "Wisconsin", "Midwest", "National"];
const PRIORITY_FILTERS: PriorityFilter[] = ["All", "High", "Medium", "Low"];

const DAILY_CHECKLIST = [
  {
    id: "follow",
    label: "Follow 3-5 new accounts per day",
    icon: UserPlus,
  },
  {
    id: "like",
    label: "Like 10+ posts from coaches and analysts",
    icon: Heart,
  },
  {
    id: "comment",
    label: "Comment on 5 coach posts (use Comment Templates)",
    icon: MessageSquare,
  },
  {
    id: "retweet",
    label: "Retweet 2 relevant recruiting posts",
    icon: Repeat2,
  },
  {
    id: "dm",
    label: "Send 1 cold DM per day",
    icon: Send,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTypeBadgeClasses(type: string): string {
  switch (type) {
    case "Recruiting Analysts":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "OL Specialists":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "Camps/Showcases":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Media/Influencers":
      return "bg-pink-100 text-pink-700 border-pink-200";
    case "Peer Recruits":
      return "bg-green-100 text-green-700 border-green-200";
    case "Recruiting Services":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function getRegionBadgeClasses(region: string): string {
  switch (region) {
    case "Wisconsin":
      return "bg-red-50 text-red-700 border-red-200";
    case "Midwest":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "National":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function getPriorityDot(priority: string): string {
  switch (priority) {
    case "High":
      return "bg-red-500";
    case "Medium":
      return "bg-yellow-500";
    case "Low":
      return "bg-green-500";
    default:
      return "bg-slate-400";
  }
}

function formatFollowers(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
  if (count >= 1000) return (count / 1000).toFixed(1) + "K";
  return count.toString();
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function ConnectionStrategyPanel() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const completedCount = checked.size;
  const totalCount = DAILY_CHECKLIST.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-500" />
            Daily Engagement Strategy
          </CardTitle>
          <div
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              percentage === 100
                ? "bg-green-100 text-green-700"
                : percentage > 50
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {completedCount}/{totalCount} done
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              percentage === 100 ? "bg-green-500" : "bg-indigo-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="space-y-2">
          {DAILY_CHECKLIST.map((item) => {
            const Icon = item.icon;
            const isChecked = checked.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className={`w-full flex items-center gap-3 rounded-lg p-2.5 text-left transition-all ${
                  isChecked
                    ? "bg-green-50 border border-green-200"
                    : "bg-white border border-slate-200 hover:border-slate-300"
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-slate-300 flex-shrink-0" />
                )}
                <Icon
                  className={`h-3.5 w-3.5 flex-shrink-0 ${isChecked ? "text-green-500" : "text-slate-400"}`}
                />
                <span
                  className={`text-sm ${
                    isChecked
                      ? "text-green-700 line-through"
                      : "text-slate-700"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ConnectionCard({ target }: { target: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Profile header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xs font-bold text-white">
              {(target.name || "?")
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {target.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {target.handle ? `@${target.handle.replace("@", "")}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className={`h-2.5 w-2.5 rounded-full ${getPriorityDot(target.priority)}`}
              title={`${target.priority} priority`}
            />
            <span className="text-[10px] text-slate-400 font-medium">
              {target.priority}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <div
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${getTypeBadgeClasses(target.type)}`}
          >
            {target.type}
          </div>
          {target.region && (
            <div
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${getRegionBadgeClasses(target.region)}`}
            >
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5" />
                {target.region}
              </span>
            </div>
          )}
          {target.followers && (
            <Badge variant="secondary" className="text-[10px] gap-0.5">
              <Users className="h-2.5 w-2.5" />
              {formatFollowers(target.followers)}
            </Badge>
          )}
        </div>

        {/* Engagement Tip */}
        {target.engagementTip && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 mb-3">
            <div className="flex items-start gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {target.engagementTip}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="default" size="sm" className="flex-1 gap-1.5 text-xs">
            <UserPlus className="h-3 w-3" />
            Follow
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs">
            <ExternalLink className="h-3 w-3" />
            View on X
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ConnectionScraper() {
  const [activeType, setActiveType] = useState<TypeFilter>("All");
  const [activeRegion, setActiveRegion] = useState<RegionFilter>("All");
  const [activePriority, setActivePriority] = useState<PriorityFilter>("All");

  const targets = scraperTargets;

  // Filtered items
  const filteredItems = useMemo(() => {
    return targets.filter((target) => {
      if (activeType !== "All" && target.type !== typeFilterMap[activeType]) return false;
      if (activeRegion !== "All" && target.region !== activeRegion) return false;
      if (activePriority !== "All" && target.priority !== priorityFilterMap[activePriority]) return false;
      return true;
    });
  }, [targets, activeType, activeRegion, activePriority]);

  // Top 10 priority queue
  const priorityQueue = useMemo(() => {
    return [...targets]
      .filter((t) => t.priority === "high")
      .slice(0, 10);
  }, [targets]);

  // Stats
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Connection Discovery
              </h1>
              <p className="text-sm text-slate-500">
                Find and connect with the right people on X
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {stats.total}
                </p>
                <p className="text-[11px] text-slate-500">Total Targets</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-[11px] text-slate-500 mb-1">By Type</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(stats.byType)
                  .slice(0, 4)
                  .map(([type, count]) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="text-[10px]"
                    >
                      {type.slice(0, 12)}: {count}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="text-[11px] text-slate-500 mb-1">By Priority</div>
              <div className="flex gap-3">
                {Object.entries(stats.byPriority).map(([priority, count]) => (
                  <div key={priority} className="flex items-center gap-1.5">
                    <div
                      className={`h-3 w-3 rounded-full ${getPriorityDot(priority)}`}
                    />
                    <span className="text-sm font-semibold text-slate-900">
                      {count}
                    </span>
                    <span className="text-xs text-slate-500">{priority}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connection Strategy Panel */}
        <div className="mb-6">
          <ConnectionStrategyPanel />
        </div>

        {/* Priority Queue */}
        {priorityQueue.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-red-500 fill-red-500" />
              <h2 className="text-lg font-bold text-slate-900">
                Priority Queue
              </h2>
              <Badge className="bg-red-500 text-white border-0">
                Must Connect
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {priorityQueue.map((target) => (
                <Card
                  key={target.id}
                  className="border-2 border-red-200 bg-gradient-to-br from-red-50/30 to-orange-50/30"
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
                        {(target.name || "?")
                          .split(" ")
                          .map((w: string) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {target.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {target.handle
                            ? `@${target.handle.replace("@", "")}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <div
                        className={`rounded-full px-2 py-0.5 text-[9px] font-semibold border ${getTypeBadgeClasses(target.type)}`}
                      >
                        {target.type}
                      </div>
                      {target.followers && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] gap-0.5"
                        >
                          {formatFollowers(target.followers)}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-3 mb-6">
          {/* Type filter */}
          <div>
            <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <Radio className="h-3 w-3" />
              Account Type
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_FILTERS.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveType(type)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    activeType === type
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Region filter */}
          <div>
            <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <Globe className="h-3 w-3" />
              Region
            </div>
            <div className="flex gap-1.5">
              {REGION_FILTERS.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setActiveRegion(region)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    activeRegion === region
                      ? "bg-emerald-500 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Priority filter */}
          <div>
            <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />
              Priority
            </div>
            <div className="flex gap-1.5">
              {PRIORITY_FILTERS.map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setActivePriority(priority)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
                    activePriority === priority
                      ? priority === "High"
                        ? "bg-red-500 text-white"
                        : priority === "Medium"
                          ? "bg-yellow-500 text-white"
                          : priority === "Low"
                            ? "bg-green-500 text-white"
                            : "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {priority !== "All" && (
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activePriority === priority
                          ? "bg-white"
                          : getPriorityDot(priority)
                      }`}
                    />
                  )}
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Connection Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((target) => (
            <ConnectionCard key={target.id} target={target} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              No connections match your current filters
            </p>
            <Button
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
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
