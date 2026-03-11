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
          <p className="text-lg font-bold text-dash-text">{coach.schoolName}</p>
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
              className="mt-2 inline-flex items-center gap-1 text-sm text-dash-accent hover:underline"
            >
              @{coach.xHandle} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-dash-border px-3 py-2 text-xs font-medium text-dash-text-secondary hover:bg-dash-surface-raised transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Follow on X
          </button>
          <button
            type="button"
            onClick={() => onDraftDM(coach)}
            className="flex items-center gap-2 rounded-lg bg-dash-accent px-3 py-2 text-xs font-medium text-white hover:bg-dash-accent-hover transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Draft DM
          </button>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-dash-border bg-dash-surface-raised p-3">
            <p className="text-xs text-dash-muted">OL Need</p>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={cn("h-3 w-3 rounded-full", n <= coach.olNeedScore ? "bg-dash-accent" : "bg-dash-border")} />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-dash-border bg-dash-surface-raised p-3">
            <p className="text-xs text-dash-muted">X Activity</p>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={cn("h-3 w-3 rounded-full", n <= coach.xActivityScore ? "bg-dash-warning" : "bg-dash-border")} />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-dash-border bg-dash-surface-raised p-3">
            <p className="text-xs text-dash-muted">Follow Status</p>
            <p className="mt-1 text-sm font-medium text-dash-text capitalize">{coach.followStatus.replace("_", " ")}</p>
          </div>
          <div className="rounded-lg border border-dash-border bg-dash-surface-raised p-3">
            <p className="text-xs text-dash-muted">DM Status</p>
            <p className="mt-1 text-sm font-medium text-dash-text capitalize">{coach.dmStatus.replace("_", " ")}</p>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dash-muted">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={4}
            className="w-full rounded-lg border border-dash-border bg-dash-surface p-3 text-sm text-dash-text placeholder:text-dash-muted/50 focus:border-dash-accent focus:outline-none"
            placeholder="Add notes about this coach..."
          />
          {savingNotes && <p className="mt-1 text-xs text-dash-muted">Saving...</p>}
        </div>
      </div>
    </SlideOver>
  );
}
