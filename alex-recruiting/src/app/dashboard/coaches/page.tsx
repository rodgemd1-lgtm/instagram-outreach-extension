"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, LayoutGrid, List, Search } from "lucide-react";
import type { Coach } from "@/lib/types";
import { CoachTable } from "@/components/dashboard/coach-table";
import { CoachCard } from "@/components/dashboard/coach-card";
import { CoachDetail } from "@/components/dashboard/coach-detail";

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

  useEffect(() => {
    fetch("/api/coaches")
      .then(r => r.json())
      .then(data => {
        setCoaches(Array.isArray(data) ? data : data?.coaches || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredCoaches = useMemo(() => {
    return coaches.filter(c => {
      if (search && !c.name?.toLowerCase().includes(search.toLowerCase()) && !c.schoolName?.toLowerCase().includes(search.toLowerCase())) return false;
      if (tierFilter !== "all" && c.priorityTier !== tierFilter) return false;
      return true;
    });
  }, [coaches, search, tierFilter]);

  const handleCoachClick = useCallback((coach: Coach) => {
    setSelectedCoach(coach);
    setDetailOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1720]">Coaches</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">{coaches.length} coaches tracked</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[#0F1720] text-white" : "bg-[#F5F5F4] text-[#6B7280]"}`}><List className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("card")} className={`p-2 rounded-lg ${viewMode === "card" ? "bg-[#0F1720] text-white" : "bg-[#F5F5F4] text-[#6B7280]"}`}><LayoutGrid className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input type="text" placeholder="Search coaches or schools..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white text-[#0F1720] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F1720] focus:ring-offset-1" />
        </div>
        <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white text-[#0F1720] focus:outline-none focus:ring-2 focus:ring-[#0F1720]">
          <option value="all">All Tiers</option>
          <option value="Tier 1">Tier 1</option>
          <option value="Tier 2">Tier 2</option>
          <option value="Tier 3">Tier 3</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({length: 3}).map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-lg p-4 animate-pulse">
              <div className="h-5 w-48 bg-[#F5F5F4] rounded mb-3" />
              <div className="h-4 w-full bg-[#F5F5F4] rounded mb-2" />
              <div className="h-4 w-2/3 bg-[#F5F5F4] rounded" />
            </div>
          ))}
        </div>
      ) : filteredCoaches.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-[#6B7280] font-medium">No coaches found</p>
          <p className="text-sm text-[#9CA3AF] mt-1">{search || tierFilter !== "all" ? "Try adjusting your filters" : "Add coaches to start tracking"}</p>
        </div>
      ) : viewMode === "list" ? (
        <CoachTable coaches={filteredCoaches} onCoachClick={handleCoachClick} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoaches.map(coach => (
            <CoachCard key={coach.id} coach={coach} onClick={() => handleCoachClick(coach)} />
          ))}
        </div>
      )}

      <CoachDetail open={detailOpen} onClose={() => setDetailOpen(false)} coach={selectedCoach} onDraftDM={() => {}} />
    </div>
  );
}
