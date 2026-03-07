/**
 * CollegeFootballData.com API Client
 *
 * Free tier: 1,000 calls/month
 * Base URL: https://apinext.collegefootballdata.com
 * Auth: Bearer token via CFBD_API_KEY env var
 *
 * Includes:
 *   - In-memory response cache with 24h TTL
 *   - Monthly request counter to stay under the 1,000/month limit
 */

const CFBD_BASE_URL = "https://apinext.collegefootballdata.com";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MONTHLY_REQUEST_LIMIT = 1000;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CFBDTeam {
  id: number;
  school: string;
  mascot: string | null;
  abbreviation: string | null;
  alt_name1: string | null;
  alt_name2: string | null;
  alt_name3: string | null;
  classification: string | null; // "fbs" | "fcs" | "ii" | "iii"
  conference: string | null;
  division: string | null;
  color: string | null;
  alt_color: string | null;
  logos: string[] | null;
  twitter: string | null;
  location: {
    venue_id: number | null;
    name: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country_code: string | null;
    timezone: string | null;
    latitude: number | null;
    longitude: number | null;
    elevation: number | null;
    capacity: number | null;
    year_constructed: number | null;
    grass: boolean | null;
    dome: boolean | null;
  } | null;
}

export interface CFBDRosterPlayer {
  id: number | null;
  first_name: string | null;
  last_name: string | null;
  team: string;
  weight: number | null;
  height: number | null;
  jersey: number | null;
  year: number | null; // 1=Fr, 2=So, 3=Jr, 4=Sr, 5=Gr
  position: string | null;
  home_city: string | null;
  home_state: string | null;
  home_country: string | null;
  home_latitude: number | null;
  home_longitude: number | null;
  home_county_fips: string | null;
  recruit_ids: number[] | null;
}

export interface CFBDCoach {
  first_name: string;
  last_name: string;
  hire_date: string | null;
  seasons: CFBDCoachSeason[];
}

export interface CFBDCoachSeason {
  school: string;
  year: number;
  games: number;
  wins: number;
  losses: number;
  ties: number;
  preseason_rank: number | null;
  postseason_rank: number | null;
}

export interface CFBDRecruitingPlayer {
  id: number | null;
  recruit_type: string | null;
  year: number;
  ranking: number | null;
  name: string;
  school: string | null;
  committed_to: string | null;
  position: string | null;
  height: number | null;
  weight: number | null;
  stars: number | null;
  rating: number | null;
  city: string | null;
  state_province: string | null;
  country: string | null;
  recruitment_url: string | null;
  athlete_id: number | null;
}

export interface CFBDTeamTalent {
  year: number;
  school: string;
  talent: number;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Request counter ──────────────────────────────────────────────────────────

interface RequestCounter {
  month: string; // "YYYY-MM"
  count: number;
}

let requestCounter: RequestCounter = {
  month: new Date().toISOString().slice(0, 7),
  count: 0,
};

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function incrementRequestCount(): void {
  const month = getCurrentMonth();
  if (requestCounter.month !== month) {
    requestCounter = { month, count: 0 };
  }
  requestCounter.count += 1;
}

export function getRequestCount(): { month: string; count: number; remaining: number } {
  const month = getCurrentMonth();
  if (requestCounter.month !== month) {
    requestCounter = { month, count: 0 };
  }
  return {
    month: requestCounter.month,
    count: requestCounter.count,
    remaining: MONTHLY_REQUEST_LIMIT - requestCounter.count,
  };
}

function assertBudget(): void {
  const { remaining } = getRequestCount();
  if (remaining <= 0) {
    throw new Error(
      `CFBD API monthly limit reached (${MONTHLY_REQUEST_LIMIT} requests/month). ` +
        `Counter resets on the 1st of each month.`
    );
  }
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function cfbdFetch<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const apiKey = process.env.CFBD_API_KEY;
  if (!apiKey) {
    throw new Error("CFBD_API_KEY environment variable is not set.");
  }

  const cacheKey = `${path}?${new URLSearchParams(
    Object.fromEntries(Object.entries(params ?? {}).map(([k, v]) => [k, String(v)]))
  ).toString()}`;

  const cached = getCached<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  assertBudget();

  const url = new URL(`${CFBD_BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  incrementRequestCount();

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `CFBD API error ${response.status} for ${url.pathname}: ${text}`
    );
  }

  const data = (await response.json()) as T;
  setCached<T>(cacheKey, data);
  return data;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * GET /teams — all FBS/FCS teams with conference info.
 * Optional `conference` filter (e.g. "Big Ten", "MAC").
 */
export async function getTeams(conference?: string): Promise<CFBDTeam[]> {
  const params: Record<string, string> = {};
  if (conference) params.conference = conference;
  return cfbdFetch<CFBDTeam[]>("/teams", params);
}

/**
 * GET /roster — player roster for a team and year.
 * `year` defaults to the current calendar year.
 */
export async function getRoster(
  team: string,
  year: number = new Date().getFullYear()
): Promise<CFBDRosterPlayer[]> {
  return cfbdFetch<CFBDRosterPlayer[]>("/roster", { team, year });
}

/**
 * GET /coaches — coaching records, optionally filtered by team and/or year.
 */
export async function getCoaches(
  team?: string,
  year?: number
): Promise<CFBDCoach[]> {
  const params: Record<string, string | number> = {};
  if (team) params.team = team;
  if (year) params.year = year;
  return cfbdFetch<CFBDCoach[]>("/coaches", params);
}

/**
 * GET /recruiting/players — recruiting rankings for a class year and position.
 * `position` should be a CFBD position string, e.g. "OT", "OG", "C", "OL".
 */
export async function getRecruitingPlayers(
  year: number,
  position?: string,
  team?: string
): Promise<CFBDRecruitingPlayer[]> {
  const params: Record<string, string | number> = { year };
  if (position) params.position = position;
  if (team) params.team = team;
  return cfbdFetch<CFBDRecruitingPlayer[]>("/recruiting/players", params);
}

/**
 * GET /talent — composite talent score per team for a given year.
 */
export async function getTeamTalent(year: number = new Date().getFullYear()): Promise<CFBDTeamTalent[]> {
  return cfbdFetch<CFBDTeamTalent[]>("/talent", { year });
}

/**
 * Convenience: fetch roster and return only OL players (OT, OG, C, OL).
 */
export async function getOLRoster(
  team: string,
  year: number = new Date().getFullYear()
): Promise<CFBDRosterPlayer[]> {
  const roster = await getRoster(team, year);
  const olPositions = new Set(["OT", "OG", "OC", "C", "OL", "LS"]);
  return roster.filter((p) => p.position && olPositions.has(p.position.toUpperCase()));
}

/**
 * Convenience: return players by year-of-eligibility from a roster.
 * year 4 = seniors, year 5 = grad students.
 */
export function filterByEligibilityYear(
  roster: CFBDRosterPlayer[],
  eligibilityYear: number
): CFBDRosterPlayer[] {
  return roster.filter((p) => p.year === eligibilityYear);
}
