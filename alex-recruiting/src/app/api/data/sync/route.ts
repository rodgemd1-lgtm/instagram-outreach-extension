/**
 * POST /api/data/sync
 *
 * Triggers a full data sync from all pipeline sources:
 *   1. CFBD enrichment for all target schools
 *   2. CFBD coaching history for all target schools
 *   3. 247Sports Class of 2029 OL prospect scrape
 *
 * Sources run concurrently but are guarded with individual try/catch so a
 * single failure does not abort the entire sync.
 *
 * Optionally accepts a JSON body to limit which sources run:
 *   { "sources": ["schools", "coaches", "prospects"] }
 *
 * Security: In production, protect this endpoint with CRON_SECRET or an
 * admin-only auth check to prevent unintended API budget consumption.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllEnrichedSchoolProfiles } from "@/lib/data-pipeline/school-data";
import { enrichAllTargetSchoolCoaches } from "@/lib/data-pipeline/coach-enricher";
import { scrapeClass2029OLProspects } from "@/lib/data-pipeline/recruiting-scraper";
import { getRequestCount } from "@/lib/data-pipeline/cfbd-client";

type SyncSource = "schools" | "coaches" | "prospects";

interface SyncResult {
  source: SyncSource;
  success: boolean;
  count: number;
  durationMs: number;
  error?: string;
}

export async function POST(req: NextRequest) {
  // Optional: guard with CRON_SECRET in production
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Parse optional source filter from body
  let requestedSources: SyncSource[] = ["schools", "coaches", "prospects"];
  try {
    const body = await req.json().catch(() => ({}));
    if (Array.isArray(body?.sources) && body.sources.length > 0) {
      requestedSources = body.sources.filter((s: unknown) =>
        ["schools", "coaches", "prospects"].includes(s as string)
      ) as SyncSource[];
    }
  } catch {
    // Use defaults if body parsing fails
  }

  const startedAt = new Date().toISOString();
  const results: SyncResult[] = [];

  // ── 1. Schools enrichment ──────────────────────────────────────────────────
  if (requestedSources.includes("schools")) {
    const t0 = Date.now();
    try {
      const profiles = await getAllEnrichedSchoolProfiles();
      results.push({
        source: "schools",
        success: true,
        count: profiles.length,
        durationMs: Date.now() - t0,
      });
    } catch (err) {
      results.push({
        source: "schools",
        success: false,
        count: 0,
        durationMs: Date.now() - t0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // ── 2. Coach enrichment ───────────────────────────────────────────────────
  if (requestedSources.includes("coaches")) {
    const t0 = Date.now();
    try {
      const coachProfiles = await enrichAllTargetSchoolCoaches();
      results.push({
        source: "coaches",
        success: true,
        count: coachProfiles.length,
        durationMs: Date.now() - t0,
      });
    } catch (err) {
      results.push({
        source: "coaches",
        success: false,
        count: 0,
        durationMs: Date.now() - t0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // ── 3. Prospect scrape ────────────────────────────────────────────────────
  if (requestedSources.includes("prospects")) {
    const t0 = Date.now();
    try {
      const scrapeResult = await scrapeClass2029OLProspects();
      results.push({
        source: "prospects",
        success: scrapeResult.errors.length === 0,
        count: scrapeResult.totalFound,
        durationMs: Date.now() - t0,
        error: scrapeResult.errors.length > 0 ? scrapeResult.errors.join("; ") : undefined,
      });
    } catch (err) {
      results.push({
        source: "prospects",
        success: false,
        count: 0,
        durationMs: Date.now() - t0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const cfbdBudget = getRequestCount();
  const overallSuccess = results.every((r) => r.success);

  return NextResponse.json(
    {
      success: overallSuccess,
      startedAt,
      completedAt: new Date().toISOString(),
      sources: results,
      cfbdBudget,
    },
    { status: overallSuccess ? 200 : 207 }
  );
}
