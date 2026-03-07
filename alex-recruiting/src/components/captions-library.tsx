"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Copy,
  Check,
  FileText,
  Film,
  Camera,
  Image,
  Type,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Hash,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { captionsLibrary, getCaptionsByPillar } from "@/lib/data/captions-library";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Caption {
  id: string;
  title: string;
  fullCaption: string;
  pillar: string;
  hashtags: string[];
  mediaType: string;
  estimatedEngagement: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PILLAR_TABS = ["All", "Performance", "Work Ethic", "Character"] as const;

const PILLAR_KEY_MAP: Record<string, string> = {
  Performance: "performance",
  "Work Ethic": "work_ethic",
  Character: "character",
};

const MEDIA_TYPES = [
  { label: "All", value: "all", icon: FileText },
  { label: "Film Clip", value: "Film Clip", icon: Film },
  { label: "Training Video", value: "Training Video", icon: Camera },
  { label: "Photo", value: "Photo", icon: Image },
  { label: "Graphic", value: "Graphic", icon: Image },
  { label: "Text Only", value: "Text Only", icon: Type },
] as const;

const ENGAGEMENT_LEVELS = [
  { label: "All", value: "all", color: "" },
  { label: "Viral", value: "Viral", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { label: "High", value: "High", color: "bg-green-100 text-green-800 border-green-300" },
  { label: "Medium", value: "Medium", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { label: "Low", value: "Low", color: "bg-slate-100 text-slate-600 border-slate-300" },
] as const;

const PILLAR_BADGE_CONFIG: Record<string, string> = {
  performance: "bg-blue-100 text-blue-800",
  work_ethic: "bg-orange-100 text-orange-800",
  character: "bg-green-100 text-green-800",
};

function getEngagementBadgeClass(level: string): string {
  switch (level) {
    case "Viral":
      return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    case "High":
      return "bg-green-100 text-green-800 border border-green-300";
    case "Medium":
      return "bg-blue-100 text-blue-800 border border-blue-300";
    case "Low":
      return "bg-slate-100 text-slate-600 border border-slate-300";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getMediaIcon(mediaType: string) {
  switch (mediaType) {
    case "Film Clip":
      return Film;
    case "Training Video":
      return Camera;
    case "Photo":
      return Image;
    case "Graphic":
      return Image;
    case "Text Only":
      return Type;
    default:
      return FileText;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CaptionsLibrary() {
  const [activePillar, setActivePillar] = useState<string>("All");
  const [mediaFilter, setMediaFilter] = useState<string>("all");
  const [engagementFilter, setEngagementFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allCaptions: Caption[] = captionsLibrary;

  // ── Filtered captions ───────────────────────────────────────────────────

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

  // ── Stats ───────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const byPillar: Record<string, number> = {};
    const byEngagement: Record<string, number> = {};

    for (const c of allCaptions) {
      byPillar[c.pillar] = (byPillar[c.pillar] || 0) + 1;
      byEngagement[c.estimatedEngagement] = (byEngagement[c.estimatedEngagement] || 0) + 1;
    }

    return { total: allCaptions.length, byPillar, byEngagement };
  }, [allCaptions]);

  // ── Copy handler ────────────────────────────────────────────────────────

  async function handleCopy(caption: Caption) {
    const text = `${caption.fullCaption}\n\n${caption.hashtags.map((h) => `#${h}`).join(" ")}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(caption.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // ── Pillar label ────────────────────────────────────────────────────────

  function getPillarLabel(pillar: string): string {
    switch (pillar) {
      case "performance":
        return "Performance";
      case "work_ethic":
        return "Work Ethic";
      case "character":
        return "Character";
      default:
        return pillar;
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-purple-500" />
            Captions Library
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {stats.total} ready-to-post captions across all content pillars
          </p>
        </div>
        {copiedId && (
          <div className="flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-sm font-medium text-green-700 animate-in fade-in">
            <Check className="h-4 w-4" />
            Copied to clipboard!
          </div>
        )}
      </div>

      {/* ── Quick Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-slate-500">Total Captions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-blue-600">{stats.byPillar["performance"] || 0}</p>
            <p className="text-xs text-slate-500">Performance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-orange-600">{stats.byPillar["work_ethic"] || 0}</p>
            <p className="text-xs text-slate-500">Work Ethic</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-green-600">{stats.byPillar["character"] || 0}</p>
            <p className="text-xs text-slate-500">Character</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-1">
              {Object.entries(stats.byEngagement).map(([level, count]) => (
                <Badge key={level} className={cn("text-xs", getEngagementBadgeClass(level))}>
                  {level}: {count}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">By Engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search captions, hashtags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Pillar Tabs */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Content Pillar</p>
            <Tabs value={activePillar} onValueChange={setActivePillar}>
              <TabsList>
                {PILLAR_TABS.map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="text-xs">
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Media Type */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Media Type</p>
            <div className="flex flex-wrap gap-2">
              {MEDIA_TYPES.map((mt) => {
                const Icon = mt.icon;
                return (
                  <Button
                    key={mt.value}
                    variant={mediaFilter === mt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMediaFilter(mt.value)}
                    className="text-xs"
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {mt.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Engagement Level */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Engagement Level
            </p>
            <div className="flex gap-2">
              {ENGAGEMENT_LEVELS.map((el) => (
                <Button
                  key={el.value}
                  variant={engagementFilter === el.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEngagementFilter(el.value)}
                  className={cn(
                    "text-xs",
                    engagementFilter === el.value && el.value !== "all" && el.color
                  )}
                >
                  {el.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Results Count ───────────────────────────────────────────────── */}
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700">{filteredCaptions.length}</span> captions
      </p>

      {/* ── Caption Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCaptions.map((caption) => {
          const MediaIcon = getMediaIcon(caption.mediaType);
          const charCount = caption.fullCaption.length;

          return (
            <Card key={caption.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{caption.title}</CardTitle>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        PILLAR_BADGE_CONFIG[caption.pillar] || "bg-slate-100 text-slate-600"
                      )}
                    >
                      {getPillarLabel(caption.pillar)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Caption Preview (dark box like X post) */}
                <div className="rounded-lg bg-slate-900 p-4 text-sm text-slate-100 leading-relaxed whitespace-pre-wrap font-mono">
                  {caption.fullCaption}
                </div>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1.5">
                  {caption.hashtags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    >
                      <Hash className="h-2.5 w-2.5 mr-0.5" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Meta Row */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <MediaIcon className="h-3 w-3 mr-1" />
                      {caption.mediaType}
                    </Badge>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                        getEngagementBadgeClass(caption.estimatedEngagement)
                      )}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {caption.estimatedEngagement}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span>{charCount} chars</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleCopy(caption)}
                  >
                    {copiedId === caption.id ? (
                      <><Check className="h-3 w-3 mr-1" /> Copied!</>
                    ) : (
                      <><Copy className="h-3 w-3 mr-1" /> Copy Full Caption</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {filteredCaptions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No captions match your filters</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
