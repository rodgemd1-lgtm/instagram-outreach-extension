"use client";

import { useState, useMemo } from "react";
import {
  Flame,
  Copy,
  FileText,
  Calendar,
  Camera,
  TrendingUp,
  Star,
  BarChart3,
  Sparkles,
  Check,
  Heart,
  Repeat2,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { viralContentLibrary } from "@/lib/data/viral-content";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getViralBadgeClasses(score: number): string {
  if (score >= 10) return "bg-red-500 text-white border-red-600";
  if (score >= 8) return "bg-orange-500 text-white border-orange-600";
  return "bg-yellow-500 text-white border-yellow-600";
}

function getViralLabel(score: number): string {
  if (score >= 10) return "🔥 " + score;
  if (score >= 8) return "⚡ " + score;
  return "✨ " + score;
}

function renderPostContent(text: string): React.ReactNode[] {
  const parts = text.split(/(#\w+|@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("#")) {
      return (
        <span key={i} className="text-blue-400">
          {part}
        </span>
      );
    }
    if (part.startsWith("@")) {
      return (
        <span key={i} className="text-blue-400">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const CATEGORIES: CategoryFilter[] = [
  "All",
  "Before/After",
  "Day in the Life",
  "Bold Statements",
  "Questions",
  "Threads",
  "Lists",
  "Film Breakdown",
  "Gratitude",
];

// ─── Sub-Components ──────────────────────────────────────────────────────────

function XPostPreviewMini({ content }: { content: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#16181c] p-4">
      <div className="flex gap-3">
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
          JR
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-sm">Jacob Rogers</span>
            <svg
              viewBox="0 0 22 22"
              className="h-3.5 w-3.5 text-blue-400 fill-current flex-shrink-0"
              aria-label="Verified account"
            >
              <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.271.586.702 1.084 1.24 1.438.54.354 1.167.551 1.813.568.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.261.276 1.897.143.634-.131 1.217-.437 1.687-.883.445-.468.751-1.053.882-1.687.13-.634.083-1.291-.14-1.898.586-.274 1.084-.705 1.438-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
            </svg>
          </div>
          <span className="text-slate-500 text-xs">@JacobRogersOL28</span>
        </div>
      </div>
      <div className="mt-2.5 text-[13px] leading-relaxed text-white whitespace-pre-wrap break-words">
        {renderPostContent(content)}
      </div>
      <div className="mt-2.5 border-t border-slate-700/50 pt-2.5 flex justify-between text-slate-500">
        <button
          className="flex items-center gap-1 hover:text-blue-400 transition-colors"
          type="button"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="text-[11px]">24</span>
        </button>
        <button
          className="flex items-center gap-1 hover:text-green-400 transition-colors"
          type="button"
        >
          <Repeat2 className="h-3.5 w-3.5" />
          <span className="text-[11px]">89</span>
        </button>
        <button
          className="flex items-center gap-1 hover:text-pink-400 transition-colors"
          type="button"
        >
          <Heart className="h-3.5 w-3.5" />
          <span className="text-[11px]">342</span>
        </button>
        <button
          className="flex items-center gap-1 hover:text-blue-400 transition-colors"
          type="button"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span className="text-[11px]">12.4K</span>
        </button>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ContentCard({ item, isTopPick }: { item: any; isTopPick?: boolean }) {
  const [copied, setCopied] = useState(false);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card
      className={
        isTopPick
          ? "border-2 border-yellow-400 bg-gradient-to-br from-yellow-50/50 via-amber-50/30 to-orange-50/50 shadow-lg shadow-yellow-100/50"
          : ""
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isTopPick && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}
            <CardTitle className="text-base truncate">{item.title}</CardTitle>
          </div>
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border ${getViralBadgeClasses(item.viralPotential)}`}
          >
            {getViralLabel(item.viralPotential)}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge variant="secondary">{item.category}</Badge>
          {item.bestDay && (
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {item.bestDay}
            </Badge>
          )}
          {item.mediaRequired && (
            <Badge
              variant="outline"
              className="gap-1 border-purple-200 text-purple-700"
            >
              <Camera className="h-3 w-3" />
              Media Required
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Format Template */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            Format Template
          </div>
          <div className="rounded-lg bg-slate-100 border border-slate-200 p-3 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
            {item.template}
          </div>
        </div>

        {/* Example Post Preview */}
        {item.examplePost && (
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Example Post
            </div>
            <XPostPreviewMini content={item.examplePost} />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs"
            onClick={() => handleCopy(item.examplePost || item.template)}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "Copied!" : "Copy Example"}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-1.5 text-xs"
            onClick={() => handleCopy(item.template)}
          >
            <FileText className="h-3 w-3" />
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ViralContentEngine() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [viralMin, setViralMin] = useState<ViralMinFilter>(0);

  const library = viralContentLibrary;

  // Filtered items
  const filteredItems = useMemo(() => {
    return library.filter((item) => {
      if (activeCategory !== "All" && item.category !== categoryFilterMap[activeCategory])
        return false;
      if (viralMin > 0 && item.viralPotential < viralMin) return false;
      return true;
    });
  }, [library, activeCategory, viralMin]);

  // Top 5 picks
  const topPicks = useMemo(() => {
    return [...library]
      .sort((a, b) => b.viralPotential - a.viralPotential)
      .slice(0, 5);
  }, [library]);

  // Stats
  const stats = useMemo(() => {
    const avgViral =
      library.length > 0
        ? (
            library.reduce(
              (sum: number, item) => sum + item.viralPotential,
              0
            ) / library.length
          ).toFixed(1)
        : "0";
    const categoryCount: Record<string, number> = {};
    library.forEach((item) => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });
    return { total: library.length, avgViral, categoryCount };
  }, [library]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-2.5">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Viral Content Engine
              </h1>
              <p className="text-sm text-slate-500">
                Proven post formats that drive maximum engagement
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {stats.total}
                </p>
                <p className="text-[11px] text-slate-500">Total Formats</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {stats.avgViral}
                </p>
                <p className="text-[11px] text-slate-500">Avg Viral Score</p>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="text-[11px] text-slate-500 mb-1.5">
                Formats by Category
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(stats.categoryCount).map(([cat, count]) => (
                  <Badge key={cat} variant="secondary" className="text-[10px]">
                    {cat}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Viral Picks */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Top Viral Picks
            </h2>
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
              Top 5
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPicks.map((item) => (
              <ContentCard key={item.id} item={item} isTopPick />
            ))}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-4">
          <div className="text-xs font-medium text-slate-500 mb-2">
            Filter by Category
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Viral Potential Filter */}
        <div className="mb-6">
          <div className="text-xs font-medium text-slate-500 mb-2">
            Minimum Viral Potential
          </div>
          <div className="flex gap-1.5">
            {([0, 7, 8, 9, 10] as ViralMinFilter[]).map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setViralMin(score)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  viralMin === score
                    ? score === 10
                      ? "bg-red-500 text-white"
                      : score >= 8
                        ? "bg-orange-500 text-white"
                        : score >= 7
                          ? "bg-yellow-500 text-white"
                          : "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
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
            <Flame className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              No formats match your current filters
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => {
                setActiveCategory("All");
                setViralMin(0);
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
