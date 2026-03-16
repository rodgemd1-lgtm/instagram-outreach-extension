"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  StitchPageHeader,
  StatCard,
  GlassCard,
  StitchButton,
  StitchBadge,
  FilterBar,
  TalentTopography,
} from "@/components/stitch";
import { StitchTabs } from "@/components/stitch/stitch-tabs";

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

const STAGES: { key: OutreachStage; label: string }[] = [
  { key: "research", label: "Research" },
  { key: "follow", label: "Follow" },
  { key: "engage", label: "Engage" },
  { key: "dm", label: "DM" },
  { key: "response", label: "Response" },
  { key: "relationship", label: "Relationship" },
];

const STAGE_COLORS: Record<OutreachStage, string> = {
  research: "bg-white/10 text-white/50",
  follow: "bg-[#00f2ff]/15 text-[#00f2ff]",
  engage: "bg-amber-400/15 text-amber-400",
  dm: "bg-purple-400/15 text-purple-400",
  response: "bg-[#0bda7d]/15 text-[#0bda7d]",
  relationship: "bg-[#C5050C]/15 text-[#C5050C]",
};

export default function OutreachPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<OutreachPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

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

  return (
    <div className="space-y-6">
      <StitchPageHeader
        title="Campaign HQ"
        subtitle="Full outreach pipeline from research to relationship"
        actions={
          <StitchButton
            variant="pirate"
            size="sm"
            onClick={handleGeneratePlan}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Plan"
            )}
          </StitchButton>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Total Coaches" value={plan?.stats.total ?? 0} />
        <StatCard label="DMs Drafted" value={plan?.stats.dmsDrafted ?? 0} />
        <StatCard label="DMs Sent" value={plan?.stats.dmsSent ?? 0} />
        <StatCard label="Responses" value={plan?.stats.responses ?? 0} />
        <StatCard label="Follow Rate" value={plan?.stats.followRate ?? "0%"} />
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            label: "Tier",
            value: tierFilter,
            onChange: setTierFilter,
            options: [
              { value: "all", label: "All Tiers" },
              { value: "Tier 1", label: "Tier 1" },
              { value: "Tier 2", label: "Tier 2" },
              { value: "Tier 3", label: "Tier 3" },
            ],
          },
        ]}
      />

      {/* Talent Network Map */}
      <TalentTopography onSchoolClick={(id) => router.push(`/coaches/${id}`)} />

      {/* Loading */}
      {loading && (
        <GlassCard className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C5050C] border-t-transparent" />
          <span className="ml-3 text-sm text-white/40">Loading pipeline...</span>
        </GlassCard>
      )}

      {/* Empty State */}
      {!loading && !hasCoaches && (
        <GlassCard className="py-16 text-center">
          <p className="text-lg font-semibold text-white/50">No outreach plan yet</p>
          <p className="mt-2 text-sm text-white/30">
            Click &quot;Generate Plan&quot; to build your pipeline with all target schools.
          </p>
          <StitchButton
            variant="pirate"
            size="sm"
            className="mt-6"
            onClick={handleGeneratePlan}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate Outreach Plan"}
          </StitchButton>
        </GlassCard>
      )}

      {/* Pipeline Kanban */}
      {!loading && hasCoaches && (
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-6 gap-3" style={{ minWidth: "1100px" }}>
            {STAGES.map((stage) => {
              const stageCoaches = filterCoaches(plan?.stages[stage.key] ?? []);

              return (
                <div key={stage.key} className="flex flex-col">
                  {/* Column header */}
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">
                      {stage.label}
                    </h3>
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/5 px-1.5 text-[10px] font-bold text-white/30">
                      {stageCoaches.length}
                    </span>
                  </div>

                  {/* Coach cards */}
                  <div className="flex flex-col gap-2">
                    {stageCoaches.length === 0 && (
                      <div className="rounded-lg border border-white/5 py-8 text-center">
                        <p className="text-[10px] text-white/15">Empty</p>
                      </div>
                    )}
                    {stageCoaches
                      .sort((a, b) => b.priorityScore - a.priorityScore)
                      .map((coach) => (
                        <GlassCard
                          key={coach.id}
                          className="p-3 cursor-pointer hover:border-white/10 transition-all"
                          onClick={() => router.push(`/coaches/${coach.schoolId}`)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {coach.name}
                              </p>
                              <p className="truncate text-[11px] text-white/40">
                                {coach.schoolName}
                              </p>
                            </div>
                            <StitchBadge
                              variant={
                                coach.priorityTier === "Tier 1" ? "tier1" :
                                coach.priorityTier === "Tier 2" ? "tier2" : "tier3"
                              }
                            >
                              {coach.priorityTier.replace("Tier ", "T")}
                            </StitchBadge>
                          </div>
                          <p className="mt-2 text-[11px] font-medium text-white/50">
                            Next: {coach.nextAction}
                          </p>
                          {coach.nextActionDate && (
                            <p className="text-[10px] text-white/25">
                              Due: {coach.nextActionDate}
                            </p>
                          )}
                          <div className="mt-2 flex gap-1">
                            <button
                              className={`rounded px-1.5 py-0.5 text-[9px] font-semibold transition-all ${STAGE_COLORS.dm}`}
                              onClick={(e) => { e.stopPropagation(); }}
                            >
                              DM
                            </button>
                            <button
                              className={`rounded px-1.5 py-0.5 text-[9px] font-semibold transition-all ${STAGE_COLORS.engage}`}
                              onClick={(e) => { e.stopPropagation(); }}
                            >
                              Engage
                            </button>
                          </div>
                        </GlassCard>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NCAA Compliance Note */}
      {plan?.ncaaNote && (
        <GlassCard className="border-amber-400/20 p-4">
          <p className="stitch-label text-amber-400/60">NCAA Compliance</p>
          <p className="mt-1 text-sm text-amber-400/70">{plan.ncaaNote}</p>
        </GlassCard>
      )}
    </div>
  );
}
