/**
 * POST /api/content/generate-week
 *
 * AI-powered weekly content generation using Claude.
 * Generates 5-7 posts for the upcoming week with pillar balance,
 * psychology mechanisms, and optimal timing from the weekly calendar.
 *
 * Body (optional):
 * {
 *   weekStartDate?: string  // ISO date, defaults to next Monday
 *   context?: string        // Additional context (e.g. "camp this weekend", "game Friday")
 * }
 *
 * Returns:
 * {
 *   success: true,
 *   weekStart: string,
 *   generated: number,
 *   posts: GeneratedWeekPost[]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { jacobProfile } from "@/lib/data/jacob-profile";
import { weeklyCalendar } from "@/lib/data/weekly-calendar";
import { constitutionRules } from "@/lib/data/constitution";
import { getContentPsychologyPrompt } from "@/lib/data/content-psychology";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const generateWeekSchema = z.object({
  weekStartDate: z.string().optional(),
  context: z.string().max(2000).optional().default(""),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GeneratedWeekPost {
  id: string;
  dayOfWeek: string;
  date: string;
  content: string;
  pillar: string;
  hashtags: string[];
  bestTime: string;
  mediaSuggestion: string;
  psychologyMechanism: string;
  status: "draft";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getNextMonday(from?: string): Date {
  const base = from ? new Date(from) : new Date();
  const day = base.getDay();
  const diff = day === 0 ? 1 : 8 - day; // if Sunday, next day; otherwise next Monday
  const monday = new Date(base);
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekDates(monday: Date): { day: string; date: string }[] {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days.map((day, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return { day, date: d.toISOString().slice(0, 10) };
  });
}

function generateId(): string {
  return `wp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Build prompt
// ---------------------------------------------------------------------------

function buildWeeklyPrompt(weekDates: { day: string; date: string }[], context: string): string {
  const calendarGuide = weeklyCalendar
    .map((entry) => `- ${entry.day}: ${entry.contentType} (Pillar: ${entry.pillar}, Best time: ${entry.bestTime}). Notes: ${entry.notes}`)
    .join("\n");

  return `You are Alex, Jacob Rodgers' AI content strategist. Generate a week of X/Twitter posts for Jacob.

JACOB'S PROFILE:
- ${jacobProfile.positionFull} | ${jacobProfile.height} ${jacobProfile.weight} | Class of ${jacobProfile.classYear}
- ${jacobProfile.school}, ${jacobProfile.state}
- Handle: ${jacobProfile.xHandle}
- Core message: ${jacobProfile.coreMessage}

CONTENT PILLARS (must be balanced across the week):
- performance (40%): Film clips, game highlights, training results
- work_ethic (40%): Training videos, workouts, camps, grind content
- character (20%): Academic, community, team moments

WEEKLY CALENDAR GUIDE:
${calendarGuide}

POSTING CONSTITUTION — Jacob NEVER posts:
${constitutionRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

${getContentPsychologyPrompt()}

WEEK DATES:
${weekDates.map((d) => `- ${d.day}: ${d.date}`).join("\n")}

${context ? `ADDITIONAL CONTEXT FOR THIS WEEK:\n${context}\n` : ""}

Generate exactly ${weekDates.length >= 7 ? "5-7" : weekDates.length} posts for this week. Skip Saturday and Sunday if no specific event context is provided for them.

For EACH post, respond in this exact JSON format (array of objects):
[
  {
    "dayOfWeek": "Monday",
    "date": "YYYY-MM-DD",
    "content": "The actual tweet text (under 280 characters preferred, max 500)",
    "pillar": "performance|work_ethic|character",
    "hashtags": ["tag1", "tag2", "tag3"],
    "bestTime": "HH:MM AM/PM CST",
    "mediaSuggestion": "Brief description of ideal media to pair with this post",
    "psychologyMechanism": "identity_resonance|reciprocity|commitment_consistency|scarcity|loss_aversion|narrative_transportation|curiosity_gap|autonomy_bias"
  }
]

RULES:
- Each post MUST use a different psychology mechanism
- Pillar balance: ~2 performance, ~2 work_ethic, ~1 character minimum
- Make others the hero (coaches, teammates, trainers)
- Vary post formats: question, story, stat callout, gratitude, behind-the-scenes
- Keep tweets authentic to a 15-year-old athlete — not corporate
- Every post must pass the constitution check
- Return ONLY the JSON array, no additional text`;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  let rawBody: unknown = {};
  try {
    const text = await req.text();
    if (text) rawBody = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = generateWeekSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { weekStartDate, context } = parsed.data;

  try {
    // Calculate week dates
    const monday = weekStartDate ? new Date(weekStartDate) : getNextMonday();
    const weekDates = getWeekDates(monday);
    const weekStart = weekDates[0].date;

    // Build prompt and call Claude
    const prompt = buildWeeklyPrompt(weekDates, context);

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the JSON response
    let aiPosts: Array<{
      dayOfWeek: string;
      date: string;
      content: string;
      pillar: string;
      hashtags: string[];
      bestTime: string;
      mediaSuggestion: string;
      psychologyMechanism: string;
    }>;

    try {
      // Extract JSON from response (Claude sometimes wraps in markdown code blocks)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found in response");
      aiPosts = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("[POST /api/content/generate-week] Failed to parse AI response:", parseErr);
      return NextResponse.json(
        { error: "Failed to parse AI response", rawResponse: text.slice(0, 500) },
        { status: 500 },
      );
    }

    // Build posts with IDs
    const posts: GeneratedWeekPost[] = aiPosts.map((p) => ({
      id: generateId(),
      dayOfWeek: p.dayOfWeek,
      date: p.date,
      content: p.content,
      pillar: p.pillar || "performance",
      hashtags: p.hashtags || [],
      bestTime: p.bestTime || "12:00 PM CST",
      mediaSuggestion: p.mediaSuggestion || "",
      psychologyMechanism: p.psychologyMechanism || "commitment_consistency",
      status: "draft" as const,
    }));

    // Optionally save to Supabase posts table
    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        const rows = posts.map((p) => {
          // Parse the bestTime into a scheduled timestamp
          const dateStr = p.date;
          const timeMatch = p.bestTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          let scheduledFor = `${dateStr}T12:00:00`;
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2];
            const ampm = timeMatch[3].toUpperCase();
            if (ampm === "PM" && hours !== 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;
            scheduledFor = `${dateStr}T${String(hours).padStart(2, "0")}:${minutes}:00`;
          }

          return {
            content: p.content,
            pillar: p.pillar,
            hashtags: p.hashtags,
            media_url: null,
            scheduled_for: scheduledFor,
            best_time: p.bestTime,
            status: "draft",
          };
        });

        await supabase.from("posts").insert(rows);
      } catch (dbErr) {
        console.error("[POST /api/content/generate-week] DB save error:", dbErr);
        // Non-fatal — still return the generated posts
      }
    }

    return NextResponse.json({
      success: true,
      weekStart,
      generated: posts.length,
      posts,
    });
  } catch (err) {
    console.error("[POST /api/content/generate-week]", err);

    // If Anthropic API fails, return a helpful in-memory fallback
    if (!process.env.ANTHROPIC_API_KEY) {
      const monday = weekStartDate ? new Date(weekStartDate) : getNextMonday();
      const weekDates = getWeekDates(monday);

      const fallbackPosts: GeneratedWeekPost[] = weekDates.slice(0, 5).map((d, i) => {
        const cal = weeklyCalendar.find((c) => c.day === d.day) || weeklyCalendar[0];
        return {
          id: generateId(),
          dayOfWeek: d.day,
          date: d.date,
          content: `[AI generation unavailable] ${cal.contentType}`,
          pillar: cal.pillar,
          hashtags: ["recruiting", "classof2029", "football"],
          bestTime: cal.bestTime.split("-")[0] || "12:00 PM CST",
          mediaSuggestion: "Add a training photo or game clip",
          psychologyMechanism: "commitment_consistency",
          status: "draft" as const,
        };
      });

      return NextResponse.json({
        success: true,
        weekStart: weekDates[0].date,
        generated: fallbackPosts.length,
        posts: fallbackPosts,
        fallback: true,
      });
    }

    return NextResponse.json(
      { error: "Failed to generate weekly content" },
      { status: 500 },
    );
  }
}
