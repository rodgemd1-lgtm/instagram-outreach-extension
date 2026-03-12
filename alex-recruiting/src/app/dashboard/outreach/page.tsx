"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Mail } from "lucide-react";
import type { Coach, DMMessage } from "@/lib/types";
import { DMKanban } from "@/components/dashboard/dm-kanban";
import { DMComposer } from "@/components/dashboard/dm-composer";
import { EmptyState } from "@/components/dashboard/empty-state";
import { WaveProgress } from "@/components/dashboard/wave-progress";
import { AnimatedNumber } from "@/components/dashboard/animated-number";
import { useDashboardAssembly } from "@/hooks/useDashboardAssembly";

export default function OutreachPage() {
  const scopeRef = useDashboardAssembly();
  const [dms, setDMs] = useState<DMMessage[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedDM, setSelectedDM] = useState<DMMessage | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dmsRes, coachesRes] = await Promise.allSettled([
        fetch("/api/dms"),
        fetch("/api/coaches"),
      ]);
      if (dmsRes.status === "fulfilled" && dmsRes.value.ok) {
        const data = await dmsRes.value.json();
        setDMs(data.dms || []);
      }
      if (coachesRes.status === "fulfilled" && coachesRes.value.ok) {
        const data = await coachesRes.value.json();
        setCoaches(data.coaches || []);
      }
    } catch { /* fallback */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  // Check for coach preselection from URL
  const [preselectedCoachId, setPreselectedCoachId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const coachId = params.get("coach");
    if (coachId) {
      setPreselectedCoachId(coachId);
      setComposerOpen(true);
    }
  }, []);

  return (
    <div ref={scopeRef} className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between" data-dash-animate>
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white">DM Outreach</h1>
          <p className="mt-1 text-sm text-white/40">
            Review, approve, and track coach outreach.{" "}
            <span className="font-mono text-white/25">
              <AnimatedNumber value={183} className="text-sm text-white/25" /> coaches targeted
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setSelectedDM(null); setComposerOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-[#ff000c] px-4 py-2 text-xs font-medium uppercase tracking-widest text-white hover:bg-[#cc000a] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New DM
        </button>
      </div>

      {/* Wave Progress */}
      <div className="mb-4" data-dash-animate>
        <WaveProgress
          currentWave={1}
          counts={{ followed: 40, introDM: 12, followUp: 0, directAsk: 0 }}
          total={183}
        />
      </div>

      {/* DM Stats Summary */}
      <div className="mb-4 flex gap-3" data-dash-animate>
        {[
          { label: "Sent", value: 12, color: "border-[#22C55E]/30 text-[#22C55E]" },
          { label: "Replied", value: 3, color: "border-[#D4A853]/30 text-[#D4A853]" },
          { label: "Rate", value: 25, suffix: "%", color: "border-[#ff000c]/30 text-[#ff000c]" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`flex items-center gap-2 rounded-full border bg-white/[0.02] px-3 py-1.5 ${stat.color}`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">
              {stat.label}
            </span>
            <AnimatedNumber
              value={stat.value}
              suffix={stat.suffix}
              className="text-xs font-bold"
            />
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#ff000c] border-t-transparent" />
        </div>
      ) : dms.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No outreach yet"
          description="Start by drafting a DM to a coach from your CRM."
          action={{ label: "Draft First DM", onClick: () => setComposerOpen(true) }}
        />
      ) : (
        <div data-dash-animate>
          <DMKanban dms={dms} onCardClick={(dm) => { setSelectedDM(dm); setComposerOpen(true); }} />
        </div>
      )}

      <DMComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        coaches={coaches}
        existingDM={selectedDM}
        preselectedCoachId={preselectedCoachId}
        onSaved={fetchData}
      />
    </div>
  );
}
