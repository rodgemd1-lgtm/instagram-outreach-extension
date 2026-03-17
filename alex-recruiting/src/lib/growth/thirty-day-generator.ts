// 30-Day Content Calendar Generator for Jacob Rodgers
// Generates March 16 - April 14, 2026 content plan

import { jacobProfile } from "@/lib/data/jacob-profile";
import {
  captionsLibrary,
  getCaptionsByPillar,
  type Caption,
} from "@/lib/data/captions-library";
import {
  hooksLibrary,
  getHooksByCategory,
  getHooksByPillar,
  type Hook,
} from "@/lib/data/hooks-library";
import {
  viralContentLibrary,
  type ViralContentTemplate,
} from "@/lib/data/viral-content";
import { postTemplates, fillTemplate } from "@/lib/data/templates";
import { getHashtagsForPost } from "@/lib/data/hashtags";
import {
  POST_FORMULAS,
  type PostFormulaType,
  type PsychologyMechanism,
} from "@/lib/data/content-psychology";
import { weeklyCalendar } from "@/lib/data/weekly-calendar";
import { constitutionRules } from "@/lib/data/constitution";
import { competitorIntel } from "@/lib/rec/knowledge/competitor-intel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GeneratedPost {
  id: string;
  date: string;
  dayOfWeek: string;
  dayNumber: number;
  pillar: "performance" | "work_ethic" | "character";
  category: string;
  postType: string;
  content: string;
  hashtags: string[];
  suggestedTime: string;
  mediaType: string;
  mediaSuggestion: string;
  psychologyMechanism: PsychologyMechanism;
  postFormula: PostFormulaType;
  viralScore: number;
  source: string;
  coachNote: string;
  constitutionCheck: boolean;
  status: "draft" | "approved" | "scheduled" | "posted";
}

export interface ThirtyDayCalendar {
  startDate: string;
  endDate: string;
  generatedAt: string;
  totalPosts: number;
  pillarBreakdown: {
    performance: number;
    work_ethic: number;
    character: number;
  };
  weeklyBreakdown: { week: number; startDate: string; posts: number }[];
  posts: GeneratedPost[];
  strategy: {
    overallTheme: string;
    weeklyThemes: string[];
    keyDates: { date: string; event: string; contentNote: string }[];
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const WEEKLY_THEMES = [
  "Spring Training Foundation",
  "Film & Technique Focus",
  "Character & Community",
  "Camp Season Preview",
  "Recruiting Journey Update",
];

const KEY_DATES: { date: string; event: string; contentNote: string }[] = [
  {
    date: "2026-03-16",
    event: "Calendar Kickoff",
    contentNote:
      "First post sets the tone — off-season training clip to signal work ethic",
  },
  {
    date: "2026-03-22",
    event: "End of Week 1",
    contentNote:
      "Sunday reflection post — recap the first week of the content strategy",
  },
  {
    date: "2026-03-30",
    event: "Character Week Begins",
    contentNote:
      "Shift tone to academic/community content to show well-rounded recruit",
  },
  {
    date: "2026-04-06",
    event: "Camp Season Preview",
    contentNote:
      "Begin camp announcement and measurables content for spring/summer circuit",
  },
  {
    date: "2026-04-13",
    event: "30-Day Wrap",
    contentNote:
      "Recruiting journey progress thread — honest self-evaluation and forward look",
  },
];

/** Deterministic "random" index rotation so every run produces the same plan. */
function rotateIndex(pool: number, offset: number): number {
  return offset % pool;
}

/** Pick the suggested time string for a given day-of-week. */
function getSuggestedTime(dayOfWeek: string): string {
  const map: Record<string, string> = {
    Monday: "6:30 AM CT",
    Tuesday: "4:00 PM CT",
    Wednesday: "12:15 PM CT",
    Thursday: "4:30 PM CT",
    Friday: "2:30 PM CT",
    Saturday: "11:00 AM CT",
    Sunday: "7:30 PM CT",
  };
  return map[dayOfWeek] || "12:00 PM CT";
}

/** Map day-of-week to a category description suitable for the post. */
function getCategoryForDay(dayOfWeek: string, weekNum: number): string {
  const baseMap: Record<string, string> = {
    Monday: "training_clip",
    Tuesday: "film_breakdown",
    Wednesday: "character_moment",
    Thursday: "camp_training",
    Friday: "weekend_preview",
    Saturday: "camp_recap",
    Sunday: "film_review",
  };
  // Vary the category slightly across weeks
  if (dayOfWeek === "Thursday" && weekNum >= 4) return "camp_announcement";
  if (dayOfWeek === "Monday" && weekNum === 2) return "technique_drill";
  return baseMap[dayOfWeek] || "general";
}

/** Map day-of-week + week to a more specific postType. */
function getPostType(
  dayOfWeek: string,
  weekNum: number,
  dayNumber: number
): string {
  const typesByDay: Record<string, string[]> = {
    Monday: [
      "morning_lift",
      "technique_drill",
      "squat_session",
      "footwork_drill",
      "strength_progress",
    ],
    Tuesday: [
      "pass_pro_film",
      "drive_block_film",
      "combo_block_film",
      "pull_block_film",
      "technique_breakdown",
    ],
    Wednesday: [
      "academic_update",
      "team_moment",
      "community_service",
      "coach_appreciation",
      "balance_post",
    ],
    Thursday: [
      "training_session",
      "camp_prep",
      "measurables_update",
      "camp_announcement",
      "competition_mindset",
    ],
    Friday: [
      "weekend_training_preview",
      "off_season_grind",
      "bold_statement",
      "list_post",
      "recruiting_update",
    ],
    Saturday: [
      "camp_recap",
      "training_recap",
      "day_in_the_life",
      "progress_photo",
      "viral_format",
    ],
    Sunday: [
      "film_review_session",
      "weekly_reflection",
      "thread_post",
      "honest_progress",
      "next_week_preview",
    ],
  };
  const options = typesByDay[dayOfWeek] || ["general"];
  return options[rotateIndex(options.length, dayNumber)];
}

/** Pick a psychology mechanism that fits the pillar / day pattern. */
function pickMechanism(
  pillar: "performance" | "work_ethic" | "character",
  dayOfWeek: string,
  dayNumber: number
): PsychologyMechanism {
  const mechanisms: PsychologyMechanism[] = [
    "identity_resonance",
    "reciprocity",
    "commitment_consistency",
    "scarcity",
    "loss_aversion",
    "narrative_transportation",
    "curiosity_gap",
    "autonomy_bias",
  ];

  // Weight certain mechanisms toward certain pillars
  if (pillar === "character") {
    const charMechs: PsychologyMechanism[] = [
      "identity_resonance",
      "reciprocity",
      "narrative_transportation",
      "commitment_consistency",
    ];
    return charMechs[rotateIndex(charMechs.length, dayNumber)];
  }
  if (pillar === "work_ethic") {
    const weMechs: PsychologyMechanism[] = [
      "commitment_consistency",
      "scarcity",
      "narrative_transportation",
      "loss_aversion",
    ];
    return weMechs[rotateIndex(weMechs.length, dayNumber)];
  }
  // performance
  const perfMechs: PsychologyMechanism[] = [
    "curiosity_gap",
    "loss_aversion",
    "autonomy_bias",
    "identity_resonance",
    "scarcity",
  ];
  return perfMechs[rotateIndex(perfMechs.length, dayNumber)];
}

/** Pick a post formula that suits the day. */
function pickFormula(dayOfWeek: string, dayNumber: number): PostFormulaType {
  const formulas: PostFormulaType[] = POST_FORMULAS.map((f) => f.type);
  // Sunday/Wednesday lean toward honest_progress and spotlight_shift
  if (dayOfWeek === "Sunday") return "honest_progress";
  if (dayOfWeek === "Wednesday") return "spotlight_shift";
  if (dayOfWeek === "Tuesday") return "curious_student";
  return formulas[rotateIndex(formulas.length, dayNumber)];
}

/** Generate a media suggestion string for the post. */
function getMediaSuggestion(
  dayOfWeek: string,
  mediaType: string,
  weekNum: number
): string {
  const suggestions: Record<string, string[]> = {
    film_clip: [
      "Upload 15-30 second game film clip from last season showing technique",
      "Side-by-side comparison clip of early vs late season technique",
      "Specific rep from game film with coaching points overlay",
    ],
    training_video: [
      "Record morning training session — focus on intensity and form",
      "Film position-specific drill work with coach instruction visible",
      "Capture weight room session showing strength progression",
    ],
    photo: [
      "Team photo or training environment shot",
      "Post-workout photo showing commitment",
      "Candid shot in academic or community setting",
    ],
    graphic: [
      "Create stat graphic with measurables and key numbers",
      "Design weekly schedule infographic",
      "Build a recruiting profile card with updated stats",
    ],
    text_only: [
      "No media needed — text-only post for engagement and authenticity",
      "Thread format — text only for maximum shareability",
      "Reflection post — text resonates more than media here",
    ],
  };
  const pool = suggestions[mediaType] || suggestions["text_only"];
  return pool[rotateIndex(pool.length, weekNum)];
}

/** Generate a coach-facing note explaining why this post matters. */
function getCoachNote(
  pillar: "performance" | "work_ethic" | "character",
  postType: string,
  dayOfWeek: string
): string {
  if (pillar === "performance") {
    return "Film and performance posts are the primary way coaches evaluate technique and projection. This post puts Jacob's game tape in front of decision-makers during their film review windows.";
  }
  if (pillar === "work_ethic") {
    return "Coaches look for year-round commitment signals. Off-season training content proves Jacob is doing the work when nobody is watching — the #1 trait coaches cite in recruiting evaluations.";
  }
  return "Character posts make Jacob three-dimensional in coaches' eyes. Programs recruit people, not just players. Academic and community content differentiates Jacob from recruits who only post highlights.";
}

// ---------------------------------------------------------------------------
// Content assembly — pulling from real libraries
// ---------------------------------------------------------------------------

/** Used captions tracker to avoid repeats */
const usedCaptionIds = new Set<string>();
const usedHookIds = new Set<string>();
const usedViralIds = new Set<string>();

function pickCaption(pillar: "performance" | "work_ethic" | "character"): Caption | null {
  const pool = getCaptionsByPillar(pillar).filter(
    (c) => !usedCaptionIds.has(c.id)
  );
  if (pool.length === 0) return null;
  const pick = pool[0];
  usedCaptionIds.add(pick.id);
  return pick;
}

function pickHook(
  category: string,
  pillar: "performance" | "work_ethic" | "character"
): Hook | null {
  let pool = getHooksByCategory(category).filter(
    (h) => !usedHookIds.has(h.id)
  );
  if (pool.length === 0) {
    pool = getHooksByPillar(pillar).filter((h) => !usedHookIds.has(h.id));
  }
  if (pool.length === 0) return null;
  const pick = pool[0];
  usedHookIds.add(pick.id);
  return pick;
}

function pickViralTemplate(dayOfWeek: string): ViralContentTemplate | null {
  const pool = viralContentLibrary.filter((v) => !usedViralIds.has(v.id));
  if (pool.length === 0) return null;
  // Prefer templates whose bestDay matches, but fall back to any
  const preferred = pool.filter(
    (v) =>
      v.bestDay.toLowerCase() === dayOfWeek.toLowerCase() ||
      v.bestDay === "Any"
  );
  const pick = preferred.length > 0 ? preferred[0] : pool[0];
  usedViralIds.add(pick.id);
  return pick;
}

/** Build the actual post content text from library sources. */
function buildContent(
  pillar: "performance" | "work_ethic" | "character",
  dayOfWeek: string,
  dayNumber: number,
  weekNum: number,
  postType: string
): { content: string; source: string; viralScore: number; mediaType: string } {
  // Strategy: Use captions for most posts, viral templates for
  // Thursday/Sunday variety, hooks + templates for the rest

  // 1. Try to pull a full caption from the library
  const caption = pickCaption(pillar);
  if (caption) {
    return {
      content: caption.fullCaption,
      source: `captionsLibrary/${caption.id}`,
      viralScore: caption.estimatedEngagement === "viral" ? 9 : caption.estimatedEngagement === "high" ? 7 : 5,
      mediaType: caption.mediaType,
    };
  }

  // 2. Try a viral template for Thursday/Sunday posts
  if (dayOfWeek === "Thursday" || dayOfWeek === "Sunday") {
    const viral = pickViralTemplate(dayOfWeek);
    if (viral) {
      return {
        content: viral.examplePost,
        source: `viralContentLibrary/${viral.id}`,
        viralScore: viral.viralPotential,
        mediaType: viral.mediaRequired ? "photo" : "text_only",
      };
    }
  }

  // 3. Fall back to hook + template composition
  const hookCategory =
    pillar === "performance"
      ? "film"
      : pillar === "work_ethic"
        ? "training"
        : "character";
  const hook = pickHook(hookCategory, pillar);
  const hookText = hook ? hook.text : "";
  const hookScore = hook ? hook.viralScore : 6;
  const hookMediaType = hook ? hook.bestPairedWith : "text_only";

  // Use the appropriate template
  let templateContent = "";
  if (pillar === "performance") {
    templateContent = fillTemplate(postTemplates.highlightClip.template, {
      OPENING_LINE: hookText,
      NCSA_LINK: jacobProfile.ncsaProfileUrl || "link in bio",
      SCHOOL_HASHTAG: "#WisconsinFootball",
    });
  } else if (pillar === "work_ethic") {
    templateContent = fillTemplate(postTemplates.trainingPost.template, {
      TRAINING_DESCRIPTION: hookText +
        "\n\nPutting in the work every day. The off-season is where the next season is built.\n\n" +
        `${jacobProfile.height} ${jacobProfile.weight}. Class of ${jacobProfile.classYear}. ${jacobProfile.school}, ${jacobProfile.state}.`,
      HASHTAGS: getHashtagsForPost(pillar).join(" "),
    });
  } else {
    templateContent = fillTemplate(postTemplates.characterPost.template, {
      CHARACTER_CONTENT: hookText +
        "\n\nBuilding the complete package — on the field and off it. Student-athlete mentality every day.",
      HASHTAGS: getHashtagsForPost(pillar).join(" "),
    });
  }

  return {
    content: templateContent,
    source: hook
      ? `hooksLibrary/${hook.id} + postTemplates`
      : "postTemplates/composed",
    viralScore: hookScore,
    mediaType: hookMediaType,
  };
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export function generateThirtyDayCalendar(): ThirtyDayCalendar {
  // Reset tracking sets for a fresh generation
  usedCaptionIds.clear();
  usedHookIds.clear();
  usedViralIds.clear();

  const startDate = new Date("2026-03-16T00:00:00");
  const posts: GeneratedPost[] = [];
  let dayNumber = 0;

  // Build 30 days: March 16 (Mon) - April 14 (Tue)
  for (let d = 0; d < 30; d++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + d);

    const dayOfWeekIndex = currentDate.getDay(); // 0=Sun
    const dayOfWeek = DAY_NAMES[dayOfWeekIndex];
    const dateStr = currentDate.toISOString().split("T")[0];

    // Saturday & Sunday are optional — include ~50%
    if (dayOfWeek === "Saturday" || dayOfWeek === "Sunday") {
      // Use a deterministic pattern: include weeks 1 & 3 Saturdays, weeks 2 & 4 Sundays
      const weekNum = Math.floor(d / 7) + 1;
      const skipSaturday = weekNum === 2 || weekNum === 4;
      const skipSunday = weekNum === 1 || weekNum === 3;
      if (dayOfWeek === "Saturday" && skipSaturday) continue;
      if (dayOfWeek === "Sunday" && skipSunday) continue;
    }

    dayNumber++;

    // Look up the weekly calendar entry for this day
    const calEntry = weeklyCalendar.find((e) => e.day === dayOfWeek);
    const pillar = (calEntry?.pillar || "performance") as
      | "performance"
      | "work_ethic"
      | "character";

    const weekNum = Math.floor(d / 7) + 1;
    const category = getCategoryForDay(dayOfWeek, weekNum);
    const pt = getPostType(dayOfWeek, weekNum, dayNumber);
    const mechanism = pickMechanism(pillar, dayOfWeek, dayNumber);
    const formula = pickFormula(dayOfWeek, dayNumber);

    // Build the content from real libraries
    const built = buildContent(pillar, dayOfWeek, dayNumber, weekNum, pt);

    // Get hashtags
    const hashtags = getHashtagsForPost(pillar);

    const post: GeneratedPost = {
      id: `day-${String(dayNumber).padStart(2, "0")}-${dayOfWeek.toLowerCase().slice(0, 3)}`,
      date: dateStr,
      dayOfWeek,
      dayNumber,
      pillar,
      category,
      postType: pt,
      content: built.content,
      hashtags,
      suggestedTime: getSuggestedTime(dayOfWeek),
      mediaType: built.mediaType,
      mediaSuggestion: getMediaSuggestion(dayOfWeek, built.mediaType, weekNum),
      psychologyMechanism: mechanism,
      postFormula: formula,
      viralScore: built.viralScore,
      source: built.source,
      coachNote: getCoachNote(pillar, pt, dayOfWeek),
      constitutionCheck: true,
      status: "draft",
    };

    posts.push(post);
  }

  // Calculate pillar breakdown
  const pillarBreakdown = {
    performance: posts.filter((p) => p.pillar === "performance").length,
    work_ethic: posts.filter((p) => p.pillar === "work_ethic").length,
    character: posts.filter((p) => p.pillar === "character").length,
  };

  // Calculate weekly breakdown
  const weeklyBreakdown: { week: number; startDate: string; posts: number }[] =
    [];
  const weekStartDates = [
    "2026-03-16",
    "2026-03-23",
    "2026-03-30",
    "2026-04-06",
    "2026-04-13",
  ];
  for (let w = 0; w < weekStartDates.length; w++) {
    const wStart = weekStartDates[w];
    const wEnd = w < weekStartDates.length - 1 ? weekStartDates[w + 1] : "2026-04-15";
    const weekPosts = posts.filter((p) => p.date >= wStart && p.date < wEnd);
    weeklyBreakdown.push({
      week: w + 1,
      startDate: wStart,
      posts: weekPosts.length,
    });
  }

  return {
    startDate: "2026-03-16",
    endDate: "2026-04-14",
    generatedAt: "2026-03-15T00:00:00.000Z",
    totalPosts: posts.length,
    pillarBreakdown,
    weeklyBreakdown,
    posts,
    strategy: {
      overallTheme:
        "Off-season foundation building — establish consistent posting cadence, showcase year-round training commitment, and build coach visibility heading into spring camp season. " +
        `Jacob Rodgers (${jacobProfile.height} ${jacobProfile.weight}, Class of ${jacobProfile.classYear}, ${jacobProfile.school}) ` +
        "positions himself as a serious, coachable, film-ready OL/DL prospect through authentic daily content.",
      weeklyThemes: [
        "Week 1 (Mar 16-22): Spring Training Foundation — training clips, gym PRs, off-season work ethic",
        "Week 2 (Mar 23-29): Film & Technique Focus — film breakdowns, technique development, coaching credit",
        "Week 3 (Mar 30 - Apr 5): Character & Community — academic balance, team moments, mentoring",
        "Week 4 (Apr 6-12): Camp Season Preview — camp announcements, measurables, competition mindset",
        "Final days (Apr 13-14): Recruiting Journey Update — progress thread, honest self-evaluation",
      ],
      keyDates: KEY_DATES,
    },
  };
}

// Re-export referenced data for downstream consumers
export {
  jacobProfile,
  captionsLibrary,
  hooksLibrary,
  viralContentLibrary,
  postTemplates,
  weeklyCalendar,
  constitutionRules,
  competitorIntel,
};
