"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Copy,
  Check,
  Flame,
  Sparkles,
  Send,
  Filter,
  BarChart3,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { hooksLibrary, getHooksByCategory, getViralHooks } from "@/lib/data/hooks-library";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Hook {
  id: string;
  text: string;
  category: string;
  pillar: string;
  viralScore: number;
  bestPairedWith: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  "All",
  "Film",
  "Training",
  "Game Day",
  "Character",
  "Milestone",
  "Camp",
  "Motivational",
  "Viral Format",
] as const;

const PILLAR_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; badgeBg: string }> = {
  performance: {
    label: "Performance",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeBg: "bg-blue-100 text-blue-800",
  },
  work_ethic: {
    label: "Work Ethic",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    badgeBg: "bg-orange-100 text-orange-800",
  },
  character: {
    label: "Character",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    badgeBg: "bg-green-100 text-green-800",
  },
};

const VIRAL_SCORE_OPTIONS = [1, 3, 5, 7, 9] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function HooksLibrary() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const [minViralScore, setMinViralScore] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allHooks: Hook[] = hooksLibrary;
  const viralPicks: Hook[] = getViralHooks(8).slice(0, 5);

  // ── Filtered hooks ──────────────────────────────────────────────────────

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

  // ── Stats ───────────────────────────────────────────────────────────────

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

  // ── Copy handler ────────────────────────────────────────────────────────

  async function handleCopy(hook: Hook) {
    await navigator.clipboard.writeText(hook.text);
    setCopiedId(hook.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // ── Flame renderer ──────────────────────────────────────────────────────

  function renderFlames(score: number) {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Flame
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < score ? "text-orange-500 fill-orange-500" : "text-slate-200"
            )}
          />
        ))}
        <span className="ml-1 text-xs font-medium text-slate-600">{score}/10</span>
      </div>
    );
  }

  // ── Pillar badge ────────────────────────────────────────────────────────

  function getPillarBadge(pillar: string) {
    const config = PILLAR_CONFIG[pillar];
    if (!config) return <Badge variant="secondary">{pillar}</Badge>;
    return (
      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", config.badgeBg)}>
        {config.label}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Hooks Library
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {stats.total} hooks ready to use — find the perfect opener for every post
          </p>
        </div>
        {copiedId && (
          <div className="flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-sm font-medium text-green-700 animate-in fade-in">
            <Check className="h-4 w-4" />
            Copied!
          </div>
        )}
      </div>

      {/* ── Stats Bar ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-slate-500">Total Hooks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgViral}</p>
              <p className="text-xs text-slate-500">Avg Viral Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Hooks per Category</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Viral Picks ─────────────────────────────────────────────────── */}
      <Card className="border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Viral Picks — Top 5 Highest Scoring Hooks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {viralPicks.map((hook) => (
              <Card
                key={hook.id}
                className="border-yellow-300 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-3">
                  <p className="text-sm font-medium leading-snug mb-2 line-clamp-3">
                    {hook.text}
                  </p>
                  <div className="flex items-center justify-between">
                    {getPillarBadge(hook.pillar)}
                    <div className="flex items-center gap-0.5">
                      <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                      <span className="text-xs font-bold text-orange-600">{hook.viralScore}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 h-7 text-xs"
                    onClick={() => handleCopy(hook)}
                  >
                    {copiedId === hook.id ? (
                      <><Check className="h-3 w-3 mr-1" /> Copied</>
                    ) : (
                      <><Copy className="h-3 w-3 mr-1" /> Copy</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search hooks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Tabs */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Category
            </p>
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="flex flex-wrap h-auto gap-1">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="text-xs px-2.5 py-1">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Pillar Filter */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Content Pillar</p>
            <div className="flex gap-2">
              <Button
                variant={activePillar === null ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePillar(null)}
                className="text-xs"
              >
                All
              </Button>
              {Object.entries(PILLAR_CONFIG).map(([key, config]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePillar(activePillar === key ? null : key)}
                  className={cn(
                    "text-xs",
                    activePillar === key && cn(config.bgColor, config.borderColor, config.color)
                  )}
                >
                  {config.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Viral Score Filter */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-400" /> Minimum Viral Score: {minViralScore}+
            </p>
            <div className="flex gap-2">
              {VIRAL_SCORE_OPTIONS.map((score) => (
                <Button
                  key={score}
                  variant={minViralScore === score ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMinViralScore(score)}
                  className="text-xs"
                >
                  {score}+
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Results count ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filteredHooks.length}</span> hooks
        </p>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <TrendingUp className="h-3 w-3" /> Sorted by viral score
        </div>
      </div>

      {/* ── Hook Cards Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHooks.map((hook) => {
          return (
            <Card
              key={hook.id}
              className={cn(
                "hover:shadow-md transition-shadow",
                hook.viralScore >= 9 && "border-yellow-300 ring-1 ring-yellow-200"
              )}
            >
              <CardContent className="p-4 space-y-3">
                {/* Hook Text */}
                <p className="text-sm font-medium leading-relaxed">{hook.text}</p>

                {/* Meta Row */}
                <div className="flex items-center justify-between">
                  {getPillarBadge(hook.pillar)}
                  <Badge variant="secondary" className="text-xs">
                    {hook.category}
                  </Badge>
                </div>

                {/* Viral Score */}
                {renderFlames(hook.viralScore)}

                {/* Best Paired With */}
                <p className="text-xs text-slate-400">
                  Best paired with: <span className="text-slate-600">{hook.bestPairedWith}</span>
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleCopy(hook)}
                  >
                    {copiedId === hook.id ? (
                      <><Check className="h-3 w-3 mr-1" /> Copied!</>
                    ) : (
                      <><Copy className="h-3 w-3 mr-1" /> Copy</>
                    )}
                  </Button>
                  <Button variant="default" size="sm" className="flex-1 text-xs">
                    <Send className="h-3 w-3 mr-1" /> Use in Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {filteredHooks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No hooks match your filters</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
