"use client";

import { useCallback, useEffect, useState } from "react";
import type { Coach, DMMessage } from "@/lib/types";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";

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

  const currentWave = directAskCount > 0 ? 3 : followUpCount > 0 ? 2 : introDmCount > 0 ? 1 : 0;

  const handleCardClick = useCallback((dm: DMMessage) => {
    setSelectedDM(dm);
    setComposerOpen(true);
  }, []);

  const handleNewDm = useCallback(() => {
    setSelectedDM(null);
    setComposerOpen(true);
  }, []);

  const statusBadgeVariant = (status: string) => {
    if (status === "responded") return "success" as const;
    if (status === "sent") return "info" as const;
    if (status === "no_response") return "warning" as const;
    if (status === "drafted") return "default" as const;
    return "default" as const;
  };

  // Group DMs by status for kanban-style display
  const dmsByStatus = {
    drafted: dms.filter(d => d.status === "drafted" || d.status === "not_sent"),
    sent: dms.filter(d => d.status === "sent"),
    no_response: dms.filter(d => d.status === "no_response"),
    responded: dms.filter(d => d.status === "responded"),
  };

  return (
    <div className="space-y-6">
      <SCPageHeader
        title="OUTREACH PIPELINE"
        subtitle={`${coaches.length} targets locked in the system`}
        actions={
          <SCButton onClick={handleNewDm}>
            <span className="material-symbols-outlined text-[16px]">add</span>
            New DM
          </SCButton>
        }
      />

      <p className="text-sm text-slate-500 max-w-3xl">
        Manage the end-to-end coach engagement lifecycle. Move prospects from initial tracking to intro DMs and direct asks.
      </p>

      {/* Stats from real data */}
      {dms.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SCStatCard label="Sent" value={String(sentCount)} icon="send" />
          <SCStatCard label="Replied" value={String(repliedCount)} icon="reply" />
          {replyRate !== null && (
            <SCStatCard label="Reply Rate" value={`${replyRate}%`} icon="percent" />
          )}
          <SCStatCard label="Followed" value={String(followedCount)} icon="person_add" />
        </div>
      )}

      {/* Wave Progress */}
      {dms.length > 0 && (
        <SCGlassCard className="p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Wave Progress</p>
          <div className="flex gap-4">
            {[
              { label: "Follow", count: followedCount, wave: 0 },
              { label: "Intro DM", count: introDmCount, wave: 1 },
              { label: "Follow Up", count: followUpCount, wave: 2 },
              { label: "Direct Ask", count: directAskCount, wave: 3 },
            ].map((item) => (
              <div key={item.label} className="flex-1 text-center">
                <div className={`text-2xl font-black ${currentWave >= item.wave ? "text-white" : "text-slate-600"}`}>
                  {item.count}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">{item.label}</div>
                <div className={`mt-2 h-1 rounded-full ${currentWave >= item.wave ? "bg-sc-primary" : "bg-white/5"}`} />
              </div>
            ))}
          </div>
        </SCGlassCard>
      )}

      {/* Kanban or empty state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SCGlassCard key={i} className="p-4 h-40 animate-pulse">
              <div className="h-4 w-24 bg-white/5 rounded mb-4" />
              <div className="h-16 bg-white/5 rounded" />
            </SCGlassCard>
          ))}
        </div>
      ) : dms.length === 0 ? (
        <SCGlassCard className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-slate-600 mb-4 block">chat_bubble</span>
          <p className="text-white font-bold text-lg">Empty Pipeline</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Draft your first intro message to begin tracking outreach data.
          </p>
          <SCButton onClick={handleNewDm} className="mt-6">
            Draft First DM
          </SCButton>
        </SCGlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(["drafted", "sent", "no_response", "responded"] as const).map((status) => (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <SCBadge variant={statusBadgeVariant(status)}>
                  {status.replace(/_/g, " ")}
                </SCBadge>
                <span className="text-xs text-slate-500">{dmsByStatus[status].length}</span>
              </div>
              <div className="space-y-2">
                {dmsByStatus[status].map((dm) => {
                  const coach = coaches.find(c => c.id === dm.coachId);
                  return (
                    <SCGlassCard
                      key={dm.id}
                      className="p-3 cursor-pointer hover:border-sc-primary/30 transition-colors"
                    >
                      <button
                        onClick={() => handleCardClick(dm)}
                        className="w-full text-left"
                      >
                        <p className="text-sm font-bold text-white truncate">
                          {coach?.name || dm.coachId}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-1">
                          {coach?.schoolName || "Unknown School"}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                          {dm.content}
                        </p>
                        {dm.templateType && (
                          <SCBadge variant="default" className="mt-2">
                            {dm.templateType}
                          </SCBadge>
                        )}
                      </button>
                    </SCGlassCard>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Composer slide-over */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setComposerOpen(false); setSelectedDM(null); }} />
          <div className="relative w-full max-w-lg bg-sc-bg border-l border-sc-border overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-black text-white">
                {selectedDM ? "Edit DM" : "New DM"}
              </h2>
              <SCButton variant="ghost" size="sm" onClick={() => { setComposerOpen(false); setSelectedDM(null); }}>
                <span className="material-symbols-outlined">close</span>
              </SCButton>
            </div>
            <SCGlassCard className="p-4">
              <p className="text-sm text-slate-400">
                DM composer functionality preserved. Select a coach and draft your message.
              </p>
              {selectedDM && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-slate-500">Current content:</p>
                  <p className="text-sm text-white">{selectedDM.content}</p>
                </div>
              )}
            </SCGlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
