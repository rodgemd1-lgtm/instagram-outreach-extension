"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  SCPageHeader,
  SCStatCard,
  SCGlassCard,
  SCBadge,
  SCButton,
  SCInput,
  SCHeroBanner,
  SCPageTransition,
  SCAnimatedNumber,
  SCTabs,
} from "@/components/sc";
import { DMList } from "@/components/outreach/dm-list";
import { ConnectionsList } from "@/components/outreach/connections-list";
import EmailComposer from "@/components/email-composer";
import { EmailTracker } from "@/components/email-tracker";

type OutreachStage = "research" | "follow" | "engage" | "dm" | "response" | "relationship";

interface OutreachCoach {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
  division: string;
  conference: string;
  priorityTier: string;
  xHandle: string;
  stage: OutreachStage;
  nextAction: string;
  nextActionDate: string;
  priorityScore: number;
  lastActionDate: string | null;
  dmTimeline: string;
}

interface OutreachPlan {
  stages: Record<OutreachStage, OutreachCoach[]>;
  stats: {
    total: number;
    dmsDrafted: number;
    dmsSent: number;
    responses: number;
    followRate: string;
  };
  ncaaNote: string;
  generatedAt: string;
}

const STAGES: { key: OutreachStage; label: string; icon: string }[] = [
  { key: "research", label: "Research", icon: "search" },
  { key: "follow", label: "Follow", icon: "person_add" },
  { key: "engage", label: "Engage", icon: "thumb_up" },
  { key: "dm", label: "DM", icon: "mail" },
  { key: "response", label: "Response", icon: "reply" },
  { key: "relationship", label: "Relationship", icon: "handshake" },
];

const STAGE_COLORS: Record<OutreachStage, string> = {
  research: "bg-white/10 text-white/50",
  follow: "bg-blue-400/15 text-blue-400",
  engage: "bg-yellow-500/15 text-yellow-500",
  dm: "bg-purple-400/15 text-purple-400",
  response: "bg-emerald-400/15 text-emerald-400",
  relationship: "bg-sc-primary/15 text-sc-primary",
};

const OUTREACH_TABS = [
  { label: "Pipeline", value: "pipeline" },
  { label: "DM Sequences", value: "dms" },
  { label: "Email", value: "email" },
  { label: "Follow Strategy", value: "follows" },
];

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function OutreachPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<OutreachPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("pipeline");

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outreach/plan");
      const data = await res.json();
      if (data.stages) setPlan(data);
    } catch (error) {
      console.error("Failed to fetch outreach plan:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  async function handleGeneratePlan() {
    setGenerating(true);
    try {
      const res = await fetch("/api/outreach/plan", { method: "POST" });
      const data = await res.json();
      if (data.success && data.plan) setPlan(data.plan);
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setGenerating(false);
    }
  }

  function filterCoaches(coaches: OutreachCoach[]): OutreachCoach[] {
    return coaches.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.schoolName.toLowerCase().includes(search.toLowerCase());
      const matchesTier = tierFilter === "all" || c.priorityTier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }

  const hasCoaches = plan && plan.stats.total > 0;

  const signingRate =
    plan && plan.stats.total > 0
      ? Math.round((plan.stats.responses / plan.stats.total) * 100)
      : 0;

  return (
    <SCPageTransition>
      <div className="space-y-6">
        <SCPageHeader
          kicker="Campaign HQ"
          title="OUTREACH COMMAND"
          subtitle="Full recruitment campaign pipeline from research to relationship"
          actions={
            <SCButton
              variant="primary"
              size="sm"
              onClick={handleGeneratePlan}
              disabled={generating}
            >
              {generating && (
                <span className="material-symbols-outlined animate-spin text-[16px]">
                  progress_activity
                </span>
              )}
              {generating ? "Generating..." : "Generate Plan"}
            </SCButton>
          }
        />

        <SCHeroBanner screen="outreach" className="mb-6" />

        <SCTabs tabs={OUTREACH_TABS} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

        {activeTab === "dms" && <DMList />}
        {activeTab === "email" && (
          <div className="space-y-6">
            <EmailComposer />
            <EmailTracker />
          </div>
        )}
        {activeTab === "follows" && <ConnectionsList />}

        {activeTab === "pipeline" && (<>
        {/* Metrics Row */}
        <motion.div
          className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={staggerItem}>
            <SCStatCard
              label="Total Coaches"
              value={<SCAnimatedNumber value={plan?.stats.total ?? 0} />}
              icon="groups"
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <SCStatCard
              label="Response Rate"
              value={<SCAnimatedNumber value={signingRate} suffix="%" />}
              icon="verified"
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <SCStatCard
              label="Responses Received"
              value={<SCAnimatedNumber value={plan?.stats.responses ?? 0} />}
              icon="how_to_reg"
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <SCStatCard
              label="DMs Drafted"
              value={<SCAnimatedNumber value={plan?.stats.dmsDrafted ?? 0} />}
              icon="edit_note"
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <SCStatCard
              label="Outreach Velocity"
              value={plan?.stats.followRate ?? "0%"}
              icon="speed"
            />
          </motion.div>
        </motion.div>

        {/* Filters */}
        <SCGlassCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SCInput
              icon="search"
              placeholder="Search coaches or schools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-sc-border bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            <option value="all" className="bg-sc-surface text-white">All Tiers</option>
            <option value="Tier 1" className="bg-sc-surface text-white">Tier 1</option>
            <option value="Tier 2" className="bg-sc-surface text-white">Tier 2</option>
            <option value="Tier 3" className="bg-sc-surface text-white">Tier 3</option>
          </select>
        </SCGlassCard>

        {/* Network Visualization Placeholder */}
        <SCGlassCard className="relative overflow-hidden p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-sc-primary text-[20px]">hub</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Talent Network Map
            </p>
          </div>
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-sc-border">
            <div className="text-center">
              <span className="material-symbols-outlined text-[40px] text-white/10">
                scatter_plot
              </span>
              <p className="mt-2 text-xs text-slate-500">
                Network visualization loads with pipeline data
              </p>
            </div>
          </div>
        </SCGlassCard>

        {/* Loading */}
        {loading && (
          <SCGlassCard className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sc-primary border-t-transparent" />
            <span className="ml-3 text-sm text-slate-400">Loading pipeline...</span>
          </SCGlassCard>
        )}

        {/* Empty State */}
        {!loading && !hasCoaches && (
          <SCGlassCard className="py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-white/10">
              campaign
            </span>
            <p className="mt-4 text-lg font-bold text-white/50">No outreach plan yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Click &quot;Generate Plan&quot; to build your pipeline with all target schools.
            </p>
            <SCButton
              variant="primary"
              size="sm"
              className="mt-6"
              onClick={handleGeneratePlan}
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate Outreach Plan"}
            </SCButton>
          </SCGlassCard>
        )}

        {/* Pipeline Kanban */}
        {!loading && hasCoaches && (
          <div className="overflow-x-auto pb-4">
            <motion.div
              className="grid grid-cols-6 gap-3"
              style={{ minWidth: "1100px" }}
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {STAGES.map((stage) => {
                const stageCoaches = filterCoaches(plan?.stages[stage.key] ?? []);

                return (
                  <motion.div key={stage.key} className="flex flex-col" variants={staggerItem}>
                    {/* Column header */}
                    <div className="mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-slate-500">
                        {stage.icon}
                      </span>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {stage.label}
                      </h3>
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/5 px-1.5 text-[10px] font-bold text-slate-500">
                        {stageCoaches.length}
                      </span>
                    </div>

                    {/* Coach cards */}
                    <div className="flex flex-col gap-2">
                      {stageCoaches.length === 0 && (
                        <div className="rounded-xl border border-dashed border-sc-border py-8 text-center">
                          <p className="text-[10px] text-white/15">Empty</p>
                        </div>
                      )}
                      {stageCoaches
                        .sort((a, b) => b.priorityScore - a.priorityScore)
                        .map((coach) => (
                          <div
                            key={coach.id}
                            className="cursor-pointer"
                            onClick={() => router.push(`/coaches/${coach.schoolId}`)}
                          >
                          <SCGlassCard
                            className="p-3 transition-all hover:border-sc-primary/30"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-white">
                                  {coach.name}
                                </p>
                                <p className="truncate text-[11px] text-slate-500">
                                  {coach.schoolName}
                                </p>
                              </div>
                              <SCBadge
                                variant={
                                  coach.priorityTier === "Tier 1"
                                    ? "danger"
                                    : coach.priorityTier === "Tier 2"
                                    ? "warning"
                                    : "default"
                                }
                              >
                                {coach.priorityTier.replace("Tier ", "T")}
                              </SCBadge>
                            </div>
                            <p className="mt-2 text-[11px] font-medium text-slate-400">
                              Next: {coach.nextAction}
                            </p>
                            {coach.nextActionDate && (
                              <p className="text-[10px] text-slate-600">
                                Due: {coach.nextActionDate}
                              </p>
                            )}
                            <div className="mt-2 flex gap-1">
                              <button
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold transition-all ${STAGE_COLORS.dm}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/coaches/${coach.schoolId}?tab=dm`);
                                }}
                              >
                                DM
                              </button>
                              <button
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold transition-all ${STAGE_COLORS.engage}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/coaches/${coach.schoolId}`);
                                }}
                              >
                                Engage
                              </button>
                            </div>
                          </SCGlassCard>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* NCAA Compliance Note */}
        {plan?.ncaaNote && (
          <SCGlassCard variant="broadcast" className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[16px] text-yellow-500">
                gavel
              </span>
              <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500/60">
                NCAA Compliance
              </p>
            </div>
            <p className="text-sm text-yellow-500/70">{plan.ncaaNote}</p>
          </SCGlassCard>
        )}
        </>)}
      </div>
    </SCPageTransition>
  );
}
