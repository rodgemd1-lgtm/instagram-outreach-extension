"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Mail } from "lucide-react";
import type { Coach, DMMessage } from "@/lib/types";
import { DMKanban } from "@/components/dashboard/dm-kanban";
import { DMComposer } from "@/components/dashboard/dm-composer";
import { WaveProgress } from "@/components/dashboard/wave-progress";
import { ArrowRight, MessageSquare } from "lucide-react";
import { dispatchOperatorCommand } from "@/lib/os/operator-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-6 animate-fade-in -m-6 p-6 min-h-screen bg-[#FAFAFA]">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-[#0F1720]">
            Outreach Pipeline
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            {coaches.length} targets locked in the system
          </p>
        </div>
        <Button
          onClick={handleNewDm}
          className="bg-[#0F1720] text-white hover:bg-[#1a2533] px-4"
        >
          <Plus className="w-4 h-4 mr-2" /> New DM
        </Button>
      </div>

      <p className="mb-6 -mt-4 text-sm text-[#6B7280] max-w-3xl">
        Manage the end-to-end coach engagement lifecycle. Move prospects from initial tracking to intro DMs and direct asks. Use the Kanban to ensure no response slips through the cracks.
      </p>

      {/* Stats from real data */}
      {dms.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          <div className="px-4 py-2 bg-white border border-[rgba(15,40,75,0.08)] rounded-[20px] text-sm flex gap-3 shadow-sm">
            <span className="text-[#9CA3AF] font-semibold uppercase tracking-wider text-[10px] mt-0.5">Sent</span>{" "}
            <span className="font-mono text-lg font-bold text-[#0F1720]">{sentCount}</span>
          </div>
          <div className="px-4 py-2 bg-white border border-[rgba(15,40,75,0.08)] rounded-[20px] text-sm flex gap-3 shadow-sm">
            <span className="text-[#9CA3AF] font-semibold uppercase tracking-wider text-[10px] mt-0.5">Replied</span>{" "}
            <span className="font-mono text-lg font-bold text-[#16A34A]">{repliedCount}</span>
          </div>
          {replyRate !== null && (
            <div className="px-4 py-2 bg-white border border-[rgba(15,40,75,0.08)] rounded-[20px] text-sm flex gap-3 shadow-sm">
              <span className="text-[#9CA3AF] font-semibold uppercase tracking-wider text-[10px] mt-0.5">Rate</span>{" "}
              <span className="font-mono text-lg font-bold text-[#0F1720]">{replyRate}%</span>
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
              <div className="h-4 w-24 bg-[#E5E7EB] rounded mb-4" />
              <div className="h-16 bg-[#E5E7EB] rounded" />
            </div>
          ))}
        </div>
      ) : dms.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[rgba(15,40,75,0.08)] rounded-[24px]">
          <MessageSquare className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
          <p className="text-[#0F1720] font-semibold text-lg">Empty Pipeline</p>
          <p className="text-sm text-[#6B7280] mt-1 max-w-sm mx-auto">
            Draft your first intro message to begin tracking outreach data.
          </p>
          <Button
            onClick={handleNewDm}
            className="mt-6 bg-[#0F1720] text-white hover:bg-[#1a2533]"
          >
            Draft First DM
          </Button>
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
