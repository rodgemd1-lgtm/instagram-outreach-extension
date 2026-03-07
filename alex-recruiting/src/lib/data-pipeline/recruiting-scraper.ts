/**
 * Recruiting Intel Scraper
 *
 * Scrapes 247Sports composite rankings for Class of 2029 OL prospects using
 * the existing Firecrawl integration. Parsed results are upserted into the
 * `recruitingProspects` table (or held in memory when DB is not configured).
 *
 * Target: https://247sports.com/Season/2029-Football/CompositeRecruitRankings/
 *         ?InstitutionGroup=HighSchool&Position=OL
 */

import { scrapeSchoolRecentPosts } from "@/lib/integrations/firecrawl";
import { db, isDbConfigured } from "@/lib/db";
import { recruitingProspects } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProspectData {
  name: string;
  position: string | null;
  school: string | null;      // high-school name
  state: string | null;
  classYear: number;
  rating: number | null;      // 0.0–1.0 composite
  stars: number | null;
  committedTo: string | null; // college commitment if announced
  source: string;
  sourceUrl: string;
  scrapedAt: string;
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

const memoryProspects: ProspectData[] = [];

// ─── URL helpers ──────────────────────────────────────────────────────────────

const CLASS_YEAR = 2029;
const OL_POSITIONS = ["OT", "OG", "C", "OL", "IOL"];

function build247Url(position: string, page = 1): string {
  const base = `https://247sports.com/Season/${CLASS_YEAR}-Football/CompositeRecruitRankings/`;
  const params = new URLSearchParams({
    InstitutionGroup: "HighSchool",
    Position: position,
  });
  if (page > 1) params.set("Page", String(page));
  return `${base}?${params.toString()}`;
}

// ─── Markdown parsers ─────────────────────────────────────────────────────────

/**
 * Parse prospect rows from 247Sports composite ranking markdown.
 *
 * 247Sports renders a table that, when converted to markdown, typically looks
 * like:
 *
 *   | Rank | Name            | Pos | Rating | School         | State | Committed |
 *   |------|-----------------|-----|--------|----------------|-------|-----------|
 *   | 1    | John Smith      | OT  | 0.9975 | Lincoln HS     | TX    | Alabama   |
 *
 * We also handle the "card" layout that Firecrawl sometimes returns as plain
 * text blocks.
 */
function parseProspectsFromMarkdown(
  markdown: string,
  sourceUrl: string,
  position: string
): ProspectData[] {
  const prospects: ProspectData[] = [];
  const lines = markdown.split("\n").map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Skip header / separator rows
    if (/^[\s|:-]+$/.test(line)) continue;
    if (/rank.*name.*pos.*rating/i.test(line)) continue;

    // ── Table row format: | rank | name | pos | rating | school | state | committed |
    if (line.startsWith("|")) {
      const cells = line
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);

      if (cells.length < 4) continue;

      // Try to locate name cell — usually the second cell (after rank)
      // and rating as a decimal between 0.85 and 1.00
      const ratingCell = cells.find((c) => /^0\.\d{3,4}$/.test(c));
      const nameIndex = cells.findIndex((c) => /^[A-Z][a-z]+ [A-Z][a-z]/.test(c));

      if (nameIndex === -1) continue;

      const name = cells[nameIndex];
      const posCandidate = cells.find((c) => OL_POSITIONS.includes(c.toUpperCase()));
      const pos = posCandidate?.toUpperCase() ?? position;
      const rating = ratingCell ? parseFloat(ratingCell) : null;

      // Stars: look for a cell that is a single digit 1-5
      const starsCell = cells.find((c) => /^[1-5]$/.test(c));
      const stars = starsCell ? parseInt(starsCell, 10) : null;

      // School and state: cells after the rating that are not the name/pos
      const metaCells = cells.slice(nameIndex + 1).filter(
        (c) => c !== pos && c !== ratingCell && !/^[1-5]$/.test(c)
      );
      const school = metaCells[0] ?? null;
      const state = metaCells[1] ?? null;
      const committedTo = metaCells[2] ?? null;

      if (!name) continue;

      prospects.push({
        name,
        position: pos,
        school,
        state,
        classYear: CLASS_YEAR,
        rating,
        stars,
        committedTo: committedTo && committedTo.toLowerCase() !== "uncommitted" ? committedTo : null,
        source: "247sports",
        sourceUrl,
        scrapedAt: new Date().toISOString(),
      });

      continue;
    }

    // ── Card/prose format: "1. John Smith | OT | 0.9975 | Lincoln HS, TX"
    const cardMatch = line.match(
      /^(\d+)[.)]\s+([A-Z][a-z]+(?: [A-Z][a-z]+)+)\s*[|,]\s*([A-Z]+)\s*[|,]\s*(0\.\d+)/
    );
    if (cardMatch) {
      const [, , name, pos, ratingStr] = cardMatch;
      const rating = parseFloat(ratingStr);
      const rest = line.slice(cardMatch[0].length).trim();
      const parts = rest.split(/[|,]/).map((p) => p.trim());

      prospects.push({
        name,
        position: pos.toUpperCase(),
        school: parts[0] ?? null,
        state: parts[1] ?? null,
        classYear: CLASS_YEAR,
        rating: isNaN(rating) ? null : rating,
        stars: ratingToStars(rating),
        committedTo: null,
        source: "247sports",
        sourceUrl,
        scrapedAt: new Date().toISOString(),
      });
    }
  }

  return prospects;
}

function ratingToStars(rating: number | null): number | null {
  if (rating === null || isNaN(rating)) return null;
  if (rating >= 0.98) return 5;
  if (rating >= 0.9) return 4;
  if (rating >= 0.8) return 3;
  if (rating >= 0.7) return 2;
  return 1;
}

// ─── DB persistence ───────────────────────────────────────────────────────────

async function upsertProspects(prospects: ProspectData[]): Promise<void> {
  if (!isDbConfigured()) {
    // Merge into the in-memory store (deduplicate by name + classYear)
    for (const p of prospects) {
      const idx = memoryProspects.findIndex(
        (m) => m.name === p.name && m.classYear === p.classYear
      );
      if (idx >= 0) {
        memoryProspects[idx] = p;
      } else {
        memoryProspects.push(p);
      }
    }
    return;
  }

  for (const p of prospects) {
    try {
      // Check for existing record
      const existing = await db
        .select()
        .from(recruitingProspects)
        .where(
          and(
            eq(recruitingProspects.name, p.name),
            eq(recruitingProspects.classYear, p.classYear)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(recruitingProspects)
          .set({
            position: p.position,
            school: p.school,
            state: p.state,
            rating: p.rating,
            stars: p.stars,
            committedTo: p.committedTo,
            source: p.source,
            sourceUrl: p.sourceUrl,
            lastSynced: new Date(),
          })
          .where(
            and(
              eq(recruitingProspects.name, p.name),
              eq(recruitingProspects.classYear, p.classYear)
            )
          );
      } else {
        await db.insert(recruitingProspects).values({
          name: p.name,
          position: p.position,
          school: p.school,
          state: p.state,
          classYear: p.classYear,
          rating: p.rating,
          stars: p.stars,
          committedTo: p.committedTo,
          source: p.source,
          sourceUrl: p.sourceUrl,
        });
      }
    } catch {
      // Skip individual insert failures without aborting the batch
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ScraperResult {
  prospects: ProspectData[];
  totalFound: number;
  positionsScraped: string[];
  storedInDb: boolean;
  errors: string[];
}

/**
 * Scrape 247Sports composite rankings for Class of 2029 OL prospects.
 *
 * Iterates over each OL sub-position to maximize coverage, then deduplicates
 * by prospect name before persisting.
 */
export async function scrapeClass2029OLProspects(): Promise<ScraperResult> {
  const allProspects = new Map<string, ProspectData>(); // keyed by name
  const errors: string[] = [];
  const positionsScraped: string[] = [];

  for (const position of OL_POSITIONS) {
    const url = build247Url(position);
    try {
      // Re-use the existing Firecrawl scraper (accepts any URL)
      const markdown = await scrapeSchoolRecentPosts(url);
      if (!markdown) continue;

      const parsed = parseProspectsFromMarkdown(markdown, url, position);
      for (const p of parsed) {
        // Deduplicate: keep highest-rated entry per prospect name
        const existing = allProspects.get(p.name);
        if (!existing || (p.rating ?? 0) > (existing.rating ?? 0)) {
          allProspects.set(p.name, p);
        }
      }
      positionsScraped.push(position);
    } catch (err) {
      errors.push(
        `Failed to scrape position ${position}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  const prospects = Array.from(allProspects.values());

  // Persist
  let storedInDb = false;
  if (prospects.length > 0) {
    try {
      await upsertProspects(prospects);
      storedInDb = isDbConfigured();
    } catch (err) {
      errors.push(`DB upsert failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return {
    prospects,
    totalFound: prospects.length,
    positionsScraped,
    storedInDb,
    errors,
  };
}

/**
 * Return currently stored prospects (DB or memory fallback).
 */
export async function getStoredProspects(): Promise<ProspectData[]> {
  if (!isDbConfigured()) {
    return [...memoryProspects];
  }

  try {
    const rows = await db
      .select()
      .from(recruitingProspects)
      .where(eq(recruitingProspects.classYear, CLASS_YEAR));

    return rows.map((r) => ({
      name: r.name,
      position: r.position,
      school: r.school,
      state: r.state,
      classYear: r.classYear ?? CLASS_YEAR,
      rating: r.rating,
      stars: r.stars,
      committedTo: r.committedTo,
      source: r.source ?? "247sports",
      sourceUrl: r.sourceUrl ?? "",
      scrapedAt: r.lastSynced?.toISOString() ?? new Date().toISOString(),
    }));
  } catch {
    return [...memoryProspects];
  }
}
