"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EngagementMeter } from "./engagement-meter";
import { calculateEngagement } from "@/lib/dashboard/engagement-scoring";
import type { Coach } from "@/lib/types";

interface CoachTableProps {
  coaches: Coach[];
  onCoachClick: (coach: Coach) => void;
}

type SortKey = "name" | "schoolName" | "division" | "priorityTier" | "olNeedScore" | "lastEngaged";
type SortDir = "asc" | "desc";

const DIVISION_OPTIONS = ["All", "D1 FBS", "D1 FCS", "D2", "D3", "NAIA"];
const TIER_OPTIONS = ["All", "Tier 1", "Tier 2", "Tier 3"];
const DM_STATUS_OPTIONS = ["All", "not_sent", "drafted", "sent", "responded"];

function getFollowBadgeVariant(status: string) {
  switch (status) {
    case "followed_back": return "default" as const;
    case "followed": return "secondary" as const;
    default: return "outline" as const;
  }
}

function getDmBadgeVariant(status: string) {
  switch (status) {
    case "responded": return "responded" as const;
    case "sent": return "sent" as const;
    case "drafted": return "draft" as const;
    default: return "outline" as const;
  }
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

function getEngagementScore(coach: Coach): number {
  const daysAgo = coach.lastEngaged
    ? Math.floor((Date.now() - new Date(coach.lastEngaged).getTime()) / 86400000)
    : null;
  return calculateEngagement({
    isFollowed: coach.followStatus !== "not_followed",
    isFollowedBack: coach.followStatus === "followed_back",
    dmSent: ["sent", "responded", "approved"].includes(coach.dmStatus),
    dmReplied: coach.dmStatus === "responded",
    lastInteractionDays: daysAgo,
    interactionCount: coach.xActivityScore,
  }).score;
}

function getTierBorderColor(tier: string): string {
  switch (tier) {
    case "Tier 1": return "border-l-[#ff000c]";
    case "Tier 2": return "border-l-[#D4A853]";
    default: return "border-l-white/20";
  }
}

export function CoachTable({ coaches, onCoachClick }: CoachTableProps) {
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("All");
  const [tier, setTier] = useState("All");
  const [dmStatus, setDmStatus] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("priorityTier");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    let result = coaches;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.schoolName.toLowerCase().includes(q));
    }
    if (division !== "All") result = result.filter((c) => c.division === division);
    if (tier !== "All") result = result.filter((c) => c.priorityTier === tier);
    if (dmStatus !== "All") result = result.filter((c) => c.dmStatus === dmStatus);

    result = [...result].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [coaches, search, division, tier, dmStatus, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const selectClass = "rounded-lg border border-white/10 bg-[#111111] px-2 py-1.5 text-xs text-white focus:border-[#ff000c] focus:outline-none";

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coaches or schools..."
            className="w-full rounded-lg border border-white/10 bg-[#111111] py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-white/30 focus:border-[#ff000c] focus:outline-none"
          />
        </div>
        <select value={division} onChange={(e) => setDivision(e.target.value)} className={selectClass}>
          {DIVISION_OPTIONS.map((o) => <option key={o} value={o}>{o === "All" ? "All Divisions" : o}</option>)}
        </select>
        <select value={tier} onChange={(e) => setTier(e.target.value)} className={selectClass}>
          {TIER_OPTIONS.map((o) => <option key={o} value={o}>{o === "All" ? "All Tiers" : o}</option>)}
        </select>
        <select value={dmStatus} onChange={(e) => setDmStatus(e.target.value)} className={selectClass}>
          {DM_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o === "All" ? "All DM Status" : o.replace("_", " ")}</option>)}
        </select>
        <span className="text-xs text-white/40">{filtered.length} coaches</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0A0A0A]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {([["name", "Coach"], ["schoolName", "School"], ["division", "Division"], ["priorityTier", "Tier"], ["olNeedScore", "Engagement"]] as [SortKey, string][]).map(([key, label]) => (
                <th key={key} className="px-4 py-3">
                  <button type="button" onClick={() => toggleSort(key)} className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white">
                    {label}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-white/40">Follow</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-white/40">DM</th>
              <th className="px-4 py-3">
                <button type="button" onClick={() => toggleSort("lastEngaged")} className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white">
                  Engaged <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((coach, idx) => (
              <tr
                key={coach.id}
                tabIndex={0}
                onClick={() => onCoachClick(coach)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCoachClick(coach); } }}
                className={cn(
                  "cursor-pointer border-b border-white/5 border-l-2 transition-all",
                  getTierBorderColor(coach.priorityTier),
                  idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]",
                  "hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(255,0,12,0.05)]",
                  "focus:bg-white/[0.04] focus:outline-none"
                )}
              >
                <td className="px-4 py-3 font-medium text-white">{coach.name}</td>
                <td className="px-4 py-3 text-white/60">{coach.schoolName}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{coach.division}</Badge></td>
                <td className="px-4 py-3"><Badge variant={coach.priorityTier === "Tier 1" ? "tier1" : coach.priorityTier === "Tier 2" ? "tier2" : "tier3"} className="text-[10px]">{coach.priorityTier}</Badge></td>
                <td className="px-4 py-3 min-w-[120px]">
                  <EngagementMeter score={getEngagementScore(coach)} />
                </td>
                <td className="px-4 py-3"><Badge variant={getFollowBadgeVariant(coach.followStatus)} className="text-[10px]">{coach.followStatus.replace("_", " ")}</Badge></td>
                <td className="px-4 py-3"><Badge variant={getDmBadgeVariant(coach.dmStatus)} className="text-[10px]">{coach.dmStatus.replace("_", " ")}</Badge></td>
                <td className="px-4 py-3 text-xs text-white/40">{formatRelativeDate(coach.lastEngaged)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
