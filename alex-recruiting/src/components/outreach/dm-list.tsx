"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SCPageHeader,
  SCStatCard,
  SCGlassCard,
  SCBadge,
  SCButton,
  SCHeroBanner,
  SCPageTransition,
  SCAnimatedNumber,
} from "@/components/sc";
import { dmTemplates, fillTemplate } from "@/lib/data/templates";
import { jacobProfile } from "@/lib/data/jacob-profile";
import { dispatchOperatorCommand } from "@/lib/os/operator-client";
import type { Coach, DMMessage } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface DMVariation {
  content: string;
  tone: "professional" | "casual" | "contextual";
  compliant: boolean;
  complianceNote: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function buildIntroDraft(coach: Coach): string {
  const lastName = coach.name.split(" ").pop() ?? coach.name;
  return fillTemplate(dmTemplates.intro.template, {
    COACH_LAST_NAME: lastName,
    SCHOOL_NAME: coach.schoolName,
    NCSA_LINK: jacobProfile.ncsaProfileUrl || jacobProfile.websiteUrl || "https://ncsasports.org",
  });
}

function tierSort(coach: Coach): number {
  if (coach.priorityTier === "Tier 1") return 0;
  if (coach.priorityTier === "Tier 2") return 1;
  return 2;
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

export function DMList() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [recentDMs, setRecentDMs] = useState<DMMessage[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // AI generation state
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [variations, setVariations] = useState<Record<string, DMVariation[]>>({});
  const [selectedVariation, setSelectedVariation] = useState<Record<string, number>>({});
  const [aiGenerated, setAiGenerated] = useState<Set<string>>(new Set());
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  /* ---- Data loading ---- */

  const load = useCallback(async () => {
    try {
      const [coachResponse, dmResponse] = await Promise.all([
        fetch("/api/coaches", { cache: "no-store" }),
        fetch("/api/dms", { cache: "no-store" }),
      ]);

      const coachData = await coachResponse.json();
      const dmData = await dmResponse.json();

      const liveCoaches: Coach[] = coachData.coaches ?? [];
      setCoaches(liveCoaches);
      setRecentDMs(dmData.dms ?? []);
      setDrafts((current) => {
        const next = { ...current };
        for (const coach of liveCoaches) {
          if (!next[coach.id]) {
            next[coach.id] = buildIntroDraft(coach);
          }
        }
        return next;
      });
    } catch (error) {
      console.error("Failed to load DM campaign data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* ---- Queue computation ---- */

  const queue = useMemo(
    () =>
      coaches
        .filter((coach) => coach.xHandle)
        .filter((coach) => coach.dmStatus !== "responded")
        .sort((a, b) => tierSort(a) - tierSort(b) || Number(b.dmOpen) - Number(a.dmOpen))
        .slice(0, 12),
    [coaches]
  );

  const waveSummary = useMemo(
    () => [
      {
        label: "Ready Now",
        icon: "bolt",
        count: queue.filter((coach) => coach.dmOpen || coach.priorityTier === "Tier 3").length,
      },
      {
        label: "Tier 1 Targets",
        icon: "star",
        count: queue.filter((coach) => coach.priorityTier === "Tier 1").length,
      },
      {
        label: "AI Drafted",
        icon: "auto_awesome",
        count: aiGenerated.size,
      },
      {
        label: "Sent / Logged",
        icon: "check_circle",
        count: recentDMs.filter((dm) => dm.status === "sent" || dm.status === "responded").length,
      },
    ],
    [queue, recentDMs, aiGenerated.size]
  );

  const nextCoach = queue[0] ?? null;

  /* ---- AI DM generation (single coach) ---- */

  async function generateAIDM(coach: Coach) {
    setGeneratingId(coach.id);
    setActionMessage(null);
    try {
      const response = await fetch("/api/dms/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachId: coach.id }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Generation failed (${response.status})`);
      }

      const data = await response.json();
      const vars: DMVariation[] = data.variations ?? [];

      setVariations((current) => ({ ...current, [coach.id]: vars }));
      setSelectedVariation((current) => ({ ...current, [coach.id]: 0 }));

      // Set the first variation as the draft
      if (vars.length > 0) {
        setDrafts((current) => ({ ...current, [coach.id]: vars[0].content }));
        setAiGenerated((current) => new Set(current).add(coach.id));
      }

      setActionMessage(`Generated 3 AI variations for ${coach.name}`);
    } catch (error) {
      console.error("Failed to generate AI DM:", error);
      setActionMessage(`Failed to generate AI DM for ${coach.name}`);
    } finally {
      setGeneratingId(null);
    }
  }

  /* ---- AI DM generation (batch) ---- */

  async function generateAllAIDMs() {
    setGeneratingAll(true);
    setActionMessage(null);
    try {
      const eligibleIds = queue.map((c) => c.id).slice(0, 10);

      const response = await fetch("/api/dms/generate-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachIds: eligibleIds }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Batch generation failed (${response.status})`);
      }

      const data = await response.json();
      const batchDrafts = data.drafts ?? [];

      // Update drafts with generated content
      setDrafts((current) => {
        const next = { ...current };
        for (const d of batchDrafts) {
          next[d.coachId] = d.content;
        }
        return next;
      });

      // Mark all as AI-generated
      setAiGenerated((current) => {
        const next = new Set(current);
        for (const d of batchDrafts) {
          next.add(d.coachId);
        }
        return next;
      });

      const errorCount = data.errors?.length ?? 0;
      setActionMessage(
        `Generated ${batchDrafts.length} AI drafts${errorCount > 0 ? ` (${errorCount} failed)` : ""}`
      );

      // Refresh the DM list to show new drafts
      await load();
    } catch (error) {
      console.error("Failed to generate batch DMs:", error);
      setActionMessage("Batch generation failed. Try generating individually.");
    } finally {
      setGeneratingAll(false);
    }
  }

  /* ---- Variation selection ---- */

  function selectVariation(coachId: string, index: number) {
    const vars = variations[coachId];
    if (!vars || !vars[index]) return;

    setSelectedVariation((current) => ({ ...current, [coachId]: index }));
    setDrafts((current) => ({ ...current, [coachId]: vars[index].content }));
  }

  /* ---- Send / Log actions ---- */

  async function sendDraft(coach: Coach) {
    setSendingId(coach.id);
    setActionMessage(null);
    try {
      const response = await fetch("/api/dms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: coach.id,
          coachName: coach.name,
          schoolName: coach.schoolName,
          templateType: "intro",
          xHandle: coach.xHandle,
          content: drafts[coach.id],
          sendNow: true,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Send failed (${response.status})`);
      }

      setActionMessage(`DM sent to ${coach.name} via X`);
      await load();
    } catch (error) {
      console.error("Failed to send DM:", error);
      setActionMessage(`Failed to send DM to ${coach.name}`);
    } finally {
      setSendingId(null);
    }
  }

  async function logDraft(coach: Coach) {
    setSendingId(coach.id);
    setActionMessage(null);
    try {
      const response = await fetch("/api/dms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: coach.id,
          coachName: coach.name,
          schoolName: coach.schoolName,
          templateType: "intro",
          xHandle: coach.xHandle,
          content: drafts[coach.id],
          sendNow: false,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Log failed (${response.status})`);
      }

      setActionMessage(`DM drafted and saved for ${coach.name} — send when ready`);
      await load();
    } catch (error) {
      console.error("Failed to log DM:", error);
      setActionMessage(`Failed to save draft for ${coach.name}`);
    } finally {
      setSendingId(null);
    }
  }

  /* ---- Filtering ---- */

  const filteredDMs = useMemo(() => {
    if (filterStatus === "all") return recentDMs;
    return recentDMs.filter((dm) => dm.status === filterStatus);
  }, [recentDMs, filterStatus]);

  /* ---- Render ---- */

  return (
    <SCPageTransition>
    <div className="space-y-6">
      <SCPageHeader
        kicker="Secure Comms"
        title="VAULT ARCHIVE"
        subtitle="AI-personalized coach outreach — generate, review, send when ready"
        actions={
          <div className="flex gap-3">
            <SCButton
              variant="primary"
              size="sm"
              onClick={generateAllAIDMs}
              disabled={generatingAll || queue.length === 0}
            >
              {generatingAll ? (
                <span className="material-symbols-outlined animate-spin text-[16px]">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              )}
              {generatingAll ? "Generating..." : "Generate All AI DMs"}
            </SCButton>
            <SCButton
              variant="secondary"
              size="sm"
              onClick={() => dispatchOperatorCommand({ command: "What should I do today?" })}
            >
              <span className="material-symbols-outlined text-[16px]">assistant</span>
              Today&apos;s Plan
            </SCButton>
          </div>
        }
      />

      <SCHeroBanner screen="outreach" className="mb-6" />

      {/* Action feedback message */}
      {actionMessage && (
        <SCGlassCard variant="broadcast" className="px-4 py-3">
          <p className="text-sm font-bold text-white">{actionMessage}</p>
        </SCGlassCard>
      )}

      {/* Wave Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {waveSummary.map((wave) => (
          <SCStatCard
            key={wave.label}
            label={wave.label}
            value={<SCAnimatedNumber value={wave.count} />}
            icon={wave.icon}
          />
        ))}
      </div>

      {/* Recommended Move + Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <SCGlassCard variant="broadcast" className="p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Recommended Move
          </p>
          <h3 className="mt-3 text-2xl font-black text-white">
            {nextCoach ? `Draft for ${nextCoach.name}` : "Review the coach pipeline first"}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {nextCoach
              ? `${nextCoach.schoolName} is the current lead target in the queue. Hit "Generate AI DM" for personalized variations, pick the best one, and send when ready.`
              : "There is no clean DM-ready record right now. Enrich coach handles and priorities first, then return here to send outreach."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/coaches">
              <SCButton variant="secondary" size="sm">
                <span className="material-symbols-outlined text-[16px]">groups</span>
                Open Coach Pipeline
              </SCButton>
            </Link>
            <SCButton
              variant="ghost"
              size="sm"
              onClick={() => dispatchOperatorCommand({ command: "Show follow targets" })}
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              Follow Targets
            </SCButton>
          </div>
        </SCGlassCard>

        {/* Compliance Filter Sidebar */}
        <SCGlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-slate-400">filter_list</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Classification Filter
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "drafted", "sent", "responded"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                  filterStatus === status
                    ? "bg-sc-primary text-white"
                    : "bg-white/5 text-slate-500 hover:text-white"
                }`}
              >
                {status === "all" ? "All Messages" : status}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Total Threads</span>
              <span className="font-bold text-white">{recentDMs.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Queue Depth</span>
              <span className="font-bold text-white">{queue.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Response Rate</span>
              <span className="font-bold text-emerald-400">
                {recentDMs.length > 0
                  ? `${Math.round(
                      (recentDMs.filter((d) => d.status === "responded").length /
                        recentDMs.length) *
                        100
                    )}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </SCGlassCard>
      </div>

      {/* Live DM Queue */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[18px] text-sc-primary">mail</span>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Live DM Queue
          </h2>
        </div>

        {loading ? (
          <SCGlassCard className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-sc-primary border-t-transparent" />
            <span className="ml-3 text-sm text-slate-400">Loading outreach queue...</span>
          </SCGlassCard>
        ) : queue.length === 0 ? (
          <SCGlassCard className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-white/10">mail</span>
            <p className="mt-4 text-lg font-bold text-white/50">No DMs ready to send</p>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              No coaches with X handles are ready for outreach yet. Add coach handles in the Coach Pipeline, then return here to draft and send DMs.
            </p>
            <Link href="/coaches">
              <SCButton variant="primary" size="sm" className="mt-6">
                <span className="material-symbols-outlined text-[16px]">groups</span>
                Open Coach Pipeline
              </SCButton>
            </Link>
          </SCGlassCard>
        ) : (
          <div className="space-y-3">
            {queue.map((coach) => {
              const coachVariations = variations[coach.id];
              const isGenerating = generatingId === coach.id;
              const isSending = sendingId === coach.id;
              const isAI = aiGenerated.has(coach.id);
              const selected = selectedVariation[coach.id] ?? 0;

              return (
                <SCGlassCard key={coach.id} className="p-4">
                  {/* Coach header */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{coach.name}</p>
                        <SCBadge
                          variant={
                            coach.priorityTier === "Tier 1"
                              ? "danger"
                              : coach.priorityTier === "Tier 2"
                              ? "warning"
                              : "default"
                          }
                        >
                          {coach.priorityTier}
                        </SCBadge>
                        {coach.dmOpen && <SCBadge variant="success">DM Open</SCBadge>}
                        {isAI && (
                          <SCBadge variant="info">
                            <span className="material-symbols-outlined text-[12px] mr-0.5">auto_awesome</span>
                            AI
                          </SCBadge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {coach.schoolName} · {coach.title || "Football staff"} · {coach.xHandle}
                      </p>
                    </div>
                    <SCBadge
                      variant={
                        coach.dmStatus === "responded"
                          ? "success"
                          : coach.dmStatus === "sent"
                          ? "info"
                          : "default"
                      }
                    >
                      {coach.dmStatus.replaceAll("_", " ")}
                    </SCBadge>
                  </div>

                  {/* Variation selector (when AI generated 3 options) */}
                  {coachVariations && coachVariations.length > 1 && (
                    <div className="mt-3 flex gap-2">
                      {coachVariations.map((v, i) => (
                        <button
                          key={v.tone}
                          onClick={() => selectVariation(coach.id, i)}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                            selected === i
                              ? "bg-sc-primary text-white"
                              : "bg-white/5 text-slate-500 hover:text-white"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {v.tone === "professional" ? "business_center" : v.tone === "casual" ? "chat_bubble" : "tune"}
                          </span>
                          {v.tone === "professional" ? "Pro" : v.tone === "casual" ? "Casual" : "Custom"}
                          {!v.compliant && (
                            <span className="material-symbols-outlined text-[12px] text-yellow-500" title={v.complianceNote}>
                              warning
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Draft textarea */}
                  <textarea
                    className="mt-3 w-full rounded-lg border border-sc-border bg-white/5 p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
                    value={drafts[coach.id] ?? ""}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [coach.id]: event.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="DM content..."
                  />

                  {/* Character count */}
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`text-[10px] ${(drafts[coach.id]?.length ?? 0) > 280 ? "text-yellow-500" : "text-slate-600"}`}>
                      {drafts[coach.id]?.length ?? 0} chars
                      {(drafts[coach.id]?.length ?? 0) > 280 && " — consider shortening"}
                    </span>
                    {coachVariations && coachVariations[selected] && !coachVariations[selected].compliant && (
                      <span className="text-[10px] text-yellow-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">warning</span>
                        Compliance note — review before sending
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {/* Generate AI DM */}
                    <SCButton
                      size="sm"
                      variant="secondary"
                      onClick={() => generateAIDM(coach)}
                      disabled={isGenerating || generatingAll}
                    >
                      {isGenerating ? (
                        <span className="material-symbols-outlined animate-spin text-[14px]">
                          progress_activity
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      )}
                      {isGenerating ? "Generating..." : "Generate AI DM"}
                    </SCButton>

                    {/* Send via X */}
                    <SCButton
                      size="sm"
                      variant="primary"
                      onClick={() => sendDraft(coach)}
                      disabled={isSending || !drafts[coach.id]?.trim()}
                    >
                      {isSending ? (
                        <span className="material-symbols-outlined animate-spin text-[14px]">
                          progress_activity
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[14px]">send</span>
                      )}
                      Send via X
                    </SCButton>

                    {/* Log for Later */}
                    <SCButton
                      size="sm"
                      variant="ghost"
                      onClick={() => logDraft(coach)}
                      disabled={isSending || !drafts[coach.id]?.trim()}
                    >
                      <span className="material-symbols-outlined text-[14px]">schedule_send</span>
                      Save for Later
                    </SCButton>

                    {/* Reset */}
                    <SCButton
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setDrafts((current) => ({
                          ...current,
                          [coach.id]: buildIntroDraft(coach),
                        }));
                        setVariations((current) => {
                          const next = { ...current };
                          delete next[coach.id];
                          return next;
                        });
                        setAiGenerated((current) => {
                          const next = new Set(current);
                          next.delete(coach.id);
                          return next;
                        });
                      }}
                    >
                      <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                      Reset
                    </SCButton>
                  </div>

                  {coach.notes ? (
                    <p className="mt-2 text-xs text-slate-600">{coach.notes}</p>
                  ) : null}
                </SCGlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Outreach Log */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[18px] text-slate-400">history</span>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Recent Outreach Log
          </h2>
        </div>

        {filteredDMs.length === 0 ? (
          <SCGlassCard className="flex flex-col items-center justify-center py-12 text-center">
            <span className="material-symbols-outlined text-[40px] text-white/10">history</span>
            <p className="mt-3 text-sm font-bold text-white/50">No outreach logged yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Sent DMs will appear here for tracking and follow-up.
            </p>
          </SCGlassCard>
        ) : (
          <div className="space-y-2">
            {filteredDMs.slice(0, 10).map((dm) => (
              <SCGlassCard key={dm.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-white">{dm.coachName}</p>
                  <SCBadge
                    variant={
                      dm.status === "responded"
                        ? "success"
                        : dm.status === "sent"
                        ? "info"
                        : "default"
                    }
                  >
                    {dm.status}
                  </SCBadge>
                  {(dm.status === "sent" || dm.status === "responded") && (
                    <span className="material-symbols-outlined text-[16px] text-emerald-500">
                      check_circle
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">{dm.schoolName}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{dm.content}</p>
              </SCGlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
    </SCPageTransition>
  );
}
