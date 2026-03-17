"use client";

import { useState, useMemo } from "react";
import {
  SCPageHeader,
  SCGlassCard,
  SCStatCard,
  SCBadge,
  SCButton,
  SCInput,
} from "@/components/sc";
import { hooksLibrary, getHooksByCategory, getViralHooks } from "@/lib/data/hooks-library";

interface Hook {
  id: string;
  text: string;
  category: string;
  pillar: string;
  viralScore: number;
  bestPairedWith: string;
}

const CATEGORIES = [
  "All", "Film", "Training", "Game Day", "Character",
  "Milestone", "Camp", "Motivational", "Viral Format",
] as const;

const PILLAR_CONFIG: Record<string, { label: string; variant: "info" | "warning" | "success" }> = {
  performance: { label: "Performance", variant: "info" },
  work_ethic: { label: "Work Ethic", variant: "warning" },
  character: { label: "Character", variant: "success" },
};

const VIRAL_SCORE_OPTIONS = [1, 3, 5, 7, 9] as const;

export default function HooksPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const [minViralScore, setMinViralScore] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allHooks: Hook[] = hooksLibrary;
  const viralPicks: Hook[] = getViralHooks(8).slice(0, 5);

  const filteredHooks = useMemo(() => {
    let hooks = activeCategory === "All" ? allHooks : getHooksByCategory(activeCategory);
    if (activePillar) {
      hooks = hooks.filter((h) => h.pillar === activePillar);
    }
    if (minViralScore > 1) {
      hooks = hooks.filter((h) => h.viralScore >= minViralScore);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      hooks = hooks.filter((h) => h.text.toLowerCase().includes(q));
    }
    return hooks;
  }, [allHooks, activeCategory, activePillar, minViralScore, search]);

  const stats = useMemo(() => {
    const avgViral =
      allHooks.length > 0
        ? (allHooks.reduce((sum, h) => sum + h.viralScore, 0) / allHooks.length).toFixed(1)
        : "0";
    const categoryBreakdown: Record<string, number> = {};
    for (const h of allHooks) {
      categoryBreakdown[h.category] = (categoryBreakdown[h.category] || 0) + 1;
    }
    return { total: allHooks.length, avgViral, categoryBreakdown };
  }, [allHooks]);

  async function handleCopy(hook: Hook) {
    await navigator.clipboard.writeText(hook.text);
    setCopiedId(hook.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function renderFlames(score: number) {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className={`material-symbols-outlined text-[14px] ${
              i < score ? "text-orange-500" : "text-white/10"
            }`}
          >
            local_fire_department
          </span>
        ))}
        <span className="ml-1 text-xs font-bold text-slate-400">{score}/10</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SCPageHeader
        kicker="Opening Lines"
        title="HOOK TEMPLATES"
        subtitle={`${stats.total} hooks ready to use — find the perfect opener for every post`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SCStatCard label="Total Hooks" value={String(stats.total)} icon="bolt" />
        <SCStatCard label="Avg Viral Score" value={stats.avgViral} icon="local_fire_department" />
        <SCGlassCard className="col-span-2 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Hooks per Category</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
              <SCBadge key={cat} variant="default">{cat}: {count}</SCBadge>
            ))}
          </div>
        </SCGlassCard>
      </div>

      {/* Viral Picks */}
      <SCGlassCard variant="broadcast" className="p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-yellow-500">auto_awesome</span>
          Viral Picks — Top 5 Highest Scoring Hooks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {viralPicks.map((hook) => (
            <SCGlassCard key={hook.id} className="p-3">
              <p className="text-sm font-bold text-white leading-snug mb-2 line-clamp-3">
                {hook.text}
              </p>
              <div className="flex items-center justify-between mb-2">
                <SCBadge variant={PILLAR_CONFIG[hook.pillar]?.variant || "default"}>
                  {PILLAR_CONFIG[hook.pillar]?.label || hook.pillar}
                </SCBadge>
                <div className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px] text-orange-500">local_fire_department</span>
                  <span className="text-xs font-black text-orange-500">{hook.viralScore}</span>
                </div>
              </div>
              <SCButton
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => handleCopy(hook)}
              >
                {copiedId === hook.id ? (
                  <>
                    <span className="material-symbols-outlined text-[14px] text-emerald-400">check</span>
                    Copied
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    Copy
                  </>
                )}
              </SCButton>
            </SCGlassCard>
          ))}
        </div>
      </SCGlassCard>

      {/* Filters */}
      <SCGlassCard className="p-4 space-y-4">
        <SCInput
          icon="search"
          placeholder="Search hooks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                    : "bg-white/5 border border-sc-border text-slate-500 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Content Pillar</p>
          <div className="flex gap-2">
            <button
              onClick={() => setActivePillar(null)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activePillar === null
                  ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                  : "bg-white/5 border border-sc-border text-slate-500 hover:text-white"
              }`}
            >
              All
            </button>
            {Object.entries(PILLAR_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setActivePillar(activePillar === key ? null : key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activePillar === key
                    ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                    : "bg-white/5 border border-sc-border text-slate-500 hover:text-white"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Minimum Viral Score: {minViralScore}+
          </p>
          <div className="flex gap-2">
            {VIRAL_SCORE_OPTIONS.map((score) => (
              <button
                key={score}
                onClick={() => setMinViralScore(score)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  minViralScore === score
                    ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                    : "bg-white/5 border border-sc-border text-slate-500 hover:text-white"
                }`}
              >
                {score}+
              </button>
            ))}
          </div>
        </div>
      </SCGlassCard>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-bold text-white">{filteredHooks.length}</span> hooks
        </p>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span className="material-symbols-outlined text-[14px]">trending_up</span>
          Sorted by viral score
        </div>
      </div>

      {/* Hook Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHooks.map((hook) => (
          <SCGlassCard
            key={hook.id}
            className={`p-4 space-y-3 ${hook.viralScore >= 9 ? "border-yellow-500/30" : ""}`}
          >
            <p className="text-sm font-bold text-white leading-relaxed">{hook.text}</p>

            <div className="flex items-center justify-between">
              <SCBadge variant={PILLAR_CONFIG[hook.pillar]?.variant || "default"}>
                {PILLAR_CONFIG[hook.pillar]?.label || hook.pillar}
              </SCBadge>
              <SCBadge variant="default">{hook.category}</SCBadge>
            </div>

            {renderFlames(hook.viralScore)}

            <p className="text-xs text-slate-500">
              Best paired with: <span className="text-slate-300">{hook.bestPairedWith}</span>
            </p>

            <div className="flex gap-2 pt-1">
              <SCButton
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => handleCopy(hook)}
              >
                {copiedId === hook.id ? (
                  <>
                    <span className="material-symbols-outlined text-[14px] text-emerald-400">check</span>
                    Copied!
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    Copy
                  </>
                )}
              </SCButton>
              <SCButton variant="primary" size="sm" className="flex-1">
                <span className="material-symbols-outlined text-[14px]">send</span>
                Use in Post
              </SCButton>
            </div>
          </SCGlassCard>
        ))}
      </div>

      {filteredHooks.length === 0 && (
        <SCGlassCard className="py-12 text-center">
          <span className="material-symbols-outlined text-[40px] text-white/10">search</span>
          <p className="text-sm text-slate-500 mt-3">No hooks match your filters</p>
          <p className="text-xs text-slate-600 mt-1">Try adjusting your search or filter criteria</p>
        </SCGlassCard>
      )}
    </div>
  );
}
