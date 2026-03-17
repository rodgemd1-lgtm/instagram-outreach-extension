import type { ContentPillar, Post } from "../types";
import { weeklyCalendar, getTodayEntry } from "../data/weekly-calendar";
import { getHashtagsForPost } from "../data/hashtags";
import { postTemplates } from "../data/templates";

export interface PostDraft {
  content: string;
  pillar: ContentPillar;
  hashtags: string[];
  bestTime: string;
  mediaSuggestion: string;
  templateName: string;
}

// Get today's content recommendation based on the weekly calendar
export function getTodayRecommendation(): {
  day: string;
  pillar: ContentPillar;
  contentType: string;
  bestTime: string;
  notes: string;
  hashtags: string[];
} {
  const entry = getTodayEntry();
  const hashtags = getHashtagsForPost(entry.pillar);

  return {
    day: entry.day,
    pillar: entry.pillar,
    contentType: entry.contentType,
    bestTime: entry.bestTime,
    notes: entry.notes,
    hashtags,
  };
}

// Generate a post draft from a template
export function generateDraftFromTemplate(
  templateKey: keyof typeof postTemplates,
  variables: Record<string, string>
): PostDraft {
  const template = postTemplates[templateKey];
  let content = template.template;

  for (const [key, value] of Object.entries(variables)) {
    content = content.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }

  // Remove unfilled variables
  content = content.replace(/\{[A-Z_]+\}/g, "[TBD]");

  const pillar = templateKey === "characterPost" ? "character" :
    templateKey === "trainingPost" ? "work_ethic" : "performance";

  return {
    content,
    pillar: pillar as ContentPillar,
    hashtags: getHashtagsForPost(pillar),
    bestTime: getTodayEntry().bestTime,
    mediaSuggestion: getMediaSuggestion(templateKey),
    templateName: template.name,
  };
}

function getMediaSuggestion(templateKey: string): string {
  switch (templateKey) {
    case "pinned": return "Native highlight video upload (15-60 seconds, best clips)";
    case "highlightClip": return "Native video, 15-45 seconds, trimmed tight, best angle";
    case "trainingPost": return "Training video or photo — gym, field, or IMG facility";
    case "characterPost": return "Team photo, classroom/GPA screenshot, or community event photo";
    case "gameDayPost": return "Game action photo or team huddle";
    case "campAnnouncement": return "Camp/event logo or facility photo";
    case "milestonePost": return "Screenshot of offer/achievement or celebration photo";
    default: return "High-quality photo or native video";
  }
}

// Get the full 7-day content calendar
export function getWeeklyPlan(): typeof weeklyCalendar {
  return weeklyCalendar;
}

// Calculate pillar distribution from recent posts
export function calculatePillarDistribution(posts: Post[]): {
  performance: number;
  work_ethic: number;
  character: number;
  balanced: boolean;
} {
  const total = posts.length || 1;
  const counts = { performance: 0, work_ethic: 0, character: 0 };

  for (const post of posts) {
    if (post.pillar in counts) {
      counts[post.pillar as keyof typeof counts]++;
    }
  }

  const distribution = {
    performance: Math.round((counts.performance / total) * 100),
    work_ethic: Math.round((counts.work_ethic / total) * 100),
    character: Math.round((counts.character / total) * 100),
    balanced: false,
  };

  // Target: 40% performance, 40% work ethic, 20% character (±10% tolerance)
  distribution.balanced =
    distribution.performance >= 30 && distribution.performance <= 50 &&
    distribution.work_ethic >= 30 && distribution.work_ethic <= 50 &&
    distribution.character >= 10 && distribution.character <= 30;

  return distribution;
}

// Create a new post record
export function createPostRecord(draft: PostDraft, scheduledFor: string): Omit<Post, "id"> {
  return {
    content: draft.content,
    pillar: draft.pillar,
    hashtags: draft.hashtags,
    mediaUrl: null,
    scheduledFor,
    bestTime: draft.bestTime,
    status: "draft",
    xPostId: null,
    impressions: 0,
    engagements: 0,
    engagementRate: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
