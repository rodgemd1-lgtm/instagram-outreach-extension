"use client";

import { useState, useCallback } from "react";
import { ExternalLink, UserPlus, MessageSquare } from "lucide-react";
import { SlideOver } from "./slide-over";
import { getSchoolLogo, getSchoolColors } from "@/lib/data/school-branding";
import type { Coach } from "@/lib/types";

interface CoachDetailProps {
  open: boolean;
  onClose: () => void;
  coach: Coach | null;
  onDraftDM: (coach: Coach) => void;
}

function getEngagementStatus(coach: Coach): { label: string; color: string } {
  if (coach.dmStatus === "replied" || coach.dmStatus === "responded") return { label: "Replied", color: "#16A34A" };
  if (coach.dmStatus === "sent") return { label: "DM Sent", color: "#F59E0B" };
  if (coach.followStatus === "following" || coach.followStatus === "followed" || coach.followStatus === "followed_back") return { label: "Followed", color: "#2563EB" };
  return { label: "No Contact", color: "#D1D5DB" };
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

  const schoolId = coach.schoolId || coach.schoolName?.toLowerCase().replace(/\s+/g, "-") || "";
  const colors = getSchoolColors(schoolId);
  const status = getEngagementStatus(coach);

  return (
    <SlideOver open={open} onClose={onClose} title={coach.name} wide>
      <div className="space-y-6">
        {/* School logo + header */}
        <div className="flex items-start gap-4">
          <img src={getSchoolLogo(schoolId)} alt="" className="w-14 h-14 rounded-full border-2" style={{ borderColor: colors.primary }} />
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-[#0F1720]">{coach.schoolName}</p>
            <p className="text-sm text-[#6B7280] mt-0.5">{coach.title || "Coach"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F5F5F4] text-[#6B7280]">{coach.division}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F5F5F4] text-[#6B7280]">{coach.priorityTier}</span>
              {coach.conference && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F5F5F4] text-[#6B7280]">{coach.conference}</span>}
            </div>
          </div>
        </div>

        {/* Engagement status */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.color }} />
          <span className="text-sm font-medium text-[#0F1720]">{status.label}</span>
        </div>

        {coach.xHandle && (
          <a
            href={`https://x.com/${coach.xHandle}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#2563EB] hover:underline"
          >
            @{coach.xHandle} <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-[#F5F5F4] px-3 py-2 text-xs font-medium text-[#6B7280] hover:bg-[#E5E7EB] transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Follow on X
          </button>
          <button
            type="button"
            onClick={() => onDraftDM(coach)}
            className="flex items-center gap-2 rounded-lg bg-[#0F1720] px-3 py-2 text-xs font-medium text-white hover:bg-[#1a2533] transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Draft DM
          </button>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">OL Need</p>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={`h-3 w-3 rounded-full ${n <= coach.olNeedScore ? "bg-[#0F1720]" : "bg-[#E5E7EB]"}`} />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Follow Status</p>
            <p className="mt-1 text-sm font-medium text-[#0F1720] capitalize">{coach.followStatus.replace("_", " ")}</p>
          </div>
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">DM Status</p>
            <p className="mt-1 text-sm font-medium text-[#0F1720] capitalize">{coach.dmStatus.replace("_", " ")}</p>
          </div>
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">X Activity</p>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={`h-3 w-3 rounded-full ${n <= coach.xActivityScore ? "bg-[#0F1720]" : "bg-[#E5E7EB]"}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-[#9CA3AF]">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={4}
            className="w-full rounded-lg border border-[#E5E7EB] bg-white p-3 text-sm text-[#0F1720] placeholder:text-[#9CA3AF] focus:border-[#0F1720] focus:outline-none focus:ring-1 focus:ring-[#0F1720]"
            placeholder="Add notes about this coach..."
          />
          {savingNotes && <p className="mt-1 text-xs text-[#9CA3AF]">Saving...</p>}
        </div>
      </div>
    </SlideOver>
  );
}
