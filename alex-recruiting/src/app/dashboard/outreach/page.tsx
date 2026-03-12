"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Mail } from "lucide-react";
import type { Coach, DMMessage } from "@/lib/types";
import { DMKanban } from "@/components/dashboard/dm-kanban";
import { DMComposer } from "@/components/dashboard/dm-composer";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function OutreachPage() {
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
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white">DM Outreach</h1>
          <p className="mt-1 text-sm text-white/40">
            Review, approve, and track coach outreach.
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
        <DMKanban dms={dms} onCardClick={(dm) => { setSelectedDM(dm); setComposerOpen(true); }} />
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
