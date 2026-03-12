"use client";

import { useState, useCallback } from "react";
import { ExternalLink, UserPlus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SlideOver } from "./slide-over";
import type { Coach } from "@/lib/types";

interface CoachDetailProps {
  open: boolean;
  onClose: () => void;
  coach: Coach | null;
  onDraftDM: (coach: Coach) => void;
}

export function CoachDetail({ open, onClose, coach, onDraftDM }: CoachDetailProps) {
  const [notes, setNotes] = useState(coach?.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  const saveNotes = useCallback(async () => {
    if (!coach) return;
    setSavingNotes(true);
    try {
      await fetch(`/api/coaches/${coach.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
    } catch { /* silent */ }
    finally { setSavingNotes(false); }
  }, [coach, notes]);

  if (!coach) return null;

  const tierVariant = coach.priorityTier === "Tier 1" ? "tier1" : coach.priorityTier === "Tier 2" ? "tier2" : "tier3";

  return (
    <SlideOver open={open} onClose={onClose} title={coach.name}>
      <div className="space-y-6">
        {/* Header info */}
        <div>
          <p className="text-xl font-bold uppercase tracking-tight text-white">{coach.schoolName}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">{coach.division}</Badge>
            <Badge variant={tierVariant}>{coach.priorityTier}</Badge>
            {coach.conference && <Badge variant="secondary">{coach.conference}</Badge>}
          </div>
          {coach.xHandle && (
            <a
              href={`https://x.com/${coach.xHandle}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-[#ff000c] hover:underline"
            >
              @{coach.xHandle} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/10 transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Follow on X
          </button>
          <button
            type="button"
            onClick={() => onDraftDM(coach)}
            className="flex items-center gap-2 rounded-lg bg-[#ff000c] px-3 py-2 text-xs font-medium text-white hover:bg-[#cc000a] transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Draft DM
          </button>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/5 bg-[#111111] p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">OL Need</p>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={cn("h-3 w-3 rounded-full", n <= coach.olNeedScore ? "bg-[#ff000c]" : "bg-white/10")} />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/5 bg-[#111111] p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">X Activity</p>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={cn("h-3 w-3 rounded-full", n <= coach.xActivityScore ? "bg-[#D4A853]" : "bg-white/10")} />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/5 bg-[#111111] p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Follow Status</p>
            <p className="mt-1 text-sm font-medium text-white capitalize">{coach.followStatus.replace("_", " ")}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-[#111111] p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">DM Status</p>
            <p className="mt-1 text-sm font-medium text-white capitalize">{coach.dmStatus.replace("_", " ")}</p>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-[#111111] p-3 text-sm text-white placeholder:text-white/30 focus:border-[#ff000c] focus:outline-none"
            placeholder="Add notes about this coach..."
          />
          {savingNotes && <p className="mt-1 text-xs text-white/40">Saving...</p>}
        </div>
      </div>
    </SlideOver>
  );
}
