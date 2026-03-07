/**
 * Calendar Automation — AI-powered weekly content planning for Jacob Rodgers
 *
 * Uses the Anthropic Claude SDK to generate contextually aware content calendars
 * that honour the 40/40/20 content pillar distribution from jacob-profile.ts.
 *
 * Exports:
 *   generateWeeklyCalendar — produce a 7-day structured content plan
 *   suggestNextPost        — recommend the next post based on recent history
 */

import Anthropic from "@anthropic-ai/sdk";
import { jacobProfile } from "@/lib/data/jacob-profile";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ContentPillarId = "performance" | "work_ethic" | "character";

export type PostType =
  | "game_highlight"
  | "training_clip"
  | "stat_update"
  | "game_day"
  | "motivational"
  | "academic"
  | "team_moment"
  | "camp_content"
  | "strength_update"
  | "film_breakdown"
  | "community"
  | "rest_day";

export interface CalendarEntry {
  date: string;           // ISO date string "YYYY-MM-DD"
  dayName: string;        // "Monday", "Tuesday", etc.
  postType: PostType;
  pillar: ContentPillarId;
  suggestedTime: string;  // e.g. "7:00 AM CT"
  caption: string;        // Ready-to-use draft caption
  hashtags: string[];
  mediaNote: string;      // What video/image to pair with this post
  coachNote: string;      // Tip for maximising coach visibility
}

export interface WeeklyCalendar {
  weekStartDate: string;
  weekEndDate: string;
  pillarBreakdown: {
    performance: number;
    work_ethic: number;
    character: number;
  };
  entries: CalendarEntry[];
  weeklyTheme: string;
  generatedAt: string;
}

export interface PostSuggestion {
  postType: PostType;
  pillar: ContentPillarId;
  reasoning: string;
  suggestedCaption: string;
  hashtags: string[];
  suggestedTime: string;
  urgency: "high" | "medium" | "low";
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** Day-of-week name from a Date object */
function dayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Chicago" });
}

/** ISO date string (YYYY-MM-DD) from a Date */
function isoDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Add `n` days to a Date */
function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** Parse JSON safely — return null on failure */
function safeParseJSON<T>(text: string): T | null {
  try {
    // Claude sometimes wraps JSON in markdown fences; strip them
    const cleaned = text.replace(/```json?\s*/gi, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Static fallback calendar (used when Anthropic API is unavailable)
// ---------------------------------------------------------------------------

const FALLBACK_POST_SCHEDULE: Array<{
  postType: PostType;
  pillar: ContentPillarId;
  time: string;
  hashtagSet: string[];
  mediaNoteBase: string;
}> = [
  {
    postType: "training_clip",
    pillar: "work_ethic",
    time: "7:00 AM CT",
    hashtagSet: ["#OLine", "#FootballTraining", "#ClassOf2029"],
    mediaNoteBase: "Morning weight-room session clip — showcase form and intensity",
  },
  {
    postType: "game_highlight",
    pillar: "performance",
    time: "6:00 PM CT",
    hashtagSet: ["#OLine", "#HighSchoolFootball", "#RecruitingClass2029"],
    mediaNoteBase: "Best pancake block or dominant pass-pro rep from Hudl",
  },
  {
    postType: "strength_update",
    pillar: "work_ethic",
    time: "7:30 AM CT",
    hashtagSet: ["#StrengthTraining", "#OLine", "#Pewaukee"],
    mediaNoteBase: "Bench or squat video — numbers with good form",
  },
  {
    postType: "stat_update",
    pillar: "performance",
    time: "5:00 PM CT",
    hashtagSet: ["#OLine", "#ClassOf2029", "#WisconsinFootball"],
    mediaNoteBase: "Stat graphic — use the stat card template",
  },
  {
    postType: "motivational",
    pillar: "character",
    time: "8:00 AM CT",
    hashtagSet: ["#Mindset", "#FootballLife", "#ClassOf2029"],
    mediaNoteBase: "Quote graphic or sideline photo",
  },
  {
    postType: "film_breakdown",
    pillar: "performance",
    time: "4:00 PM CT",
    hashtagSet: ["#FilmRoom", "#OLine", "#HighSchoolFootball"],
    mediaNoteBase: "Short clip with telestration overlay showing technique",
  },
  {
    postType: "team_moment",
    pillar: "character",
    time: "11:00 AM CT",
    hashtagSet: ["#PewaukeeFootball", "#TeamFirst", "#StateChamps"],
    mediaNoteBase: "Team huddle, celebration, or locker-room moment",
  },
];

function buildFallbackCalendar(startDate: Date): WeeklyCalendar {
  const entries: CalendarEntry[] = FALLBACK_POST_SCHEDULE.map((template, i) => {
    const date = addDays(startDate, i);
    return {
      date: isoDate(date),
      dayName: dayName(date),
      postType: template.postType,
      pillar: template.pillar,
      suggestedTime: template.time,
      caption: buildFallbackCaption(template.postType),
      hashtags: template.hashtagSet,
      mediaNote: template.mediaNoteBase,
      coachNote: "Post during peak coach activity windows (7–9 AM or 5–7 PM CT weekdays).",
    };
  });

  const breakdown = countPillars(entries);

  return {
    weekStartDate: isoDate(startDate),
    weekEndDate: isoDate(addDays(startDate, 6)),
    pillarBreakdown: breakdown,
    entries,
    weeklyTheme: "Consistency Builds Credibility",
    generatedAt: new Date().toISOString(),
  };
}

function buildFallbackCaption(postType: PostType): string {
  const { name, jerseyNumber, position, school, classYear } = jacobProfile;
  const captions: Record<PostType, string> = {
    game_highlight: `Doing my job in the trenches. Every rep matters. 🏈\n\n${name} | #${jerseyNumber} | ${position} | ${school} '${String(classYear).slice(2)}`,
    training_clip: `Work never stops. Back in the weight room this morning.\n\n${position} | ${school} | Class of ${classYear}`,
    stat_update: `Season numbers: ${jacobProfile.seasonStats.pancakeBlocks} pancakes, ${jacobProfile.seasonStats.sacks} sacks — on a ${jacobProfile.seasonStats.teamRecord} State Championship squad.\n\n${name} | ${position} | Class of ${classYear}`,
    game_day: `Game day. Let's work. 🏟️\n\n#${jerseyNumber} | ${position} | ${school}`,
    motivational: `The grind doesn't take days off. Neither do I.\n\n${name} | ${position} | ${school} '${String(classYear).slice(2)}`,
    academic: `Balancing the books and the film room. ${jacobProfile.gpa} GPA — student-athlete means both.\n\n${name} | ${position} | Class of ${classYear}`,
    team_moment: `State Champions. This team, this moment. 🏆\n\n${school} Football | Class of ${classYear}`,
    camp_content: `Camp season is where reputations are made. Putting in reps today.\n\n${name} | ${position} | ${school}`,
    strength_update: `${jacobProfile.bench} bench / ${jacobProfile.squat} squat — still growing.\n\n${position} | ${jacobProfile.height} ${jacobProfile.weight} | Class of ${classYear}`,
    film_breakdown: `Breaking down the film. Every detail matters in the trenches.\n\n${name} | ${position} | ${school}`,
    community: `Giving back to the community that built me. Grateful.\n\n${name} | ${school} | Class of ${classYear}`,
    rest_day: `Recovery is part of the process. Active rest day.\n\n${name} | ${position} | ${school}`,
  };
  return captions[postType] ?? captions.motivational;
}

function countPillars(entries: CalendarEntry[]): WeeklyCalendar["pillarBreakdown"] {
  const counts = { performance: 0, work_ethic: 0, character: 0 };
  for (const e of entries) counts[e.pillar]++;
  return counts;
}

// ---------------------------------------------------------------------------
// 1. generateWeeklyCalendar
// ---------------------------------------------------------------------------

export async function generateWeeklyCalendar(startDate: Date = new Date()): Promise<WeeklyCalendar> {
  // Build the date list for prompt context
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(startDate, i);
    return { date: isoDate(d), day: dayName(d) };
  });

  const pillarContext = jacobProfile.contentPillars
    .map((p) => `- ${p.name} (${p.percentage}%): ${p.description}`)
    .join("\n");

  const profileContext = `
Name: ${jacobProfile.name}
Position: ${jacobProfile.positionFull} (${jacobProfile.position})
Jersey: #${jacobProfile.jerseyNumber}
Size: ${jacobProfile.height}, ${jacobProfile.weight}
School: ${jacobProfile.school}, ${jacobProfile.state}
Class: ${jacobProfile.classYear}
Stats: ${jacobProfile.seasonStats.pancakeBlocks} pancakes, ${jacobProfile.seasonStats.sacks} sacks, ${jacobProfile.seasonStats.fumbleRecoveries} FR, ${jacobProfile.seasonStats.teamRecord} record
Strength: ${jacobProfile.bench} bench / ${jacobProfile.squat} squat
GPA: ${jacobProfile.gpa}
X Handle: ${jacobProfile.xHandle}
Core Message: ${jacobProfile.coreMessage}
`.trim();

  const systemPrompt = `You are Trey, Jacob Rodgers' Content Strategist. You produce weekly X/Twitter content calendars for a Class of 2029 high school football recruiting campaign.

ATHLETE PROFILE:
${profileContext}

CONTENT PILLARS (target distribution):
${pillarContext}

POSTING CONSTITUTION (never violate):
- No trash talk, no complaining about coaches
- No personal drama or controversy
- Every post reinforces the athlete brand
- Academic content must be genuine, not forced
- Media must be real game or training footage

BEST POSTING WINDOWS (Central Time):
- Weekday mornings: 7–9 AM CT (coaches check feeds)
- Weekday evenings: 5–7 PM CT (peak recruiting traffic)
- Weekend mornings: 8–11 AM CT

OUTPUT FORMAT:
Return ONLY a JSON object — no markdown fences, no extra commentary — with this exact shape:
{
  "weeklyTheme": "string — one compelling theme for the week",
  "entries": [
    {
      "dayName": "Monday",
      "postType": "training_clip",
      "pillar": "work_ethic",
      "suggestedTime": "7:00 AM CT",
      "caption": "Ready-to-post tweet text (under 240 chars, no placeholders)",
      "hashtags": ["#OLine", "#ClassOf2029"],
      "mediaNote": "Specific description of the clip or graphic to use",
      "coachNote": "One sentence tip for maximising coach engagement on this specific post"
    }
  ]
}

Valid postType values: game_highlight, training_clip, stat_update, game_day, motivational, academic, team_moment, camp_content, strength_update, film_breakdown, community, rest_day
Valid pillar values: performance, work_ethic, character

The entries array MUST have exactly 7 elements (one per day) in chronological order.
Target distribution: 3 performance posts, 3 work_ethic posts, 1 character post.`;

  const userPrompt = `Generate a weekly content calendar for the week of ${dates[0].date} through ${dates[6].date}.

Days: ${dates.map((d) => `${d.day} ${d.date}`).join(", ")}

Make every caption authentic and ready to post — use Jacob's voice (confident but not arrogant, hard-working, team-first). Reference the ${jacobProfile.seasonStats.teamRecord} state championship season where relevant.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    type AICalendarShape = {
      weeklyTheme: string;
      entries: Array<{
        dayName: string;
        postType: PostType;
        pillar: ContentPillarId;
        suggestedTime: string;
        caption: string;
        hashtags: string[];
        mediaNote: string;
        coachNote: string;
      }>;
    };

    const parsed = safeParseJSON<AICalendarShape>(rawText);

    if (parsed && Array.isArray(parsed.entries) && parsed.entries.length === 7) {
      const entries: CalendarEntry[] = parsed.entries.map((e, i) => ({
        date: isoDate(addDays(startDate, i)),
        dayName: dates[i].day,
        postType: e.postType,
        pillar: e.pillar,
        suggestedTime: e.suggestedTime,
        caption: e.caption,
        hashtags: e.hashtags ?? [],
        mediaNote: e.mediaNote,
        coachNote: e.coachNote,
      }));

      return {
        weekStartDate: isoDate(startDate),
        weekEndDate: isoDate(addDays(startDate, 6)),
        pillarBreakdown: countPillars(entries),
        entries,
        weeklyTheme: parsed.weeklyTheme ?? "Consistency Builds Credibility",
        generatedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error("[calendar-automation] Anthropic API error:", err);
  }

  // Fallback to static template
  return buildFallbackCalendar(startDate);
}

// ---------------------------------------------------------------------------
// 2. suggestNextPost
// ---------------------------------------------------------------------------

export interface RecentPostHistory {
  postType: PostType;
  pillar: ContentPillarId;
  postedAt: string; // ISO date string
}

export async function suggestNextPost(
  recentHistory: RecentPostHistory[] = []
): Promise<PostSuggestion> {
  const pillarContext = jacobProfile.contentPillars
    .map((p) => `- ${p.name} (${p.percentage}%): ${p.description}`)
    .join("\n");

  const historyText =
    recentHistory.length > 0
      ? recentHistory
          .slice(-10)
          .map((h) => `${h.postedAt}: ${h.postType} (${h.pillar})`)
          .join("\n")
      : "No recent posts — this is the first post.";

  const systemPrompt = `You are Trey, Jacob Rodgers' Content Strategist. Analyse post history and recommend the single best next post.

CONTENT PILLARS:
${pillarContext}

Return ONLY a JSON object:
{
  "postType": "training_clip",
  "pillar": "work_ethic",
  "reasoning": "Why this post now (1-2 sentences)",
  "suggestedCaption": "Ready-to-post tweet text",
  "hashtags": ["#OLine"],
  "suggestedTime": "7:00 AM CT",
  "urgency": "high"
}
Valid urgency: "high" | "medium" | "low"`;

  const userPrompt = `Recent post history (oldest first):
${historyText}

Today's date: ${isoDate(new Date())}

What should Jacob post next to maintain momentum and hit the 40/40/20 pillar distribution?`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    const parsed = safeParseJSON<PostSuggestion>(rawText);
    if (parsed && parsed.postType && parsed.pillar) {
      return parsed;
    }
  } catch (err) {
    console.error("[calendar-automation] suggestNextPost API error:", err);
  }

  // Fallback suggestion
  return {
    postType: "training_clip",
    pillar: "work_ethic",
    reasoning:
      "Training content performs consistently well and reinforces the work-ethic pillar, which should represent 40% of posts.",
    suggestedCaption: `Back in the weight room. The work never stops.\n\n${jacobProfile.name} | #${jacobProfile.jerseyNumber} | ${jacobProfile.position} | ${jacobProfile.school} Class of ${jacobProfile.classYear}`,
    hashtags: ["#OLine", "#ClassOf2029", "#FootballTraining", "#Pewaukee"],
    suggestedTime: "7:00 AM CT",
    urgency: "medium",
  };
}
