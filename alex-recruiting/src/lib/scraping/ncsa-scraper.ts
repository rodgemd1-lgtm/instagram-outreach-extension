/**
 * NCSA Scraper — Firecrawl + Jina-based scraping for NCSA recruiting data.
 *
 * Extracts profile views, camp invites, and competitor intelligence from NCSA,
 * then stores results in Supabase and auto-tweets thank-you messages for camp invites.
 *
 * Does NOT use Puppeteer. Uses Firecrawl API with Jina reader fallback.
 */

import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { postTweet } from "@/lib/integrations/x-api";
import { addLead } from "@/lib/rec/knowledge/ncsa-leads";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NCSAProfileView {
  coachName: string;
  school: string;
  division: string;
  viewedAt: string;
}

export interface NCSACampInvite {
  school: string;
  campName: string;
  date: string;
  coachName: string;
  coachXHandle: string | null;
}

export interface NCSACompetitor {
  name: string;
  position: string;
  school: string;
  state: string;
  classYear: number;
  offers: number;
}

export interface NCSAScrapeResult {
  profileViews: NCSAProfileView[];
  campInvites: NCSACampInvite[];
  competitors: NCSACompetitor[];
  thankYouTweetsSent: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// NCSA URLs
// ---------------------------------------------------------------------------

const NCSA_PROFILE_URL = "https://www.ncsasports.org/";
const NCSA_SEARCH_URL = "https://recruit-match.ncsasports.org/";

// ---------------------------------------------------------------------------
// Scraping helpers — Firecrawl primary, Jina fallback
// ---------------------------------------------------------------------------

async function scrapeWithFirecrawl(url: string): Promise<string | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl returned ${response.status} for ${url}`);
      return null;
    }

    const data = await response.json();
    return data?.data?.markdown || data?.markdown || null;
  } catch (err) {
    console.error("Firecrawl scrape error:", err);
    return null;
  }
}

async function scrapeWithJina(url: string): Promise<string | null> {
  const apiKey = process.env.JINA_API_KEY;

  try {
    const headers: Record<string, string> = {
      Accept: "text/markdown",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`https://r.jina.ai/${url}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error(`Jina returned ${response.status} for ${url}`);
      return null;
    }

    return await response.text();
  } catch (err) {
    console.error("Jina scrape error:", err);
    return null;
  }
}

/**
 * Attempt to scrape a URL using Firecrawl first, then fall back to Jina reader.
 */
async function scrapeUrl(url: string): Promise<{ markdown: string | null; source: string }> {
  // Try Firecrawl first
  const firecrawlResult = await scrapeWithFirecrawl(url);
  if (firecrawlResult) {
    return { markdown: firecrawlResult, source: "firecrawl" };
  }

  // Fall back to Jina
  const jinaResult = await scrapeWithJina(url);
  if (jinaResult) {
    return { markdown: jinaResult, source: "jina" };
  }

  return { markdown: null, source: "none" };
}

// ---------------------------------------------------------------------------
// Parsers — extract structured data from scraped markdown
// ---------------------------------------------------------------------------

function parseProfileViews(markdown: string): NCSAProfileView[] {
  const views: NCSAProfileView[] = [];

  // NCSA profile views typically appear in table-like structures
  // Look for patterns: "Coach Name | School | Division | Date"
  const lines = markdown.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match table row patterns (pipe-separated or tab-separated)
    const pipeMatch = line.match(
      /\|?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*\|\s*([^|]+?)\s*\|\s*(D[I123]|DII|DIII|NAIA|FBS|FCS|D1|D2|D3)\s*\|\s*(\d{1,2}\/\d{1,2}\/\d{2,4})\s*\|?/i
    );

    if (pipeMatch) {
      views.push({
        coachName: pipeMatch[1].trim(),
        school: pipeMatch[2].trim(),
        division: normalizeDivision(pipeMatch[3].trim()),
        viewedAt: pipeMatch[4].trim(),
      });
      continue;
    }

    // Match markdown list items: "- Coach Name, School (D1) — 3/5/2026"
    const listMatch = line.match(
      /[-*]\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*[,—-]\s*([^(]+?)\s*\(?(D[I123]|DII|DIII|NAIA|FBS|FCS|D1|D2|D3)\)?\s*[—-]\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i
    );

    if (listMatch) {
      views.push({
        coachName: listMatch[1].trim(),
        school: listMatch[2].trim(),
        division: normalizeDivision(listMatch[3].trim()),
        viewedAt: listMatch[4].trim(),
      });
      continue;
    }

    // Match "viewed your profile" patterns
    const viewedMatch = line.match(
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(?:from\s+)?([^|,]+?)\s+viewed\s+(?:your\s+)?profile/i
    );

    if (viewedMatch) {
      views.push({
        coachName: viewedMatch[1].trim(),
        school: viewedMatch[2].trim(),
        division: "Unknown",
        viewedAt: new Date().toISOString().split("T")[0],
      });
    }
  }

  return views;
}

function parseCampInvites(markdown: string): NCSACampInvite[] {
  const invites: NCSACampInvite[] = [];
  const lines = markdown.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match "Camp Invite" or "Prospect Day" patterns
    const campMatch = line.match(
      /(?:camp\s+invite|prospect\s+day|camp\s+invitation|football\s+camp|elite\s+camp|showcase)\s*[—:-]\s*(.+)/i
    );

    if (campMatch) {
      const detail = campMatch[1].trim();
      // Try to extract school and date from detail or surrounding lines
      const schoolMatch = detail.match(/(?:at\s+|from\s+)?([A-Z][^,|]+?)(?:\s+on\s+|\s*[,|]\s*)/i);
      const dateMatch = detail.match(/(\d{1,2}\/\d{1,2}\/\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/);
      const coachMatch = detail.match(/(?:from|by|coach)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);

      invites.push({
        school: schoolMatch ? schoolMatch[1].trim() : extractSchoolFromContext(lines, i),
        campName: detail.split(/[,|]/)[0]?.trim() || "Football Camp",
        date: dateMatch ? dateMatch[1].trim() : "TBD",
        coachName: coachMatch ? coachMatch[1].trim() : "Camp Coordinator",
        coachXHandle: null,
      });
      continue;
    }

    // Match table rows for camp invites
    const tableMatch = line.match(
      /\|?\s*([^|]+?)\s*\|\s*([^|]+?camp[^|]*)\s*\|\s*(\d{1,2}\/\d{1,2}\/\d{2,4})\s*\|\s*([^|]+?)\s*\|?/i
    );

    if (tableMatch) {
      invites.push({
        school: tableMatch[1].trim(),
        campName: tableMatch[2].trim(),
        date: tableMatch[3].trim(),
        coachName: tableMatch[4].trim(),
        coachXHandle: null,
      });
    }
  }

  return invites;
}

function parseCompetitors(markdown: string): NCSACompetitor[] {
  const competitors: NCSACompetitor[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Match table rows: "Name | Position | School | State | Class | Offers"
    const pipeMatch = trimmed.match(
      /\|?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*\|\s*(OL|OT|OG|C|OC|IOL)\s*\|\s*([^|]+?)\s*\|\s*([A-Z]{2})\s*\|\s*(?:20)?(\d{2})\s*\|\s*(\d+)\s*\|?/i
    );

    if (pipeMatch) {
      competitors.push({
        name: pipeMatch[1].trim(),
        position: pipeMatch[2].trim().toUpperCase(),
        school: pipeMatch[3].trim(),
        state: pipeMatch[4].trim().toUpperCase(),
        classYear: normalizeClassYear(pipeMatch[5]),
        offers: parseInt(pipeMatch[6], 10) || 0,
      });
      continue;
    }

    // Match list items: "- John Smith, OT, Springfield HS (IL), Class of 2029, 3 offers"
    const listMatch = trimmed.match(
      /[-*]\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*,\s*(OL|OT|OG|C|OC|IOL)\s*,\s*([^(,]+?)\s*\(?([A-Z]{2})\)?\s*,\s*(?:Class\s+of\s+)?(\d{4})\s*,\s*(\d+)\s*offers?/i
    );

    if (listMatch) {
      competitors.push({
        name: listMatch[1].trim(),
        position: listMatch[2].trim().toUpperCase(),
        school: listMatch[3].trim(),
        state: listMatch[4].trim().toUpperCase(),
        classYear: parseInt(listMatch[5], 10),
        offers: parseInt(listMatch[6], 10) || 0,
      });
    }
  }

  return competitors;
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function normalizeDivision(div: string): string {
  const map: Record<string, string> = {
    D1: "DI",
    D2: "DII",
    D3: "DIII",
    "D-1": "DI",
    "D-2": "DII",
    "D-3": "DIII",
    FBS: "DI-FBS",
    FCS: "DI-FCS",
  };
  return map[div.toUpperCase()] || div;
}

function normalizeClassYear(yearStr: string): number {
  const num = parseInt(yearStr, 10);
  if (num < 100) {
    return 2000 + num;
  }
  return num;
}

function extractSchoolFromContext(lines: string[], currentIndex: number): string {
  // Look at surrounding lines (up to 3 above and below) for school names
  for (let offset = -3; offset <= 3; offset++) {
    const idx = currentIndex + offset;
    if (idx < 0 || idx >= lines.length || idx === currentIndex) continue;
    const line = lines[idx].trim();
    // Look for "University" or "College" mentions
    const schoolMatch = line.match(/([A-Z][a-zA-Z\s]+(?:University|College|State|Tech))/);
    if (schoolMatch) {
      return schoolMatch[1].trim();
    }
  }
  return "Unknown School";
}

// ---------------------------------------------------------------------------
// Store results in Supabase
// ---------------------------------------------------------------------------

async function storeProfileViewsAsLeads(views: NCSAProfileView[]): Promise<void> {
  for (const view of views) {
    try {
      await addLead({
        coachName: view.coachName,
        schoolName: view.school,
        division: view.division,
        conference: "",
        source: "profile_view",
        sourceDetail: `Viewed Jacob's NCSA profile on ${view.viewedAt}`,
        xHandle: null,
        outreachStatus: "new",
        assignedTo: "nina",
        notes: "",
      });
    } catch (err) {
      console.error(`Failed to store profile view lead for ${view.coachName}:`, err);
    }
  }
}

async function storeCampInvitesAsLeads(invites: NCSACampInvite[]): Promise<void> {
  for (const invite of invites) {
    try {
      await addLead({
        coachName: invite.coachName,
        schoolName: invite.school,
        division: "Unknown",
        conference: "",
        source: "camp_invite",
        sourceDetail: `Camp invite: ${invite.campName} on ${invite.date}`,
        xHandle: invite.coachXHandle,
        outreachStatus: "new",
        assignedTo: "nina",
        notes: `Camp: ${invite.campName}, Date: ${invite.date}`,
      });
    } catch (err) {
      console.error(`Failed to store camp invite lead for ${invite.school}:`, err);
    }
  }
}

async function storeCampInSupabase(invite: NCSACampInvite): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = createAdminClient();
    await supabase.from("camps").insert({
      name: invite.campName,
      school: invite.school,
      camp_type: "school_camp",
      date: invite.date !== "TBD" ? new Date(invite.date).toISOString() : null,
      registration_status: "not_registered",
      coaches_present: invite.coachName
        ? [{ name: invite.coachName, title: "", school: invite.school, contacted: false }]
        : [],
      notes: `Auto-detected from NCSA. Coach: ${invite.coachName}`,
    });
  } catch (err) {
    console.error(`Failed to store camp ${invite.campName} in Supabase:`, err);
  }
}

// ---------------------------------------------------------------------------
// Auto-tweet thank-you for camp invites
// ---------------------------------------------------------------------------

async function sendThankYouTweets(invites: NCSACampInvite[]): Promise<number> {
  let sent = 0;

  for (const invite of invites) {
    try {
      const handleTag = invite.coachXHandle ? ` @${invite.coachXHandle.replace("@", "")}` : "";
      const tweetText = `Grateful for the camp invite from ${invite.coachName} at ${invite.school}! Looking forward to competing. #Pewaukee #ClassOf2029${handleTag}`;

      // Enforce 280 character limit
      const text = tweetText.length > 280 ? tweetText.substring(0, 277) + "..." : tweetText;

      const result = await postTweet(text);
      if (result) {
        sent++;
        console.info(`Thank-you tweet sent for ${invite.school}: ${result.id}`);
      }
    } catch (err) {
      console.error(`Failed to tweet thank-you for ${invite.school}:`, err);
    }
  }

  return sent;
}

// ---------------------------------------------------------------------------
// Exported sub-functions
// ---------------------------------------------------------------------------

/**
 * Scrape NCSA profile dashboard for coach profile views.
 */
export async function scrapeProfileViews(): Promise<NCSAProfileView[]> {
  const { markdown, source } = await scrapeUrl(NCSA_PROFILE_URL);

  if (!markdown) {
    console.warn("Could not scrape NCSA profile page (auth wall likely). Source:", source);
    return [];
  }

  // Check for auth wall indicators
  if (
    markdown.includes("Sign In") &&
    markdown.includes("password") &&
    !markdown.includes("profile view")
  ) {
    console.warn("NCSA returned login page — authenticated scraping not available");
    return [];
  }

  return parseProfileViews(markdown);
}

/**
 * Scrape NCSA for camp invitations.
 */
export async function scrapeCampInvites(): Promise<NCSACampInvite[]> {
  const { markdown, source } = await scrapeUrl(NCSA_PROFILE_URL);

  if (!markdown) {
    console.warn("Could not scrape NCSA camp invites (auth wall likely). Source:", source);
    return [];
  }

  if (
    markdown.includes("Sign In") &&
    markdown.includes("password") &&
    !markdown.includes("camp")
  ) {
    console.warn("NCSA returned login page — authenticated scraping not available");
    return [];
  }

  return parseCampInvites(markdown);
}

/**
 * Scrape NCSA recruit-match for competitor OL profiles.
 */
export async function scrapeCompetitors(): Promise<NCSACompetitor[]> {
  const { markdown, source } = await scrapeUrl(NCSA_SEARCH_URL);

  if (!markdown) {
    console.warn("Could not scrape NCSA competitor data. Source:", source);
    return [];
  }

  if (
    markdown.includes("Sign In") &&
    markdown.includes("password") &&
    !markdown.includes("recruit")
  ) {
    console.warn("NCSA returned login page — authenticated scraping not available");
    return [];
  }

  return parseCompetitors(markdown);
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

/**
 * Full NCSA data processing pipeline:
 * 1. Scrape profile views, camp invites, and competitors
 * 2. Store results in Supabase (ncsa_leads, camps)
 * 3. Auto-tweet thank-you messages for new camp invites
 *
 * Returns structured results including any errors encountered.
 * All failures are gracefully handled — the function never throws.
 */
export async function processNCSAData(): Promise<NCSAScrapeResult> {
  const errors: string[] = [];
  let profileViews: NCSAProfileView[] = [];
  let campInvites: NCSACampInvite[] = [];
  let competitors: NCSACompetitor[] = [];
  let thankYouTweetsSent = 0;

  // ── 1. Scrape profile views ──
  try {
    profileViews = await scrapeProfileViews();
    if (profileViews.length === 0) {
      errors.push("No profile views found — NCSA may require authenticated scraping");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Profile views scrape failed: ${msg}`);
  }

  // ── 2. Scrape camp invites ──
  try {
    campInvites = await scrapeCampInvites();
    if (campInvites.length === 0) {
      errors.push("No camp invites found — NCSA may require authenticated scraping");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Camp invites scrape failed: ${msg}`);
  }

  // ── 3. Scrape competitors ──
  try {
    competitors = await scrapeCompetitors();
    if (competitors.length === 0) {
      errors.push("No competitor data found — NCSA recruit-match may require auth");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Competitor scrape failed: ${msg}`);
  }

  // ── 4. Store profile views as leads ──
  if (profileViews.length > 0) {
    try {
      await storeProfileViewsAsLeads(profileViews);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to store profile view leads: ${msg}`);
    }
  }

  // ── 5. Store camp invites as leads + in camps table ──
  if (campInvites.length > 0) {
    try {
      await storeCampInvitesAsLeads(campInvites);
      for (const invite of campInvites) {
        await storeCampInSupabase(invite);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to store camp invite data: ${msg}`);
    }
  }

  // ── 6. Auto-tweet thank-you messages for camp invites ──
  if (campInvites.length > 0) {
    try {
      thankYouTweetsSent = await sendThankYouTweets(campInvites);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Thank-you tweets failed: ${msg}`);
    }
  }

  return {
    profileViews,
    campInvites,
    competitors,
    thankYouTweetsSent,
    errors,
  };
}
