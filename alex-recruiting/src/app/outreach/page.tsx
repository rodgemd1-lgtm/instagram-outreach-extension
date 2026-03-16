"use client";

import { useEffect, useState, useCallback } from "react";
import { StudioPageHeader } from "@/components/studio-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OutreachStage =
  | "research"
  | "follow"
  | "engage"
  | "dm"
  | "response"
  | "relationship";

type PriorityTier = "Tier 1" | "Tier 2" | "Tier 3";

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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAGES: { key: OutreachStage; label: string; color: string; bgColor: string; borderColor: string }[] = [
  {
    key: "research",
    label: "Research",
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
  {
    key: "follow",
    label: "Follow",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    key: "engage",
    label: "Engage",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    key: "dm",
    label: "DM",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    key: "response",
    label: "Response",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    key: "relationship",
    label: "Relationship",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
];

const TIER_STYLES: Record<string, { badge: string; text: string }> = {
  "Tier 1": { badge: "bg-indigo-100 text-indigo-800 border-indigo-200", text: "text-indigo-700" },
  "Tier 2": { badge: "bg-blue-100 text-blue-800 border-blue-200", text: "text-blue-700" },
  "Tier 3": { badge: "bg-emerald-100 text-emerald-800 border-emerald-200", text: "text-emerald-700" },
};

// ---------------------------------------------------------------------------
// Helper Components
// ---------------------------------------------------------------------------

function SchoolInitial({ name, tier }: { name: string; tier: string }) {
  const initial = name.charAt(0).toUpperCase();
  const bgMap: Record<string, string> = {
    "Tier 1": "bg-indigo-600",
    "Tier 2": "bg-blue-600",
    "Tier 3": "bg-emerald-600",
  };

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${bgMap[tier] ?? "bg-gray-600"}`}
    >
      {initial}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const style = TIER_STYLES[tier] ?? TIER_STYLES["Tier 1"];
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${style.badge}`}>
      {tier}
    </Badge>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-[rgba(15,40,75,0.08)] bg-white/80 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
        {value}
      </p>
    </div>
  );
}

function CoachCard({
  coach,
  onAction,
}: {
  coach: OutreachCoach;
  onAction: (action: string, coach: OutreachCoach) => void;
}) {
  return (
    <div className="rounded-xl border border-[rgba(15,40,75,0.08)] bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-2.5">
        <SchoolInitial name={coach.schoolName} tier={coach.priorityTier} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--app-navy-strong)]">
            {coach.name}
          </p>
          <p className="truncate text-xs text-[var(--app-muted)]">
            {coach.schoolName}
          </p>
        </div>
        <TierBadge tier={coach.priorityTier} />
      </div>

      <div className="mt-2.5 space-y-1">
        <p className="text-[11px] text-[var(--app-muted)]">
          {coach.division} / {coach.conference}
        </p>
        {coach.lastActionDate && (
          <p className="text-[11px] text-[var(--app-muted)]">
            Last action: {coach.lastActionDate}
          </p>
        )}
        <p className="text-[11px] font-medium text-[var(--app-navy-strong)]">
          Next: {coach.nextAction}
        </p>
        {coach.nextActionDate && (
          <p className="text-[10px] text-[var(--app-muted)]">
            Due: {coach.nextActionDate}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          onClick={() => onAction("dm", coach)}
          className="rounded-md bg-purple-50 px-2 py-1 text-[10px] font-medium text-purple-700 transition-colors hover:bg-purple-100"
        >
          Send DM
        </button>
        <button
          onClick={() => onAction("like", coach)}
          className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 transition-colors hover:bg-blue-100"
        >
          Like Post
        </button>
        <button
          onClick={() => onAction("reply", coach)}
          className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700 transition-colors hover:bg-amber-100"
        >
          Reply
        </button>
        <button
          onClick={() => onAction("schedule", coach)}
          className="rounded-md bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          Schedule
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

type FilterTier = PriorityTier | "all";
type FilterDivision = "all" | "D1 FBS" | "D1 FCS" | "D2";
type FilterStage = OutreachStage | "all";

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function OutreachPage() {
  const [plan, setPlan] = useState<OutreachPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingDM, setGeneratingDM] = useState(false);
  const [filterTier, setFilterTier] = useState<FilterTier>("all");
  const [filterDivision, setFilterDivision] = useState<FilterDivision>("all");
  const [filterStage, setFilterStage] = useState<FilterStage>("all");
  const [actionLog, setActionLog] = useState<string[]>([]);

  // Fetch initial plan data
  const fetchPlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outreach/plan");
      const data = await res.json();
      if (data.stages) {
        setPlan(data);
      }
    } catch (error) {
      console.error("Failed to fetch outreach plan:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  // Generate outreach plan
  async function handleGeneratePlan() {
    setGenerating(true);
    try {
      const res = await fetch("/api/outreach/plan", { method: "POST" });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
        setActionLog((prev) => [
          `Generated outreach plan for ${data.coaches} coaches`,
          ...prev,
        ]);
      }
    } catch (error) {
      console.error("Failed to generate outreach plan:", error);
    } finally {
      setGenerating(false);
    }
  }

  // Generate DM sequences
  async function handleGenerateDMSequences() {
    setGeneratingDM(true);
    try {
      const res = await fetch("/api/outreach/dm-sequence", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setActionLog((prev) => [
          `Generated ${data.sequences} DM sequences with ${data.totalMessages} messages`,
          ...prev,
        ]);
        // Refresh plan to reflect new DM data
        fetchPlan();
      }
    } catch (error) {
      console.error("Failed to generate DM sequences:", error);
    } finally {
      setGeneratingDM(false);
    }
  }

  // Handle quick actions on coach cards
  function handleCoachAction(action: string, coach: OutreachCoach) {
    const timestamp = new Date().toLocaleTimeString();
    const actionLabels: Record<string, string> = {
      dm: `Drafted DM for ${coach.name} at ${coach.schoolName}`,
      like: `Liked post from ${coach.schoolName}`,
      reply: `Replied to ${coach.schoolName} post`,
      schedule: `Scheduled follow-up with ${coach.name}`,
    };
    setActionLog((prev) => [
      `[${timestamp}] ${actionLabels[action] ?? action}`,
      ...prev.slice(0, 19),
    ]);
  }

  // Filter coaches
  function filterCoaches(coaches: OutreachCoach[]): OutreachCoach[] {
    return coaches.filter((c) => {
      if (filterTier !== "all" && c.priorityTier !== filterTier) return false;
      if (filterDivision !== "all" && c.division !== filterDivision)
        return false;
      return true;
    });
  }

  // Compute total across all stages after filtering
  const filteredTotal =
    plan
      ? Object.values(plan.stages).reduce(
          (sum, coaches) => sum + filterCoaches(coaches).length,
          0
        )
      : 0;

  const hasCoaches = plan && plan.stats.total > 0;

  return (
    <div className="space-y-6">
      <StudioPageHeader
        icon="Mail"
        kicker="Nina + Casey + Trey"
        title="Run the full outreach pipeline from research to relationship."
        description="This is the nerve center for coach outreach. Every school, every coach, every DM and follow lives here. Move prospects through the pipeline from first research to real relationship."
        council={["Nina", "Casey", "Trey", "Marcus"]}
      >
        <p className="font-semibold">Outreach principle:</p>
        <p className="mt-2 leading-6 text-[var(--app-muted)]">
          Systematic beats random. Follow the pipeline, respect the timeline,
          and never let a warm lead go cold. Every action moves a coach one
          stage closer.
        </p>
      </StudioPageHeader>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Total Coaches"
          value={plan?.stats.total ?? 0}
        />
        <StatCard
          label="DMs Drafted"
          value={plan?.stats.dmsDrafted ?? 0}
        />
        <StatCard
          label="DMs Sent"
          value={plan?.stats.dmsSent ?? 0}
        />
        <StatCard
          label="Responses"
          value={plan?.stats.responses ?? 0}
        />
        <StatCard
          label="Follow Rate"
          value={plan?.stats.followRate ?? "0%"}
        />
      </div>

      {/* Action Buttons + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="bg-[var(--app-navy-strong)] text-white hover:bg-[var(--app-navy-strong)]/90"
          >
            {generating ? "Generating..." : "Generate Outreach Plan"}
          </Button>
          <Button
            onClick={handleGenerateDMSequences}
            disabled={generatingDM}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            {generatingDM ? "Generating..." : "Generate DM Sequences"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Tier Filter */}
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value as FilterTier)}
            className="rounded-lg border border-[rgba(15,40,75,0.12)] bg-white px-3 py-1.5 text-xs text-[var(--app-navy-strong)] outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="Tier 1">Tier 1 (Reach)</option>
            <option value="Tier 2">Tier 2 (Target)</option>
            <option value="Tier 3">Tier 3 (Safety)</option>
          </select>

          {/* Division Filter */}
          <select
            value={filterDivision}
            onChange={(e) =>
              setFilterDivision(e.target.value as FilterDivision)
            }
            className="rounded-lg border border-[rgba(15,40,75,0.12)] bg-white px-3 py-1.5 text-xs text-[var(--app-navy-strong)] outline-none"
          >
            <option value="all">All Divisions</option>
            <option value="D1 FBS">D1 FBS</option>
            <option value="D1 FCS">D1 FCS</option>
            <option value="D2">D2</option>
          </select>

          {/* Stage Filter */}
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value as FilterStage)}
            className="rounded-lg border border-[rgba(15,40,75,0.12)] bg-white px-3 py-1.5 text-xs text-[var(--app-navy-strong)] outline-none"
          >
            <option value="all">All Stages</option>
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          {filteredTotal !== (plan?.stats.total ?? 0) && (
            <span className="self-center text-xs text-[var(--app-muted)]">
              Showing {filteredTotal} of {plan?.stats.total ?? 0}
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--app-navy-strong)] border-t-transparent" />
            <p className="text-sm text-[var(--app-muted)]">
              Loading outreach pipeline...
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !hasCoaches && (
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <CardTitle className="text-lg text-[var(--app-navy-strong)]">
              No outreach plan yet
            </CardTitle>
            <CardDescription className="max-w-md">
              Click &quot;Generate Outreach Plan&quot; to build your pipeline.
              This will create coach entries for all 17 target schools with
              recommended outreach stages, next actions, and timeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="bg-[var(--app-navy-strong)] text-white hover:bg-[var(--app-navy-strong)]/90"
            >
              {generating ? "Generating..." : "Generate Outreach Plan"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      {!loading && hasCoaches && (
        <div className="overflow-x-auto pb-4">
          <div
            className={`grid gap-4 ${
              filterStage !== "all"
                ? "grid-cols-1"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
            }`}
            style={
              filterStage === "all"
                ? { minWidth: "1200px" }
                : undefined
            }
          >
            {STAGES.filter(
              (s) => filterStage === "all" || filterStage === s.key
            ).map((stage) => {
              const stageCoaches = filterCoaches(
                plan?.stages[stage.key] ?? []
              );

              return (
                <div
                  key={stage.key}
                  className={`flex flex-col rounded-2xl border ${stage.borderColor} ${stage.bgColor} p-3`}
                >
                  {/* Column Header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-semibold ${stage.color}`}
                      >
                        {stage.label}
                      </h3>
                      <span
                        className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${stage.color} ${stage.bgColor} border ${stage.borderColor}`}
                      >
                        {stageCoaches.length}
                      </span>
                    </div>
                  </div>

                  {/* Coach Cards */}
                  <div className="flex flex-col gap-2.5">
                    {stageCoaches.length === 0 && (
                      <p className="py-6 text-center text-xs text-[var(--app-muted)]">
                        No coaches in this stage
                      </p>
                    )}
                    {stageCoaches
                      .sort((a, b) => b.priorityScore - a.priorityScore)
                      .map((coach) => (
                        <CoachCard
                          key={coach.id}
                          coach={coach}
                          onAction={handleCoachAction}
                        />
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
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            NCAA Compliance Note
          </p>
          <p className="mt-1 text-sm leading-relaxed text-amber-700">
            {plan.ncaaNote}
          </p>
        </div>
      )}

      {/* Action Log */}
      {actionLog.length > 0 && (
        <div className="rounded-xl border border-[rgba(15,40,75,0.08)] bg-white/80 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
            Recent Actions
          </h3>
          <div className="mt-2 space-y-1">
            {actionLog.slice(0, 10).map((log, i) => (
              <p
                key={`${log}-${i}`}
                className="text-xs text-[var(--app-muted)]"
              >
                {log}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
