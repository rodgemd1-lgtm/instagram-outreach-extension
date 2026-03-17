"use client";

import { useState, useMemo, useCallback } from "react";
import {
  SCPageHeader,
  SCGlassCard,
  SCBadge,
  SCButton,
  SCTabs,
} from "@/components/sc";
import { hashtagStack, getHashtagsForPost } from "@/lib/data/hashtags";
import { constitutionRules } from "@/lib/data/constitution";
import { weeklyCalendar, getTodayEntry } from "@/lib/data/weekly-calendar";
import { MediaPicker } from "@/components/media-picker";
import type { ContentPillar } from "@/lib/types";

interface QueuedPost {
  id: string;
  content: string;
  pillar: ContentPillar;
  scheduledFor: string;
  status: "draft" | "scheduled";
}

type ScheduleOption = "now" | "best_time" | "tomorrow_am" | "custom";

interface ConstitutionCheck {
  label: string;
  passed: boolean;
  description: string;
}

interface SelectedMediaInfo {
  id: string;
  name: string;
  filePath: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  category: string | null;
  optimizedFilePath: string | null;
  fileSize: number | null;
  width: number | null;
  height: number | null;
}

const PILLAR_CONFIG: Record<
  ContentPillar,
  { label: string; icon: string; description: string }
> = {
  performance: {
    label: "Performance",
    icon: "sports_football",
    description: "Film, highlights, stats",
  },
  work_ethic: {
    label: "Work Ethic",
    icon: "fitness_center",
    description: "Training, preparation, grind",
  },
  character: {
    label: "Character",
    icon: "volunteer_activism",
    description: "Community, academics, leadership",
  },
};

const QUICK_INSERTS = [
  { label: "Film Link", text: "Check out my latest highlights: [HUDL LINK]", icon: "movie" },
  { label: "Stats Line", text: '6\'4" 285 | OL | Class of 2029 | Pewaukee HS (WI)', icon: "bar_chart" },
  { label: "Call to Action", text: "Coaches, DMs are open. Film + academics ready.", icon: "send" },
  { label: "GPA Line", text: "3.8 GPA | Building on and off the field", icon: "auto_awesome" },
];

const SLANG_WORDS = [
  "bruh", "fam", "lowkey", "highkey", "bussin", "no cap", "frfr", "ong", "bet",
  "lit", "fire", "slay", "yolo", "tbh", "ngl", "deadass", "sus", "salty",
  "goated", "rizz", "skibidi", "gyatt", "simp", "vibe check", "sheesh", "idk",
  "smh", "lmao", "lmfao", "omg", "af", "wtf", "stfu", "istg",
];

const NEGATIVE_WORDS = [
  "hate", "trash", "garbage", "weak", "pathetic", "loser", "suck", "stupid",
  "dumb", "idiot", "clown", "joke", "overrated", "fraud", "soft",
  "can't compete", "washed", "mid", "L ", "ratio", "hold this L", "cry", "cope",
];

function countHashtags(text: string): number {
  const matches = text.match(/#\w+/g);
  return matches ? matches.length : 0;
}

function getCharCountColor(count: number): string {
  if (count >= 260) return "text-red-400";
  if (count >= 200) return "text-yellow-400";
  return "text-emerald-400";
}

function renderPostContent(text: string): React.ReactNode[] {
  const parts = text.split(/(#\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("#")) {
      return <span key={i} className="text-blue-400">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

function checkConstitution(content: string): ConstitutionCheck[] {
  const lower = content.toLowerCase();
  const hashCount = countHashtags(content);
  const hasSlang = SLANG_WORDS.some((word) => lower.includes(word.toLowerCase()));
  const hasNegative = NEGATIVE_WORDS.some((word) => lower.includes(word.toLowerCase()));
  const hasProfanity = /\b(damn|hell|ass|shit|fuck|bitch|crap)\b/i.test(content);
  const hashtagGood = hashCount >= 3 && hashCount <= 5;
  const hasPurpose =
    /film|highlight|training|workout|game|camp|gpa|honor|team|practice|drill|session|bench|squat|rep/i.test(content) ||
    /hudl|ncsa|coach/i.test(content);

  return [
    { label: "No slang or informal language", passed: !hasSlang, description: hasSlang ? "Detected informal language. Keep it professional." : "Language is professional and clean." },
    { label: "No trash talk or negativity", passed: !hasNegative, description: hasNegative ? "Detected negative or confrontational tone." : "Tone is positive and respectful." },
    { label: "Professional tone", passed: !hasProfanity && !hasSlang, description: hasProfanity ? "Profanity detected. Remove immediately." : "Tone is appropriate for recruiting." },
    { label: "Hashtag count (3-5 recommended)", passed: hashtagGood, description: `${hashCount} hashtag${hashCount !== 1 ? "s" : ""} found. ${hashtagGood ? "Perfect range." : hashCount < 3 ? "Add more hashtags for visibility." : "Too many hashtags — trim to 5."}` },
    { label: "Clear purpose (film, training, character)", passed: hasPurpose, description: hasPurpose ? "Post has a clear recruiting purpose." : "Add specific content about film, training, or character." },
    { label: "No complaints about coaches/refs/teammates", passed: !/\b(ref|referee|coach|teammate).*(bad|wrong|unfair|terrible|worst)/i.test(content) && !/\b(playing time|benched|not fair)\b/i.test(content), description: "No complaints detected." },
    { label: "No controversial topics", passed: !/\b(politic|democrat|republican|liberal|conservative|abortion|gun control|election)\b/i.test(content), description: "No controversial topics detected." },
  ];
}

export default function CreatePostPage() {
  const todayEntry = getTodayEntry();
  const initialPillar = todayEntry.pillar as ContentPillar;

  const [content, setContent] = useState("");
  const [pillar, setPillar] = useState<ContentPillar>(initialPillar);
  const [scheduleOption, setScheduleOption] = useState<ScheduleOption>("best_time");
  const [queue, setQueue] = useState<QueuedPost[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<SelectedMediaInfo | null>(null);
  const [postingId, setPostingId] = useState<string | null>(null);
  const [postResult, setPostResult] = useState<{ id: string; tweetUrl?: string; error?: string } | null>(null);

  const constitutionChecks = useMemo(() => checkConstitution(content), [content]);
  const charCount = content.length;
  const allChecksPassed = constitutionChecks.every((c) => c.passed);
  const passedCount = constitutionChecks.filter((c) => c.passed).length;
  const percentage = Math.round((passedCount / constitutionChecks.length) * 100);

  const suggestedTags = useMemo(() => getHashtagsForPost(pillar), [pillar]);

  const pillarCategories = useMemo(() => {
    const categoryMap: Record<ContentPillar, string[]> = {
      performance: ["Core Recruiting", "Position-Specific", "National Football", "Division-Specific"],
      work_ethic: ["Core Recruiting", "Position-Specific", "Training/Work Ethic", "Wisconsin-Local"],
      character: ["Core Recruiting", "Wisconsin-Local", "National Football"],
    };
    return hashtagStack.filter((cat) => categoryMap[pillar].includes(cat.category));
  }, [pillar]);

  const handleQuickInsert = useCallback((text: string) => {
    setContent((prev) => {
      const separator = prev.length > 0 && !prev.endsWith("\n") ? "\n\n" : "";
      return prev + separator + text;
    });
  }, []);

  const handleHashtagAdd = useCallback((tag: string) => {
    setContent((prev) => {
      if (prev.includes(tag)) return prev;
      const separator = prev.length > 0 && !prev.endsWith("\n") && !prev.endsWith(" ") ? " " : "";
      return prev + separator + tag;
    });
  }, []);

  const handleAddToQueue = useCallback(async () => {
    const scheduledFor =
      scheduleOption === "now" ? "Posting now"
        : scheduleOption === "best_time" ? `Today, ${todayEntry.bestTime}`
        : scheduleOption === "tomorrow_am" ? "Tomorrow, 7:00 AM CST"
        : "Custom time";

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, pillar, status: scheduleOption === "now" ? "scheduled" : "draft" }),
      });
      const data = await res.json();
      const newPost: QueuedPost = {
        id: data.id || `q${Date.now()}`,
        content, pillar, scheduledFor,
        status: scheduleOption === "now" ? "scheduled" : "draft",
      };
      setQueue((prev) => [newPost, ...prev].slice(0, 5));
    } catch {
      const newPost: QueuedPost = {
        id: `q${Date.now()}`,
        content, pillar, scheduledFor,
        status: scheduleOption === "now" ? "scheduled" : "draft",
      };
      setQueue((prev) => [newPost, ...prev].slice(0, 5));
    }
    setContent("");
    setSelectedMedia(null);
  }, [content, pillar, scheduleOption, todayEntry.bestTime]);

  const handlePostToX = useCallback(async (post: QueuedPost) => {
    setPostingId(post.id);
    setPostResult(null);
    try {
      const res = await fetch(`/api/posts/${post.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: post.content }),
      });
      const data = await res.json();
      if (res.ok && data.tweetUrl) {
        setPostResult({ id: post.id, tweetUrl: data.tweetUrl });
        setQueue((prev) => prev.map((p) => (p.id === post.id ? { ...p, status: "scheduled" as const } : p)));
      } else {
        setPostResult({ id: post.id, error: data.error || "Failed to post" });
      }
    } catch {
      setPostResult({ id: post.id, error: "Network error" });
    } finally {
      setPostingId(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      <SCPageHeader
        kicker="Content Studio"
        title="CREATE"
        subtitle="Create, check, and schedule posts for Jacob Rodgers' X/Twitter recruiting account"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* X Post Preview */}
          <SCGlassCard variant="strong" className="p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-400">Live Preview</p>
              <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                charCount >= 260 ? "bg-red-500/20 text-red-400" : charCount >= 200 ? "bg-yellow-500/20 text-yellow-400" : "bg-emerald-500/20 text-emerald-400"
              }`}>
                {charCount} / 280
              </span>
            </div>

            <div className="rounded-xl border border-sc-border bg-white/5 p-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-sc-primary to-red-700 flex items-center justify-center text-sm font-black text-white">
                  JR
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-[15px]">Jacob Rodgers</span>
                  </div>
                  <span className="text-slate-500 text-sm">@JacobRodge52987</span>
                </div>
              </div>

              <div className="mt-3 text-[15px] leading-relaxed text-white whitespace-pre-wrap break-words">
                {content ? renderPostContent(content) : (
                  <span className="text-slate-600 italic">Start typing to see your post preview...</span>
                )}
              </div>

              {selectedMedia?.thumbnailUrl && (
                <div className="mt-3 relative rounded-xl overflow-hidden border border-sc-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedMedia.thumbnailUrl} alt={selectedMedia.name} className="w-full aspect-video object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="rounded-full bg-sc-primary/90 p-3">
                      <span className="material-symbols-outlined text-[24px] text-white">play_arrow</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-3 text-slate-600 text-[13px]">
                {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                {" "}&middot;{" "}
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {" "}&middot; <span className="text-slate-600 text-xs italic">Preview</span>
              </div>
            </div>

            {charCount > 280 && (
              <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                Post exceeds 280 character limit by {charCount - 280} characters
              </div>
            )}
          </SCGlassCard>

          {/* Constitution Checker */}
          <SCGlassCard className={`p-5 ${allChecksPassed ? "border-emerald-500/20" : "border-yellow-500/20"}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white">Constitution Checker</p>
              <SCBadge variant={allChecksPassed ? "success" : "warning"}>
                {allChecksPassed ? (
                  <span className="material-symbols-outlined text-[10px] mr-0.5">check</span>
                ) : (
                  <span className="material-symbols-outlined text-[10px] mr-0.5">warning</span>
                )}
                {percentage}% — {allChecksPassed ? "PASS" : "NEEDS REVIEW"}
              </SCBadge>
            </div>
            <div className="space-y-2">
              {constitutionChecks.map((check, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-lg p-2.5 ${
                    check.passed ? "bg-emerald-500/5" : "bg-red-500/5"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[14px] mt-0.5 ${check.passed ? "text-emerald-500" : "text-red-500"}`}>
                    {check.passed ? "check_circle" : "cancel"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${check.passed ? "text-emerald-400" : "text-red-400"}`}>{check.label}</p>
                    <p className={`text-xs mt-0.5 ${check.passed ? "text-emerald-500/60" : "text-red-500/60"}`}>{check.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <details className="mt-4">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300">
                View full constitution rules ({constitutionRules.length} rules)
              </summary>
              <ul className="mt-2 space-y-1">
                {constitutionRules.map((rule, i) => (
                  <li key={i} className="text-xs text-slate-500 flex gap-2">
                    <span className="text-slate-600 flex-shrink-0">{i + 1}.</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </details>
          </SCGlassCard>
        </div>

        {/* Right Column - Compose */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pillar Selector */}
          <SCGlassCard className="p-5">
            <p className="text-sm font-bold text-white mb-1">Content Pillar</p>
            <p className="text-xs text-slate-500 mb-3">
              Today is {todayEntry.day} — recommended pillar:{" "}
              <span className="font-bold text-white">
                {PILLAR_CONFIG[todayEntry.pillar as ContentPillar]?.label}
              </span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.entries(PILLAR_CONFIG) as [ContentPillar, typeof PILLAR_CONFIG[ContentPillar]][]).map(
                ([key, config]) => {
                  const isSelected = pillar === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPillar(key)}
                      className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        isSelected
                          ? "border-sc-primary/40 bg-sc-primary/10 ring-1 ring-sc-primary/20"
                          : "border-sc-border bg-white/5 hover:border-sc-primary/20"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[24px] ${isSelected ? "text-sc-primary" : "text-slate-500"}`}>
                        {config.icon}
                      </span>
                      <div className="text-center">
                        <div className={`font-bold text-sm ${isSelected ? "text-white" : "text-slate-400"}`}>{config.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{config.description}</div>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px] text-sc-primary absolute top-2 right-2">check_circle</span>
                      )}
                    </button>
                  );
                }
              )}
            </div>

            <div className="mt-4 rounded-lg bg-white/5 border border-sc-border p-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                Suggested content for {PILLAR_CONFIG[pillar].label}
              </div>
              <div className="space-y-1.5">
                {weeklyCalendar
                  .filter((entry) => entry.pillar === pillar)
                  .map((entry) => (
                    <div key={entry.day} className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="material-symbols-outlined text-[12px] text-slate-600">chevron_right</span>
                      <span className="font-bold">{entry.day}:</span>
                      <span>{entry.contentType}</span>
                    </div>
                  ))}
              </div>
            </div>
          </SCGlassCard>

          {/* Compose Area */}
          <SCGlassCard className="p-5 space-y-4">
            <p className="text-sm font-bold text-white">Compose</p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post here..."
              className="w-full min-h-[160px] resize-y rounded-lg bg-white/5 border border-sc-border p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
              maxLength={500}
            />

            {/* Media Picker */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Attach Media</p>
              <MediaPicker selectedMedia={selectedMedia} onSelect={setSelectedMedia} />
            </div>

            {/* Quick Insert */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Quick Insert</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_INSERTS.map((insert) => (
                  <SCButton
                    key={insert.label}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleQuickInsert(insert.text)}
                  >
                    <span className="material-symbols-outlined text-[14px]">{insert.icon}</span>
                    {insert.label}
                  </SCButton>
                ))}
              </div>
            </div>

            {/* Hashtag Suggestions */}
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Quick Add (recommended)</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleHashtagAdd(tag)}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-colors"
                    >
                      {tag}
                      <span className="text-blue-500/60">+</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">More hashtags by category</p>
                <div className="space-y-2">
                  {pillarCategories.map((cat) => (
                    <div key={cat.category}>
                      <div className="text-xs text-slate-600 mb-1">{cat.category}</div>
                      <div className="flex flex-wrap gap-1">
                        {cat.hashtags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleHashtagAdd(tag)}
                            className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-400 hover:bg-white/10 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SCGlassCard>

          {/* Scheduling */}
          <SCGlassCard className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[20px] text-white">schedule</span>
              <p className="text-sm font-bold text-white">Schedule</p>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Best time to post today ({todayEntry.day}): <span className="font-bold text-white">{todayEntry.bestTime}</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                { key: "now" as const, label: "Post Now", icon: "send" },
                { key: "best_time" as const, label: "Best Time Today", icon: "schedule" },
                { key: "tomorrow_am" as const, label: "Tomorrow AM", icon: "calendar_today" },
                { key: "custom" as const, label: "Custom", icon: "edit_calendar" },
              ]).map(({ key, label, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setScheduleOption(key)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-center ${
                    scheduleOption === key
                      ? "border-sc-primary bg-sc-primary/10 text-white"
                      : "border-sc-border bg-white/5 text-slate-500 hover:border-sc-primary/30"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  <span className="text-xs font-bold">{label}</span>
                </button>
              ))}
            </div>
          </SCGlassCard>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <SCButton
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleAddToQueue}
              disabled={content.length === 0 || content.length > 280}
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              {scheduleOption === "now" ? "Post Now" : "Add to Queue"}
            </SCButton>
            <SCButton
              variant="secondary"
              size="lg"
              onClick={() => { setContent(""); setSelectedMedia(null); }}
              disabled={content.length === 0 && !selectedMedia}
            >
              Clear
            </SCButton>
          </div>

          {/* Post Queue */}
          {queue.length > 0 && (
            <SCGlassCard className="p-5">
              <p className="text-sm font-bold text-white mb-3">Post Queue</p>
              <div className="space-y-3">
                {queue.slice(0, 3).map((post) => (
                  <div key={post.id} className="rounded-lg border border-sc-border bg-white/5 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <SCBadge variant={post.pillar === "performance" ? "info" : post.pillar === "work_ethic" ? "warning" : "success"}>
                          {PILLAR_CONFIG[post.pillar].label}
                        </SCBadge>
                        <SCBadge variant={post.status === "scheduled" ? "primary" : "default"}>
                          {post.status === "scheduled" ? "Scheduled" : "Draft"}
                        </SCBadge>
                      </div>
                      <span className="text-xs text-slate-500">{post.scheduledFor}</span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 whitespace-pre-wrap">
                      {post.content.slice(0, 120)}{post.content.length > 120 ? "..." : ""}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <SCButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePostToX(post)}
                        disabled={postingId === post.id || post.content.length > 280}
                      >
                        <span className="material-symbols-outlined text-[14px]">send</span>
                        {postingId === post.id ? "Posting..." : "Post to X Now"}
                      </SCButton>
                      {postResult?.id === post.id && postResult.tweetUrl && (
                        <a href={postResult.tweetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                          View on X
                        </a>
                      )}
                      {postResult?.id === post.id && postResult.error && (
                        <span className="text-xs text-red-500">{postResult.error}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SCGlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
