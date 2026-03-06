"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Mail,
  Copy,
  Edit3,
  Check,
  Clock,
  ArrowRight,
  Zap,
  Users,
  Send,
  ChevronDown,
  X,
  MessageSquare,
  Target,
  GitBranch,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { coldDMLibrary } from "@/lib/data/cold-dms";
import { scraperTargets } from "@/lib/data/scraper-targets";

// ─── Types ───────────────────────────────────────────────────────────────────

type SequenceFilter =
  | "All"
  | "Initial Outreach"
  | "Follow-Up 1"
  | "Follow-Up 2"
  | "Trigger-Based"
  | "Relationship";

const sequenceFilterMap: Record<SequenceFilter, string[]> = {
  "All": [],
  "Initial Outreach": ["initial"],
  "Follow-Up 1": ["follow_up_1"],
  "Follow-Up 2": ["follow_up_2", "follow_up_3"],
  "Trigger-Based": ["trigger"],
  "Relationship": ["relationship"],
};

const tierFilterMap: Record<string, string[]> = {
  "All": [],
  "Tier 1": ["Tier 1"],
  "Tier 2": ["Tier 2"],
  "Tier 3": ["Tier 3"],
};

type TierFilter = "All" | "Tier 1" | "Tier 2" | "Tier 3";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTierBadgeClasses(tier: string): string {
  if (tier.includes("1")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (tier.includes("2")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (tier.includes("3")) return "bg-green-100 text-green-700 border-green-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function getSequenceBadgeClasses(sequence: string): string {
  if (sequence.includes("Initial")) return "bg-blue-500 text-white border-blue-600";
  if (sequence.includes("Follow-Up 1")) return "bg-indigo-500 text-white border-indigo-600";
  if (sequence.includes("Follow-Up 2")) return "bg-violet-500 text-white border-violet-600";
  if (sequence.includes("Trigger")) return "bg-amber-500 text-white border-amber-600";
  if (sequence.includes("Relationship")) return "bg-emerald-500 text-white border-emerald-600";
  return "bg-slate-500 text-white border-slate-600";
}

function highlightVariables(text: string): React.ReactNode[] {
  const parts = text.split(/(\{[^}]+\})/g);
  return parts.map((part, i) => {
    if (part.startsWith("{") && part.endsWith("}")) {
      return (
        <span
          key={i}
          className="inline-flex items-center rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 text-xs font-mono font-semibold"
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function personalizeTemplate(
  template: string,
  schoolName: string,
  coachLastName: string
): string {
  return template
    .replace(/\{SCHOOL_NAME\}/g, schoolName)
    .replace(/\{COACH_LAST_NAME\}/g, coachLastName)
    .replace(/\{COACH_NAME\}/g, coachLastName)
    .replace(/\{PLAYER_NAME\}/g, "Jacob Rogers")
    .replace(/\{POSITION\}/g, "Offensive Line")
    .replace(/\{HUDL_LINK\}/g, "hudl.com/profile/jacob-rogers")
    .replace(/\{NCSA_LINK\}/g, "ncsa.com/jacob-rogers")
    .replace(/\{GPA\}/g, "3.8")
    .replace(/\{CLASS_YEAR\}/g, "2028")
    .replace(/\{HEIGHT_WEIGHT\}/g, '6\'4" 285')
    .replace(/\{HIGH_SCHOOL\}/g, "Pewaukee HS");
}

const SEQUENCE_FILTERS: SequenceFilter[] = [
  "All",
  "Initial Outreach",
  "Follow-Up 1",
  "Follow-Up 2",
  "Trigger-Based",
  "Relationship",
];

const TIER_FILTERS: TierFilter[] = ["All", "Tier 1", "Tier 2", "Tier 3"];

// ─── Sub-Components ──────────────────────────────────────────────────────────

function SequenceVisualizer() {
  const steps = [
    { label: "Initial Outreach", day: "Day 0", icon: Send, color: "bg-blue-500" },
    { label: "Follow-Up 1", day: "Day 7", icon: Mail, color: "bg-indigo-500" },
    { label: "Follow-Up 2", day: "Day 14", icon: MessageSquare, color: "bg-violet-500" },
    { label: "Follow-Up 3", day: "Day 21", icon: Users, color: "bg-purple-500" },
  ];

  return (
    <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-blue-500" />
          DM Sequence Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main sequence */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center gap-1 flex-shrink-0">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`${step.color} rounded-full p-2 text-white shadow-sm`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-800">
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-500">{step.day}</p>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex items-center gap-0.5 mx-1 -mt-6">
                    <div className="h-0.5 w-6 sm:w-10 bg-slate-300" />
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Trigger-based branch */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
          <Zap className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-800">
              Trigger-Based DMs
            </p>
            <p className="text-[10px] text-amber-600">
              Sent when specific events occur (coach follows, game highlights,
              camp announcements)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickPersonalizePanel({
  onPersonalize,
}: {
  onPersonalize: (schoolName: string, coachLast: string) => void;
}) {
  const [selectedSchool, setSelectedSchool] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Get unique school names from scraper targets
  const schools = useMemo(() => {
    const uniqueSchools: { name: string; handle: string }[] = [];
    const seen = new Set<string>();
    scraperTargets.forEach((target) => {
      if (target.type === "analyst" || !target.name) return;
      const name = target.name;
      if (!seen.has(name)) {
        seen.add(name);
        uniqueSchools.push({ name, handle: target.handle || "" });
      }
    });
    return uniqueSchools.slice(0, 30);
  }, []);

  function handleSelect(schoolName: string) {
    setSelectedSchool(schoolName);
    const parts = schoolName.split(" ");
    const coachLast = parts[parts.length - 1] || "Coach";
    onPersonalize(schoolName, coachLast);
    setIsOpen(false);
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-500" />
          Quick Personalize
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">
              Select a School / Target
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-left hover:border-slate-300 transition-colors"
              >
                <span className={selectedSchool ? "text-slate-900" : "text-slate-400"}>
                  {selectedSchool || "Choose a school..."}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {isOpen && (
                <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {schools.map((school) => (
                    <button
                      key={school.name}
                      type="button"
                      onClick={() => handleSelect(school.name)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                    >
                      {school.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedSchool && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Check className="h-3.5 w-3.5 text-green-600" />
                <p className="text-xs font-medium text-green-800">
                  Variables will be auto-filled
                </p>
              </div>
              <div className="space-y-0.5 text-[11px] text-green-700">
                <p>
                  {"{SCHOOL_NAME}"} → {selectedSchool}
                </p>
                <p>
                  {"{COACH_LAST_NAME}"} → Coach
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DMTemplateCard({
  dm,
  personalizedSchool,
  personalizedCoach,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dm: any;
  personalizedSchool: string;
  personalizedCoach: string;
}) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(dm.template);

  const displayTemplate = personalizedSchool
    ? personalizeTemplate(editContent, personalizedSchool, personalizedCoach)
    : editContent;

  function handleCopy() {
    navigator.clipboard.writeText(displayTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">{dm.name}</CardTitle>
          <div className="flex gap-1.5 flex-shrink-0">
            <div
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getSequenceBadgeClasses(dm.sequence)}`}
            >
              {dm.sequence}
            </div>
            <div
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getTierBadgeClasses(dm.tier)}`}
            >
              {dm.tier}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Trigger */}
        {dm.trigger && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Zap className="h-3 w-3 text-amber-500" />
            <span>{dm.trigger}</span>
          </div>
        )}

        {/* Wait days indicator */}
        {dm.waitDays && dm.waitDays > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-slate-500">
              Wait {dm.waitDays} days after previous step
            </span>
          </div>
        )}

        {/* Message bubble */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
              className="text-sm font-mono"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setIsEditing(false)}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditContent(dm.template);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative rounded-2xl rounded-tl-sm bg-slate-100 border border-slate-200 p-4">
            <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {personalizedSchool ? (
                <span>{displayTemplate}</span>
              ) : (
                highlightVariables(editContent)
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <X className="h-3 w-3" />
            ) : (
              <Edit3 className="h-3 w-3" />
            )}
            {isEditing ? "Close" : "Customize"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ColdDMEngine() {
  const [activeSequence, setActiveSequence] = useState<SequenceFilter>("All");
  const [activeTier, setActiveTier] = useState<TierFilter>("All");
  const [personalizedSchool, setPersonalizedSchool] = useState("");
  const [personalizedCoach, setPersonalizedCoach] = useState("");

  const library = coldDMLibrary;

  const handlePersonalize = useCallback(
    (schoolName: string, coachLast: string) => {
      setPersonalizedSchool(schoolName);
      setPersonalizedCoach(coachLast);
    },
    []
  );

  // Filtered items
  const filteredItems = useMemo(() => {
    return library.filter((dm) => {
      if (activeSequence !== "All") {
        const allowedSequences = sequenceFilterMap[activeSequence];
        if (!allowedSequences.includes(dm.sequence)) return false;
      }
      if (activeTier !== "All") {
        const allowedTiers = tierFilterMap[activeTier] || [];
        if (!allowedTiers.includes(dm.tier) && dm.tier !== "all") return false;
      }
      return true;
    });
  }, [library, activeSequence, activeTier]);

  // Stats
  const stats = useMemo(() => {
    const bySequence: Record<string, number> = {};
    const byTier: Record<string, number> = {};
    library.forEach((dm) => {
      bySequence[dm.sequence] = (bySequence[dm.sequence] || 0) + 1;
      byTier[dm.tier] = (byTier[dm.tier] || 0) + 1;
    });
    return { total: library.length, bySequence, byTier };
  }, [library]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Cold DM Command Center
              </h1>
              <p className="text-sm text-slate-500">
                Strategic DM outreach templates and tracking
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {stats.total}
                </p>
                <p className="text-[11px] text-slate-500">Total Templates</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-[11px] text-slate-500 mb-1">By Sequence</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(stats.bySequence).map(([seq, count]) => (
                  <Badge key={seq} variant="secondary" className="text-[10px]">
                    {seq}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="text-[11px] text-slate-500 mb-1">By Tier</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(stats.byTier).map(([tier, count]) => (
                  <div
                    key={tier}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getTierBadgeClasses(tier)}`}
                  >
                    {tier}: {count}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sequence Visualizer */}
        <div className="mb-6">
          <SequenceVisualizer />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Personalize */}
            <QuickPersonalizePanel onPersonalize={handlePersonalize} />

            {/* Personalized preview */}
            {personalizedSchool && (
              <Card className="border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Personalized Preview Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500">
                    All DM templates below are personalized for{" "}
                    <span className="font-semibold text-slate-700">
                      {personalizedSchool}
                    </span>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => {
                      setPersonalizedSchool("");
                      setPersonalizedCoach("");
                    }}
                  >
                    Clear Personalization
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main content */}
          <div className="lg:col-span-8 space-y-4">
            {/* Sequence Tabs */}
            <div>
              <div className="text-xs font-medium text-slate-500 mb-2">
                Sequence Step
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SEQUENCE_FILTERS.map((seq) => (
                  <button
                    key={seq}
                    type="button"
                    onClick={() => setActiveSequence(seq)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      activeSequence === seq
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {seq}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier Filter */}
            <div>
              <div className="text-xs font-medium text-slate-500 mb-2">
                Target Tier
              </div>
              <div className="flex gap-1.5">
                {TIER_FILTERS.map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setActiveTier(tier)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      activeTier === tier
                        ? tier === "Tier 1"
                          ? "bg-purple-500 text-white"
                          : tier === "Tier 2"
                            ? "bg-blue-500 text-white"
                            : tier === "Tier 3"
                              ? "bg-green-500 text-white"
                              : "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* DM Template Cards */}
            <div className="space-y-4">
              {filteredItems.map((dm) => (
                <DMTemplateCard
                  key={dm.id}
                  dm={dm}
                  personalizedSchool={personalizedSchool}
                  personalizedCoach={personalizedCoach}
                />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <Mail className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  No DM templates match your current filters
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setActiveSequence("All");
                    setActiveTier("All");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
