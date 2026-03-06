// Airtable Data Export — Transforms all content into Airtable-ready records
// Generates CSV and JSON exports for direct import into Airtable

import { jacobXProfile, type XPost } from "./jacob-x-profile";
import { captionsLibrary, type Caption } from "./captions-library";
import { coldDMLibrary, type ColdDM } from "./cold-dms";
import { weeklyCalendar } from "./weekly-calendar";

// ─── Airtable Record Interfaces ─────────────────────────────────────────────

export interface AirtablePostRecord {
  id: string;
  weekNumber: number;
  dayOfWeek: string;
  postDate: string;
  postTime: string;
  pillar: string;
  content: string;
  hashtags: string;
  mediaType: string;
  mediaDescription: string;
  status: "Draft" | "Ready" | "Scheduled" | "Posted" | "Skipped";
  constitutionCheck: "Pass" | "Pending" | "Fail";
  notes: string;
  xPostUrl: string;
  engagementLikes: number;
  engagementRetweets: number;
  engagementReplies: number;
  engagementImpressions: number;
}

export interface AirtableCaptionRecord {
  id: string;
  title: string;
  fullCaption: string;
  pillar: string;
  hashtags: string;
  mediaType: string;
  estimatedEngagement: string;
  characterCount: number;
  category: string;
}

export interface AirtableDMRecord {
  id: string;
  name: string;
  template: string;
  sequence: string;
  tier: string;
  trigger: string;
  daysSinceLast: number;
  characterCount: number;
  placeholders: string;
}

// ─── Date Utilities ──────────────────────────────────────────────────────────

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

function getNextMonday(fromDate: Date): Date {
  const d = new Date(fromDate);
  const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ...
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : 8 - dayOfWeek;
  d.setDate(d.getDate() + daysUntilMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getBestTimeForDay(day: string): string {
  const entry = weeklyCalendar.find((e) => e.day === day);
  if (!entry) return "7:00 PM CST";
  // Extract the first time from the range (e.g. "6:30-8:00 AM CST" -> "6:30 AM CST")
  const match = entry.bestTime.match(/^(\d{1,2}:\d{2})\s*[-–]/);
  if (match) {
    // Get the AM/PM from the full string
    const amPmMatch = entry.bestTime.match(/(AM|PM)\s*(CST|CT)?/i);
    const amPm = amPmMatch ? amPmMatch[1].toUpperCase() : "AM";
    const tz = amPmMatch?.[2] || "CST";
    return `${match[1]} ${amPm} ${tz}`;
  }
  return entry.bestTime;
}

function getDayOffset(day: string): number {
  const idx = DAY_ORDER.indexOf(day as (typeof DAY_ORDER)[number]);
  return idx >= 0 ? idx : 0;
}

// ─── Post Schedule Generator ────────────────────────────────────────────────

export function generatePostSchedule(
  startDate?: Date
): AirtablePostRecord[] {
  const baseDate = startDate || new Date();
  const firstMonday = getNextMonday(baseDate);
  const posts: XPost[] = jacobXProfile.posts as unknown as XPost[];

  return posts.map((post) => {
    // Calculate the actual date: first Monday + (weekNumber - 1) * 7 + dayOffset
    const postDate = new Date(firstMonday);
    const weekOffset = (post.weekNumber - 1) * 7;
    const dayOffset = getDayOffset(post.day);
    postDate.setDate(postDate.getDate() + weekOffset + dayOffset);

    const bestTime = getBestTimeForDay(post.day);

    return {
      id: `post-${String(post.id).padStart(3, "0")}`,
      weekNumber: post.weekNumber,
      dayOfWeek: post.day,
      postDate: formatDate(postDate),
      postTime: bestTime,
      pillar: post.pillar,
      content: post.content,
      hashtags: post.hashtags.join(", "),
      mediaType: post.mediaType,
      mediaDescription: post.notes,
      status: "Draft" as const,
      constitutionCheck: "Pending" as const,
      notes: post.notes,
      xPostUrl: "",
      engagementLikes: 0,
      engagementRetweets: 0,
      engagementReplies: 0,
      engagementImpressions: 0,
    };
  });
}

// ─── Caption Records Generator ──────────────────────────────────────────────

function getCaptionCategory(id: string): string {
  if (id.startsWith("fc-")) return "Film";
  if (id.startsWith("tc-")) return "Training";
  if (id.startsWith("gd-")) return "Game Day";
  if (id.startsWith("cc-")) return "Character";
  if (id.startsWith("cpc-")) return "Camp";
  return "General";
}

export function generateCaptionRecords(): AirtableCaptionRecord[] {
  return captionsLibrary.map((caption: Caption) => ({
    id: caption.id,
    title: caption.title,
    fullCaption: caption.fullCaption,
    pillar: caption.pillar,
    hashtags: caption.hashtags.join(", "),
    mediaType: caption.mediaType,
    estimatedEngagement: caption.estimatedEngagement,
    characterCount: caption.fullCaption.length,
    category: getCaptionCategory(caption.id),
  }));
}

// ─── DM Records Generator ──────────────────────────────────────────────────

function extractPlaceholders(template: string): string {
  const matches = template.match(/\{[A-Z_]+\}/g);
  if (!matches) return "";
  return [...new Set(matches)].join(", ");
}

export function generateDMRecords(): AirtableDMRecord[] {
  return coldDMLibrary.map((dm: ColdDM) => ({
    id: dm.id,
    name: dm.name,
    template: dm.template,
    sequence: dm.sequence,
    tier: dm.tier,
    trigger: dm.trigger,
    daysSinceLast: dm.daysSinceLast,
    characterCount: dm.template.length,
    placeholders: extractPlaceholders(dm.template),
  }));
}

// ─── CSV Export ──────────────────────────────────────────────────────────────

function escapeCSVField(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV(records: AirtablePostRecord[]): string {
  const headers = [
    "id",
    "weekNumber",
    "dayOfWeek",
    "postDate",
    "postTime",
    "pillar",
    "content",
    "hashtags",
    "mediaType",
    "mediaDescription",
    "status",
    "constitutionCheck",
    "notes",
    "xPostUrl",
    "engagementLikes",
    "engagementRetweets",
    "engagementReplies",
    "engagementImpressions",
  ];

  const rows = records.map((record) =>
    headers.map((header) => escapeCSVField(record[header as keyof AirtablePostRecord])).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

// ─── JSON Export ─────────────────────────────────────────────────────────────

export function exportToJSON(records: AirtablePostRecord[]): string {
  return JSON.stringify(records, null, 2);
}

// ─── Summary Utilities ──────────────────────────────────────────────────────

export function getScheduleSummary(records: AirtablePostRecord[]) {
  const byWeek = new Map<number, AirtablePostRecord[]>();
  for (const r of records) {
    const week = byWeek.get(r.weekNumber) || [];
    week.push(r);
    byWeek.set(r.weekNumber, week);
  }

  const byPillar = { performance: 0, work_ethic: 0, character: 0 };
  const byMedia = new Map<string, number>();
  for (const r of records) {
    if (r.pillar in byPillar) {
      byPillar[r.pillar as keyof typeof byPillar]++;
    }
    byMedia.set(r.mediaType, (byMedia.get(r.mediaType) || 0) + 1);
  }

  return {
    totalPosts: records.length,
    weeks: byWeek.size,
    startDate: records.length > 0 ? records[0].postDate : "",
    endDate: records.length > 0 ? records[records.length - 1].postDate : "",
    byPillar,
    byMedia: Object.fromEntries(byMedia),
  };
}
