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
import { commentsLibrary, getCommentsByCategory } from "@/lib/data/comments-library";

interface Comment {
  id: string;
  text: string;
  category: string;
  tone: string;
  safetyLevel: string;
}

const CATEGORIES = [
  { label: "All", value: "All" },
  { label: "Coach Film", value: "Coach Film" },
  { label: "Coach Recruiting", value: "Coach Recruiting" },
  { label: "Coach Team", value: "Coach Team" },
  { label: "Coach Win", value: "Coach Win" },
  { label: "Coach Inspirational", value: "Coach Inspirational" },
  { label: "Coach Camp", value: "Coach Camp" },
  { label: "General", value: "General" },
];

const TONES = ["All", "Respectful", "Enthusiastic", "Professional", "Casual"] as const;

const SAFETY_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "danger"; icon: string }> = {
  "Always Safe": { label: "Always Safe", variant: "success", icon: "verified_user" },
  "Context Check": { label: "Context Check", variant: "warning", icon: "shield" },
  "Coach Specific": { label: "Coach Specific", variant: "danger", icon: "warning" },
};

const ENGAGEMENT_TIPS = [
  { icon: "favorite", text: "Like 3 posts before commenting", description: "Warm up the algorithm and show genuine interest before engaging." },
  { icon: "schedule", text: "Comment within 1 hour of coach posting", description: "Early comments get more visibility and show you are paying attention." },
  { icon: "block", text: "Never comment on recruiting decisions", description: "Stay in your lane. Commenting on offers or commitments looks desperate." },
  { icon: "visibility", text: "Be specific — reference what they posted", description: "Generic comments get ignored. Mention details from their actual post." },
];

export default function CommentsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [toneFilter, setToneFilter] = useState<string>("All");
  const [safetyFilter, setSafetyFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allComments: Comment[] = commentsLibrary;

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

  const stats = useMemo(() => {
    const bySafety: Record<string, number> = {};
    for (const c of allComments) {
      bySafety[c.safetyLevel] = (bySafety[c.safetyLevel] || 0) + 1;
    }
    return { total: allComments.length, bySafety };
  }, [allComments]);

  async function handleCopy(comment: Comment) {
    await navigator.clipboard.writeText(comment.text);
    setCopiedId(comment.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      <SCPageHeader
        kicker="Coach Engagement"
        title="COMMENT TEMPLATES"
        subtitle={`${stats.total} coach engagement comment templates — build relationships the right way`}
      />

      {/* Engagement Tips */}
      <SCGlassCard variant="broadcast" className="p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-yellow-500">lightbulb</span>
          Coach Engagement Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ENGAGEMENT_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-white/5 border border-sc-border p-3">
              <div className="rounded-full bg-sc-primary/10 p-1.5 mt-0.5">
                <span className="material-symbols-outlined text-[14px] text-sc-primary">{tip.icon}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{tip.text}</p>
                <p className="text-xs text-slate-500 mt-0.5">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </SCGlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SCStatCard label="Total Comments" value={String(stats.total)} icon="chat" />
        {Object.entries(SAFETY_CONFIG).map(([level, config]) => (
          <SCStatCard
            key={level}
            label={config.label}
            value={String(stats.bySafety[level] || 0)}
            icon={config.icon}
          />
        ))}
      </div>

      {/* Filters */}
      <SCGlassCard className="p-4 space-y-4">
        <SCInput
          icon="search"
          placeholder="Search comments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeCategory === cat.value
                    ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                    : "bg-white/5 border border-sc-border text-slate-500 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tone</p>
          <div className="flex flex-wrap gap-2">
            {TONES.map((tone) => (
              <button
                key={tone}
                onClick={() => setToneFilter(tone)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  toneFilter === tone
                    ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                    : "bg-white/5 border border-sc-border text-slate-500 hover:text-white"
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Safety Level</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSafetyFilter(null)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                safetyFilter === null
                  ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                  : "bg-white/5 border border-sc-border text-slate-500 hover:text-white"
              }`}
            >
              All
            </button>
            {Object.entries(SAFETY_CONFIG).map(([level, config]) => (
              <button
                key={level}
                onClick={() => setSafetyFilter(safetyFilter === level ? null : level)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  safetyFilter === level
                    ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                    : "bg-white/5 border border-sc-border text-slate-500 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">{config.icon}</span>
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </SCGlassCard>

      <p className="text-sm text-slate-500">
        Showing <span className="font-bold text-white">{filteredComments.length}</span> comments
      </p>

      {/* Comment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComments.map((comment) => (
          <SCGlassCard key={comment.id} className="p-4 space-y-3">
            <div className="relative rounded-xl bg-white/5 border border-sc-border p-4">
              <p className="text-sm leading-relaxed text-slate-300">{comment.text}</p>
            </div>

            <div className="flex items-center gap-1.5">
              <SCBadge variant="default">{comment.category}</SCBadge>
              <SCBadge variant="info">{comment.tone}</SCBadge>
            </div>

            <div>
              <SCBadge variant={SAFETY_CONFIG[comment.safetyLevel]?.variant || "default"}>
                <span className="material-symbols-outlined text-[10px] mr-0.5">
                  {SAFETY_CONFIG[comment.safetyLevel]?.icon || "shield"}
                </span>
                {comment.safetyLevel}
              </SCBadge>
            </div>

            <div className="flex gap-2 pt-1">
              <SCButton
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => handleCopy(comment)}
              >
                {copiedId === comment.id ? (
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
              <SCButton variant="ghost" size="sm" className="flex-1">
                <span className="material-symbols-outlined text-[14px]">edit</span>
                Personalize
              </SCButton>
            </div>
          </SCGlassCard>
        ))}
      </div>

      {filteredComments.length === 0 && (
        <SCGlassCard className="py-12 text-center">
          <span className="material-symbols-outlined text-[40px] text-white/10">search</span>
          <p className="text-sm text-slate-500 mt-3">No comments match your filters</p>
          <p className="text-xs text-slate-600 mt-1">Try adjusting your search or filter criteria</p>
        </SCGlassCard>
      )}
    </div>
  );
}
