"use client";

import { useState, useMemo, useCallback } from "react";
import {
  SCPageHeader,
  SCStatCard,
  SCGlassCard,
  SCBadge,
  SCButton,
  SCInput,
} from "@/components/sc";
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

function getTierBadgeVariant(tier: string): "danger" | "warning" | "success" | "default" {
  if (tier.includes("1")) return "danger";
  if (tier.includes("2")) return "warning";
  if (tier.includes("3")) return "success";
  return "default";
}

function getSequenceBadgeVariant(sequence: string): "info" | "primary" | "warning" | "success" | "default" {
  if (sequence.includes("Initial")) return "info";
  if (sequence.includes("Follow-Up 1")) return "primary";
  if (sequence.includes("Follow-Up 2")) return "primary";
  if (sequence.includes("Trigger")) return "warning";
  if (sequence.includes("Relationship")) return "success";
  return "default";
}

function highlightVariables(text: string): React.ReactNode[] {
  const parts = text.split(/(\{[^}]+\})/g);
  return parts.map((part, i) => {
    if (part.startsWith("{") && part.endsWith("}")) {
      return (
        <span
          key={i}
          className="inline-flex items-center rounded bg-sc-primary/10 text-sc-primary px-1.5 py-0.5 text-xs font-mono font-bold"
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
    .replace(/\{PLAYER_NAME\}/g, "Jacob Rodgers")
    .replace(/\{POSITION\}/g, "Offensive Line")
    .replace(/\{HUDL_LINK\}/g, "hudl.com/profile/jacob-rogers")
    .replace(/\{NCSA_LINK\}/g, "ncsa.com/jacob-rogers")
    .replace(/\{GPA\}/g, "3.8")
    .replace(/\{CLASS_YEAR\}/g, "2029")
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
    { label: "Initial Outreach", day: "Day 0", icon: "send", color: "bg-blue-500" },
    { label: "Follow-Up 1", day: "Day 7", icon: "mail", color: "bg-indigo-500" },
    { label: "Follow-Up 2", day: "Day 14", icon: "chat", color: "bg-violet-500" },
    { label: "Follow-Up 3", day: "Day 21", icon: "groups", color: "bg-purple-500" },
  ];

  return (
    <SCGlassCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[18px] text-blue-400">account_tree</span>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          DM Sequence Timeline
        </p>
      </div>
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-1 flex-shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`${step.color} rounded-full p-2 text-white shadow-lg`}>
                <span className="material-symbols-outlined text-[16px]">{step.icon}</span>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-white">{step.label}</p>
                <p className="text-[10px] text-slate-500">{step.day}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex items-center gap-0.5 mx-1 -mt-6">
                <div className="h-0.5 w-6 sm:w-10 bg-white/10" />
                <span className="material-symbols-outlined text-[12px] text-slate-600">arrow_forward</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-2.5">
        <span className="material-symbols-outlined text-[16px] text-yellow-500">bolt</span>
        <div>
          <p className="text-xs font-bold text-yellow-500">Trigger-Based DMs</p>
          <p className="text-[10px] text-yellow-500/60">
            Sent when specific events occur (coach follows, game highlights, camp announcements)
          </p>
        </div>
      </div>
    </SCGlassCard>
  );
}

function QuickPersonalizePanel({
  onPersonalize,
}: {
  onPersonalize: (schoolName: string, coachLast: string) => void;
}) {
  const [selectedSchool, setSelectedSchool] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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
    <SCGlassCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[18px] text-blue-400">target</span>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Quick Personalize
        </p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
            Select a School / Target
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between rounded-lg border border-sc-border bg-white/5 px-3 py-2 text-sm text-left hover:border-sc-primary/30 transition-colors"
            >
              <span className={selectedSchool ? "text-white" : "text-slate-500"}>
                {selectedSchool || "Choose a school..."}
              </span>
              <span className="material-symbols-outlined text-[16px] text-slate-500">expand_more</span>
            </button>
            {isOpen && (
              <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-sc-border bg-sc-surface shadow-2xl">
                {schools.map((school) => (
                  <button
                    key={school.name}
                    type="button"
                    onClick={() => handleSelect(school.name)}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-sc-primary/10 transition-colors border-b border-sc-border last:border-0"
                  >
                    {school.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedSchool && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
              <p className="text-xs font-bold text-emerald-500">Variables will be auto-filled</p>
            </div>
            <div className="space-y-0.5 text-[11px] text-emerald-400/70">
              <p>{"{SCHOOL_NAME}"} → {selectedSchool}</p>
              <p>{"{COACH_LAST_NAME}"} → Coach</p>
            </div>
          </div>
        )}
      </div>
    </SCGlassCard>
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
    <SCGlassCard className="p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-sm font-bold text-white">{dm.name}</p>
        <div className="flex gap-1.5 flex-shrink-0">
          <SCBadge variant={getSequenceBadgeVariant(dm.sequence)}>{dm.sequence}</SCBadge>
          <SCBadge variant={getTierBadgeVariant(dm.tier)}>{dm.tier}</SCBadge>
        </div>
      </div>

      {dm.trigger && (
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span className="material-symbols-outlined text-[14px] text-yellow-500">bolt</span>
          <span>{dm.trigger}</span>
        </div>
      )}

      {dm.waitDays && dm.waitDays > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span className="material-symbols-outlined text-[14px] text-slate-500">schedule</span>
          <span>Wait {dm.waitDays} days after previous step</span>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-sc-border bg-white/5 p-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
          />
          <div className="flex gap-2">
            <SCButton size="sm" variant="primary" onClick={() => setIsEditing(false)}>
              Save
            </SCButton>
            <SCButton
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditContent(dm.template);
                setIsEditing(false);
              }}
            >
              Cancel
            </SCButton>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl bg-white/5 border border-sc-border p-4">
          <div className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
            {personalizedSchool ? (
              <span>{displayTemplate}</span>
            ) : (
              highlightVariables(editContent)
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <SCButton variant="secondary" size="sm" className="flex-1" onClick={handleCopy}>
          {copied ? (
            <span className="material-symbols-outlined text-[14px] text-emerald-500">check</span>
          ) : (
            <span className="material-symbols-outlined text-[14px]">content_copy</span>
          )}
          {copied ? "Copied!" : "Copy"}
        </SCButton>
        <SCButton
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <span className="material-symbols-outlined text-[14px]">close</span>
          ) : (
            <span className="material-symbols-outlined text-[14px]">edit</span>
          )}
          {isEditing ? "Close" : "Customize"}
        </SCButton>
      </div>
    </SCGlassCard>
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
    <div className="space-y-6">
      <SCPageHeader
        kicker="DM Templates"
        title="COLD DM COMMAND"
        subtitle="Strategic DM outreach templates and tracking"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SCStatCard label="Total Templates" value={String(stats.total)} icon="mail" />
        <SCGlassCard className="p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">By Sequence</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(stats.bySequence).map(([seq, count]) => (
              <SCBadge key={seq} variant="default">{seq}: {count}</SCBadge>
            ))}
          </div>
        </SCGlassCard>
        <SCGlassCard className="col-span-2 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">By Tier</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(stats.byTier).map(([tier, count]) => (
              <SCBadge key={tier} variant={getTierBadgeVariant(tier)}>
                {tier}: {count}
              </SCBadge>
            ))}
          </div>
        </SCGlassCard>
      </div>

      {/* Sequence Visualizer */}
      <SequenceVisualizer />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <QuickPersonalizePanel onPersonalize={handlePersonalize} />

          {personalizedSchool && (
            <SCGlassCard className="p-4 border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
                <p className="text-sm font-bold text-emerald-500">Personalized Preview Active</p>
              </div>
              <p className="text-xs text-slate-500">
                All DM templates below are personalized for{" "}
                <span className="font-bold text-white">{personalizedSchool}</span>
              </p>
              <SCButton
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setPersonalizedSchool("");
                  setPersonalizedCoach("");
                }}
              >
                Clear Personalization
              </SCButton>
            </SCGlassCard>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sequence Tabs */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Sequence Step
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SEQUENCE_FILTERS.map((seq) => (
                <button
                  key={seq}
                  type="button"
                  onClick={() => setActiveSequence(seq)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                    activeSequence === seq
                      ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                      : "bg-white/5 border border-sc-border text-slate-500 hover:text-white hover:border-sc-primary/30"
                  }`}
                >
                  {seq}
                </button>
              ))}
            </div>
          </div>

          {/* Tier Filter */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Target Tier
            </p>
            <div className="flex gap-1.5">
              {TIER_FILTERS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setActiveTier(tier)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                    activeTier === tier
                      ? tier === "Tier 1"
                        ? "bg-red-500 text-white"
                        : tier === "Tier 2"
                          ? "bg-yellow-500 text-black"
                          : tier === "Tier 3"
                            ? "bg-emerald-500 text-white"
                            : "bg-sc-primary text-white"
                      : "bg-white/5 border border-sc-border text-slate-500 hover:text-white"
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
            <SCGlassCard className="py-12 text-center">
              <span className="material-symbols-outlined text-[40px] text-white/10">mail</span>
              <p className="mt-3 text-sm text-slate-500">
                No DM templates match your current filters
              </p>
              <SCButton
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setActiveSequence("All");
                  setActiveTier("All");
                }}
              >
                Reset Filters
              </SCButton>
            </SCGlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
