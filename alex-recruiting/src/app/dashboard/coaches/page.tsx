"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Coach } from "@/lib/types";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCTable } from "@/components/sc/sc-table";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";
import { SCInput } from "@/components/sc/sc-input";

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

  const tierBadgeVariant = (tier: string) => {
    if (tier === "Tier 1") return "danger" as const;
    if (tier === "Tier 2") return "warning" as const;
    return "default" as const;
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const columns = [
    {
      key: "name",
      header: "Coach",
      render: (row: any) => {
        const c = row as Coach;
        return (
          <button
            onClick={() => handleCoachClick(c)}
            className="text-left hover:text-sc-primary transition-colors"
          >
            <p className="font-bold text-white">{c.name}</p>
            <p className="text-xs text-slate-400">{c.title}</p>
          </button>
        );
      },
    },
    {
      key: "schoolName",
      header: "School",
      render: (row: any) => (
        <span className="text-slate-300">{(row as Coach).schoolName}</span>
      ),
    },
    {
      key: "division",
      header: "Division",
      render: (row: any) => (
        <span className="text-slate-400 text-xs">{(row as Coach).division}</span>
      ),
    },
    {
      key: "priorityTier",
      header: "Tier",
      render: (row: any) => {
        const c = row as Coach;
        return (
          <SCBadge variant={tierBadgeVariant(c.priorityTier)}>
            {c.priorityTier}
          </SCBadge>
        );
      },
    },
    {
      key: "followStatus",
      header: "Follow",
      render: (row: any) => {
        const c = row as Coach;
        return (
          <SCBadge variant={c.followStatus === "followed_back" ? "success" : c.followStatus === "followed" ? "info" : "default"}>
            {c.followStatus?.replace(/_/g, " ") || "none"}
          </SCBadge>
        );
      },
    },
    {
      key: "dmStatus",
      header: "DM",
      render: (row: any) => {
        const c = row as Coach;
        return (
          <SCBadge variant={c.dmStatus === "responded" ? "success" : c.dmStatus === "sent" ? "info" : "default"}>
            {c.dmStatus?.replace(/_/g, " ") || "none"}
          </SCBadge>
        );
      },
    },
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="space-y-6">
      <SCPageHeader
        title="COACH DATABASE"
        subtitle={`${coaches.length} coaches tracked`}
        actions={
          <div className="flex items-center gap-2">
            <SCButton
              variant={viewMode === "list" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
            </SCButton>
            <SCButton
              variant={viewMode === "card" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setViewMode("card")}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
            </SCButton>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 max-w-sm">
          <SCInput
            icon="search"
            placeholder="Search coaches or schools..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={tierFilter}
          onChange={e => setTierFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white/5 border border-sc-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
        >
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
            <SCGlassCard key={i} className="p-4 animate-pulse">
              <div className="h-5 w-48 bg-white/5 rounded mb-3" />
              <div className="h-4 w-full bg-white/5 rounded mb-2" />
              <div className="h-4 w-2/3 bg-white/5 rounded" />
            </SCGlassCard>
          ))}
        </div>
      ) : filteredCoaches.length === 0 ? (
        <SCGlassCard className="text-center py-16">
          <span className="material-symbols-outlined text-[40px] text-slate-600 mb-3 block">group</span>
          <p className="text-slate-300 font-medium">No coaches found</p>
          <p className="text-sm text-slate-500 mt-1">
            {search || tierFilter !== "all" ? "Try adjusting your filters" : "Add coaches to start tracking"}
          </p>
        </SCGlassCard>
      ) : viewMode === "list" ? (
        <SCTable columns={columns} data={filteredCoaches as unknown as Record<string, unknown>[]} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoaches.map(coach => (
            <SCGlassCard
              key={coach.id}
              className="p-5 cursor-pointer hover:border-sc-primary/30 transition-colors"
            >
              <button
                onClick={() => handleCoachClick(coach)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-white">{coach.name}</p>
                    <p className="text-xs text-slate-400">{coach.title}</p>
                  </div>
                  <SCBadge variant={tierBadgeVariant(coach.priorityTier)}>
                    {coach.priorityTier}
                  </SCBadge>
                </div>
                <p className="text-sm text-slate-300">{coach.schoolName}</p>
                <p className="text-xs text-slate-500 mt-1">{coach.division} &middot; {coach.conference}</p>
                <div className="flex gap-2 mt-3">
                  <SCBadge variant={coach.followStatus === "followed_back" ? "success" : "default"}>
                    {coach.followStatus?.replace(/_/g, " ") || "none"}
                  </SCBadge>
                </div>
              </button>
            </SCGlassCard>
          ))}
        </div>
      )}

      {/* Detail slide-over */}
      {detailOpen && selectedCoach && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDetailOpen(false)} />
          <div className="relative w-full max-w-lg bg-sc-bg border-l border-sc-border overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-white">{selectedCoach.name}</h2>
                <p className="text-sm text-slate-400">{selectedCoach.title}</p>
              </div>
              <SCButton variant="ghost" size="sm" onClick={() => setDetailOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </SCButton>
            </div>
            <div className="space-y-4">
              <SCGlassCard className="p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">School</p>
                <p className="text-white font-bold">{selectedCoach.schoolName}</p>
                <p className="text-xs text-slate-400">{selectedCoach.division} &middot; {selectedCoach.conference}</p>
              </SCGlassCard>
              <SCGlassCard className="p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  <SCBadge variant={tierBadgeVariant(selectedCoach.priorityTier)}>{selectedCoach.priorityTier}</SCBadge>
                  <SCBadge variant={selectedCoach.dmOpen ? "success" : "default"}>{selectedCoach.dmOpen ? "DM Open" : "DM Closed"}</SCBadge>
                  <SCBadge variant={selectedCoach.followStatus === "followed_back" ? "success" : "info"}>
                    {selectedCoach.followStatus?.replace(/_/g, " ") || "none"}
                  </SCBadge>
                </div>
              </SCGlassCard>
              {selectedCoach.xHandle && (
                <SCGlassCard className="p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">X Handle</p>
                  <p className="text-white font-mono">@{selectedCoach.xHandle}</p>
                </SCGlassCard>
              )}
              {selectedCoach.notes && (
                <SCGlassCard className="p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Notes</p>
                  <p className="text-sm text-slate-300">{selectedCoach.notes}</p>
                </SCGlassCard>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
