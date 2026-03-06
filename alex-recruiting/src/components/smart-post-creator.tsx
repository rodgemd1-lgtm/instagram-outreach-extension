"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Check,
  X,
  Clock,
  Send,
  Calendar,
  Heart,
  Repeat2,
  MessageCircle,
  BarChart3,
  Hash,
  FileText,
  Dumbbell,
  Users,
  AlertTriangle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { hashtagStack, getHashtagsForPost } from "@/lib/data/hashtags";
import { constitutionRules } from "@/lib/data/constitution";
import { weeklyCalendar, getTodayEntry } from "@/lib/data/weekly-calendar";
import type { ContentPillar } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Constants ───────────────────────────────────────────────────────────────

const PILLAR_CONFIG: Record<
  ContentPillar,
  { label: string; icon: typeof FileText; color: string; bgColor: string; borderColor: string; description: string }
> = {
  performance: {
    label: "Performance",
    icon: FileText,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "Film, highlights, stats",
  },
  work_ethic: {
    label: "Work Ethic",
    icon: Dumbbell,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Training, preparation, grind",
  },
  character: {
    label: "Character",
    icon: Users,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    description: "Community, academics, leadership",
  },
};

const QUICK_INSERTS = [
  {
    label: "Film Link",
    text: "Check out my latest highlights: [HUDL LINK]",
    icon: FileText,
  },
  {
    label: "Stats Line",
    text: '6\'4" 285 | OL | Class of 2028 | Pewaukee HS (WI)',
    icon: BarChart3,
  },
  {
    label: "Call to Action",
    text: "Coaches, DMs are open. Film + academics ready.",
    icon: Send,
  },
  {
    label: "GPA Line",
    text: "3.8 GPA | Building on and off the field",
    icon: Sparkles,
  },
];

const SLANG_WORDS = [
  "bruh",
  "fam",
  "lowkey",
  "highkey",
  "bussin",
  "no cap",
  "frfr",
  "ong",
  "bet",
  "lit",
  "fire",
  "slay",
  "yolo",
  "tbh",
  "ngl",
  "deadass",
  "sus",
  "salty",
  "goated",
  "rizz",
  "skibidi",
  "gyatt",
  "simp",
  "vibe check",
  "sheesh",
  "idk",
  "smh",
  "lmao",
  "lmfao",
  "omg",
  "af",
  "wtf",
  "stfu",
  "istg",
];

const NEGATIVE_WORDS = [
  "hate",
  "trash",
  "garbage",
  "weak",
  "pathetic",
  "loser",
  "suck",
  "stupid",
  "dumb",
  "idiot",
  "clown",
  "joke",
  "overrated",
  "fraud",
  "soft",
  "can't compete",
  "washed",
  "mid",
  "L ",
  "ratio",
  "hold this L",
  "cry",
  "cope",
];

const INITIAL_DRAFT = `Back to work this Monday. Film review session done, now hitting footwork drills.

Every rep counts. Getting better every day.

#2028Recruit #FootballRecruiting #OL #PutInTheWork #WisconsinFootball`;

const INITIAL_QUEUE: QueuedPost[] = [
  {
    id: "q1",
    content:
      "Drive block technique from Friday\u2019s game \u2014 finishing through the whistle.\n\nFull film: ncsa.com/jacob-rogers\n\n#OL #OffensiveLine #FootballRecruiting #2028Recruit",
    pillar: "performance",
    scheduledFor: "Tomorrow, 3:30 PM CST",
    status: "scheduled",
  },
  {
    id: "q2",
    content:
      "Honor roll this semester \u2014 balancing the books and the field. 3.8 GPA and climbing.\n\n#2028Recruit #StudentAthlete #FootballRecruiting",
    pillar: "character",
    scheduledFor: "Wednesday, 12:00 PM CST",
    status: "draft",
  },
  {
    id: "q3",
    content:
      "Early morning session at @IMGAcademy \u2014 competing against the best to become the best.\n\n#PutInTheWork #OffSeason #FootballTraining #2028Recruit",
    pillar: "work_ethic",
    scheduledFor: "Thursday, 4:00 PM CST",
    status: "draft",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function countHashtags(text: string): number {
  const matches = text.match(/#\w+/g);
  return matches ? matches.length : 0;
}

function getCharCountColor(count: number): string {
  if (count >= 260) return "text-red-400";
  if (count >= 200) return "text-yellow-400";
  return "text-green-400";
}

function getCharCountBg(count: number): string {
  if (count >= 260) return "bg-red-500/20";
  if (count >= 200) return "bg-yellow-500/20";
  return "bg-green-500/20";
}

function renderPostContent(text: string): React.ReactNode[] {
  const parts = text.split(/(#\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("#")) {
      return (
        <span key={i} className="text-blue-400">
          {part}
        </span>
      );
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
    {
      label: "No slang or informal language",
      passed: !hasSlang,
      description: hasSlang ? "Detected informal language. Keep it professional." : "Language is professional and clean.",
    },
    {
      label: "No trash talk or negativity",
      passed: !hasNegative,
      description: hasNegative
        ? "Detected negative or confrontational tone."
        : "Tone is positive and respectful.",
    },
    {
      label: "Professional tone",
      passed: !hasProfanity && !hasSlang,
      description:
        hasProfanity
          ? "Profanity detected. Remove immediately."
          : "Tone is appropriate for recruiting.",
    },
    {
      label: "Hashtag count (3-5 recommended)",
      passed: hashtagGood,
      description: `${hashCount} hashtag${hashCount !== 1 ? "s" : ""} found. ${hashtagGood ? "Perfect range." : hashCount < 3 ? "Add more hashtags for visibility." : "Too many hashtags \u2014 trim to 5."}`,
    },
    {
      label: "Clear purpose (film, training, character)",
      passed: hasPurpose,
      description: hasPurpose
        ? "Post has a clear recruiting purpose."
        : "Add specific content about film, training, or character.",
    },
    {
      label: "No complaints about coaches/refs/teammates",
      passed: !/\b(ref|referee|coach|teammate).*(bad|wrong|unfair|terrible|worst)/i.test(content) &&
        !/\b(playing time|benched|not fair)\b/i.test(content),
      description: "No complaints detected.",
    },
    {
      label: "No controversial topics",
      passed: !/\b(politic|democrat|republican|liberal|conservative|abortion|gun control|election)\b/i.test(content),
      description: "No controversial topics detected.",
    },
  ];
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function XPostPreview({ content }: { content: string }) {
  const charCount = content.length;

  return (
    <Card className="border-0 bg-black text-white overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-300">
            Live Preview
          </CardTitle>
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${getCharCountBg(charCount)} ${getCharCountColor(charCount)}`}>
            {charCount} / 280
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-slate-700 bg-[#16181c] p-4">
          {/* Header */}
          <div className="flex gap-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
              JR
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-[15px]">Jacob Rogers</span>
                <svg viewBox="0 0 22 22" className="h-4 w-4 text-blue-400 fill-current flex-shrink-0" aria-label="Verified account">
                  <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.271.586.702 1.084 1.24 1.438.54.354 1.167.551 1.813.568.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.261.276 1.897.143.634-.131 1.217-.437 1.687-.883.445-.468.751-1.053.882-1.687.13-.634.083-1.291-.14-1.898.586-.274 1.084-.705 1.438-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                </svg>
              </div>
              <span className="text-slate-500 text-sm">@JacobRogersOL28</span>
            </div>
          </div>

          {/* Content */}
          <div className="mt-3 text-[15px] leading-relaxed text-white whitespace-pre-wrap break-words">
            {content ? renderPostContent(content) : (
              <span className="text-slate-500 italic">Start typing to see your post preview...</span>
            )}
          </div>

          {/* Timestamp */}
          <div className="mt-3 text-slate-500 text-[13px]">
            {new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}{" "}
            &middot;{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            &middot;{" "}
            <span className="text-white font-semibold">12.4K</span> Views
          </div>

          {/* Divider */}
          <div className="mt-3 border-t border-slate-700" />

          {/* Engagement */}
          <div className="mt-3 flex justify-between text-slate-500">
            <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors" type="button">
              <MessageCircle className="h-4 w-4" />
              <span className="text-[13px]">24</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-green-400 transition-colors" type="button">
              <Repeat2 className="h-4 w-4" />
              <span className="text-[13px]">89</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-pink-400 transition-colors" type="button">
              <Heart className="h-4 w-4" />
              <span className="text-[13px]">342</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors" type="button">
              <BarChart3 className="h-4 w-4" />
              <span className="text-[13px]">12.4K</span>
            </button>
          </div>
        </div>

        {/* Character warning */}
        {charCount > 280 && (
          <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Post exceeds 280 character limit by {charCount - 280} characters</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PillarSelector({
  selected,
  onSelect,
}: {
  selected: ContentPillar;
  onSelect: (pillar: ContentPillar) => void;
}) {
  const todayEntry = getTodayEntry();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Content Pillar</CardTitle>
        <p className="text-sm text-slate-500">
          Today is {todayEntry.day} &mdash; recommended pillar:{" "}
          <span className="font-semibold text-slate-700">
            {PILLAR_CONFIG[todayEntry.pillar as ContentPillar]?.label}
          </span>
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.entries(PILLAR_CONFIG) as [ContentPillar, typeof PILLAR_CONFIG[ContentPillar]][]).map(
            ([key, config]) => {
              const Icon = config.icon;
              const isSelected = selected === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelect(key)}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    isSelected
                      ? `${config.borderColor} ${config.bgColor} ring-2 ring-offset-1 ring-${key === "performance" ? "purple" : key === "work_ethic" ? "blue" : "green"}-500/20`
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className={`rounded-full p-2.5 ${isSelected ? config.bgColor : "bg-slate-100"}`}>
                    <Icon className={`h-5 w-5 ${isSelected ? config.color : "text-slate-400"}`} />
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold text-sm ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                      {config.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{config.description}</div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Check className={`h-4 w-4 ${config.color}`} />
                    </div>
                  )}
                </button>
              );
            }
          )}
        </div>

        {/* Calendar suggestion for selected pillar */}
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Calendar className="h-4 w-4" />
            Suggested content for {PILLAR_CONFIG[selected].label}
          </div>
          <div className="space-y-1.5">
            {weeklyCalendar
              .filter((entry) => entry.pillar === selected)
              .map((entry) => (
                <div key={entry.day} className="flex items-center gap-2 text-sm text-slate-600">
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                  <span className="font-medium">{entry.day}:</span>
                  <span>{entry.contentType}</span>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HashtagSuggestions({
  pillar,
  onAdd,
}: {
  pillar: ContentPillar;
  onAdd: (tag: string) => void;
}) {
  const suggestedTags = useMemo(() => getHashtagsForPost(pillar), [pillar]);

  const pillarCategories = useMemo(() => {
    const categoryMap: Record<ContentPillar, string[]> = {
      performance: ["Core Recruiting", "Position-Specific", "National Football", "Division-Specific"],
      work_ethic: ["Core Recruiting", "Position-Specific", "Training/Work Ethic", "Wisconsin-Local"],
      character: ["Core Recruiting", "Wisconsin-Local", "National Football"],
    };
    return hashtagStack.filter((cat) => categoryMap[pillar].includes(cat.category));
  }, [pillar]);

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5" />
          Quick Add (recommended for this pillar)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onAdd(tag)}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {tag}
              <span className="text-blue-400">+</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-slate-500 mb-2">More hashtags by category</div>
        <div className="space-y-2">
          {pillarCategories.map((cat) => (
            <div key={cat.category}>
              <div className="text-xs text-slate-400 mb-1">{cat.category}</div>
              <div className="flex flex-wrap gap-1">
                {cat.hashtags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onAdd(tag)}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 hover:bg-slate-200 transition-colors"
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
  );
}

function ConstitutionPanel({ checks }: { checks: ConstitutionCheck[] }) {
  const passed = checks.filter((c) => c.passed).length;
  const total = checks.length;
  const percentage = Math.round((passed / total) * 100);
  const allPassed = passed === total;

  return (
    <Card className={allPassed ? "border-green-200" : "border-amber-200"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Constitution Checker</CardTitle>
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${
              allPassed
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {allPassed ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {percentage}% &mdash; {allPassed ? "PASS" : "NEEDS REVIEW"}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Real-time check against Jacob&apos;s posting constitution
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {checks.map((check, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-lg p-2.5 ${
                check.passed ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {check.passed ? (
                  <div className="rounded-full bg-green-500 p-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <div className="rounded-full bg-red-500 p-0.5">
                    <X className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium ${
                    check.passed ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {check.label}
                </div>
                <div
                  className={`text-xs mt-0.5 ${
                    check.passed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {check.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Constitution rules reference */}
        <details className="mt-4">
          <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
            View full constitution rules ({constitutionRules.length} rules)
          </summary>
          <ul className="mt-2 space-y-1">
            {constitutionRules.map((rule, i) => (
              <li key={i} className="text-xs text-slate-500 flex gap-2">
                <span className="text-slate-400 flex-shrink-0">{i + 1}.</span>
                {rule}
              </li>
            ))}
          </ul>
        </details>
      </CardContent>
    </Card>
  );
}

function SchedulingSection({
  selectedOption,
  onSelect,
}: {
  selectedOption: ScheduleOption;
  onSelect: (option: ScheduleOption) => void;
}) {
  const todayEntry = getTodayEntry();

  const scheduleLabels: Record<ScheduleOption, string> = {
    now: "Posting immediately",
    best_time: `Scheduled for ${todayEntry.bestTime} (${todayEntry.day})`,
    tomorrow_am: "Scheduled for tomorrow, 7:00 AM CST",
    custom: "Custom time selected",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Schedule
        </CardTitle>
        <p className="text-sm text-slate-500">
          Best time to post today ({todayEntry.day}): <span className="font-semibold text-slate-700">{todayEntry.bestTime}</span>
        </p>
        <p className="text-xs text-slate-400">{todayEntry.notes}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            [
              { key: "now" as const, label: "Post Now", icon: Send },
              { key: "best_time" as const, label: "Best Time Today", icon: Clock },
              { key: "tomorrow_am" as const, label: "Tomorrow AM", icon: Calendar },
              { key: "custom" as const, label: "Custom", icon: Calendar },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-center ${
                selectedOption === key
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>{scheduleLabels[selectedOption]}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function PostQueue({ posts }: { posts: QueuedPost[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Post Queue</CardTitle>
        <p className="text-xs text-slate-500">Recent drafts and scheduled posts</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={post.pillar === "performance" ? "performance" : post.pillar === "work_ethic" ? "work_ethic" : "character"}>
                    {PILLAR_CONFIG[post.pillar].label}
                  </Badge>
                  <Badge variant={post.status === "scheduled" ? "approved" : "draft"}>
                    {post.status === "scheduled" ? "Scheduled" : "Draft"}
                  </Badge>
                </div>
                <span className="text-xs text-slate-500">{post.scheduledFor}</span>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2 whitespace-pre-wrap">
                {post.content.slice(0, 120)}
                {post.content.length > 120 ? "..." : ""}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SmartPostCreator() {
  const todayEntry = getTodayEntry();
  const initialPillar = todayEntry.pillar as ContentPillar;

  const [content, setContent] = useState(INITIAL_DRAFT);
  const [pillar, setPillar] = useState<ContentPillar>(initialPillar);
  const [scheduleOption, setScheduleOption] = useState<ScheduleOption>("best_time");
  const [queue, setQueue] = useState<QueuedPost[]>(INITIAL_QUEUE);

  const constitutionChecks = useMemo(() => checkConstitution(content), [content]);

  const handleQuickInsert = useCallback(
    (text: string) => {
      setContent((prev) => {
        const separator = prev.length > 0 && !prev.endsWith("\n") ? "\n\n" : "";
        return prev + separator + text;
      });
    },
    []
  );

  const handleHashtagAdd = useCallback(
    (tag: string) => {
      setContent((prev) => {
        if (prev.includes(tag)) return prev;
        const separator = prev.length > 0 && !prev.endsWith("\n") && !prev.endsWith(" ") ? " " : "";
        return prev + separator + tag;
      });
    },
    []
  );

  const handleAddToQueue = useCallback(() => {
    const newPost: QueuedPost = {
      id: `q${Date.now()}`,
      content,
      pillar,
      scheduledFor:
        scheduleOption === "now"
          ? "Posting now"
          : scheduleOption === "best_time"
            ? `Today, ${todayEntry.bestTime}`
            : scheduleOption === "tomorrow_am"
              ? "Tomorrow, 7:00 AM CST"
              : "Custom time",
      status: scheduleOption === "now" ? "scheduled" : "draft",
    };
    setQueue((prev) => [newPost, ...prev].slice(0, 5));
    setContent("");
  }, [content, pillar, scheduleOption, todayEntry.bestTime]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Smart Post Creator
          </h1>
          <p className="mt-1 text-slate-500">
            Create, check, and schedule posts for Jacob Rogers&apos; X/Twitter recruiting account
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Preview */}
          <div className="lg:col-span-5 space-y-6">
            <XPostPreview content={content} />

            {/* Constitution Checker */}
            <ConstitutionPanel checks={constitutionChecks} />
          </div>

          {/* Right Column - Compose */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pillar Selector */}
            <PillarSelector selected={pillar} onSelect={setPillar} />

            {/* Compose Area */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Compose</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post here..."
                  className="min-h-[160px] resize-y text-sm"
                  maxLength={500}
                />

                {/* Quick Insert Buttons */}
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-2">Quick Insert</div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_INSERTS.map((insert) => {
                      const Icon = insert.icon;
                      return (
                        <Button
                          key={insert.label}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickInsert(insert.text)}
                          className="text-xs gap-1.5"
                        >
                          <Icon className="h-3 w-3" />
                          {insert.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Hashtag Suggestions */}
                <HashtagSuggestions pillar={pillar} onAdd={handleHashtagAdd} />
              </CardContent>
            </Card>

            {/* Scheduling */}
            <SchedulingSection
              selectedOption={scheduleOption}
              onSelect={setScheduleOption}
            />

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="success"
                size="lg"
                className="flex-1 gap-2 text-base"
                onClick={handleAddToQueue}
                disabled={content.length === 0 || content.length > 280}
              >
                <Send className="h-4 w-4" />
                {scheduleOption === "now" ? "Post Now" : "Add to Queue"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setContent("")}
                disabled={content.length === 0}
              >
                Clear
              </Button>
            </div>

            {/* Post Queue */}
            <PostQueue posts={queue.slice(0, 3)} />
          </div>
        </div>
      </div>
    </div>
  );
}
