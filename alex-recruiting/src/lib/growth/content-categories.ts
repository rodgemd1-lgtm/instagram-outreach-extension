// Content Categories — Comprehensive content category system integrating all local data sources
// Maps every content type to its pillar, available library assets, psychology, and scheduling data

import { jacobProfile } from "@/lib/data/jacob-profile";
import { captionsLibrary, getCaptionsByPillar } from "@/lib/data/captions-library";
import { hooksLibrary, getHooksByCategory, getHooksByPillar } from "@/lib/data/hooks-library";
import {
  viralContentLibrary,
  getViralContentByCategory,
} from "@/lib/data/viral-content";
import { postTemplates, dmTemplates } from "@/lib/data/templates";
import { hashtagStack, getHashtagsForPost } from "@/lib/data/hashtags";
import {
  POST_FORMULAS,
  PSYCHOLOGY_MECHANISMS,
  CONTENT_TONE_BIBLE,
  type PsychologyMechanism,
  type PostFormulaType,
} from "@/lib/data/content-psychology";
import { weeklyCalendar } from "@/lib/data/weekly-calendar";
import { constitutionRules } from "@/lib/data/constitution";
import {
  commentsLibrary,
  getCommentsByCategory,
} from "@/lib/data/comments-library";
import { competitorIntel } from "@/lib/rec/knowledge/competitor-intel";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ContentCategoryId =
  | "game_highlight"
  | "training_clip"
  | "film_breakdown"
  | "strength_update"
  | "game_day"
  | "camp_content"
  | "motivational"
  | "academic"
  | "team_moment"
  | "community"
  | "recruiting_update"
  | "stat_update"
  | "question_post"
  | "day_in_the_life"
  | "bold_statement"
  | "thread_format"
  | "list_post"
  | "before_after"
  | "ambient_update";

export type ContentPillarId = "performance" | "work_ethic" | "character";

export interface ContentCategory {
  id: ContentCategoryId;
  name: string;
  pillar: ContentPillarId;
  description: string;
  bestDays: string[];
  bestTimes: string[];
  mediaRequired: boolean;
  suggestedMediaType: string;
  hashtagStrategy: string[];
  psychologyMechanisms: PsychologyMechanism[];
  postFormula: PostFormulaType;
  captionCount: number;
  hookCount: number;
  viralTemplateCount: number;
  commentTemplateCount: number;
  weeklyFrequency: number;
  pillarPercentage: number;
}

// ─── Helper: extract best times from weekly calendar by day names ────────────

function getBestTimesForDays(days: string[]): string[] {
  const times: string[] = [];
  for (const day of days) {
    const entry = weeklyCalendar.find(
      (e) => e.day.toLowerCase() === day.toLowerCase()
    );
    if (entry && !times.includes(entry.bestTime)) {
      times.push(entry.bestTime);
    }
  }
  return times;
}

// ─── Content Categories ─────────────────────────────────────────────────────

export const CONTENT_CATEGORIES: ContentCategory[] = [
  // ── Performance Pillar (40%) ─────────────────────────────────────────────

  {
    id: "game_highlight",
    name: "Game Highlight",
    pillar: "performance",
    description:
      "Short film clips from games showcasing blocks, technique, and dominance at the point of attack.",
    bestDays: ["Tuesday", "Thursday", "Saturday"],
    bestTimes: getBestTimesForDays(["Tuesday", "Thursday", "Saturday"]),
    mediaRequired: true,
    suggestedMediaType: "film_clip",
    hashtagStrategy: getHashtagsForPost("performance"),
    psychologyMechanisms: ["loss_aversion", "identity_resonance"],
    postFormula: "spotlight_shift",
    captionCount: getCaptionsByPillar("performance").filter(
      (c) => c.mediaType === "film_clip"
    ).length,
    hookCount: getHooksByCategory("film").length,
    viralTemplateCount: getViralContentByCategory("film_breakdown").length,
    commentTemplateCount: getCommentsByCategory("coach_film").length,
    weeklyFrequency: 2,
    pillarPercentage: 40,
  },
  {
    id: "training_clip",
    name: "Training Clip",
    pillar: "work_ethic",
    description:
      "Weight room sessions, footwork drills, sled pushes, and conditioning work showing daily commitment.",
    bestDays: ["Monday", "Wednesday", "Friday"],
    bestTimes: getBestTimesForDays(["Monday", "Wednesday", "Friday"]),
    mediaRequired: true,
    suggestedMediaType: "training_video",
    hashtagStrategy: getHashtagsForPost("work_ethic"),
    psychologyMechanisms: ["commitment_consistency", "narrative_transportation"],
    postFormula: "honest_progress",
    captionCount: getCaptionsByPillar("work_ethic").filter(
      (c) => c.mediaType === "training_video"
    ).length,
    hookCount: getHooksByCategory("training").length,
    viralTemplateCount: 0, // no direct viral category for training clips
    commentTemplateCount: getCommentsByCategory("coach_team").length,
    weeklyFrequency: 2,
    pillarPercentage: 40,
  },
  {
    id: "film_breakdown",
    name: "Film Breakdown",
    pillar: "performance",
    description:
      "Detailed technique analysis of specific plays with coaching points and self-evaluation.",
    bestDays: ["Tuesday", "Wednesday"],
    bestTimes: getBestTimesForDays(["Tuesday", "Wednesday"]),
    mediaRequired: true,
    suggestedMediaType: "film_clip",
    hashtagStrategy: getHashtagsForPost("performance"),
    psychologyMechanisms: ["curiosity_gap", "autonomy_bias"],
    postFormula: "curious_student",
    captionCount: getCaptionsByPillar("performance").filter(
      (c) => c.id.startsWith("fc-")
    ).length,
    hookCount: getHooksByCategory("film").length,
    viralTemplateCount: getViralContentByCategory("film_breakdown").length,
    commentTemplateCount: getCommentsByCategory("coach_film").length,
    weeklyFrequency: 1,
    pillarPercentage: 40,
  },
  {
    id: "strength_update",
    name: "Strength Update",
    pillar: "work_ethic",
    description:
      "PR announcements, lift progress, measurable strength gains showing physical development trajectory.",
    bestDays: ["Monday", "Wednesday"],
    bestTimes: getBestTimesForDays(["Monday", "Wednesday"]),
    mediaRequired: true,
    suggestedMediaType: "training_video",
    hashtagStrategy: getHashtagsForPost("work_ethic"),
    psychologyMechanisms: ["commitment_consistency", "scarcity"],
    postFormula: "honest_progress",
    captionCount: getCaptionsByPillar("work_ethic").filter(
      (c) =>
        c.title.toLowerCase().includes("bench") ||
        c.title.toLowerCase().includes("squat") ||
        c.title.toLowerCase().includes("deadlift") ||
        c.title.toLowerCase().includes("clean") ||
        c.title.toLowerCase().includes("pr")
    ).length,
    hookCount: getHooksByCategory("training").filter(
      (h) =>
        h.text.toLowerCase().includes("pr") ||
        h.text.toLowerCase().includes("bench") ||
        h.text.toLowerCase().includes("squat") ||
        h.text.toLowerCase().includes("clean")
    ).length,
    viralTemplateCount: getViralContentByCategory("before_after").filter(
      (v) =>
        v.title.toLowerCase().includes("strength") ||
        v.title.toLowerCase().includes("speed")
    ).length,
    commentTemplateCount: getCommentsByCategory("coach_team").length,
    weeklyFrequency: 1,
    pillarPercentage: 40,
  },
  {
    id: "game_day",
    name: "Game Day",
    pillar: "performance",
    description:
      "Pre-game hype, post-game recaps, stat lines, and under-the-lights energy from Friday night football.",
    bestDays: ["Friday", "Saturday"],
    bestTimes: getBestTimesForDays(["Friday", "Saturday"]),
    mediaRequired: false,
    suggestedMediaType: "photo",
    hashtagStrategy: getHashtagsForPost("performance"),
    psychologyMechanisms: ["identity_resonance", "narrative_transportation"],
    postFormula: "spotlight_shift",
    captionCount: captionsLibrary.filter((c) => c.id.startsWith("gd-")).length,
    hookCount: getHooksByCategory("game_day").length,
    viralTemplateCount: 0,
    commentTemplateCount: getCommentsByCategory("coach_win").length,
    weeklyFrequency: 1,
    pillarPercentage: 40,
  },
  {
    id: "camp_content",
    name: "Camp Content",
    pillar: "work_ethic",
    description:
      "Camp announcements, recaps, competition footage, and coach feedback from showcases and events.",
    bestDays: ["Thursday", "Saturday", "Sunday"],
    bestTimes: getBestTimesForDays(["Thursday", "Saturday", "Sunday"]),
    mediaRequired: false,
    suggestedMediaType: "photo",
    hashtagStrategy: getHashtagsForPost("work_ethic"),
    psychologyMechanisms: ["reciprocity", "commitment_consistency"],
    postFormula: "honest_progress",
    captionCount: captionsLibrary.filter((c) => c.id.startsWith("cpc-")).length,
    hookCount: getHooksByCategory("camp_showcase").length,
    viralTemplateCount: 0,
    commentTemplateCount: getCommentsByCategory("coach_camp_event").length,
    weeklyFrequency: 1,
    pillarPercentage: 40,
  },
  {
    id: "motivational",
    name: "Motivational",
    pillar: "work_ethic",
    description:
      "Mindset posts that reveal determination, discipline, and long-term vision without empty hustle language.",
    bestDays: ["Monday", "Sunday"],
    bestTimes: getBestTimesForDays(["Monday", "Sunday"]),
    mediaRequired: false,
    suggestedMediaType: "text_only",
    hashtagStrategy: getHashtagsForPost("work_ethic"),
    psychologyMechanisms: ["narrative_transportation", "curiosity_gap"],
    postFormula: "narrative_loop",
    captionCount: 0, // motivational content is hook-driven, not caption-driven
    hookCount: getHooksByCategory("motivational").length,
    viralTemplateCount: 0,
    commentTemplateCount: getCommentsByCategory("coach_inspirational").length,
    weeklyFrequency: 1,
    pillarPercentage: 40,
  },
  {
    id: "academic",
    name: "Academic",
    pillar: "character",
    description:
      "GPA updates, honor roll, student-athlete balance, and classroom achievements that build the complete recruit profile.",
    bestDays: ["Wednesday"],
    bestTimes: getBestTimesForDays(["Wednesday"]),
    mediaRequired: false,
    suggestedMediaType: "graphic",
    hashtagStrategy: getHashtagsForPost("character"),
    psychologyMechanisms: ["identity_resonance", "scarcity"],
    postFormula: "honest_progress",
    captionCount: captionsLibrary.filter(
      (c) =>
        c.pillar === "character" &&
        (c.title.toLowerCase().includes("academic") ||
          c.title.toLowerCase().includes("honor") ||
          c.title.toLowerCase().includes("gpa"))
    ).length,
    hookCount: getHooksByPillar("character").filter(
      (h) =>
        h.text.toLowerCase().includes("gpa") ||
        h.text.toLowerCase().includes("honor") ||
        h.text.toLowerCase().includes("academic") ||
        h.text.toLowerCase().includes("student")
    ).length,
    viralTemplateCount: 0,
    commentTemplateCount: getCommentsByCategory("general_engagement").length,
    weeklyFrequency: 1,
    pillarPercentage: 20,
  },
  {
    id: "team_moment",
    name: "Team Moment",
    pillar: "character",
    description:
      "Brotherhood, team celebrations, OL group photos, and moments that show team-first mentality.",
    bestDays: ["Wednesday", "Saturday"],
    bestTimes: getBestTimesForDays(["Wednesday", "Saturday"]),
    mediaRequired: false,
    suggestedMediaType: "photo",
    hashtagStrategy: getHashtagsForPost("character"),
    psychologyMechanisms: ["reciprocity", "identity_resonance"],
    postFormula: "spotlight_shift",
    captionCount: captionsLibrary.filter(
      (c) =>
        c.pillar === "character" &&
        (c.title.toLowerCase().includes("team") ||
          c.title.toLowerCase().includes("brother"))
    ).length,
    hookCount: getHooksByPillar("character").filter(
      (h) =>
        h.text.toLowerCase().includes("team") ||
        h.text.toLowerCase().includes("brother") ||
        h.text.toLowerCase().includes("next to you")
    ).length,
    viralTemplateCount: 0,
    commentTemplateCount: getCommentsByCategory("coach_team").length,
    weeklyFrequency: 1,
    pillarPercentage: 20,
  },
  {
    id: "community",
    name: "Community",
    pillar: "character",
    description:
      "Volunteering, youth football coaching, community service, and giving back to Pewaukee.",
    bestDays: ["Wednesday", "Sunday"],
    bestTimes: getBestTimesForDays(["Wednesday", "Sunday"]),
    mediaRequired: false,
    suggestedMediaType: "photo",
    hashtagStrategy: getHashtagsForPost("character"),
    psychologyMechanisms: ["reciprocity", "identity_resonance"],
    postFormula: "spotlight_shift",
    captionCount: captionsLibrary.filter(
      (c) =>
        c.pillar === "character" &&
        (c.title.toLowerCase().includes("community") ||
          c.title.toLowerCase().includes("volunteer") ||
          c.title.toLowerCase().includes("mentor") ||
          c.title.toLowerCase().includes("gratitude") ||
          c.title.toLowerCase().includes("giving"))
    ).length,
    hookCount: getHooksByPillar("character").filter(
      (h) =>
        h.text.toLowerCase().includes("volunteer") ||
        h.text.toLowerCase().includes("community") ||
        h.text.toLowerCase().includes("giving") ||
        h.text.toLowerCase().includes("mentor")
    ).length,
    viralTemplateCount: 0,
    commentTemplateCount: getCommentsByCategory("general_engagement").length,
    weeklyFrequency: 1,
    pillarPercentage: 20,
  },
  {
    id: "recruiting_update",
    name: "Recruiting Update",
    pillar: "performance",
    description:
      "Offers, camp invites, profile updates, and recruiting milestone announcements.",
    bestDays: ["Monday", "Wednesday", "Thursday"],
    bestTimes: getBestTimesForDays(["Monday", "Wednesday", "Thursday"]),
    mediaRequired: false,
    suggestedMediaType: "graphic",
    hashtagStrategy: getHashtagsForPost("performance"),
    psychologyMechanisms: ["scarcity", "loss_aversion"],
    postFormula: "honest_progress",
    captionCount: 0, // recruiting updates are event-driven, not pre-written
    hookCount: getHooksByCategory("milestone").length,
    viralTemplateCount: getViralContentByCategory("gratitude_milestone").length,
    commentTemplateCount: getCommentsByCategory("coach_recruiting").length,
    weeklyFrequency: 1,
    pillarPercentage: 40,
  },
  {
    id: "stat_update",
    name: "Stat Update",
    pillar: "performance",
    description:
      "OL stat lines, measurables, camp measurements, and quantifiable performance data.",
    bestDays: ["Saturday", "Sunday"],
    bestTimes: getBestTimesForDays(["Saturday", "Sunday"]),
    mediaRequired: false,
    suggestedMediaType: "graphic",
    hashtagStrategy: getHashtagsForPost("performance"),
    psychologyMechanisms: ["loss_aversion", "curiosity_gap"],
    postFormula: "honest_progress",
    captionCount: captionsLibrary.filter(
      (c) =>
        c.title.toLowerCase().includes("stat") ||
        c.title.toLowerCase().includes("measurement")
    ).length,
    hookCount: getHooksByCategory("milestone").filter(
      (h) =>
        h.text.toLowerCase().includes("pr") ||
        h.text.toLowerCase().includes("ranked") ||
        h.text.toLowerCase().includes("100th")
    ).length,
    viralTemplateCount: getViralContentByCategory("gratitude_milestone").filter(
      (v) =>
        v.title.toLowerCase().includes("pr") ||
        v.title.toLowerCase().includes("season")
    ).length,
    commentTemplateCount: getCommentsByCategory("coach_film").length,
    weeklyFrequency: 1,
    pillarPercentage: 40,
  },
  {
    id: "question_post",
    name: "Question Post",
    pillar: "performance",
    description:
      "Engagement-driven questions about technique, recruiting, and OL play that invite coach responses.",
    bestDays: ["Wednesday", "Thursday"],
    bestTimes: getBestTimesForDays(["Wednesday", "Thursday"]),
    mediaRequired: false,
    suggestedMediaType: "text_only",
    hashtagStrategy: getHashtagsForPost("performance"),
    psychologyMechanisms: ["curiosity_gap", "autonomy_bias"],
    postFormula: "curious_student",
    captionCount: 0, // question posts are generated, not pre-written captions
    hookCount: hooksLibrary.filter(
      (h) =>
        h.text.includes("?") ||
        h.category === "viral_format" &&
        h.text.toLowerCase().includes("rate")
    ).length,
    viralTemplateCount: getViralContentByCategory("question_post").length,
    commentTemplateCount: getCommentsByCategory("general_engagement").length,
    weeklyFrequency: 1,
    pillarPercentage: 40,
  },
  {
    id: "day_in_the_life",
    name: "Day in the Life",
    pillar: "work_ethic",
    description:
      "Timeline-style posts showing daily routines, schedules, and the behind-the-scenes grind of a recruit.",
    bestDays: ["Monday", "Saturday", "Sunday"],
    bestTimes: getBestTimesForDays(["Monday", "Saturday", "Sunday"]),
    mediaRequired: false,
    suggestedMediaType: "text_only",
    hashtagStrategy: getHashtagsForPost("work_ethic"),
    psychologyMechanisms: ["narrative_transportation", "commitment_consistency"],
    postFormula: "ambient_update",
    captionCount: captionsLibrary.filter(
      (c) =>
        c.title.toLowerCase().includes("routine") ||
        c.title.toLowerCase().includes("daily")
    ).length,
    hookCount: hooksLibrary.filter(
      (h) =>
        h.text.toLowerCase().includes("day in the life") ||
        h.text.toLowerCase().includes("5 am") ||
        h.text.toLowerCase().includes("6 am")
    ).length,
    viralTemplateCount: getViralContentByCategory("day_in_the_life").length,
    commentTemplateCount: getCommentsByCategory("general_engagement").length,
    weeklyFrequency: 1,
    pillarPercentage: 40,
  },
  {
    id: "bold_statement",
    name: "Bold Statement",
    pillar: "performance",
    description:
      "Confident declarations about size, potential, and competitive advantages that command attention.",
    bestDays: ["Monday", "Wednesday", "Thursday"],
    bestTimes: getBestTimesForDays(["Monday", "Wednesday", "Thursday"]),
    mediaRequired: false,
    suggestedMediaType: "photo",
    hashtagStrategy: getHashtagsForPost("performance"),
    psychologyMechanisms: ["scarcity", "loss_aversion", "curiosity_gap"],
    postFormula: "narrative_loop",
    captionCount: 0, // bold statements are hook-driven
    hookCount: hooksLibrary.filter(
      (h) =>
        h.category === "viral_format" &&
        (h.text.toLowerCase().includes("6'4") ||
          h.text.toLowerCase().includes("285") ||
          h.text.toLowerCase().includes("name a") ||
          h.text.toLowerCase().includes("pov"))
    ).length,
    viralTemplateCount: getViralContentByCategory("bold_statement").length,
    commentTemplateCount: getCommentsByCategory("general_engagement").length,
    weeklyFrequency: 1,
    pillarPercentage: 40,
  },
  {
    id: "thread_format",
    name: "Thread Format",
    pillar: "work_ethic",
    description:
      "Multi-tweet threads covering recruiting journey, technique breakdowns, lessons learned, and season recaps.",
    bestDays: ["Sunday", "Tuesday"],
    bestTimes: getBestTimesForDays(["Sunday", "Tuesday"]),
    mediaRequired: false,
    suggestedMediaType: "text_only",
    hashtagStrategy: getHashtagsForPost("work_ethic"),
    psychologyMechanisms: [
      "narrative_transportation",
      "commitment_consistency",
      "curiosity_gap",
    ],
    postFormula: "narrative_loop",
    captionCount: 0, // threads are long-form, not single captions
    hookCount: hooksLibrary.filter(
      (h) =>
        h.text.toLowerCase().includes("thread") ||
        h.text.toLowerCase().includes("a day in the life")
    ).length,
    viralTemplateCount: getViralContentByCategory("thread_format").length,
    commentTemplateCount: getCommentsByCategory("general_engagement").length,
    weeklyFrequency: 1,
    pillarPercentage: 40,
  },
  {
    id: "list_post",
    name: "List Post",
    pillar: "work_ethic",
    description:
      "Numbered lists covering lessons learned, program priorities, daily habits, and recruiting checklists.",
    bestDays: ["Monday", "Thursday", "Sunday"],
    bestTimes: getBestTimesForDays(["Monday", "Thursday", "Sunday"]),
    mediaRequired: false,
    suggestedMediaType: "text_only",
    hashtagStrategy: getHashtagsForPost("work_ethic"),
    psychologyMechanisms: ["curiosity_gap", "autonomy_bias"],
    postFormula: "curious_student",
    captionCount: captionsLibrary.filter(
      (c) =>
        c.title.toLowerCase().includes("balance") ||
        c.title.toLowerCase().includes("routine")
    ).length,
    hookCount: hooksLibrary.filter(
      (h) =>
        h.text.toLowerCase().includes("things") ||
        h.text.toLowerCase().includes("5 ")
    ).length,
    viralTemplateCount: getViralContentByCategory("list_post").length,
    commentTemplateCount: getCommentsByCategory("general_engagement").length,
    weeklyFrequency: 1,
    pillarPercentage: 40,
  },
  {
    id: "before_after",
    name: "Before/After",
    pillar: "work_ethic",
    description:
      "Transformation content showing growth in size, strength, technique, and film quality over time.",
    bestDays: ["Monday", "Tuesday", "Thursday"],
    bestTimes: getBestTimesForDays(["Monday", "Tuesday", "Thursday"]),
    mediaRequired: true,
    suggestedMediaType: "carousel",
    hashtagStrategy: getHashtagsForPost("work_ethic"),
    psychologyMechanisms: ["commitment_consistency", "narrative_transportation"],
    postFormula: "honest_progress",
    captionCount: captionsLibrary.filter(
      (c) =>
        c.title.toLowerCase().includes("improvement") ||
        c.title.toLowerCase().includes("week to week")
    ).length,
    hookCount: hooksLibrary.filter(
      (h) =>
        h.category === "viral_format" &&
        (h.text.toLowerCase().includes("transformation") ||
          h.text.toLowerCase().includes("freshman") ||
          h.text.toLowerCase().includes("vs"))
    ).length,
    viralTemplateCount: getViralContentByCategory("before_after").length,
    commentTemplateCount: getCommentsByCategory("general_engagement").length,
    weeklyFrequency: 1,
    pillarPercentage: 40,
  },
  {
    id: "ambient_update",
    name: "Ambient Update",
    pillar: "work_ethic",
    description:
      "Low-key, in-the-moment posts that feel natural and unscripted -- a window into the daily grind.",
    bestDays: ["Monday", "Wednesday", "Friday"],
    bestTimes: getBestTimesForDays(["Monday", "Wednesday", "Friday"]),
    mediaRequired: false,
    suggestedMediaType: "photo",
    hashtagStrategy: getHashtagsForPost("work_ethic"),
    psychologyMechanisms: ["scarcity", "narrative_transportation"],
    postFormula: "ambient_update",
    captionCount: 0, // ambient updates are spontaneous, not pre-written
    hookCount: hooksLibrary.filter(
      (h) =>
        h.text.toLowerCase().includes("5 am") ||
        h.text.toLowerCase().includes("nobody") ||
        h.text.toLowerCase().includes("empty")
    ).length,
    viralTemplateCount: 0,
    commentTemplateCount: getCommentsByCategory("general_engagement").length,
    weeklyFrequency: 1,
    pillarPercentage: 40,
  },
];

// ─── Lookup Functions ───────────────────────────────────────────────────────

export function getContentCategoryById(
  id: ContentCategoryId
): ContentCategory {
  const category = CONTENT_CATEGORIES.find((c) => c.id === id);
  if (!category) {
    throw new Error(`Content category not found: ${id}`);
  }
  return category;
}

export function getCategoriesByPillar(
  pillar: ContentPillarId
): ContentCategory[] {
  return CONTENT_CATEGORIES.filter((c) => c.pillar === pillar);
}

// ─── Stats Summary ──────────────────────────────────────────────────────────

export function getContentStats(): {
  totalCaptions: number;
  totalHooks: number;
  totalViralTemplates: number;
  totalComments: number;
  categoriesByPillar: Record<ContentPillarId, number>;
  constitutionRulesCount: number;
  totalPostTemplates: number;
  totalDmTemplates: number;
  competitorCount: number;
  contentPillars: typeof jacobProfile.contentPillars;
  psychologyMechanismCount: number;
  postFormulaCount: number;
  toneRulesCount: number;
  hashtagCategoryCount: number;
  weeklyCalendarDays: number;
} {
  return {
    totalCaptions: captionsLibrary.length,
    totalHooks: hooksLibrary.length,
    totalViralTemplates: viralContentLibrary.length,
    totalComments: commentsLibrary.length,
    categoriesByPillar: {
      performance: getCategoriesByPillar("performance").length,
      work_ethic: getCategoriesByPillar("work_ethic").length,
      character: getCategoriesByPillar("character").length,
    },
    constitutionRulesCount: constitutionRules.length,
    totalPostTemplates: Object.keys(postTemplates).length,
    totalDmTemplates: Object.keys(dmTemplates).length,
    competitorCount: competitorIntel.length,
    contentPillars: jacobProfile.contentPillars,
    psychologyMechanismCount: Object.keys(PSYCHOLOGY_MECHANISMS).length,
    postFormulaCount: POST_FORMULAS.length,
    toneRulesCount: CONTENT_TONE_BIBLE.rules.length,
    hashtagCategoryCount: hashtagStack.length,
    weeklyCalendarDays: weeklyCalendar.length,
  };
}

// ─── Available Content for Category ─────────────────────────────────────────

export function getAvailableContentForCategory(id: ContentCategoryId): {
  captions: typeof captionsLibrary;
  hooks: typeof hooksLibrary;
  viralTemplates: typeof viralContentLibrary;
  comments: typeof commentsLibrary;
  hashtagSuggestions: string[];
  postFormula: (typeof POST_FORMULAS)[number] | undefined;
} {
  const category = getContentCategoryById(id);

  // Map category IDs to caption filters
  const captions = (() => {
    switch (id) {
      case "game_highlight":
        return getCaptionsByPillar("performance").filter(
          (c) => c.mediaType === "film_clip"
        );
      case "training_clip":
        return getCaptionsByPillar("work_ethic").filter(
          (c) => c.mediaType === "training_video"
        );
      case "film_breakdown":
        return getCaptionsByPillar("performance").filter(
          (c) => c.id.startsWith("fc-")
        );
      case "strength_update":
        return getCaptionsByPillar("work_ethic").filter(
          (c) =>
            c.title.toLowerCase().includes("bench") ||
            c.title.toLowerCase().includes("squat") ||
            c.title.toLowerCase().includes("deadlift") ||
            c.title.toLowerCase().includes("clean") ||
            c.title.toLowerCase().includes("pr")
        );
      case "game_day":
        return captionsLibrary.filter((c) => c.id.startsWith("gd-"));
      case "camp_content":
        return captionsLibrary.filter((c) => c.id.startsWith("cpc-"));
      case "academic":
        return captionsLibrary.filter(
          (c) =>
            c.pillar === "character" &&
            (c.title.toLowerCase().includes("academic") ||
              c.title.toLowerCase().includes("honor") ||
              c.title.toLowerCase().includes("gpa"))
        );
      case "team_moment":
        return captionsLibrary.filter(
          (c) =>
            c.pillar === "character" &&
            (c.title.toLowerCase().includes("team") ||
              c.title.toLowerCase().includes("brother"))
        );
      case "community":
        return captionsLibrary.filter(
          (c) =>
            c.pillar === "character" &&
            (c.title.toLowerCase().includes("community") ||
              c.title.toLowerCase().includes("volunteer") ||
              c.title.toLowerCase().includes("mentor") ||
              c.title.toLowerCase().includes("gratitude") ||
              c.title.toLowerCase().includes("giving"))
        );
      case "day_in_the_life":
        return captionsLibrary.filter(
          (c) =>
            c.title.toLowerCase().includes("routine") ||
            c.title.toLowerCase().includes("daily")
        );
      case "before_after":
        return captionsLibrary.filter(
          (c) =>
            c.title.toLowerCase().includes("improvement") ||
            c.title.toLowerCase().includes("week to week")
        );
      case "list_post":
        return captionsLibrary.filter(
          (c) =>
            c.title.toLowerCase().includes("balance") ||
            c.title.toLowerCase().includes("routine")
        );
      default:
        return getCaptionsByPillar(category.pillar);
    }
  })();

  // Map category IDs to hook filters
  const hooks = (() => {
    switch (id) {
      case "game_highlight":
      case "film_breakdown":
        return getHooksByCategory("film");
      case "training_clip":
      case "strength_update":
        return getHooksByCategory("training");
      case "game_day":
        return getHooksByCategory("game_day");
      case "camp_content":
        return getHooksByCategory("camp_showcase");
      case "motivational":
        return getHooksByCategory("motivational");
      case "recruiting_update":
      case "stat_update":
        return getHooksByCategory("milestone");
      case "question_post":
        return hooksLibrary.filter(
          (h) =>
            h.text.includes("?") ||
            (h.category === "viral_format" &&
              h.text.toLowerCase().includes("rate"))
        );
      case "bold_statement":
        return hooksLibrary.filter(
          (h) =>
            h.category === "viral_format" &&
            (h.text.toLowerCase().includes("6'4") ||
              h.text.toLowerCase().includes("285") ||
              h.text.toLowerCase().includes("name a") ||
              h.text.toLowerCase().includes("pov"))
        );
      case "thread_format":
        return hooksLibrary.filter(
          (h) =>
            h.text.toLowerCase().includes("thread") ||
            h.text.toLowerCase().includes("a day in the life")
        );
      case "day_in_the_life":
        return hooksLibrary.filter(
          (h) =>
            h.text.toLowerCase().includes("day in the life") ||
            h.text.toLowerCase().includes("5 am") ||
            h.text.toLowerCase().includes("6 am")
        );
      case "before_after":
        return hooksLibrary.filter(
          (h) =>
            h.category === "viral_format" &&
            (h.text.toLowerCase().includes("transformation") ||
              h.text.toLowerCase().includes("freshman") ||
              h.text.toLowerCase().includes("vs"))
        );
      case "ambient_update":
        return hooksLibrary.filter(
          (h) =>
            h.text.toLowerCase().includes("5 am") ||
            h.text.toLowerCase().includes("nobody") ||
            h.text.toLowerCase().includes("empty")
        );
      default:
        return getHooksByPillar(category.pillar);
    }
  })();

  // Map category IDs to viral template filters
  const viralTemplates = (() => {
    switch (id) {
      case "game_highlight":
      case "film_breakdown":
        return getViralContentByCategory("film_breakdown");
      case "before_after":
        return getViralContentByCategory("before_after");
      case "day_in_the_life":
        return getViralContentByCategory("day_in_the_life");
      case "bold_statement":
        return getViralContentByCategory("bold_statement");
      case "question_post":
        return getViralContentByCategory("question_post");
      case "thread_format":
        return getViralContentByCategory("thread_format");
      case "list_post":
        return getViralContentByCategory("list_post");
      case "recruiting_update":
      case "stat_update":
        return getViralContentByCategory("gratitude_milestone");
      default:
        return [];
    }
  })();

  // Map category IDs to comment filters
  const comments = (() => {
    switch (id) {
      case "game_highlight":
      case "film_breakdown":
      case "stat_update":
        return getCommentsByCategory("coach_film");
      case "game_day":
        return getCommentsByCategory("coach_win");
      case "camp_content":
        return getCommentsByCategory("coach_camp_event");
      case "recruiting_update":
        return getCommentsByCategory("coach_recruiting");
      case "training_clip":
      case "strength_update":
      case "team_moment":
        return getCommentsByCategory("coach_team");
      case "motivational":
        return getCommentsByCategory("coach_inspirational");
      default:
        return getCommentsByCategory("general_engagement");
    }
  })();

  const postFormula = POST_FORMULAS.find(
    (f) => f.type === category.postFormula
  );

  return {
    captions,
    hooks,
    viralTemplates,
    comments,
    hashtagSuggestions: category.hashtagStrategy,
    postFormula,
  };
}
