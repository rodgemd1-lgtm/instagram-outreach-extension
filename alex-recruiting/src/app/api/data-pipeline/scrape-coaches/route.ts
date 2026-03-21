/**
 * Data Pipeline — Mega Coach Scraper API Route
 *
 * POST /api/data-pipeline/scrape-coaches
 *
 * Scrapes coaching staff pages for ALL NCAA football programs (D1 FBS/FCS,
 * D2, D3) to extract OL and DL position coaches with their X/Twitter handles.
 *
 * Jacob Rodgers can play both OL and DL, so we need BOTH position coaches
 * for every school in the database.
 *
 * Request body:
 *   {
 *     division?: "D1 FBS" | "D1 FCS" | "D2" | "D3"
 *     batchSize?: number  (default 10, max 25)
 *     offset?: number     (default 0)
 *   }
 *
 * Protected by CRON_SECRET via Authorization: Bearer header.
 *
 * Rate limit: 500ms between scrape requests.
 * Processes in batches to avoid Vercel function timeouts.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase/admin";
import {
  extractCoaches,
  findHandleNearName,
  type ExtractedCoach,
} from "@/lib/data-pipeline/coach-extractor";
import { d2Schools, type D2School } from "@/lib/data/d2-schools";
import { d3Schools, type D3School } from "@/lib/data/d3-schools";

export const dynamic = "force-dynamic";

// ─── Types ────────────────────────────────────────────────────────────────────

type Division = "D1 FBS" | "D1 FCS" | "D2" | "D3";

interface SchoolRecord {
  name: string;
  division: Division;
  conference: string;
  staffUrl: string;
  state: string;
}

interface CoachResult {
  school: string;
  division: string;
  conference: string;
  olCoach: {
    name: string;
    title: string;
    xHandle: string | null;
  } | null;
  dlCoach: {
    name: string;
    title: string;
    xHandle: string | null;
  } | null;
}

interface ScrapeResponse {
  status: "completed";
  batch: {
    offset: number;
    batchSize: number;
    processed: number;
    totalInDivision: number;
    hasMore: boolean;
    nextOffset: number | null;
  };
  results: CoachResult[];
  stats: {
    olCoachesFound: number;
    dlCoachesFound: number;
    xHandlesFound: number;
    scrapeErrors: number;
    upserted: number;
  };
  errors: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RATE_LIMIT_MS = 500;
const DEFAULT_BATCH_SIZE = 10;
const MAX_BATCH_SIZE = 25;
const JINA_BASE_URL = "https://r.jina.ai";

// ─── Auth guard ───────────────────────────────────────────────────────────────

function validateAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // In dev, if CRON_SECRET is not set, allow requests
  if (!cronSecret) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[scrape-coaches] CRON_SECRET not set — allowing request (dev mode)"
      );
      return true;
    }
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.replace(/^Bearer\s+/i, "");
  return token === cronSecret;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── School list builders ─────────────────────────────────────────────────────

/**
 * Build the list of D1 FBS/FCS schools from Supabase schools_v2 table.
 * Falls back to the schools table if schools_v2 is empty.
 */
async function getD1Schools(
  division?: "D1 FBS" | "D1 FCS"
): Promise<SchoolRecord[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAdminClient();

  // Try schools_v2 first (has staff URLs)
  let query = supabase
    .from("schools_v2")
    .select("name, division, conference, staff_url, state")
    .not("staff_url", "is", null);

  if (division) {
    query = query.eq("division", division);
  } else {
    query = query.in("division", ["D1 FBS", "D1 FCS"]);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    // Fallback: try the legacy schools table
    let fallbackQuery = supabase
      .from("schools")
      .select("name, division, conference, staff_url, state")
      .not("staff_url", "is", null);

    if (division) {
      fallbackQuery = fallbackQuery.eq("division", division);
    } else {
      fallbackQuery = fallbackQuery.or(
        "division.eq.D1 FBS,division.eq.D1 FCS"
      );
    }

    const { data: fallbackData } = await fallbackQuery;
    if (!fallbackData) return [];

    return fallbackData.map((s) => ({
      name: s.name,
      division: s.division as Division,
      conference: s.conference || "Unknown",
      staffUrl: s.staff_url || "",
      state: s.state || "",
    }));
  }

  return data.map((s) => ({
    name: s.name,
    division: s.division as Division,
    conference: s.conference || "Unknown",
    staffUrl: s.staff_url || "",
    state: s.state || "",
  }));
}

function getD2SchoolRecords(): SchoolRecord[] {
  return d2Schools.map((s: D2School) => ({
    name: s.name,
    division: "D2" as Division,
    conference: s.conference,
    staffUrl: s.staffUrl,
    state: s.state,
  }));
}

function getD3SchoolRecords(): SchoolRecord[] {
  return d3Schools.map((s: D3School) => ({
    name: s.name,
    division: "D3" as Division,
    conference: s.conference,
    staffUrl: s.staffUrl,
    state: s.state,
  }));
}

/**
 * Get the full school list for the requested division(s).
 */
async function getSchoolList(division?: Division): Promise<SchoolRecord[]> {
  switch (division) {
    case "D1 FBS":
    case "D1 FCS":
      return getD1Schools(division);
    case "D2":
      return getD2SchoolRecords();
    case "D3":
      return getD3SchoolRecords();
    default: {
      // All divisions
      const [d1, d2, d3] = await Promise.all([
        getD1Schools(),
        Promise.resolve(getD2SchoolRecords()),
        Promise.resolve(getD3SchoolRecords()),
      ]);
      return [...d1, ...d2, ...d3];
    }
  }
}

// ─── Scraping functions ───────────────────────────────────────────────────────

/**
 * Scrape a staff page using Firecrawl (primary) with Jina Reader fallback.
 * Returns the raw markdown content of the page.
 */
async function scrapeStaffPage(url: string): Promise<string> {
  // Try Firecrawl first
  if (process.env.FIRECRAWL_API_KEY) {
    try {
      const content = await scrapeWithFirecrawl(url);
      if (content && content.length > 100) return content;
    } catch (err) {
      console.warn(
        `[scrape-coaches] Firecrawl failed for ${url}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Fallback to Jina Reader
  try {
    const content = await scrapeWithJina(url);
    if (content && content.length > 100) return content;
  } catch (err) {
    console.warn(
      `[scrape-coaches] Jina failed for ${url}: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return "";
}

async function scrapeWithFirecrawl(url: string): Promise<string> {
  const { FirecrawlClient } = await import("@mendable/firecrawl-js");
  const client = new FirecrawlClient({
    apiKey: process.env.FIRECRAWL_API_KEY || "",
  });

  const result = await client.scrape(url, {
    formats: ["markdown"],
  });

  return result.markdown || "";
}

async function scrapeWithJina(url: string): Promise<string> {
  const jinaUrl = `${JINA_BASE_URL}/${url}`;
  const headers: Record<string, string> = {
    Accept: "text/markdown",
  };

  if (process.env.JINA_API_KEY) {
    headers["Authorization"] = `Bearer ${process.env.JINA_API_KEY}`;
  }

  const response = await fetch(jinaUrl, {
    headers,
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Jina returned ${response.status}`);
  }

  return await response.text();
}

// ─── Supabase upsert ─────────────────────────────────────────────────────────

function schoolSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[()']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function upsertCoachResults(
  results: CoachResult[]
): Promise<{ upserted: number; errors: string[] }> {
  if (!isSupabaseConfigured()) {
    return { upserted: 0, errors: ["Supabase not configured"] };
  }

  const supabase = createAdminClient();
  let upserted = 0;
  const errors: string[] = [];

  const rows: {
    name: string;
    title: string;
    school_name: string;
    school_slug: string;
    division: string;
    conference: string;
    x_handle: string | null;
    position_type: string;
    priority_tier: string;
    updated_at: string;
  }[] = [];

  for (const r of results) {
    if (r.olCoach) {
      rows.push({
        name: r.olCoach.name,
        title: r.olCoach.title,
        school_name: r.school,
        school_slug: schoolSlug(r.school),
        division: r.division,
        conference: r.conference,
        x_handle: r.olCoach.xHandle,
        position_type: "OL",
        priority_tier: determinePriorityTier(r.division),
        updated_at: new Date().toISOString(),
      });
    }

    if (r.dlCoach) {
      rows.push({
        name: r.dlCoach.name,
        title: r.dlCoach.title,
        school_name: r.school,
        school_slug: schoolSlug(r.school),
        division: r.division,
        conference: r.conference,
        x_handle: r.dlCoach.xHandle,
        position_type: "DL",
        priority_tier: determinePriorityTier(r.division),
        updated_at: new Date().toISOString(),
      });
    }
  }

  // Upsert in chunks of 50
  const chunkSize = 50;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);

    const { data, error } = await supabase
      .from("coaches")
      .upsert(chunk, {
        onConflict: "name,school_name",
        ignoreDuplicates: false,
      })
      .select("id");

    if (error) {
      errors.push(
        `Coaches batch ${Math.floor(i / chunkSize) + 1}: ${error.message}`
      );
    } else {
      upserted += data?.length ?? 0;
    }
  }

  return { upserted, errors };
}

function determinePriorityTier(division: string): string {
  switch (division) {
    case "D1 FBS":
      return "reach";
    case "D1 FCS":
      return "target";
    case "D2":
      return "target";
    case "D3":
      return "safety";
    default:
      return "research";
  }
}

// ─── Process a single school ──────────────────────────────────────────────────

async function processSchool(school: SchoolRecord): Promise<{
  result: CoachResult;
  error: string | null;
}> {
  const baseResult: CoachResult = {
    school: school.name,
    division: school.division,
    conference: school.conference,
    olCoach: null,
    dlCoach: null,
  };

  if (!school.staffUrl) {
    return {
      result: baseResult,
      error: `${school.name}: No staff URL available`,
    };
  }

  try {
    const markdown = await scrapeStaffPage(school.staffUrl);

    if (!markdown) {
      return {
        result: baseResult,
        error: `${school.name}: Empty response from ${school.staffUrl}`,
      };
    }

    const extraction = extractCoaches(markdown);

    // If we found coaches but no X handles, do a second-pass search
    if (extraction.olCoach && !extraction.olCoach.xHandle) {
      extraction.olCoach.xHandle = findHandleNearName(
        markdown,
        extraction.olCoach.name
      );
    }
    if (extraction.dlCoach && !extraction.dlCoach.xHandle) {
      extraction.dlCoach.xHandle = findHandleNearName(
        markdown,
        extraction.dlCoach.name
      );
    }

    const formatCoach = (c: ExtractedCoach | null) =>
      c
        ? {
            name: c.name,
            title: c.title,
            xHandle: c.xHandle,
          }
        : null;

    return {
      result: {
        ...baseResult,
        olCoach: formatCoach(extraction.olCoach),
        dlCoach: formatCoach(extraction.dlCoach),
      },
      error: null,
    };
  } catch (err) {
    return {
      result: baseResult,
      error: `${school.name}: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Auth check
  if (!validateAuth(request)) {
    return NextResponse.json(
      {
        error:
          "Unauthorized. Provide Authorization: Bearer <CRON_SECRET>.",
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const {
      division,
      batchSize: rawBatchSize,
      offset: rawOffset,
    } = body as {
      division?: Division;
      batchSize?: number;
      offset?: number;
    };

    // Validate division
    const validDivisions: Division[] = [
      "D1 FBS",
      "D1 FCS",
      "D2",
      "D3",
    ];
    if (division && !validDivisions.includes(division)) {
      return NextResponse.json(
        {
          error: `Invalid division. Must be one of: ${validDivisions.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate and clamp batch size
    const batchSize = Math.min(
      Math.max(1, rawBatchSize ?? DEFAULT_BATCH_SIZE),
      MAX_BATCH_SIZE
    );
    const offset = Math.max(0, rawOffset ?? 0);

    console.log(
      `[scrape-coaches] Starting batch: division=${division ?? "all"}, offset=${offset}, batchSize=${batchSize}`
    );

    // 1. Get the school list for the requested division
    const allSchools = await getSchoolList(division);

    if (allSchools.length === 0) {
      return NextResponse.json({
        status: "completed",
        batch: {
          offset,
          batchSize,
          processed: 0,
          totalInDivision: 0,
          hasMore: false,
          nextOffset: null,
        },
        results: [],
        stats: {
          olCoachesFound: 0,
          dlCoachesFound: 0,
          xHandlesFound: 0,
          scrapeErrors: 0,
          upserted: 0,
        },
        errors: ["No schools found for the requested division"],
      } satisfies ScrapeResponse);
    }

    // 2. Slice the batch
    const batch = allSchools.slice(offset, offset + batchSize);
    const hasMore = offset + batchSize < allSchools.length;
    const nextOffset = hasMore ? offset + batchSize : null;

    // 3. Process each school with rate limiting
    const results: CoachResult[] = [];
    const errors: string[] = [];

    for (let i = 0; i < batch.length; i++) {
      const school = batch[i];

      console.log(
        `[scrape-coaches] Processing ${i + 1}/${batch.length}: ${school.name} (${school.division})`
      );

      const { result, error } = await processSchool(school);
      results.push(result);

      if (error) {
        errors.push(error);
      }

      // Rate limit between requests (skip after last one)
      if (i < batch.length - 1) {
        await sleep(RATE_LIMIT_MS);
      }
    }

    // 4. Upsert to Supabase
    const coachResults = results.filter(
      (r) => r.olCoach || r.dlCoach
    );
    let upsertResult = { upserted: 0, errors: [] as string[] };

    if (coachResults.length > 0 && isSupabaseConfigured()) {
      upsertResult = await upsertCoachResults(coachResults);
      if (upsertResult.errors.length > 0) {
        errors.push(...upsertResult.errors);
      }
    }

    // 5. Compute stats
    const olCoachesFound = results.filter(
      (r) => r.olCoach !== null
    ).length;
    const dlCoachesFound = results.filter(
      (r) => r.dlCoach !== null
    ).length;
    const xHandlesFound = results.filter(
      (r) =>
        r.olCoach?.xHandle !== null ||
        r.dlCoach?.xHandle !== null
    ).length;
    const scrapeErrors = errors.length;

    console.log(
      `[scrape-coaches] Batch complete: ${olCoachesFound} OL, ${dlCoachesFound} DL coaches found. ${upsertResult.upserted} upserted. ${scrapeErrors} errors.`
    );

    // 6. Return response
    const response: ScrapeResponse = {
      status: "completed",
      batch: {
        offset,
        batchSize,
        processed: batch.length,
        totalInDivision: allSchools.length,
        hasMore,
        nextOffset,
      },
      results,
      stats: {
        olCoachesFound,
        dlCoachesFound,
        xHandlesFound,
        scrapeErrors,
        upserted: upsertResult.upserted,
      },
      errors: errors.length > 0 ? errors : [],
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[scrape-coaches] POST error:", err);
    return NextResponse.json(
      {
        error: "Failed to execute coach scraping pipeline",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return endpoint documentation and school counts
  const d2Count = d2Schools.length;
  const d3Count = d3Schools.length;

  return NextResponse.json({
    endpoint: "POST /api/data-pipeline/scrape-coaches",
    description:
      "Scrapes coaching staff pages for NCAA football programs to extract OL and DL coaches with X/Twitter handles",
    auth: "Authorization: Bearer <CRON_SECRET>",
    body: {
      division:
        'Optional: "D1 FBS" | "D1 FCS" | "D2" | "D3" (default: all)',
      batchSize: `Optional: number 1-${MAX_BATCH_SIZE} (default: ${DEFAULT_BATCH_SIZE})`,
      offset: "Optional: number (default: 0)",
    },
    schoolCounts: {
      d2: d2Count,
      d3: d3Count,
      d1: "Loaded from Supabase schools_v2 table (FBS + FCS)",
      note: "Use division filter and offset/batchSize for pagination",
    },
    example: {
      request: '{ "division": "D2", "batchSize": 10, "offset": 0 }',
      pagination:
        "Use nextOffset from response to fetch the next batch",
    },
  });
}
