/**
 * Auto-Scheduler — 3x/week content rhythm for Jacob Rodgers
 *
 * Runs Mon/Wed/Fri and:
 * 1. Picks appropriate media from Supabase by category
 * 2. Generates a caption via the calendar automation module
 * 3. Queues the post for the next optimal posting time (7:30 PM CT)
 *
 * Monday: training / work_ethic
 * Wednesday: game film / performance
 * Friday: character / team
 */

import { createScheduledPost, getPostQueue } from "./post-pipeline";
import { suggestNextPost } from "./calendar-automation";
import { RECOMMENDED_POST_WINDOWS } from "./posting-rhythm";
import { listMedia } from "@/lib/supabase/storage";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AutoScheduleResult {
  scheduled: boolean;
  reason: string;
  postId?: string;
  content?: string;
  pillar?: string;
  scheduledAt?: string;
}

// ---------------------------------------------------------------------------
// Day-of-week → category + pillar mapping
// ---------------------------------------------------------------------------

const DAY_CONFIG = Object.fromEntries(
  RECOMMENDED_POST_WINDOWS.map((window) => [
    window.weekday,
    {
      categories: [...window.categories],
      pillar: window.pillar,
      label: window.label,
      bestTime: window.bestTime,
    },
  ])
) as Record<number, { categories: string[]; pillar: string; label: string; bestTime: string }>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get next 7:30 PM Central Time today */
function getPostingTime(): Date {
  const now = new Date();
  // CT is UTC-6 (CST) or UTC-5 (CDT). Use a fixed offset for simplicity.
  // 7:30 PM CT ≈ 1:30 AM UTC next day (during CDT) or 1:30 AM UTC (CST)
  // We'll set to 00:30 UTC (which is 7:30 PM CDT / 6:30 PM CST)
  const target = new Date(now);
  target.setUTCHours(0, 30, 0, 0);
  // If that time has passed, move to tomorrow
  if (target <= now) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  return target;
}

/** Pick a random media item from a category */
async function pickMedia(categories: string[]): Promise<{ url: string; type: string } | null> {
  for (const category of categories) {
    const items = await listMedia(category);
    if (items.length > 0) {
      const pick = items[Math.floor(Math.random() * items.length)];
      const isVideo = pick.name.match(/\.(mp4|mov|webm)$/i);
      return {
        url: pick.url,
        type: isVideo ? "video/mp4" : "image/jpeg",
      };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Check if today is a posting day and auto-schedule a post if needed.
 * Safe to call multiple times — skips if a post already exists for today.
 */
export async function autoScheduleToday(): Promise<AutoScheduleResult> {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon, ...

  const config = DAY_CONFIG[dayOfWeek];
  if (!config) {
    return { scheduled: false, reason: `Not a posting day (day ${dayOfWeek})` };
  }

  // Check if we already have a post scheduled for today
  const queue = await getPostQueue("pending");
  const today = now.toISOString().split("T")[0];
  const existingToday = queue.find((p) => p.scheduledAt.startsWith(today));

  if (existingToday) {
    return {
      scheduled: false,
      reason: `Post already scheduled for today: ${existingToday.id}`,
      postId: existingToday.id,
    };
  }

  // Get caption suggestion from AI
  const suggestion = await suggestNextPost();
  const caption = suggestion.suggestedCaption;

  // Try to pick media from Supabase
  const media = await pickMedia(config.categories);

  // Schedule the post
  const scheduledAt = getPostingTime();
  const post = await createScheduledPost({
    content: caption,
    scheduledAt,
    mediaUrl: media?.url ?? undefined,
    mediaType: media?.type ?? undefined,
    pillar: config.pillar,
  });

  return {
    scheduled: true,
    reason: `${config.label} post scheduled for ${scheduledAt.toISOString()} (${config.bestTime})`,
    postId: post.id,
    content: caption,
    pillar: config.pillar,
    scheduledAt: scheduledAt.toISOString(),
  };
}
