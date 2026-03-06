"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  StickyNote,
  ArrowRight,
  Users,
  X,
} from "lucide-react";
import type { PriorityTier, DivisionTier } from "@/lib/types";

// ── Types ────────────────────────────────────────────────────────────────────

type PipelineStage =
  | "discovered"
  | "followed"
  | "engaged"
  | "dm_sent"
  | "responded"
  | "relationship";

type XActivity = "active" | "moderate" | "inactive";

interface PipelineCoach {
  id: string;
  name: string;
  title: string;
  schoolName: string;
  schoolId: string;
  division: DivisionTier;
  conference: string;
  xHandle: string;
  priorityTier: PriorityTier;
  stage: PipelineStage;
  daysInStage: number;
  xActivity: XActivity;
  notes: string;
}

interface StageConfig {
  id: PipelineStage;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  headerBg: string;
}

// ── Stage Configuration ──────────────────────────────────────────────────────

const STAGES: StageConfig[] = [
  {
    id: "discovered",
    label: "Discovered",
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    dotColor: "bg-slate-400",
    headerBg: "bg-slate-100",
  },
  {
    id: "followed",
    label: "Followed",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    dotColor: "bg-blue-400",
    headerBg: "bg-blue-100",
  },
  {
    id: "engaged",
    label: "Engaged",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    dotColor: "bg-amber-400",
    headerBg: "bg-amber-100",
  },
  {
    id: "dm_sent",
    label: "DM Sent",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    dotColor: "bg-purple-400",
    headerBg: "bg-purple-100",
  },
  {
    id: "responded",
    label: "Responded",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    dotColor: "bg-green-400",
    headerBg: "bg-green-100",
  },
  {
    id: "relationship",
    label: "Relationship",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    dotColor: "bg-emerald-400",
    headerBg: "bg-emerald-100",
  },
];

// ── Mock Data ────────────────────────────────────────────────────────────────

const PIPELINE_COACHES: PipelineCoach[] = [
  // Stage 1: Discovered (5 coaches)
  {
    id: "c1",
    name: "Coach Mike Denbrock",
    title: "Offensive Line Coach",
    schoolName: "University of Wisconsin",
    schoolId: "wisconsin",
    division: "D1 FBS",
    conference: "Big Ten",
    xHandle: "@DenbrockOL",
    priorityTier: "Tier 1",
    stage: "discovered",
    daysInStage: 2,
    xActivity: "active",
    notes: "Posts daily about OL technique. Good engagement target.",
  },
  {
    id: "c2",
    name: "Coach Matt Feeney",
    title: "Recruiting Coordinator",
    schoolName: "Iowa",
    schoolId: "iowa",
    division: "D1 FBS",
    conference: "Big Ten",
    xHandle: "@CoachFeeney",
    priorityTier: "Tier 1",
    stage: "discovered",
    daysInStage: 5,
    xActivity: "active",
    notes: "Actively recruits WI prospects. Posts about camps frequently.",
  },
  {
    id: "c3",
    name: "Coach Tyler Roehl",
    title: "Offensive Coordinator",
    schoolName: "North Dakota State",
    schoolId: "north-dakota-state",
    division: "D1 FCS",
    conference: "Missouri Valley",
    xHandle: "@CoachRoehl",
    priorityTier: "Tier 2",
    stage: "discovered",
    daysInStage: 1,
    xActivity: "moderate",
    notes: "NDSU OC known for developing NFL linemen.",
  },
  {
    id: "c4",
    name: "Coach AJ Blazek",
    title: "OL Coach",
    schoolName: "Ferris State",
    schoolId: "ferris-state",
    division: "D2",
    conference: "GLIAC",
    xHandle: "@CoachBlazekOL",
    priorityTier: "Tier 3",
    stage: "discovered",
    daysInStage: 3,
    xActivity: "active",
    notes: "D2 national champ program. Very active recruiter on X.",
  },
  {
    id: "c5",
    name: "Coach Brian Ward",
    title: "Offensive Line Coach",
    schoolName: "Iowa State",
    schoolId: "iowa-state",
    division: "D1 FBS",
    conference: "Big 12",
    xHandle: "@CoachBWardOL",
    priorityTier: "Tier 1",
    stage: "discovered",
    daysInStage: 7,
    xActivity: "moderate",
    notes: "Big 12 OL coach. Posts film breakdowns weekly.",
  },

  // Stage 2: Followed (4 coaches)
  {
    id: "c6",
    name: "Coach Chris Kapilovic",
    title: "OL Coach",
    schoolName: "Northwestern",
    schoolId: "northwestern",
    division: "D1 FBS",
    conference: "Big Ten",
    xHandle: "@CoachKap_OL",
    priorityTier: "Tier 1",
    stage: "followed",
    daysInStage: 12,
    xActivity: "active",
    notes: "Followed 3 days ago. Posts about combine prep. Engage with his content.",
  },
  {
    id: "c7",
    name: "Coach Joe Tripodi",
    title: "Recruiting Coordinator",
    schoolName: "Northern Illinois",
    schoolId: "northern-illinois",
    division: "D1 FBS",
    conference: "MAC",
    xHandle: "@CoachTripodi",
    priorityTier: "Tier 2",
    stage: "followed",
    daysInStage: 8,
    xActivity: "active",
    notes: "Very active on X. Follows back recruits quickly.",
  },
  {
    id: "c8",
    name: "Coach Ryan Grubb",
    title: "OL Coach",
    schoolName: "Western Michigan",
    schoolId: "western-michigan",
    division: "D1 FBS",
    conference: "MAC",
    xHandle: "@CoachGrubbOL",
    priorityTier: "Tier 2",
    stage: "followed",
    daysInStage: 6,
    xActivity: "moderate",
    notes: "Posts 2-3 times per week. Focus on training content.",
  },
  {
    id: "c9",
    name: "Coach Derek Frazier",
    title: "OL Coach",
    schoolName: "Winona State",
    schoolId: "winona-state",
    division: "D2",
    conference: "NSIC",
    xHandle: "@CoachFrazierOL",
    priorityTier: "Tier 3",
    stage: "followed",
    daysInStage: 4,
    xActivity: "active",
    notes: "NSIC coach, very responsive. DM-open profile.",
  },

  // Stage 3: Engaged (3 coaches)
  {
    id: "c10",
    name: "Coach Jimmy Dougherty",
    title: "Recruiting Coordinator",
    schoolName: "South Dakota State",
    schoolId: "south-dakota-state",
    division: "D1 FCS",
    conference: "Missouri Valley",
    xHandle: "@CoachDougherty",
    priorityTier: "Tier 2",
    stage: "engaged",
    daysInStage: 14,
    xActivity: "active",
    notes: "Liked 3 of his posts. He liked Jacob&apos;s training video back.",
  },
  {
    id: "c11",
    name: "Coach Matt Drinkall",
    title: "OL Coach",
    schoolName: "Ball State",
    schoolId: "ball-state",
    division: "D1 FBS",
    conference: "MAC",
    xHandle: "@CoachDrinkall",
    priorityTier: "Tier 2",
    stage: "engaged",
    daysInStage: 10,
    xActivity: "moderate",
    notes: "Replied to his OL drill post. He replied back with a fire emoji.",
  },
  {
    id: "c12",
    name: "Coach Aaron Keen",
    title: "Head Coach",
    schoolName: "Michigan Tech",
    schoolId: "michigan-tech",
    division: "D2",
    conference: "GLIAC",
    xHandle: "@CoachKeenMTU",
    priorityTier: "Tier 3",
    stage: "engaged",
    daysInStage: 7,
    xActivity: "active",
    notes: "Retweeted Jacob&apos;s workout clip. Good signal for DM readiness.",
  },

  // Stage 4: DM Sent (2 coaches)
  {
    id: "c13",
    name: "Coach Scott Downing",
    title: "Recruiting Coordinator",
    schoolName: "Saginaw Valley State",
    schoolId: "saginaw-valley",
    division: "D2",
    conference: "GLIAC",
    xHandle: "@CoachDowningSV",
    priorityTier: "Tier 3",
    stage: "dm_sent",
    daysInStage: 5,
    xActivity: "active",
    notes: "Sent intro DM with highlight link. Waiting for response.",
  },
  {
    id: "c14",
    name: "Coach Marcus Satterfield",
    title: "OL Coach",
    schoolName: "Central Michigan",
    schoolId: "central-michigan",
    division: "D1 FBS",
    conference: "MAC",
    xHandle: "@CoachSattCMU",
    priorityTier: "Tier 2",
    stage: "dm_sent",
    daysInStage: 3,
    xActivity: "moderate",
    notes: "Sent personalized DM referencing his OL clinic post. Following up Friday.",
  },

  // Stage 5: Responded (1 coach)
  {
    id: "c15",
    name: "Coach Travis Reeve",
    title: "Head Coach",
    schoolName: "Minnesota State Mankato",
    schoolId: "minnesota-state-mankato",
    division: "D2",
    conference: "NSIC",
    xHandle: "@CoachReeveMSU",
    priorityTier: "Tier 3",
    stage: "responded",
    daysInStage: 2,
    xActivity: "active",
    notes: "Responded positively! Asked for Jacob&apos;s hudl link and GPA. Send follow-up.",
  },
];

// ── Helper Functions ─────────────────────────────────────────────────────────

function getTierBadgeVariant(tier: PriorityTier): "tier1" | "tier2" | "tier3" {
  if (tier === "Tier 1") return "tier1";
  if (tier === "Tier 2") return "tier2";
  return "tier3";
}

function getActivityDotColor(activity: XActivity): string {
  if (activity === "active") return "bg-green-400";
  if (activity === "moderate") return "bg-yellow-400";
  return "bg-gray-400";
}

function getActivityLabel(activity: XActivity): string {
  if (activity === "active") return "Active on X";
  if (activity === "moderate") return "Moderately active";
  return "Inactive on X";
}

function getNextStageLabel(currentStage: PipelineStage): string | null {
  const idx = STAGES.findIndex((s) => s.id === currentStage);
  if (idx < STAGES.length - 1) return STAGES[idx + 1].label;
  return null;
}

// ── Component ────────────────────────────────────────────────────────────────

export function CoachPipeline() {
  const [coaches, setCoaches] = useState<PipelineCoach[]>(PIPELINE_COACHES);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<PriorityTier | "all">("all");
  const [collapsedStages, setCollapsedStages] = useState<Set<PipelineStage>>(
    new Set()
  );
  const [notesModal, setNotesModal] = useState<PipelineCoach | null>(null);

  // Filter coaches
  const filteredCoaches = useMemo(() => {
    return coaches.filter((coach) => {
      const matchesSearch =
        searchQuery === "" ||
        coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.schoolName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier =
        tierFilter === "all" || coach.priorityTier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [coaches, searchQuery, tierFilter]);

  // Group by stage
  const coachesByStage = useMemo(() => {
    const grouped: Record<PipelineStage, PipelineCoach[]> = {
      discovered: [],
      followed: [],
      engaged: [],
      dm_sent: [],
      responded: [],
      relationship: [],
    };
    for (const coach of filteredCoaches) {
      grouped[coach.stage].push(coach);
    }
    return grouped;
  }, [filteredCoaches]);

  // Stats
  const totalCoaches = filteredCoaches.length;
  const stageCounts = useMemo(() => {
    return STAGES.map((stage) => ({
      ...stage,
      count: coachesByStage[stage.id].length,
    }));
  }, [coachesByStage]);

  // Funnel percentages
  const funnelStats = useMemo(() => {
    const allCoaches = coaches;
    const _discovered = allCoaches.filter(
      (c) => c.stage === "discovered"
    ).length;
    void _discovered;
    const followed = allCoaches.filter((c) => c.stage === "followed").length;
    const engaged = allCoaches.filter((c) => c.stage === "engaged").length;
    const dmSent = allCoaches.filter((c) => c.stage === "dm_sent").length;
    const responded = allCoaches.filter((c) => c.stage === "responded").length;
    const relationship = allCoaches.filter(
      (c) => c.stage === "relationship"
    ).length;

    const total = allCoaches.length;
    const pastDiscovered = followed + engaged + dmSent + responded + relationship;
    const pastFollowed = engaged + dmSent + responded + relationship;
    const pastEngaged = dmSent + responded + relationship;
    const pastDM = responded + relationship;

    return [
      {
        label: "Follow Rate",
        value:
          total > 0
            ? Math.round((pastDiscovered / total) * 100)
            : 0,
        from: "Discovered",
        to: "Followed+",
      },
      {
        label: "Engage Rate",
        value:
          pastDiscovered > 0
            ? Math.round((pastFollowed / pastDiscovered) * 100)
            : 0,
        from: "Followed",
        to: "Engaged+",
      },
      {
        label: "DM Rate",
        value:
          pastFollowed > 0
            ? Math.round((pastEngaged / pastFollowed) * 100)
            : 0,
        from: "Engaged",
        to: "DM Sent+",
      },
      {
        label: "Response Rate",
        value:
          pastEngaged > 0
            ? Math.round((pastDM / pastEngaged) * 100)
            : 0,
        from: "DM Sent",
        to: "Responded+",
      },
    ];
  }, [coaches]);

  // Move coach to next stage
  function moveToNextStage(coachId: string) {
    setCoaches((prev) =>
      prev.map((coach) => {
        if (coach.id !== coachId) return coach;
        const stageIds = STAGES.map((s) => s.id);
        const currentIdx = stageIds.indexOf(coach.stage);
        if (currentIdx >= stageIds.length - 1) return coach;
        return {
          ...coach,
          stage: stageIds[currentIdx + 1],
          daysInStage: 0,
        };
      })
    );
  }

  // Toggle collapsed stage (mobile)
  function toggleStageCollapse(stageId: PipelineStage) {
    setCollapsedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Pipeline Summary Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">
                  {totalCoaches} Coaches in Pipeline
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {stageCounts.map((stage) => (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${stage.bgColor} ${stage.color}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${stage.dotColor}`}
                    />
                    {stage.label}: {stage.count}
                  </div>
                ))}
              </div>
            </div>

            {/* Funnel Stats */}
            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-3">
              {funnelStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-1 text-xs text-slate-500"
                >
                  <span className="font-medium text-slate-700">
                    {stat.from}
                  </span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-medium text-slate-700">{stat.to}</span>
                  <span className="ml-1 font-semibold text-slate-900">
                    {stat.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search coach name or school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={tierFilter}
            onChange={(e) =>
              setTierFilter(e.target.value as PriorityTier | "all")
            }
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="all">All Tiers</option>
            <option value="Tier 1">Tier 1 - Reach</option>
            <option value="Tier 2">Tier 2 - Target</option>
            <option value="Tier 3">Tier 3 - Safety</option>
          </select>
        </div>
      </div>

      {/* Desktop: Horizontal Kanban Columns */}
      <div className="hidden lg:block">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <div
              key={stage.id}
              className={`flex min-w-[260px] flex-col rounded-lg border ${stage.borderColor}`}
            >
              {/* Column Header */}
              <div
                className={`flex items-center justify-between rounded-t-lg px-3 py-2 ${stage.headerBg}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${stage.dotColor}`}
                  />
                  <span className={`text-sm font-semibold ${stage.color}`}>
                    {stage.label}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${stage.bgColor} ${stage.color}`}
                >
                  {coachesByStage[stage.id].length}
                </span>
              </div>

              {/* Column Body */}
              <div className="flex flex-1 flex-col gap-2 p-2">
                {coachesByStage[stage.id].length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No coaches in this stage
                  </div>
                ) : (
                  coachesByStage[stage.id].map((coach) => (
                    <CoachCard
                      key={coach.id}
                      coach={coach}
                      onMoveNext={() => moveToNextStage(coach.id)}
                      onViewNotes={() => setNotesModal(coach)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Vertical Stacked Sections */}
      <div className="flex flex-col gap-3 lg:hidden">
        {STAGES.map((stage) => {
          const isCollapsed = collapsedStages.has(stage.id);
          const stageCoaches = coachesByStage[stage.id];
          return (
            <div
              key={stage.id}
              className={`rounded-lg border ${stage.borderColor}`}
            >
              {/* Section Header - tappable */}
              <button
                onClick={() => toggleStageCollapse(stage.id)}
                className={`flex w-full items-center justify-between rounded-t-lg px-4 py-3 ${stage.headerBg}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${stage.dotColor}`}
                  />
                  <span className={`text-sm font-semibold ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${stage.bgColor} ${stage.color}`}
                  >
                    {stageCoaches.length}
                  </span>
                </div>
                {isCollapsed ? (
                  <ChevronDown className={`h-4 w-4 ${stage.color}`} />
                ) : (
                  <ChevronUp className={`h-4 w-4 ${stage.color}`} />
                )}
              </button>

              {/* Section Body */}
              {!isCollapsed && (
                <div className="flex flex-col gap-2 p-2">
                  {stageCoaches.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No coaches in this stage
                    </div>
                  ) : (
                    stageCoaches.map((coach) => (
                      <CoachCard
                        key={coach.id}
                        coach={coach}
                        onMoveNext={() => moveToNextStage(coach.id)}
                        onViewNotes={() => setNotesModal(coach)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes Modal */}
      {notesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{notesModal.name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setNotesModal(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-slate-500">
                    School
                  </span>
                  <p className="text-sm">{notesModal.schoolName}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500">
                    Stage
                  </span>
                  <p className="text-sm capitalize">
                    {notesModal.stage.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500">
                    Notes
                  </span>
                  <p className="text-sm text-slate-700">{notesModal.notes}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNotesModal(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Coach Card Sub-component ─────────────────────────────────────────────────

interface CoachCardProps {
  coach: PipelineCoach;
  onMoveNext: () => void;
  onViewNotes: () => void;
}

function CoachCard({ coach, onMoveNext, onViewNotes }: CoachCardProps) {
  const nextStageLabel = getNextStageLabel(coach.stage);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-3">
        {/* Coach name + activity dot */}
        <div className="mb-1 flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 flex-shrink-0 rounded-full ${getActivityDotColor(coach.xActivity)}`}
                title={getActivityLabel(coach.xActivity)}
              />
              <h4 className="truncate text-sm font-semibold text-slate-900">
                {coach.name}
              </h4>
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {coach.title}
            </p>
          </div>
        </div>

        {/* School + tier badge */}
        <div className="mb-2 flex items-center gap-1.5">
          <span className="truncate text-xs font-medium text-slate-700">
            {coach.schoolName}
          </span>
          <Badge
            variant={getTierBadgeVariant(coach.priorityTier)}
            className="flex-shrink-0 text-[10px] px-1.5 py-0"
          >
            {coach.priorityTier}
          </Badge>
        </div>

        {/* Division + Conference */}
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
          <span>{coach.division}</span>
          <span className="text-slate-300">|</span>
          <span>{coach.conference}</span>
        </div>

        {/* X Handle */}
        <div className="mb-2 text-xs text-blue-600">{coach.xHandle}</div>

        {/* Days in stage */}
        <div className="mb-3 text-xs text-slate-400">
          {coach.daysInStage} {coach.daysInStage === 1 ? "day" : "days"} in
          stage
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5">
          {nextStageLabel && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 flex-1 gap-1 text-xs"
              onClick={onMoveNext}
            >
              <ChevronRight className="h-3 w-3" />
              {nextStageLabel}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={onViewNotes}
          >
            <StickyNote className="h-3 w-3" />
            Notes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
