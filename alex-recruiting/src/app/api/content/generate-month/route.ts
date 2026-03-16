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

import { NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { weeklyCalendar } from "@/lib/data/weekly-calendar";
import { hooksLibrary, type Hook } from "@/lib/data/hooks-library";
import { getHashtagsForPost } from "@/lib/data/hashtags";
import { type PostFormulaType } from "@/lib/data/content-psychology";

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

/** Build post content from a hook, formula structure, and template elements */
function buildPostContent(
  hook: Hook,
  formulaType: PostFormulaType,
  pillar: string,
  hashtags: string[]
): string {
  const hashtagStr = hashtags.join(" ");

  // Use different content patterns based on formula type
  switch (formulaType) {
    case "spotlight_shift": {
      // Credit someone else
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
      // Ask a question
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
      // Where I was, where I am
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
      // Short, in-the-moment
      return `${hook.text}\n\n${hashtagStr}`;
    }
    case "narrative_loop": {
      // Open a loop
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

export async function POST() {
  try {
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

        const content = buildPostContent(hook, formulaType, pillar, hashtags);
        const mediaSuggestion = getMediaSuggestion(pillar, calendarEntry.contentType);

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
