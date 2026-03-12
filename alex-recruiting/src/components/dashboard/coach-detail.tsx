"use client";

import { useState, useCallback, useMemo } from "react";
import { ExternalLink, UserPlus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SlideOver } from "./slide-over";
import { EngagementMeter } from "./engagement-meter";
import { calculateEngagement } from "@/lib/dashboard/engagement-scoring";
import type { Coach } from "@/lib/types";

interface CoachDetailProps {
  open: boolean;
  onClose: () => void;
  coach: Coach | null;
  onDraftDM: (coach: Coach) => void;
}

function getEngagementData(coach: Coach) {
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
  });
}

/* ── SVG Radial Gauge ── */
function EngagementGauge({ score, color }: { score: number; color: string }) {
  const radius = 30;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={76} height={76} viewBox="0 0 76 76">
        {/* Background circle */}
        <circle
          cx={38}
          cy={38}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={38}
          cy={38}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
        {/* Score text */}
        <text
          x={38}
          y={38}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white font-mono text-sm font-bold"
          fontSize={14}
        >
          {score}
        </text>
      </svg>
    </div>
  );
}

/* ── Relationship Timeline ── */
function RelationshipTimeline({ coach }: { coach: Coach }) {
  const events = useMemo(() => {
    const items: { label: string; color: string; active: boolean }[] = [];

    items.push({
      label: "Followed",
      color: "#A1A1AA",
      active: coach.followStatus !== "not_followed",
    });

    items.push({
      label: "DM Sent",
      color: "#D4A853",
      active: ["sent", "responded", "approved"].includes(coach.dmStatus),
    });

    items.push({
      label: "Replied",
      color: "#ff000c",
      active: coach.dmStatus === "responded",
    });

    return items;
  }, [coach.followStatus, coach.dmStatus]);

  return (
    <div className="relative">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">
        Relationship Timeline
      </p>
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-2.5 left-3 right-3 h-px bg-white/10" />

        {events.map((event) => (
          <div key={event.label} className="relative flex flex-col items-center gap-1.5 z-10">
            <div
              className={cn(
                "h-5 w-5 rounded-full border-2 transition-colors",
                event.active
                  ? "border-transparent"
                  : "border-white/10 bg-transparent"
              )}
              style={
                event.active
                  ? { backgroundColor: event.color }
                  : undefined
              }
            />
            <span
              className={cn(
                "text-[10px]",
                event.active ? "text-white/60" : "text-white/20"
              )}
            >
              {event.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
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

  const engagement = getEngagementData(coach);
  const tierVariant = coach.priorityTier === "Tier 1" ? "tier1" : coach.priorityTier === "Tier 2" ? "tier2" : "tier3";

  return (
    <SlideOver open={open} onClose={onClose} title={coach.name} wide>
      <div className="space-y-6">
        {/* Engagement gauge + header */}
        <div className="flex items-start gap-4">
          <EngagementGauge score={engagement.score} color={engagement.levelColor} />
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold uppercase tracking-tight text-white">{coach.schoolName}</p>
            <p className="text-xs text-white/40 mt-0.5">{engagement.levelLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline">{coach.division}</Badge>
              <Badge variant={tierVariant}>{coach.priorityTier}</Badge>
              {coach.conference && <Badge variant="secondary">{coach.conference}</Badge>}
            </div>
          </div>
        </div>

        {coach.xHandle && (
          <a
            href={`https://x.com/${coach.xHandle}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#ff000c] hover:underline"
          >
            @{coach.xHandle} <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {/* Relationship Timeline */}
        <RelationshipTimeline coach={coach} />

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
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Engagement</p>
            <EngagementMeter score={engagement.score} className="mt-1" />
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
