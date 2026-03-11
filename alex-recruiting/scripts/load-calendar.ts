#!/usr/bin/env npx tsx
/**
 * Load the 30-day X posting calendar into the scheduled post queue.
 *
 * Reads docs/twitter-calendar-march-april-2026.json and creates scheduled posts
 * via the post pipeline (Supabase or in-memory fallback).
 *
 * Usage:
 *   npx tsx scripts/load-calendar.ts                # load all future posts
 *   npx tsx scripts/load-calendar.ts --dry-run      # preview without inserting
 *   npx tsx scripts/load-calendar.ts --api           # load via HTTP API (requires dev server)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Load .env files
function loadEnvFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // skip
  }
}

loadEnvFile(path.join(projectRoot, ".env"));
loadEnvFile(path.join(projectRoot, ".env.local"));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalendarEntry {
  date: string;      // "2026-03-11"
  day: string;       // "Wednesday"
  time: string;      // "6:30 AM CT"
  pillar: string;    // "Work Ethic" | "Performance" | "Character"
  text: string;
  mediaType: string; // "photo" | "video" | "carousel"
  notes: string;
}

// ---------------------------------------------------------------------------
// Parse CT time to ISO timestamp
// ---------------------------------------------------------------------------

function parseScheduledTime(date: string, time: string): Date {
  // Parse "6:30 AM CT" or "7:00 PM CT" or "10:00 AM CT"
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)\s*CT$/i);
  if (!match) {
    throw new Error(`Cannot parse time: "${time}"`);
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  // CT = UTC-6 (CST) or UTC-5 (CDT)
  // March-April 2026 is CDT (daylight saving starts March 8, 2026)
  const cdtOffset = -5; // CDT = UTC-5
  const utcHours = hours - cdtOffset;

  // Build ISO string
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCHours(utcHours, minutes, 0, 0);
  return d;
}

// Map pillar names to the format expected by the pipeline
function normalizePillar(pillar: string): string {
  const map: Record<string, string> = {
    "Work Ethic": "work_ethic",
    "Performance": "performance",
    "Character": "character",
  };
  return map[pillar] ?? pillar.toLowerCase().replace(/\s+/g, "_");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const useApi = args.includes("--api");

  console.log("=== Load X Posting Calendar ===\n");

  // Read calendar JSON
  const calendarPath = path.join(projectRoot, "docs", "twitter-calendar-march-april-2026.json");
  if (!fs.existsSync(calendarPath)) {
    console.error(`Calendar file not found: ${calendarPath}`);
    process.exit(1);
  }

  const entries: CalendarEntry[] = JSON.parse(fs.readFileSync(calendarPath, "utf8"));
  console.log(`Loaded ${entries.length} calendar entries\n`);

  const now = new Date();
  const futureEntries = entries.filter((entry) => {
    const scheduledAt = parseScheduledTime(entry.date, entry.time);
    return scheduledAt > now;
  });

  console.log(`${futureEntries.length} entries are in the future (skipping ${entries.length - futureEntries.length} past entries)\n`);

  if (dryRun) {
    console.log("--- DRY RUN — No posts will be created ---\n");
    for (const entry of futureEntries) {
      const scheduledAt = parseScheduledTime(entry.date, entry.time);
      console.log(`  ${entry.date} ${entry.time} [${normalizePillar(entry.pillar)}]`);
      console.log(`    → ${entry.text.slice(0, 80)}...`);
      console.log(`    → Scheduled: ${scheduledAt.toISOString()}`);
      console.log(`    → Chars: ${entry.text.length}/280`);
      console.log();
    }
    console.log(`Total: ${futureEntries.length} posts would be scheduled`);
    return;
  }

  if (useApi) {
    // Load via HTTP API — requires dev server running on port 3000
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let created = 0;
    let errors = 0;

    for (const entry of futureEntries) {
      const scheduledAt = parseScheduledTime(entry.date, entry.time);
      const body = {
        content: entry.text,
        scheduledAt: scheduledAt.toISOString(),
        pillar: normalizePillar(entry.pillar),
        // mediaType is stored in calendar JSON for reference but the Supabase
        // scheduled_posts table doesn't have this column yet — skip for now
      };

      try {
        const url = `${baseUrl}/api/content/schedule`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const data = await res.json();
          console.log(`✓ ${entry.date} ${entry.time} [${entry.pillar}] → ${data.post?.id ?? "ok"}`);
          created++;
        } else {
          const errBody = await res.text();
          console.error(`✗ ${entry.date} ${entry.time} [HTTP ${res.status}] — ${errBody.slice(0, 200)}`);
          errors++;
        }
      } catch (err) {
        console.error(`✗ ${entry.date} ${entry.time} — ${err}`);
        errors++;
      }
    }

    console.log(`\nDone: ${created} created, ${errors} errors`);
  } else {
    // Direct import — use the post pipeline module directly
    // Dynamic import to resolve path aliases at runtime
    const { createScheduledPost } = await import("../src/lib/content-engine/post-pipeline");

    let created = 0;
    let errors = 0;

    for (const entry of futureEntries) {
      const scheduledAt = parseScheduledTime(entry.date, entry.time);

      try {
        const post = await createScheduledPost({
          content: entry.text,
          scheduledAt,
          pillar: normalizePillar(entry.pillar),
        });

        console.log(`✓ ${entry.date} ${entry.time} [${entry.pillar}] → ${post.id}`);
        created++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`✗ ${entry.date} ${entry.time} — ${msg}`);
        errors++;
      }
    }

    console.log(`\nDone: ${created} created, ${errors} errors`);
  }
}

main().catch(console.error);
