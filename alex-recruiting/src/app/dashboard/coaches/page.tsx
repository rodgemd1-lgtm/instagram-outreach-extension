"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import type { Coach } from "@/lib/types";
import { CoachTable } from "@/components/dashboard/coach-table";
import { CoachDetail } from "@/components/dashboard/coach-detail";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-white">Coach CRM</h1>
        <p className="mt-1 text-sm text-white/40">
          {coaches.length} coaches tracked. Filter, sort, and manage relationships.
        </p>
      </div>

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
        <CoachTable coaches={coaches} onCoachClick={handleCoachClick} />
      )}

      <CoachDetail
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        coach={selectedCoach}
        onDraftDM={(coach) => {
          setDetailOpen(false);
          window.location.href = `/dashboard/outreach?coach=${coach.id}`;
        }}
      />
    </div>
  );
}
