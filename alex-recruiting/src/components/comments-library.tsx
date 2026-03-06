"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Copy,
  Check,
  MessageCircle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Heart,
  ThumbsUp,
  UserCheck,
  Clock,
  Eye,
  Ban,
  Lightbulb,
  BarChart3,
  Pencil,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { commentsLibrary, getCommentsByCategory } from "@/lib/data/comments-library";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Comment {
  id: string;
  text: string;
  category: string;
  tone: string;
  safetyLevel: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  "All",
  "Coach Film",
  "Coach Recruiting",
  "Coach Team",
  "Coach Win",
  "Coach Inspirational",
  "Coach Camp",
  "General",
] as const;

const TONES = ["All", "Respectful", "Enthusiastic", "Professional", "Casual"] as const;

const SAFETY_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof ShieldCheck }> = {
  "Always Safe": {
    label: "Always Safe",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: ShieldCheck,
  },
  "Context Check": {
    label: "Context Check",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: ShieldAlert,
  },
  "Coach Specific": {
    label: "Coach Specific",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: AlertTriangle,
  },
};

const TONE_ICONS: Record<string, typeof Heart> = {
  Respectful: UserCheck,
  Enthusiastic: Heart,
  Professional: ThumbsUp,
  Casual: MessageCircle,
};

const ENGAGEMENT_TIPS = [
  {
    icon: Heart,
    text: "Like 3 posts before commenting",
    description: "Warm up the algorithm and show genuine interest before engaging.",
  },
  {
    icon: Clock,
    text: "Comment within 1 hour of coach posting",
    description: "Early comments get more visibility and show you are paying attention.",
  },
  {
    icon: Ban,
    text: "Never comment on recruiting decisions",
    description: "Stay in your lane. Commenting on offers or commitments looks desperate.",
  },
  {
    icon: Eye,
    text: "Be specific — reference what they posted",
    description: "Generic comments get ignored. Mention details from their actual post.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function CommentsLibrary() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [toneFilter, setToneFilter] = useState<string>("All");
  const [safetyFilter, setSafetyFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allComments: Comment[] = commentsLibrary;

  // ── Filtered comments ───────────────────────────────────────────────────

  const filteredComments = useMemo(() => {
    let comments =
      activeCategory === "All" ? allComments : getCommentsByCategory(activeCategory);

    if (toneFilter !== "All") {
      comments = comments.filter((c) => c.tone === toneFilter);
    }

    if (safetyFilter) {
      comments = comments.filter((c) => c.safetyLevel === safetyFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      comments = comments.filter((c) => c.text.toLowerCase().includes(q));
    }

    return comments;
  }, [allComments, activeCategory, toneFilter, safetyFilter, search]);

  // ── Stats ───────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const bySafety: Record<string, number> = {};
    for (const c of allComments) {
      bySafety[c.safetyLevel] = (bySafety[c.safetyLevel] || 0) + 1;
    }
    return { total: allComments.length, bySafety };
  }, [allComments]);

  // ── Copy handler ────────────────────────────────────────────────────────

  async function handleCopy(comment: Comment) {
    await navigator.clipboard.writeText(comment.text);
    setCopiedId(comment.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // ── Safety badge ────────────────────────────────────────────────────────

  function getSafetyBadge(level: string) {
    const config = SAFETY_CONFIG[level];
    if (!config) return <Badge variant="secondary">{level}</Badge>;
    const Icon = config.icon;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
          config.bgColor,
          config.borderColor,
          config.color
        )}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  }

  // ── Tone badge ──────────────────────────────────────────────────────────

  function getToneBadge(tone: string) {
    const Icon = TONE_ICONS[tone] || MessageCircle;
    return (
      <Badge variant="outline" className="text-xs">
        <Icon className="h-3 w-3 mr-1" />
        {tone}
      </Badge>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-indigo-500" />
            Comments Library
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {stats.total} coach engagement comment templates — build relationships the right way
          </p>
        </div>
        {copiedId && (
          <div className="flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-sm font-medium text-green-700 animate-in fade-in">
            <Check className="h-4 w-4" />
            Copied!
          </div>
        )}
      </div>

      {/* ── Coach Engagement Tips ───────────────────────────────────────── */}
      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Coach Engagement Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ENGAGEMENT_TIPS.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-white/70 p-3 border border-indigo-100">
                  <div className="rounded-full bg-indigo-100 p-1.5 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{tip.text}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{tip.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Stats Bar ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-slate-500">Total Comments</p>
            </div>
          </CardContent>
        </Card>
        {Object.entries(SAFETY_CONFIG).map(([level, config]) => {
          const Icon = config.icon;
          return (
            <Card key={level}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("rounded-lg p-2", config.bgColor)}>
                  <Icon className={cn("h-5 w-5", config.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.bySafety[level] || 0}</p>
                  <p className="text-xs text-slate-500">{config.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search comments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Tabs */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Category</p>
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

          {/* Tone Filter */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Tone</p>
            <div className="flex flex-wrap gap-2">
              {TONES.map((tone) => (
                <Button
                  key={tone}
                  variant={toneFilter === tone ? "default" : "outline"}
                  size="sm"
                  onClick={() => setToneFilter(tone)}
                  className="text-xs"
                >
                  {tone}
                </Button>
              ))}
            </div>
          </div>

          {/* Safety Level Filter */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
              <Shield className="h-3 w-3" /> Safety Level
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={safetyFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSafetyFilter(null)}
                className="text-xs"
              >
                All
              </Button>
              {Object.entries(SAFETY_CONFIG).map(([level, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={level}
                    variant="outline"
                    size="sm"
                    onClick={() => setSafetyFilter(safetyFilter === level ? null : level)}
                    className={cn(
                      "text-xs",
                      safetyFilter === level && cn(config.bgColor, config.borderColor, config.color)
                    )}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Results Count ───────────────────────────────────────────────── */}
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700">{filteredComments.length}</span> comments
      </p>

      {/* ── Comment Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComments.map((comment) => (
          <Card key={comment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              {/* Speech Bubble */}
              <div className="relative rounded-xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm leading-relaxed">{comment.text}</p>
                {/* Bubble tail */}
                <div className="absolute -bottom-2 left-6 w-4 h-4 bg-slate-50 border-b border-r border-slate-200 rotate-45" />
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-xs">
                    {comment.category}
                  </Badge>
                  {getToneBadge(comment.tone)}
                </div>
              </div>

              {/* Safety Level */}
              <div className="flex items-center justify-between">
                {getSafetyBadge(comment.safetyLevel)}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleCopy(comment)}
                >
                  {copiedId === comment.id ? (
                    <><Check className="h-3 w-3 mr-1" /> Copied!</>
                  ) : (
                    <><Copy className="h-3 w-3 mr-1" /> Copy</>
                  )}
                </Button>
                <Button variant="secondary" size="sm" className="flex-1 text-xs">
                  <Pencil className="h-3 w-3 mr-1" /> Personalize
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {filteredComments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No comments match your filters</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
