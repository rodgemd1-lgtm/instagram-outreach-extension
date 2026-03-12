"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, LayoutGrid, List } from "lucide-react";
import type { Coach } from "@/lib/types";
import { calculateEngagement } from "@/lib/dashboard/engagement-scoring";
import { useDashboardAssembly } from "@/hooks/useDashboardAssembly";
import { AnimatedNumber } from "@/components/dashboard/animated-number";
import { CoachTable } from "@/components/dashboard/coach-table";
import { CoachCard } from "@/components/dashboard/coach-card";
import { CoachDetail } from "@/components/dashboard/coach-detail";
import { EmptyState } from "@/components/dashboard/empty-state";

type ViewMode = "table" | "cards";

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

export default function CoachesPage() {
  const scopeRef = useDashboardAssembly();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coaches");
      if (res.ok) {
        const data = await res.json();
        setCoaches(data.coaches || []);
      }
    } catch { /* fallback empty */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchCoaches(); }, [fetchCoaches]);

  const handleCoachClick = (coach: Coach) => {
    setSelectedCoach(coach);
    setDetailOpen(true);
  };

  const handleDM = (coach: Coach) => {
    setDetailOpen(false);
    window.location.href = `/dashboard/outreach?coach=${coach.id}`;
  };

  // Pipeline distribution
  const pipeline = useMemo(() => {
    if (coaches.length === 0) return { cold: 0, warming: 0, hot: 0 };
    let cold = 0;
    let warming = 0;
    let hot = 0;
    for (const coach of coaches) {
      const score = getEngagementScore(coach);
      if (score >= 65) hot++;
      else if (score >= 25) warming++;
      else cold++;
    }
    return { cold, warming, hot };
  }, [coaches]);

  const total = coaches.length || 1;

  return (
    <div ref={scopeRef}>
      <div className="mb-6" data-dash-animate>
        <h1 className="text-2xl font-bold uppercase tracking-tight text-white">Coach CRM</h1>
        <p className="mt-1 text-sm text-white/40">
          {coaches.length} coaches tracked. Filter, sort, and manage relationships.
        </p>
      </div>

      {/* Pipeline Summary Bar */}
      {coaches.length > 0 && (
        <div className="mb-6 rounded-xl border border-white/5 bg-[#0A0A0A] p-4" data-dash-animate>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              Engagement Pipeline
            </p>
            {/* View toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#111111] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`rounded-md p-1.5 transition-colors ${viewMode === "table" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
                title="Table view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`rounded-md p-1.5 transition-colors ${viewMode === "cards" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
                title="Card view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Pipeline segments */}
          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-white/5">
            <div
              className="h-full rounded-full bg-[#3F3F46] transition-all duration-700"
              style={{ width: `${(pipeline.cold / total) * 100}%` }}
            />
            <div
              className="h-full rounded-full bg-[#D4A853] transition-all duration-700"
              style={{ width: `${(pipeline.warming / total) * 100}%` }}
            />
            <div
              className="h-full rounded-full bg-[#ff000c] transition-all duration-700"
              style={{ width: `${(pipeline.hot / total) * 100}%` }}
            />
          </div>

          {/* Labels */}
          <div className="mt-2 flex gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#3F3F46]" />
              <span className="text-[11px] text-white/40">Cold</span>
              <AnimatedNumber value={pipeline.cold} className="text-[11px] text-white/60" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#D4A853]" />
              <span className="text-[11px] text-white/40">Warming</span>
              <AnimatedNumber value={pipeline.warming} className="text-[11px] text-white/60" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#ff000c]" />
              <span className="text-[11px] text-white/40">Hot</span>
              <AnimatedNumber value={pipeline.hot} className="text-[11px] text-white/60" />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#ff000c] border-t-transparent" />
        </div>
      ) : coaches.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No coaches yet"
          description="Add coaches to start tracking relationships and outreach."
        />
      ) : (
        <div data-dash-animate>
          {viewMode === "table" ? (
            <CoachTable coaches={coaches} onCoachClick={handleCoachClick} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coaches.map((coach) => (
                <CoachCard
                  key={coach.id}
                  coach={coach}
                  engagementScore={getEngagementScore(coach)}
                  onView={handleCoachClick}
                  onDM={handleDM}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <CoachDetail
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        coach={selectedCoach}
        onDraftDM={handleDM}
      />
    </div>
  );
}
