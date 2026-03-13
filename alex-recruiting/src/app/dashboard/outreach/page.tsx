"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Mail } from "lucide-react";
import type { Coach, DMMessage } from "@/lib/types";
import { DMKanban } from "@/components/dashboard/dm-kanban";
import { DMComposer } from "@/components/dashboard/dm-composer";
import { WaveProgress } from "@/components/dashboard/wave-progress";

export default function OutreachPage() {
  const [dms, setDMs] = useState<DMMessage[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedDM, setSelectedDM] = useState<DMMessage | null>(null);
  const [preselectedCoachId, setPreselectedCoachId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dmsRes, coachesRes] = await Promise.allSettled([
        fetch("/api/dms"),
        fetch("/api/coaches"),
      ]);
      if (dmsRes.status === "fulfilled" && dmsRes.value.ok) {
        const data = await dmsRes.value.json();
        setDMs(Array.isArray(data) ? data : data.dms || []);
      }
      if (coachesRes.status === "fulfilled" && coachesRes.value.ok) {
        const data = await coachesRes.value.json();
        setCoaches(Array.isArray(data) ? data : data.coaches || []);
      }
    } catch {
      /* fallback */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const coachId = params.get("coach");
    if (coachId) {
      setPreselectedCoachId(coachId);
      setComposerOpen(true);
    }
  }, []);

  // Calculate real stats from DM data
  const sentCount = dms.filter(
    (d) => d.status === "sent" || d.status === "responded" || d.status === "no_response"
  ).length;
  const repliedCount = dms.filter((d) => d.status === "responded").length;
  const replyRate = sentCount > 0 ? Math.round((repliedCount / sentCount) * 100) : null;

  // Wave counts from real data
  const followedCount = coaches.filter(
    (c) => c.followStatus === "followed" || c.followStatus === "followed_back"
  ).length;
  const introDmCount = dms.filter((d) => d.templateType === "intro").length;
  const followUpCount = dms.filter((d) => d.templateType === "followup" || d.templateType === "follow_up").length;
  const directAskCount = dms.filter((d) => d.templateType === "direct" || d.templateType === "direct_ask").length;

  const handleCardClick = useCallback((dm: DMMessage) => {
    setSelectedDM(dm);
    setComposerOpen(true);
  }, []);

  const handleNewDm = useCallback(() => {
    setSelectedDM(null);
    setComposerOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1720]">Outreach</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            {coaches.length} coaches targeted
          </p>
        </div>
        <button
          onClick={handleNewDm}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F1720] text-white text-sm font-medium rounded-lg hover:bg-[#1F2937] transition-colors"
        >
          <Plus className="w-4 h-4" /> New DM
        </button>
      </div>

      {/* Stats from real data */}
      {dms.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          <div className="px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-full text-sm">
            <span className="text-[#6B7280]">Sent</span>{" "}
            <span className="font-mono font-semibold text-[#0F1720]">{sentCount}</span>
          </div>
          <div className="px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-full text-sm">
            <span className="text-[#6B7280]">Replied</span>{" "}
            <span className="font-mono font-semibold text-[#16A34A]">{repliedCount}</span>
          </div>
          {replyRate !== null && (
            <div className="px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-full text-sm">
              <span className="text-[#6B7280]">Rate</span>{" "}
              <span className="font-mono font-semibold text-[#0F1720]">{replyRate}%</span>
            </div>
          )}
        </div>
      )}

      {/* Wave Progress - only if there are DMs */}
      {dms.length > 0 && (
        <WaveProgress
          currentWave={
            directAskCount > 0 ? 3 : followUpCount > 0 ? 2 : introDmCount > 0 ? 1 : 0
          }
          counts={{
            followed: followedCount,
            introDM: introDmCount,
            followUp: followUpCount,
            directAsk: directAskCount,
          }}
          total={coaches.length}
        />
      )}

      {/* Kanban or empty state */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#E5E7EB] rounded-lg p-4 h-40 animate-pulse"
            >
              <div className="h-4 w-24 bg-[#F5F5F4] rounded mb-4" />
              <div className="h-16 bg-[#F5F5F4] rounded" />
            </div>
          ))}
        </div>
      ) : dms.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E5E7EB] rounded-lg">
          <Mail className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-[#6B7280] font-medium">No messages sent yet</p>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Draft your first DM to get started
          </p>
          <button
            onClick={handleNewDm}
            className="mt-4 px-4 py-2 bg-[#0F1720] text-white text-sm font-medium rounded-lg hover:bg-[#1F2937]"
          >
            Draft First DM
          </button>
        </div>
      ) : (
        <DMKanban dms={dms} onCardClick={handleCardClick} />
      )}

      <DMComposer
        open={composerOpen}
        onClose={() => {
          setComposerOpen(false);
          setSelectedDM(null);
        }}
        coaches={coaches}
        existingDM={selectedDM}
        preselectedCoachId={preselectedCoachId}
        onSaved={fetchData}
      />
    </div>
  );
}
