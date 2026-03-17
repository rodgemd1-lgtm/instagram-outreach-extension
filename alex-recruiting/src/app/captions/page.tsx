"use client";

import { useState, useMemo } from "react";
import {
  SCPageHeader,
  SCGlassCard,
  SCStatCard,
  SCBadge,
  SCButton,
  SCInput,
  SCTabs,
} from "@/components/sc";
import { captionsLibrary, getCaptionsByPillar } from "@/lib/data/captions-library";

interface Caption {
  id: string;
  title: string;
  fullCaption: string;
  pillar: string;
  hashtags: string[];
  mediaType: string;
  estimatedEngagement: string;
}

const PILLAR_TABS = [
  { label: "All", value: "All" },
  { label: "Performance", value: "Performance" },
  { label: "Work Ethic", value: "Work Ethic" },
  { label: "Character", value: "Character" },
];

const PILLAR_KEY_MAP: Record<string, string> = {
  Performance: "performance",
  "Work Ethic": "work_ethic",
  Character: "character",
};

const MEDIA_TYPES = [
  { label: "All", value: "all", icon: "description" },
  { label: "Film Clip", value: "Film Clip", icon: "movie" },
  { label: "Training Video", value: "Training Video", icon: "videocam" },
  { label: "Photo", value: "Photo", icon: "photo" },
  { label: "Graphic", value: "Graphic", icon: "image" },
  { label: "Text Only", value: "Text Only", icon: "text_fields" },
] as const;

const ENGAGEMENT_LEVELS = [
  { label: "All", value: "all" },
  { label: "Viral", value: "Viral" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
] as const;

function getEngagementVariant(level: string): "warning" | "success" | "info" | "default" {
  switch (level) {
    case "Viral": return "warning";
    case "High": return "success";
    case "Medium": return "info";
    default: return "default";
  }
}

function getPillarVariant(pillar: string): "info" | "warning" | "success" | "default" {
  switch (pillar) {
    case "performance": return "info";
    case "work_ethic": return "warning";
    case "character": return "success";
    default: return "default";
  }
}

function getPillarLabel(pillar: string): string {
  switch (pillar) {
    case "performance": return "Performance";
    case "work_ethic": return "Work Ethic";
    case "character": return "Character";
    default: return pillar;
  }
}

function getMediaIcon(mediaType: string): string {
  switch (mediaType) {
    case "Film Clip": return "movie";
    case "Training Video": return "videocam";
    case "Photo": return "photo";
    case "Graphic": return "image";
    case "Text Only": return "text_fields";
    default: return "description";
  }
}

export default function CaptionsPage() {
  const [activePillar, setActivePillar] = useState<string>("All");
  const [mediaFilter, setMediaFilter] = useState<string>("all");
  const [engagementFilter, setEngagementFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allCaptions: Caption[] = captionsLibrary;

  const filteredCaptions = useMemo(() => {
    let captions =
      activePillar === "All"
        ? allCaptions
        : getCaptionsByPillar(PILLAR_KEY_MAP[activePillar] || activePillar.toLowerCase());

    if (mediaFilter !== "all") {
      captions = captions.filter((c) => c.mediaType === mediaFilter);
    }
    if (engagementFilter !== "all") {
      captions = captions.filter((c) => c.estimatedEngagement === engagementFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      captions = captions.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.fullCaption.toLowerCase().includes(q) ||
          c.hashtags.some((h) => h.toLowerCase().includes(q))
      );
    }
    return captions;
  }, [allCaptions, activePillar, mediaFilter, engagementFilter, search]);

  const stats = useMemo(() => {
    const byPillar: Record<string, number> = {};
    const byEngagement: Record<string, number> = {};
    for (const c of allCaptions) {
      byPillar[c.pillar] = (byPillar[c.pillar] || 0) + 1;
      byEngagement[c.estimatedEngagement] = (byEngagement[c.estimatedEngagement] || 0) + 1;
    }
    return { total: allCaptions.length, byPillar, byEngagement };
  }, [allCaptions]);

  async function handleCopy(caption: Caption) {
    const text = `${caption.fullCaption}\n\n${caption.hashtags.map((h) => `#${h}`).join(" ")}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(caption.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      <SCPageHeader
        kicker="Content Library"
        title="CAPTION LIBRARY"
        subtitle={`${stats.total} ready-to-post captions across all content pillars`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SCStatCard label="Total Captions" value={String(stats.total)} icon="description" />
        <SCStatCard label="Performance" value={String(stats.byPillar["performance"] || 0)} icon="sports_football" />
        <SCStatCard label="Work Ethic" value={String(stats.byPillar["work_ethic"] || 0)} icon="fitness_center" />
        <SCStatCard label="Character" value={String(stats.byPillar["character"] || 0)} icon="volunteer_activism" />
        <SCGlassCard className="p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">By Engagement</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(stats.byEngagement).map(([level, count]) => (
              <SCBadge key={level} variant={getEngagementVariant(level)}>
                {level}: {count}
              </SCBadge>
            ))}
          </div>
        </SCGlassCard>
      </div>

      {/* Filters */}
      <SCGlassCard className="p-4 space-y-4">
        <SCInput
          icon="search"
          placeholder="Search captions, hashtags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Content Pillar</p>
          <SCTabs tabs={PILLAR_TABS} activeTab={activePillar} onTabChange={setActivePillar} />
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Media Type</p>
          <div className="flex flex-wrap gap-2">
            {MEDIA_TYPES.map((mt) => (
              <button
                key={mt.value}
                onClick={() => setMediaFilter(mt.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  mediaFilter === mt.value
                    ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                    : "bg-white/5 border border-sc-border text-slate-500 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{mt.icon}</span>
                {mt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Engagement Level</p>
          <div className="flex gap-2">
            {ENGAGEMENT_LEVELS.map((el) => (
              <button
                key={el.value}
                onClick={() => setEngagementFilter(el.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  engagementFilter === el.value
                    ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                    : "bg-white/5 border border-sc-border text-slate-500 hover:text-white"
                }`}
              >
                {el.label}
              </button>
            ))}
          </div>
        </div>
      </SCGlassCard>

      <p className="text-sm text-slate-500">
        Showing <span className="font-bold text-white">{filteredCaptions.length}</span> captions
      </p>

      {/* Caption Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCaptions.map((caption) => {
          const charCount = caption.fullCaption.length;
          return (
            <SCGlassCard key={caption.id} className="p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-sm font-bold text-white">{caption.title}</p>
                <SCBadge variant={getPillarVariant(caption.pillar)}>
                  {getPillarLabel(caption.pillar)}
                </SCBadge>
              </div>

              <div className="rounded-lg bg-white/5 border border-sc-border p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono mb-3">
                {caption.fullCaption}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {caption.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-0.5 rounded-full bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30 px-2 py-0.5 text-[10px] font-bold"
                  >
                    <span className="material-symbols-outlined text-[10px]">tag</span>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SCBadge variant="default">
                    <span className="material-symbols-outlined text-[10px] mr-0.5">{getMediaIcon(caption.mediaType)}</span>
                    {caption.mediaType}
                  </SCBadge>
                  <SCBadge variant={getEngagementVariant(caption.estimatedEngagement)}>
                    <span className="material-symbols-outlined text-[10px] mr-0.5">auto_awesome</span>
                    {caption.estimatedEngagement}
                  </SCBadge>
                </div>
                <span className="text-xs text-slate-500">{charCount} chars</span>
              </div>

              <SCButton
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => handleCopy(caption)}
              >
                {copiedId === caption.id ? (
                  <>
                    <span className="material-symbols-outlined text-[14px] text-emerald-400">check</span>
                    Copied!
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    Copy Full Caption
                  </>
                )}
              </SCButton>
            </SCGlassCard>
          );
        })}
      </div>

      {filteredCaptions.length === 0 && (
        <SCGlassCard className="py-12 text-center">
          <span className="material-symbols-outlined text-[40px] text-white/10">search</span>
          <p className="text-sm text-slate-500 mt-3">No captions match your filters</p>
          <p className="text-xs text-slate-600 mt-1">Try adjusting your search or filter criteria</p>
        </SCGlassCard>
      )}
    </div>
  );
}
