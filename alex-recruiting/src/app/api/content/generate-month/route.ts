/**
 * POST /api/content/generate-month
 *
 * Generate 30 days of content (3-4 posts per day, ~100 posts total).
 *
 * Uses the weekly calendar, hooks library, post templates, and hashtag system
 * to produce a varied, pillar-balanced content queue.
 *
 * Returns:
 * {
 *   success: true,
 *   generated: number,
 *   posts: GeneratedPost[]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { weeklyCalendar } from "@/lib/data/weekly-calendar";
import { hooksLibrary, type Hook } from "@/lib/data/hooks-library";
import { getHashtagsForPost } from "@/lib/data/hashtags";
import { type PostFormulaType } from "@/lib/data/content-psychology";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Activity Context
// ---------------------------------------------------------------------------

interface ActivityContext {
  currentActivities?: string[];
  currentSport?: string;
  trackEvents?: string[];
  recentAchievements?: string[];
  teamContext?: string;
  mediaAssets?: { url: string; type: string }[];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GeneratedPost {
  id: string;
  content: string;
  pillar: string;
  hashtags: string[];
  scheduledFor: string;
  bestTime: string;
  status: string;
  mediaSuggestion: string;
  formulaType: string;
  hookId: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `cq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Shuffle an array (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick a media suggestion based on pillar and content type */
function getMediaSuggestion(pillar: string, contentType: string): string {
  if (contentType.includes("film") || contentType.includes("highlight")) {
    return "Native video, 15-45 seconds, trimmed tight, best angle";
  }
  if (contentType.includes("training") || contentType.includes("workout")) {
    return "Training video or photo -- gym, field, or facility";
  }
  if (pillar === "character") {
    return "Team photo, classroom/GPA screenshot, or community event photo";
  }
  if (contentType.includes("game") || contentType.includes("Game")) {
    return "Game action photo or team huddle";
  }
  if (contentType.includes("camp") || contentType.includes("Camp")) {
    return "Camp/event logo or facility photo";
  }
  return "High-quality photo or native video";
}

// Activity-aware content variants
const ACTIVITY_VARIANTS: Record<string, Record<string, string[]>> = {
  track_season: {
    spotlight_shift: [
      "Shot put PR today. The explosive power from throwing translates directly to the punch off the line.",
      "Discus is teaching me hip rotation in ways football drills never did. The transfer is real.",
      "Track coach says my explosiveness off the blocks is the best on the team. OL footwork pays off everywhere.",
    ],
    curious_student: [
      "Any football coaches here who encourage their OL to throw in track? The power gains are noticeable.",
      "Shot put and pass blocking have more in common than most people think. Coaches, what's your take?",
    ],
    honest_progress: [
      "Track season update: shot put distance up 3 feet since January. The weight room work is showing.",
      "Balancing track meets and football offseason. Discus on Tuesday, squats on Wednesday. Building the complete athlete.",
    ],
    ambient_update: [
      "Track meet day. Shot put ring. Let's compete.",
      "Discus + shot put today. Two-sport athletes work different.",
    ],
    narrative_loop: [
      "Track season goal: hit 45 feet in shot put by conference. Starting at 40. Updates every meet.",
      "Using track season to build explosive power for football. Measuring the crossover. Stay tuned.",
    ],
  },
  weight_room: {
    spotlight_shift: [
      "Bench PR today. Couldn't have done it without the guys pushing me. The weight room culture at Pewaukee is elite.",
      "Shoutout to our strength coaches for programming that actually translates to the field.",
    ],
    curious_student: [
      "Coaches -- do you prefer OL prospects who prioritize bench press or squat? Trying to program my spring lifts.",
      "Working on squat form this week. Any OL coaches have cues that helped their players?",
    ],
    honest_progress: [
      "Spring lifting numbers: bench trending up consistently. Squat form clicking. The spring program is working.",
      "Tracking every rep this spring. Bench, squat, clean -- the numbers don't lie. Consistent gains.",
    ],
    ambient_update: [
      "5 AM lift. No shortcuts.",
      "Spring lifts done. Bench day. Getting stronger.",
    ],
    narrative_loop: [
      "30-day bench challenge starting now. Current max: [BENCH]. Goal: +15 lbs. I'll post the results.",
      "Tracking my squat progression this spring. Week 1 in the books. Stay tuned for the gains.",
    ],
  },
  pwac_football_offseason: {
    spotlight_shift: [
      "Film study session with the O-line. Breaking down every play from last season. We're going to be different.",
      "PWAC offseason program is built different. Coach Henderson has us dialed in on technique this spring.",
    ],
    curious_student: [
      "Studying pass protection schemes from college film this week. Always learning, always growing.",
      "Working on combo blocks with our center. Any OL coaches have drills for communication on the move?",
    ],
    honest_progress: [
      "Offseason progress: film study 3x/week, technique drills daily, spring lifts on schedule. Building the foundation.",
      "Compared my Week 1 film to Week 12 last season. The improvement in hand placement alone is night and day.",
    ],
    ambient_update: [
      "Film study. Technique drills. Building for fall.",
      "PWAC offseason work. Every detail matters.",
    ],
    narrative_loop: [
      "Setting 3 football technique goals for this offseason. Will track progress and report back before camp.",
      "This offseason is about refining the details. Starting a weekly technique journal. Updates coming.",
    ],
  },
  film_study: {
    spotlight_shift: [
      "Watched 2 hours of college OL film today. Studying how the best programs develop linemen.",
      "Breaking down Iowa's OL technique -- the consistency of their footwork is what stands out.",
    ],
    curious_student: [
      "Studying pull technique on film. What do coaches look for in a pulling guard at the next level?",
      "Watching college OL film and noticed different hand placement styles. Which do coaches prefer?",
    ],
    honest_progress: [
      "Film study habit update: 3 sessions this week. Starting to see plays develop before the snap.",
      "Getting better at self-scouting. Found 3 technique fixes from last season's film this week.",
    ],
    ambient_update: [
      "Film room. Learning never stops.",
      "Breaking down game film. Students of the game win.",
    ],
    narrative_loop: [
      "Committing to studying film from one target school each week this spring. Starting with NDSU.",
      "Building a technique notebook from film study. Will share what I'm learning along the way.",
    ],
  },
  meta_glasses: {
    spotlight_shift: [
      "POV training footage from today's session. Meta Glasses showing a different perspective on the work.",
      "First-person view of the drill. This angle shows what coaches can't see from the sideline.",
    ],
    curious_student: [
      "Using Meta Glasses to film training from first-person POV. Coaches -- is this kind of content useful for evaluation?",
    ],
    honest_progress: [
      "Meta Glasses training footage is helping me see technique flaws I couldn't catch before. Game changer for self-improvement.",
    ],
    ambient_update: [
      "POV training clip. See it from my perspective.",
      "Meta Glasses on. Let's get to work.",
    ],
    narrative_loop: [
      "Starting a POV training series with Meta Glasses. Week 1 footage drops this weekend.",
    ],
  },
};

/** Build post content from a hook, formula structure, and template elements */
function buildPostContent(
  hook: Hook,
  formulaType: PostFormulaType,
  pillar: string,
  hashtags: string[],
  activityContext?: ActivityContext
): string {
  const hashtagStr = hashtags.join(" ");

  // If activity context is provided, try to use activity-specific content
  if (activityContext?.currentActivities && activityContext.currentActivities.length > 0) {
    // Pick a random activity from the current activities
    const activity = activityContext.currentActivities[
      Math.floor(Math.random() * activityContext.currentActivities.length)
    ];
    const variants = ACTIVITY_VARIANTS[activity]?.[formulaType];
    if (variants && variants.length > 0) {
      const variant = variants[Math.floor(Math.random() * variants.length)];
      return `${hook.text}\n\n${variant}\n\n${hashtagStr}`;
    }
  }

  // Fallback: Use default content patterns based on formula type
  switch (formulaType) {
    case "spotlight_shift": {
      const credits = [
        "Grateful for the coaching staff at Pewaukee pushing us every day.",
        "Our whole O-line group showed up today. Iron sharpens iron.",
        "Coach Henderson's technique drills are changing how we play.",
        "Nothing happens without the guys next to me doing their job.",
        "The strength coaches have us on a whole new program this month.",
      ];
      const credit = credits[Math.floor(Math.random() * credits.length)];
      return `${hook.text}\n\n${credit}\n\n${hashtagStr}`;
    }
    case "curious_student": {
      const questions = [
        "Any OL coaches have thoughts on this technique? Always looking to learn.",
        "What do you work on first -- hand placement or footwork? Genuine question.",
        "Curious what coaches look for in film from a young OL. Input welcome.",
        "Still studying this play. What would you change about the execution?",
        "Working on my second-level blocking. Any drills coaches would recommend?",
      ];
      const question = questions[Math.floor(Math.random() * questions.length)];
      return `${hook.text}\n\n${question}\n\n${hashtagStr}`;
    }
    case "honest_progress": {
      const updates = [
        "Honest progress report: bench is up 15 lbs this month. Squat form finally clicking. Still working on lateral agility.",
        "Six months ago I couldn't sustain a block past 3 seconds. Now averaging 5+. The work shows up in the numbers.",
        "This week was about getting back to basics. Footwork drills, hand placement, film review. Building the foundation.",
        "Not perfect yet. Anchor still needs work on speed rushes. But the improvement from last season is real.",
        "Tracking my progress month over month. The numbers don't lie -- consistency is the cheat code.",
      ];
      const update = updates[Math.floor(Math.random() * updates.length)];
      return `${hook.text}\n\n${update}\n\n${hashtagStr}`;
    }
    case "ambient_update": {
      return `${hook.text}\n\n${hashtagStr}`;
    }
    case "narrative_loop": {
      const loops = [
        "Setting a goal for this month. I'll report back with the results.",
        "Challenge accepted. Check back in 30 days to see where this goes.",
        "This is week one of a new program. Following the process. Stay tuned.",
        "Started tracking every rep this week. The data is going to be interesting.",
        "New personal challenge: improve every measurable by next camp. Updates coming.",
      ];
      const loop = loops[Math.floor(Math.random() * loops.length)];
      return `${hook.text}\n\n${loop}\n\n${hashtagStr}`;
    }
    default:
      return `${hook.text}\n\n${hashtagStr}`;
  }
}

/** Parse a time range like "6:30-8:00 AM CST" into an hour number for scheduling */
function parseTimeToHour(timeStr: string): number {
  // Extract the first time in the range
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 12; // default noon
  let hour = parseInt(match[1], 10);
  // Check for PM
  if (timeStr.includes("PM") && hour < 12) hour += 12;
  if (timeStr.includes("AM") && hour === 12) hour = 0;
  return hour;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // Parse optional activity context from request body
    let activityContext: ActivityContext | undefined;
    try {
      const body = await req.json();
      if (body?.activityContext) {
        activityContext = body.activityContext;
      }
    } catch {
      // Empty body is fine — generates generic content
    }

    const now = new Date();
    const posts: GeneratedPost[] = [];
    const formulaTypes: PostFormulaType[] = [
      "spotlight_shift",
      "curious_student",
      "honest_progress",
      "ambient_update",
      "narrative_loop",
    ];

    // Pool of hooks by pillar for quick access
    const hookPools: Record<string, Hook[]> = {
      performance: shuffle(hooksLibrary.filter((h) => h.pillar === "performance")),
      work_ethic: shuffle(hooksLibrary.filter((h) => h.pillar === "work_ethic")),
      character: shuffle(hooksLibrary.filter((h) => h.pillar === "character")),
    };

    // Pool index trackers
    const hookIndexes: Record<string, number> = {
      performance: 0,
      work_ethic: 0,
      character: 0,
    };

    /** Get next available hook for a pillar, cycling through pool */
    const getNextHook = (pillar: string): Hook => {
      const pool = hookPools[pillar] || hookPools.performance;
      const idx = hookIndexes[pillar] || 0;
      const hook = pool[idx % pool.length];
      hookIndexes[pillar] = idx + 1;
      return hook;
    };

    // Generate 30 days of content
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(now);
      date.setDate(date.getDate() + dayOffset);

      // Determine day of week (0=Sun .. 6=Sat)
      const dayOfWeek = date.getDay();
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = dayNames[dayOfWeek];

      // Find matching calendar entry
      const calendarEntry = weeklyCalendar.find((e) => e.day === dayName) || weeklyCalendar[0];
      const primaryPillar = calendarEntry.pillar;

      // Determine how many posts for this day (3-4)
      const postsPerDay = dayOfWeek === 0 || dayOfWeek === 6 ? 3 : 4;

      // Build the pillar sequence for the day
      // Primary pillar gets 2 posts, secondary pillars get 1 each
      const pillars = ["performance", "work_ethic", "character"];
      const dayPillars: string[] = [primaryPillar, primaryPillar];
      const otherPillars = pillars.filter((p) => p !== primaryPillar);
      for (const p of otherPillars) {
        dayPillars.push(p);
      }
      // Trim to postsPerDay
      const selectedPillars = shuffle(dayPillars).slice(0, postsPerDay);

      // Parse the best time for scheduling
      const baseHour = parseTimeToHour(calendarEntry.bestTime);

      for (let i = 0; i < selectedPillars.length; i++) {
        const pillar = selectedPillars[i];
        const hook = getNextHook(pillar);
        const formulaType = formulaTypes[(dayOffset * 4 + i) % formulaTypes.length];
        const hashtags = getHashtagsForPost(pillar);

        const content = buildPostContent(hook, formulaType, pillar, hashtags, activityContext);

        // Use real media URLs if provided
        let mediaSuggestion: string;
        if (activityContext?.mediaAssets && activityContext.mediaAssets.length > 0) {
          const asset = activityContext.mediaAssets[i % activityContext.mediaAssets.length];
          mediaSuggestion = asset.url;
        } else {
          mediaSuggestion = getMediaSuggestion(pillar, calendarEntry.contentType);
        }

        // Space posts across the day: base hour + i * 2-3 hours
        const postHour = Math.min(baseHour + i * 3, 21); // don't go past 9 PM
        const scheduledDate = new Date(date);
        scheduledDate.setHours(postHour, 0, 0, 0);

        const post: GeneratedPost = {
          id: generateId(),
          content,
          pillar,
          hashtags,
          scheduledFor: scheduledDate.toISOString(),
          bestTime: calendarEntry.bestTime,
          status: "queued",
          mediaSuggestion,
          formulaType,
          hookId: hook.id,
          createdAt: new Date().toISOString(),
        };

        posts.push(post);
      }
    }

    // Try to store in the database
    if (isDbConfigured()) {
      try {
        const dbRecords = posts.map((p) => ({
          content: p.content,
          pillar: p.pillar,
          hashtags: p.hashtags,
          scheduledFor: new Date(p.scheduledFor),
          bestTime: p.bestTime,
          status: "queued",
        }));

        // Insert in batches of 20 to avoid oversized queries
        for (let i = 0; i < dbRecords.length; i += 20) {
          const batch = dbRecords.slice(i, i + 20);
          await db.insert(schema.posts).values(batch);
        }
      } catch (dbError) {
        console.error("[generate-month] DB insert failed, returning in-memory:", dbError);
        // Still return the generated posts even if DB insert fails
      }
    }

    return NextResponse.json({
      success: true,
      generated: posts.length,
      posts,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[POST /api/content/generate-month]", err);
    return NextResponse.json(
      { error: "Failed to generate monthly content", details: message },
      { status: 500 }
    );
  }
}
