/**
 * Highlight Catalog — Tagging schema for football plays with timestamps.
 * File-backed at .highlight-catalog.json for local development.
 */

import fs from "fs";
import path from "path";

const CATALOG_PATH = path.join(process.cwd(), ".highlight-catalog.json");

export type PlayType =
  | "pancake_block"
  | "sack"
  | "pass_protection"
  | "run_block"
  | "fumble_recovery"
  | "tackle"
  | "gap_penetration"
  | "pull_block"
  | "other";

export type SideOfBall = "offense" | "defense";

export interface HighlightEntry {
  id: string;
  /** Source video asset ID (from .video-store.json) */
  videoId: string;
  /** Source video file path */
  videoPath: string;
  /** Start timestamp in seconds */
  startTime: number;
  /** End timestamp in seconds */
  endTime: number;
  /** Play type tag */
  playType: PlayType;
  /** Offense or defense */
  side: SideOfBall;
  /** Quality rating 1-5 (5 = best) */
  quality: number;
  /** Short description of the play */
  description: string;
  /** Opponent or game context */
  gameContext?: string;
  /** Whether to include in the micro reel */
  includeInReel: boolean;
  createdAt: string;
}

export interface HighlightCatalog {
  highlights: HighlightEntry[];
  lastUpdated: string;
}

function readCatalog(): HighlightCatalog {
  try {
    const raw = fs.readFileSync(CATALOG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { highlights: [], lastUpdated: new Date().toISOString() };
  }
}

function writeCatalog(catalog: HighlightCatalog) {
  catalog.lastUpdated = new Date().toISOString();
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
}

export function getAllHighlights(): HighlightEntry[] {
  return readCatalog().highlights;
}

export function getHighlightById(id: string): HighlightEntry | undefined {
  return readCatalog().highlights.find((h) => h.id === id);
}

export function getReelHighlights(): HighlightEntry[] {
  return readCatalog()
    .highlights.filter((h) => h.includeInReel)
    .sort((a, b) => b.quality - a.quality);
}

export function addHighlight(
  entry: Omit<HighlightEntry, "id" | "createdAt">
): HighlightEntry {
  const catalog = readCatalog();
  const highlight: HighlightEntry = {
    ...entry,
    id: `hl-${Date.now()}-${catalog.highlights.length}`,
    createdAt: new Date().toISOString(),
  };
  catalog.highlights.push(highlight);
  writeCatalog(catalog);
  return highlight;
}

export function updateHighlight(
  id: string,
  updates: Partial<Omit<HighlightEntry, "id" | "createdAt">>
): HighlightEntry | null {
  const catalog = readCatalog();
  const idx = catalog.highlights.findIndex((h) => h.id === id);
  if (idx === -1) return null;
  catalog.highlights[idx] = { ...catalog.highlights[idx], ...updates };
  writeCatalog(catalog);
  return catalog.highlights[idx];
}

export function deleteHighlight(id: string): boolean {
  const catalog = readCatalog();
  const before = catalog.highlights.length;
  catalog.highlights = catalog.highlights.filter((h) => h.id !== id);
  if (catalog.highlights.length < before) {
    writeCatalog(catalog);
    return true;
  }
  return false;
}
