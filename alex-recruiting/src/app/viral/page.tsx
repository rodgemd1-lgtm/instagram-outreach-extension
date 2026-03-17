"use client";

import { useState, useMemo } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";
import { viralContentLibrary } from "@/lib/data/viral-content";

type CategoryFilter =
  | "All"
  | "Before/After"
  | "Day in the Life"
  | "Bold Statements"
  | "Questions"
  | "Threads"
  | "Lists"
  | "Film Breakdown"
  | "Gratitude";

type ViralMinFilter = 0 | 7 | 8 | 9 | 10;

const categoryFilterMap: Record<CategoryFilter, string> = {
  "All": "",
  "Before/After": "before_after",
  "Day in the Life": "day_in_the_life",
  "Bold Statements": "bold_statement",
  "Questions": "question_post",
  "Threads": "thread_format",
  "Lists": "list_post",
  "Film Breakdown": "film_breakdown",
  "Gratitude": "gratitude_milestone",
};

function getViralBadgeVariant(score: number): "danger" | "warning" | "primary" {
  if (score >= 10) return "danger";
  if (score >= 8) return "warning";
  return "primary";
}

function renderPostContent(text: string): React.ReactNode[] {
  const parts = text.split(/(#\w+|@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("#") || part.startsWith("@")) {
      return <span key={i} className="text-sc-primary">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

const CATEGORIES: CategoryFilter[] = [
  "All", "Before/After", "Day in the Life", "Bold Statements",
  "Questions", "Threads", "Lists", "Film Breakdown", "Gratitude",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ContentCard({ item, isTopPick }: { item: any; isTopPick?: boolean }) {
  const [copied, setCopied] = useState(false);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <SCGlassCard
      variant={isTopPick ? "broadcast" : "default"}
      className="p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isTopPick && (
            <span className="material-symbols-outlined text-[18px] text-yellow-500">star</span>
          )}
          <p className="text-sm font-black text-white truncate">{item.title}</p>
        </div>
        <SCBadge variant={getViralBadgeVariant(item.viralPotential)}>
          {item.viralPotential}/10
        </SCBadge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <SCBadge>{item.category}</SCBadge>
        {item.bestDay && (
          <SCBadge variant="info">
            {item.bestDay}
          </SCBadge>
        )}
        {item.mediaRequired && (
          <SCBadge variant="warning">Media Required</SCBadge>
        )}
      </div>

      {/* Format Template */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
          Format Template
        </p>
        <div className="rounded-lg bg-white/5 border border-sc-border p-3 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
          {item.template}
        </div>
      </div>

      {/* Example Post Preview */}
      {item.examplePost && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
            Example Post
          </p>
          <div className="rounded-xl border border-sc-border bg-[#16181c] p-4">
            <div className="flex gap-3">
              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-sc-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                JR
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-white text-sm">Jacob Rodgers</span>
                <span className="text-slate-500 text-xs ml-1.5">@JacobRodge52987</span>
              </div>
            </div>
            <div className="mt-2.5 text-[13px] leading-relaxed text-white whitespace-pre-wrap break-words">
              {renderPostContent(item.examplePost)}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <SCButton
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => handleCopy(item.examplePost || item.template)}
        >
          <span className="material-symbols-outlined text-[14px] mr-1">
            {copied ? "check" : "content_copy"}
          </span>
          {copied ? "Copied!" : "Copy Example"}
        </SCButton>
        <SCButton
          size="sm"
          className="flex-1"
          onClick={() => handleCopy(item.template)}
        >
          <span className="material-symbols-outlined text-[14px] mr-1">description</span>
          Use Template
        </SCButton>
      </div>
    </SCGlassCard>
  );
}

export default function ViralPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [viralMin, setViralMin] = useState<ViralMinFilter>(0);

  const library = viralContentLibrary;

  const filteredItems = useMemo(() => {
    return library.filter((item) => {
      if (activeCategory !== "All" && item.category !== categoryFilterMap[activeCategory]) return false;
      if (viralMin > 0 && item.viralPotential < viralMin) return false;
      return true;
    });
  }, [library, activeCategory, viralMin]);

  const topPicks = useMemo(() => {
    return [...library].sort((a, b) => b.viralPotential - a.viralPotential).slice(0, 5);
  }, [library]);

  const stats = useMemo(() => {
    const avgViral = library.length > 0
      ? (library.reduce((sum: number, item) => sum + item.viralPotential, 0) / library.length).toFixed(1)
      : "0";
    const categoryCount: Record<string, number> = {};
    library.forEach((item) => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });
    return { total: library.length, avgViral, categoryCount };
  }, [library]);

  return (
    <div className="space-y-6">
      <SCPageHeader
        title="VIRAL ENGINE"
        subtitle="Proven post formats that drive maximum engagement"
      />

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SCStatCard label="Total Formats" value={String(stats.total)} icon="description" />
        <SCStatCard label="Avg Viral Score" value={stats.avgViral} icon="trending_up" />
        <SCGlassCard className="p-4 col-span-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Formats by Category</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(stats.categoryCount).map(([cat, count]) => (
              <SCBadge key={cat}>{cat}: {count}</SCBadge>
            ))}
          </div>
        </SCGlassCard>
      </div>

      {/* Top Viral Picks */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[20px] text-yellow-500">star</span>
          <p className="text-lg font-black text-white">Top Viral Picks</p>
          <SCBadge variant="primary">Top 5</SCBadge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topPicks.map((item) => (
            <ContentCard key={item.id} item={item} isTopPick />
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Filter by Category</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                activeCategory === cat
                  ? "bg-sc-primary text-white"
                  : "bg-white/5 border border-sc-border text-slate-400 hover:text-white hover:border-slate-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Viral Potential Filter */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Minimum Viral Potential</p>
        <div className="flex gap-1.5">
          {([0, 7, 8, 9, 10] as ViralMinFilter[]).map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => setViralMin(score)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viralMin === score
                  ? score >= 9
                    ? "bg-red-500 text-white"
                    : score >= 7
                      ? "bg-yellow-500 text-white"
                      : "bg-sc-primary text-white"
                  : "bg-white/5 border border-sc-border text-slate-400 hover:text-white"
              }`}
            >
              {score === 0 ? "All" : `${score}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Content Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[32px] text-slate-600">local_fire_department</span>
          <p className="mt-2 text-sm text-slate-500">No formats match your current filters</p>
          <SCButton
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => { setActiveCategory("All"); setViralMin(0); }}
          >
            Reset Filters
          </SCButton>
        </div>
      )}
    </div>
  );
}
