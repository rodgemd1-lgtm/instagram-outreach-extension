/**
 * CFBD (College Football Data) API Integration
 *
 * Pulls all FBS and FCS teams with their coaching staff from the
 * CollegeFootballData.com API. Designed for bulk data pipeline use
 * (seeding the schools + coaches tables).
 *
 * Endpoints used:
 *   GET /teams        — all teams with conference, location, logos
 *   GET /coaches      — head coaching records by team/year
 *
 * Auth: Bearer token via CFBD_API_KEY env var
 * Base URL: https://apinext.collegefootballdata.com
 *
 * NOTE: The CFBD free tier allows 1,000 requests/month.
 *       The existing cfbd-client.ts (in data-pipeline/) tracks budget.
 *       This integration is intentionally separate — it targets high-volume
 *       bulk pulls and includes its own per-request rate limiting (100ms gap)
 *       to avoid hammering the API during pipeline runs.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const CFBD_BASE_URL = "https://apinext.collegefootballdata.com";
const RATE_LIMIT_MS = 100; // minimum gap between consecutive requests

// ─── Types ───────────────────────────────────────────────────────────────────

/** Raw team shape returned by CFBD /teams */
export interface CFBDTeamRaw {
  id: number;
  school: string;
  mascot: string | null;
  abbreviation: string | null;
  classification: string | null; // "fbs" | "fcs" | "ii" | "iii"
  conference: string | null;
  division: string | null;
  color: string | null;
  alt_color: string | null;
  logos: string[] | null;
  twitter: string | null;
  location: {
    city: string | null;
    state: string | null;
    zip: string | null;
    country_code: string | null;
    timezone: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
}

/** Raw coach shape returned by CFBD /coaches */
export interface CFBDCoachRaw {
  first_name: string;
  last_name: string;
  hire_date: string | null;
  seasons: {
    school: string;
    year: number;
    games: number;
    wins: number;
    losses: number;
    ties: number;
    preseason_rank: number | null;
    postseason_rank: number | null;
  }[];
}

/** Normalized team for database insertion */
export interface NormalizedTeam {
  name: string;
  mascot: string | null;
  conference: string | null;
  division: "D1 FBS" | "D1 FCS" | "D2" | "D3" | "Unknown";
  city: string | null;
  state: string | null;
  logo_url: string | null;
  twitter: string | null;
}

/** Normalized coach for database insertion */
export interface NormalizedCoach {
  name: string;
  title: string; // CFBD only returns head coaches — title is "Head Coach"
  school_name: string;
  division: string | null;
  conference: string | null;
  hire_date: string | null;
  seasons_at_school: number;
  record: { wins: number; losses: number; ties: number } | null;
}

/** Combined pipeline result */
export interface CFBDPipelineResult {
  teams: NormalizedTeam[];
  coaches: NormalizedCoach[];
  meta: {
    fbsCount: number;
    fcsCount: number;
    totalTeams: number;
    totalCoaches: number;
    fetchedAt: string;
    errors: string[];
  };
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function getApiKey(): string {
  const key = process.env.CFBD_API_KEY;
  if (!key) {
    throw new Error("CFBD_API_KEY environment variable is not set.");
  }
  return key;
}

/** Pause execution for `ms` milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Low-level fetch wrapper for the CFBD API.
 * Includes retry with exponential backoff for 429 / 5xx errors.
 */
async function cfbdRequest<T>(
  path: string,
  params?: Record<string, string | number>,
  retries = 3,
): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(`${CFBD_BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      });

      if (response.status === 429 || response.status >= 500) {
        const backoff = Math.min(1000 * 2 ** attempt, 10_000);
        console.warn(
          `[cfbd] ${response.status} on ${path} — retrying in ${backoff}ms (attempt ${attempt + 1}/${retries})`,
        );
        await sleep(backoff);
        continue;
      }

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`CFBD API ${response.status} on ${path}: ${text}`);
      }

      return (await response.json()) as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries - 1) {
        const backoff = Math.min(1000 * 2 ** attempt, 10_000);
        console.warn(
          `[cfbd] Network error on ${path} — retrying in ${backoff}ms (attempt ${attempt + 1}/${retries})`,
        );
        await sleep(backoff);
      }
    }
  }

  throw lastError ?? new Error(`CFBD request failed for ${path}`);
}

/** Map CFBD classification strings to our division format */
function classificationToDivision(
  classification: string | null,
): NormalizedTeam["division"] {
  switch (classification?.toLowerCase()) {
    case "fbs":
      return "D1 FBS";
    case "fcs":
      return "D1 FCS";
    case "ii":
      return "D2";
    case "iii":
      return "D3";
    default:
      return "Unknown";
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch all FBS and FCS teams from CFBD.
 * Returns normalized team objects ready for database insertion.
 */
export async function fetchAllTeams(): Promise<NormalizedTeam[]> {
  const rawTeams = await cfbdRequest<CFBDTeamRaw[]>("/teams");

  return rawTeams
    .filter((t) => {
      const cls = t.classification?.toLowerCase();
      return cls === "fbs" || cls === "fcs";
    })
    .map((t) => ({
      name: t.school,
      mascot: t.mascot,
      conference: t.conference,
      division: classificationToDivision(t.classification),
      city: t.location?.city ?? null,
      state: t.location?.state ?? null,
      logo_url: t.logos?.[0] ?? null,
      twitter: t.twitter ?? null,
    }));
}

/**
 * Fetch coaching staff (head coaches) for a specific team and year.
 *
 * NOTE: The CFBD /coaches endpoint only returns head coach records.
 * Position coaches (OL coach, etc.) are not available through this API.
 * For position coaches, use the mega-scraper pipeline or manual data entry.
 */
export async function fetchCoachesByTeam(
  team: string,
  year: number,
): Promise<NormalizedCoach[]> {
  const raw = await cfbdRequest<CFBDCoachRaw[]>("/coaches", { team, year });

  return raw.map((c) => {
    const relevantSeasons = c.seasons.filter(
      (s) => s.school.toLowerCase() === team.toLowerCase() && s.year === year,
    );
    const totalWins = relevantSeasons.reduce((sum, s) => sum + s.wins, 0);
    const totalLosses = relevantSeasons.reduce((sum, s) => sum + s.losses, 0);
    const totalTies = relevantSeasons.reduce((sum, s) => sum + s.ties, 0);

    return {
      name: `${c.first_name} ${c.last_name}`.trim(),
      title: "Head Coach",
      school_name: team,
      division: null, // filled in when combined with team data
      conference: null,
      hire_date: c.hire_date,
      seasons_at_school: c.seasons.filter(
        (s) => s.school.toLowerCase() === team.toLowerCase(),
      ).length,
      record:
        relevantSeasons.length > 0
          ? { wins: totalWins, losses: totalLosses, ties: totalTies }
          : null,
    };
  });
}

/**
 * Fetch ALL coaches for a given year.
 * Rate-limited: 100ms pause between requests.
 */
export async function fetchAllCoaches(
  year: number,
): Promise<NormalizedCoach[]> {
  // Fetch all coaches for the year in one request (CFBD supports year-only filter)
  const raw = await cfbdRequest<CFBDCoachRaw[]>("/coaches", { year });

  const coaches: NormalizedCoach[] = [];

  for (const c of raw) {
    const seasonForYear = c.seasons.find((s) => s.year === year);
    if (!seasonForYear) continue;

    coaches.push({
      name: `${c.first_name} ${c.last_name}`.trim(),
      title: "Head Coach",
      school_name: seasonForYear.school,
      division: null,
      conference: null,
      hire_date: c.hire_date,
      seasons_at_school: c.seasons.filter(
        (s) =>
          s.school.toLowerCase() === seasonForYear.school.toLowerCase(),
      ).length,
      record: {
        wins: seasonForYear.wins,
        losses: seasonForYear.losses,
        ties: seasonForYear.ties,
      },
    });
  }

  return coaches;
}

/**
 * Full pipeline: fetch all FBS/FCS teams + all coaches for the given year,
 * then merge them into a structured result ready for database insertion.
 *
 * This is the primary entry point for the data pipeline API route.
 */
export async function fetchAllFBSFCSData(
  year?: number,
): Promise<CFBDPipelineResult> {
  const targetYear = year ?? new Date().getFullYear();
  const errors: string[] = [];

  // Step 1: Fetch all teams
  let teams: NormalizedTeam[] = [];
  try {
    teams = await fetchAllTeams();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Failed to fetch teams: ${msg}`);
  }

  // Rate limit pause between calls
  await sleep(RATE_LIMIT_MS);

  // Step 2: Fetch all coaches for the year
  let coaches: NormalizedCoach[] = [];
  try {
    coaches = await fetchAllCoaches(targetYear);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Failed to fetch coaches: ${msg}`);
  }

  // Step 3: Enrich coaches with team division/conference data
  const teamLookup = new Map<string, NormalizedTeam>();
  for (const t of teams) {
    teamLookup.set(t.name.toLowerCase(), t);
  }

  for (const coach of coaches) {
    const team = teamLookup.get(coach.school_name.toLowerCase());
    if (team) {
      coach.division = team.division;
      coach.conference = team.conference;
    }
  }

  // Filter coaches to only FBS/FCS schools
  const fbsFcsCoaches = coaches.filter(
    (c) => c.division === "D1 FBS" || c.division === "D1 FCS",
  );

  const fbsCount = teams.filter((t) => t.division === "D1 FBS").length;
  const fcsCount = teams.filter((t) => t.division === "D1 FCS").length;

  return {
    teams,
    coaches: fbsFcsCoaches,
    meta: {
      fbsCount,
      fcsCount,
      totalTeams: teams.length,
      totalCoaches: fbsFcsCoaches.length,
      fetchedAt: new Date().toISOString(),
      errors,
    },
  };
}
