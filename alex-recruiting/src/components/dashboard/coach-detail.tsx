"use client";

import { useState, useCallback } from "react";
import { ExternalLink, UserPlus, MessageSquare, Zap, Loader2 } from "lucide-react";
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
  if (coach.dmStatus === "responded") return { label: "Replied", color: "#16A34A" };
  if (coach.dmStatus === "sent") return { label: "DM Sent", color: "#F59E0B" };
  if (coach.followStatus === "followed" || coach.followStatus === "followed_back") return { label: "Followed", color: "#2563EB" };
  return { label: "No Contact", color: "#D1D5DB" };
}

export function CoachDetail({ open, onClose, coach, onDraftDM }: CoachDetailProps) {
  const [notes, setNotes] = useState(coach?.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  const runXScraper = async () => {
    if (!coach?.xHandle) return;
    setIsScraping(true);
    try {
      const res = await fetch("/api/agents/x-growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: coach.xHandle, maxTweets: 15 }),
      });
      const data = await res.json();
      if (res.ok) {
         alert(`X Scraper Success!\nFound ${data.tweets?.length || 0} tweets.\nOffers Detected: ${data.analysis?.recruitingActivity?.offers || 0}`);
      } else {
         alert(`Error: ${data.error}`);
      }
    } catch {
      alert("Failed to hit scraper API");
    } finally {
      setIsScraping(false);
    }
  };

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
    <SlideOver open={open} onClose={onClose} title="Command Center" wide>
      <div className="space-y-6">
        {/* Profile Data */}
        <div className="bg-gray-50 p-5 border border-gray-200 rounded-xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <img src={getSchoolLogo(schoolId)} alt="" className="w-14 h-14 rounded-full border-2 bg-white" style={{ borderColor: colors.primary }} />
              <div>
                <h3 className="text-xl font-bold text-[#0F1720]">{coach.name}</h3>
                <p className="text-[#6B7280] flex items-center gap-2 mt-0.5">
                   {coach.schoolName} <span className="text-xs px-2 py-0.5 bg-gray-200 rounded text-gray-700">{coach.division}</span>
                </p>
                {coach.xHandle && (
                  <a
                    href={`https://x.com/${coach.xHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline mt-1"
                  >
                    @{coach.xHandle} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
            {/* Engagement status */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
              <span className="text-sm font-bold text-[#0F1720]">{status.label}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 w-full mt-4">
          <button 
             className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-[#2DD4BF] to-[#0ea5e9] px-4 py-3 text-sm font-bold text-white hover:opacity-90 shadow-[0_0_15px_rgba(45,212,191,0.4)] transition-all">
             <Zap className="h-4 w-4" /> AI Scrape
          </button>
          <button 
             onClick={() => onDraftDM(coach)}
             className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-[#0F1720] px-4 py-3 text-sm font-bold text-white hover:bg-black shadow-[4px_4px_0px_#000] border-2 border-black transition-all">
             <MessageSquare className="h-4 w-4" /> Draft DM
          </button>
        </div>
        
        <button className="w-full flex justify-center items-center gap-2 rounded border-2 border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
          <UserPlus className="h-4 w-4" /> Follow on X
        </button>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl border border-gray-200 bg-[#F8FAFC] p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">OL Need Score</p>
            <div className="mt-2 flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => {
                 const isActive = n <= coach.olNeedScore;
                 return (
                   <div key={n} className={`h-3 w-3 rounded-full ${isActive ? "bg-[#2DD4BF] shadow-[0_0_8px_rgba(45,212,191,0.6)]" : "bg-gray-200"}`} />
                 );
              })}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-[#F8FAFC] p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">X Activity</p>
            <div className="mt-2 flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={`h-3 w-3 rounded-full ${n <= coach.xActivityScore ? "bg-[#0F1720]" : "bg-gray-200"}`} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-[#F8FAFC] p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">Follow Status</p>
            <p className="mt-1 text-sm font-bold text-[#0F1720] capitalize">{coach.followStatus.replace("_", " ")}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-[#F8FAFC] p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">DM Status</p>
            <p className="mt-1 text-sm font-bold text-[#0F1720] capitalize">{coach.dmStatus.replace("_", " ")}</p>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl mt-4">
          <p className="text-xs uppercase text-gray-400 font-bold mb-2">Internal Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={4}
            className="w-full rounded bg-white border border-gray-200 p-3 text-sm text-[#0F1720] placeholder:text-[#9CA3AF] focus:border-[#0F1720] focus:outline-none shadow-sm"
            placeholder="Add notes about this coach..."
          />
          {savingNotes && <p className="mt-1 text-xs text-[#9CA3AF]">Saving...</p>}
        </div>
      </div>
    </SlideOver>
  );
}
