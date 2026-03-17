# Scraper CLI & Data Enrichment Pipeline — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a unified scraper CLI with 4 engines (Firecrawl, Exa, Playwright, Jina) that populates Supabase with megabytes of enriched recruiting data, then serve it to the recruit page via ISR.

**Architecture:** A TypeScript CLI (`scripts/recruit-cli.ts`) dispatches to engine-specific modules. Each engine scrapes → parses → stores in Supabase. A Claude Haiku enrichment pass adds AI summaries. The recruit page fetches enriched data via ISR (revalidate 24h).

**Tech Stack:** TypeScript, Firecrawl (`@mendable/firecrawl-js`), Exa (`exa-js`), Playwright, Jina Reader API, Claude Haiku (`@anthropic-ai/sdk`), Drizzle ORM, Supabase, Next.js ISR

**Testing note:** Run tests with `npx vitest run --environment node` due to jsdom incompatibility with Node v25.5.0. API route tests use DB guard pattern (check env var before import, fallback to randomUUID).

---

## Group 1: Database Schema + Migration

### Task 1: Add researchArticles and researchFindings tables

**Files:**
- Modify: `src/lib/db/schema.ts` (append new tables)
- Create: `supabase/migrations/20260309_research_tables.sql`
- Test: `src/__tests__/unit/research-tables.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/research-tables.test.ts
import { describe, it, expect } from "vitest";

describe("Research tables schema", () => {
  it("exports researchArticles table with required columns", async () => {
    const { researchArticles } = await import("@/lib/db/schema");
    expect(researchArticles).toBeDefined();
    const cols = Object.keys(researchArticles);
    // Table object exists — column names are checked via the SQL migration
    expect(cols.length).toBeGreaterThan(0);
  });

  it("exports researchFindings table with required columns", async () => {
    const { researchFindings } = await import("@/lib/db/schema");
    expect(researchFindings).toBeDefined();
    const cols = Object.keys(researchFindings);
    expect(cols.length).toBeGreaterThan(0);
  });

  it("researchArticles has AI enrichment columns", async () => {
    const { researchArticles } = await import("@/lib/db/schema");
    // Drizzle tables have column descriptors as properties
    const tableConfig = researchArticles as Record<string, unknown>;
    expect(tableConfig).toHaveProperty("aiSummary");
    expect(tableConfig).toHaveProperty("aiInsights");
    expect(tableConfig).toHaveProperty("aiRelevanceScore");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/research-tables.test.ts --environment node`
Expected: FAIL — `researchArticles` not exported

**Step 3: Add tables to schema.ts**

Append to `src/lib/db/schema.ts`:

```typescript
// RESEARCH PIPELINE
export const researchArticles = pgTable("research_articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull().unique(),
  title: text("title"),
  content: text("content"),
  dataType: text("data_type").notNull(),
  source: text("source").notNull(), // firecrawl, jina, playwright
  wordCount: integer("word_count"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
  // AI enrichment
  aiSummary: text("ai_summary"),
  aiInsights: jsonb("ai_insights"), // string[]
  aiActionItems: jsonb("ai_action_items"), // string[]
  aiRelevanceScore: integer("ai_relevance_score"),
  aiTags: text("ai_tags").array(),
  aiProcessedAt: timestamp("ai_processed_at"),
});

export const researchFindings = pgTable("research_findings", {
  id: uuid("id").defaultRandom().primaryKey(),
  query: text("query").notNull(),
  engine: text("engine").notNull().default("exa"),
  results: jsonb("results").notNull(), // ExaSearchResult[]
  resultCount: integer("result_count"),
  searchedAt: timestamp("searched_at").defaultNow(),
});
```

**Step 4: Write the SQL migration**

Create `supabase/migrations/20260309_research_tables.sql`:

```sql
CREATE TABLE IF NOT EXISTS research_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  data_type TEXT NOT NULL,
  source TEXT NOT NULL,
  word_count INTEGER,
  scraped_at TIMESTAMPTZ DEFAULT now(),
  ai_summary TEXT,
  ai_insights JSONB,
  ai_action_items JSONB,
  ai_relevance_score INTEGER,
  ai_tags TEXT[],
  ai_processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS research_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  engine TEXT NOT NULL DEFAULT 'exa',
  results JSONB NOT NULL,
  result_count INTEGER,
  searched_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns to enriched_schools if missing
ALTER TABLE enriched_schools
  ADD COLUMN IF NOT EXISTS ol_graduating_2029 INTEGER,
  ADD COLUMN IF NOT EXISTS scholarship_gap_score INTEGER,
  ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMPTZ;
```

**Step 5: Run test to verify it passes**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/research-tables.test.ts --environment node`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/db/schema.ts supabase/migrations/20260309_research_tables.sql src/__tests__/unit/research-tables.test.ts
git commit -m "feat(schema): add researchArticles and researchFindings tables"
```

---

## Group 2: Scraping Engine Modules

### Task 2: Build the Firecrawl engine module

**Files:**
- Create: `src/lib/scraper-engines/firecrawl-engine.ts`
- Test: `src/__tests__/unit/firecrawl-engine.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/firecrawl-engine.test.ts
import { describe, it, expect } from "vitest";

describe("Firecrawl engine", () => {
  it("exports scrapeUrl function", async () => {
    const mod = await import("@/lib/scraper-engines/firecrawl-engine");
    expect(mod.scrapeUrl).toBeTypeOf("function");
  });

  it("exports scrapeCoachingStaffPage function", async () => {
    const mod = await import("@/lib/scraper-engines/firecrawl-engine");
    expect(mod.scrapeCoachingStaffPage).toBeTypeOf("function");
  });

  it("exports scrapeRosterPage function", async () => {
    const mod = await import("@/lib/scraper-engines/firecrawl-engine");
    expect(mod.scrapeRosterPage).toBeTypeOf("function");
  });

  it("exports scrapeArticle function", async () => {
    const mod = await import("@/lib/scraper-engines/firecrawl-engine");
    expect(mod.scrapeArticle).toBeTypeOf("function");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/firecrawl-engine.test.ts --environment node`
Expected: FAIL — module not found

**Step 3: Implement firecrawl-engine.ts**

```typescript
// src/lib/scraper-engines/firecrawl-engine.ts
/**
 * Firecrawl scraping engine — primary engine for staff pages, rosters, articles.
 *
 * Uses @mendable/firecrawl-js SDK. Falls back gracefully if API key missing.
 * Reuses parsing logic from mega-scraper.ts and firecrawl.ts integrations.
 */

import { FirecrawlClient } from "@mendable/firecrawl-js";

let _client: FirecrawlClient | null = null;

function getClient(): FirecrawlClient {
  if (!_client) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) throw new Error("FIRECRAWL_API_KEY not set");
    _client = new FirecrawlClient({ apiKey });
  }
  return _client;
}

export interface ScrapeResult {
  url: string;
  markdown: string;
  title: string;
  wordCount: number;
  source: "firecrawl";
  scrapedAt: string;
}

/**
 * Scrape any URL and return markdown content.
 */
export async function scrapeUrl(url: string): Promise<ScrapeResult | null> {
  try {
    const result = await getClient().scrape(url, { formats: ["markdown"] });
    const markdown = result.markdown || "";
    if (!markdown) return null;

    const title = result.metadata?.title || url.split("/").pop() || "";
    return {
      url,
      markdown,
      title,
      wordCount: markdown.split(/\s+/).length,
      source: "firecrawl",
      scrapedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[firecrawl] Failed to scrape ${url}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export interface ParsedCoach {
  name: string;
  title: string;
  email: string | null;
  xHandle: string | null;
}

/**
 * Scrape a coaching staff page and extract coach data.
 */
export async function scrapeCoachingStaffPage(staffUrl: string): Promise<{
  raw: ScrapeResult | null;
  coaches: ParsedCoach[];
}> {
  const raw = await scrapeUrl(staffUrl);
  if (!raw) return { raw: null, coaches: [] };

  const coaches = parseCoachesFromMarkdown(raw.markdown);
  return { raw, coaches };
}

export interface ParsedRosterPlayer {
  name: string;
  position: string;
  classYear: string;
  height: string;
  weight: string;
}

/**
 * Scrape a roster page and extract OL players.
 */
export async function scrapeRosterPage(rosterUrl: string): Promise<{
  raw: ScrapeResult | null;
  olPlayers: ParsedRosterPlayer[];
  totalOL: number;
  graduatingSeniors: number;
}> {
  const raw = await scrapeUrl(rosterUrl);
  if (!raw) return { raw: null, olPlayers: [], totalOL: 0, graduatingSeniors: 0 };

  const olPlayers = parseOLFromRoster(raw.markdown);
  const graduatingSeniors = olPlayers.filter(
    (p) => /^(Sr|Senior|RS Sr|GR|5th)/i.test(p.classYear)
  ).length;

  return { raw, olPlayers, totalOL: olPlayers.length, graduatingSeniors };
}

/**
 * Scrape an article URL and return the content.
 */
export async function scrapeArticle(url: string): Promise<ScrapeResult | null> {
  return scrapeUrl(url);
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

const OL_TITLE_PATTERNS = [
  /offensive\s+line/i,
  /\bol\b\s+coach/i,
  /o[\s-]?line/i,
  /recruiting\s+coordinator/i,
  /head\s+coach/i,
  /offensive\s+coordinator/i,
  /run\s+game\s+coordinator/i,
];

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const X_HANDLE_RE = /@[A-Za-z0-9_]{1,15}/;

function parseCoachesFromMarkdown(markdown: string): ParsedCoach[] {
  const coaches: ParsedCoach[] = [];
  const lines = markdown.split("\n");
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const isCoachTitle = OL_TITLE_PATTERNS.some((p) => p.test(line));
    if (!isCoachTitle) continue;

    // Look for name in surrounding lines
    for (let offset = -2; offset <= 2; offset++) {
      if (offset === 0) continue;
      const nameIdx = i + offset;
      if (nameIdx < 0 || nameIdx >= lines.length) continue;
      const nameLine = lines[nameIdx].replace(/^[#*\s]+/, "").trim();
      const nameMatch = nameLine.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/);
      if (nameMatch) {
        const key = `${nameMatch[1].toLowerCase()}::${line.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const context = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 4)).join(" ");
        const emailMatch = context.match(EMAIL_RE);
        const handleMatch = context.match(X_HANDLE_RE);

        coaches.push({
          name: nameMatch[1],
          title: line.replace(/^[#*\s]+/, "").trim(),
          email: emailMatch?.[0] ?? null,
          xHandle: handleMatch?.[0] ?? null,
        });
        break;
      }
    }
  }

  // Also try table-based parsing (pipe-separated)
  for (const line of lines) {
    if (!line.includes("|")) continue;
    const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;

    const titleCell = cells.find((c) => OL_TITLE_PATTERNS.some((p) => p.test(c)));
    if (!titleCell) continue;

    const nameCell = cells.find(
      (c) => c !== titleCell && /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/.test(c)
    );
    if (!nameCell) continue;

    const key = `${nameCell.toLowerCase()}::${titleCell.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const emailMatch = line.match(EMAIL_RE);
    const handleMatch = line.match(X_HANDLE_RE);

    coaches.push({
      name: nameCell,
      title: titleCell,
      email: emailMatch?.[0] ?? null,
      xHandle: handleMatch?.[0] ?? null,
    });
  }

  return coaches;
}

function parseOLFromRoster(markdown: string): ParsedRosterPlayer[] {
  const players: ParsedRosterPlayer[] = [];

  for (const line of markdown.split("\n")) {
    if (!/\b(OL|OT|OG|C)\b/.test(line)) continue;

    const parts = line.split(/[|,\t]+/).map((p) => p.trim());
    if (parts.length < 3) continue;

    const position = parts.find((p) => /^(OL|OT|OG|C)$/.test(p));
    if (!position) continue;

    players.push({
      name: parts[0] || "Unknown",
      position,
      classYear: parts.find((p) => /^(Fr|So|Jr|Sr|RS|GR|5th)/i.test(p)) || "",
      height: parts.find((p) => /^\d+-\d+$/.test(p)) || "",
      weight: parts.find((p) => /^\d{3}$/.test(p)) || "",
    });
  }

  return players;
}
```

**Step 4: Run test to verify it passes**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/firecrawl-engine.test.ts --environment node`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/scraper-engines/firecrawl-engine.ts src/__tests__/unit/firecrawl-engine.test.ts
git commit -m "feat(scraper): add Firecrawl engine module"
```

---

### Task 3: Build the Jina engine module (fallback)

**Files:**
- Create: `src/lib/scraper-engines/jina-engine.ts`
- Test: `src/__tests__/unit/jina-engine.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/jina-engine.test.ts
import { describe, it, expect } from "vitest";

describe("Jina engine", () => {
  it("exports scrapeUrl function", async () => {
    const mod = await import("@/lib/scraper-engines/jina-engine");
    expect(mod.scrapeUrl).toBeTypeOf("function");
  });

  it("exports JINA_READER_PREFIX constant", async () => {
    const mod = await import("@/lib/scraper-engines/jina-engine");
    expect(mod.JINA_READER_PREFIX).toBe("https://r.jina.ai/");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/jina-engine.test.ts --environment node`
Expected: FAIL

**Step 3: Implement jina-engine.ts**

```typescript
// src/lib/scraper-engines/jina-engine.ts
/**
 * Jina AI Reader engine — fallback for clean text extraction from cluttered pages.
 * Uses the r.jina.ai reader mode API. Works without API key (free tier).
 */

export const JINA_READER_PREFIX = "https://r.jina.ai/";

export interface JinaScrapeResult {
  url: string;
  markdown: string;
  title: string;
  wordCount: number;
  source: "jina";
  scrapedAt: string;
}

/**
 * Scrape a URL using Jina AI reader mode.
 * Prepends r.jina.ai/ to the URL for clean markdown extraction.
 */
export async function scrapeUrl(url: string): Promise<JinaScrapeResult | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "text/markdown",
    };

    const apiKey = process.env.JINA_API_KEY;
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${JINA_READER_PREFIX}${url}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error(`[jina] HTTP ${response.status} for ${url}`);
      return null;
    }

    const markdown = await response.text();
    if (!markdown || markdown.length < 50) return null;

    // Extract title from first H1 or first line
    const titleMatch = markdown.match(/^#\s+(.+)/m);
    const title = titleMatch?.[1] || url.split("/").pop() || "";

    return {
      url,
      markdown,
      title,
      wordCount: markdown.split(/\s+/).length,
      source: "jina",
      scrapedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[jina] Failed to scrape ${url}:`, err instanceof Error ? err.message : err);
    return null;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/jina-engine.test.ts --environment node`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/scraper-engines/jina-engine.ts src/__tests__/unit/jina-engine.test.ts
git commit -m "feat(scraper): add Jina AI reader engine module"
```

---

### Task 4: Build the Exa engine module

**Files:**
- Create: `src/lib/scraper-engines/exa-engine.ts`
- Test: `src/__tests__/unit/exa-engine.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/exa-engine.test.ts
import { describe, it, expect } from "vitest";

describe("Exa engine", () => {
  it("exports discoverCoachHandles function", async () => {
    const mod = await import("@/lib/scraper-engines/exa-engine");
    expect(mod.discoverCoachHandles).toBeTypeOf("function");
  });

  it("exports discoverSchoolNeeds function", async () => {
    const mod = await import("@/lib/scraper-engines/exa-engine");
    expect(mod.discoverSchoolNeeds).toBeTypeOf("function");
  });

  it("exports discoverJacobMentions function", async () => {
    const mod = await import("@/lib/scraper-engines/exa-engine");
    expect(mod.discoverJacobMentions).toBeTypeOf("function");
  });

  it("exports runAllDiscovery function", async () => {
    const mod = await import("@/lib/scraper-engines/exa-engine");
    expect(mod.runAllDiscovery).toBeTypeOf("function");
  });

  it("exports DISCOVERY_QUERIES with 5 queries", async () => {
    const mod = await import("@/lib/scraper-engines/exa-engine");
    expect(mod.DISCOVERY_QUERIES).toHaveLength(5);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/exa-engine.test.ts --environment node`
Expected: FAIL

**Step 3: Implement exa-engine.ts**

Wraps the existing `src/lib/integrations/exa.ts` functions into a unified discovery module with structured output matching the `researchFindings` table shape:

```typescript
// src/lib/scraper-engines/exa-engine.ts
/**
 * Exa semantic search engine — discovers content that keyword search misses.
 * Wraps exa-js SDK for neural/semantic search across recruiting topics.
 */

import Exa from "exa-js";

let _exa: Exa | null = null;
function getExa(): Exa {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) throw new Error("EXA_API_KEY not set");
  if (!_exa) _exa = new Exa(apiKey);
  return _exa;
}

export interface DiscoveryResult {
  query: string;
  engine: "exa";
  results: {
    url: string;
    title: string;
    text: string;
    publishedDate?: string;
    author?: string;
  }[];
  resultCount: number;
  searchedAt: string;
}

export const DISCOVERY_QUERIES = [
  {
    name: "coachHandles",
    query: "D1 D2 OL recruiting coordinator Twitter X handle college football 2025 2026",
    numResults: 25,
  },
  {
    name: "schoolNeeds",
    query: "offensive line recruiting needs 2025 2026 2027 2029 college football Big Ten MAC",
    numResults: 15,
  },
  {
    name: "jacobMentions",
    query: "Jacob Rodgers Pewaukee football 2029 offensive line recruit Wisconsin",
    numResults: 10,
  },
  {
    name: "competitors",
    query: "2029 offensive line recruit Wisconsin Midwest high school football",
    numResults: 15,
  },
  {
    name: "analysts",
    query: "recruiting analyst Wisconsin Midwest Big Ten offensive line 247Sports Rivals",
    numResults: 10,
  },
];

async function runQuery(
  query: string,
  numResults: number
): Promise<DiscoveryResult> {
  const result = await getExa().searchAndContents(query, {
    type: "neural",
    numResults,
    text: true,
  });

  return {
    query,
    engine: "exa",
    results: result.results.map((r) => ({
      url: r.url,
      title: r.title || "",
      text: r.text || "",
      publishedDate: r.publishedDate || undefined,
      author: r.author || undefined,
    })),
    resultCount: result.results.length,
    searchedAt: new Date().toISOString(),
  };
}

export async function discoverCoachHandles(): Promise<DiscoveryResult> {
  const q = DISCOVERY_QUERIES[0];
  return runQuery(q.query, q.numResults);
}

export async function discoverSchoolNeeds(schoolName?: string): Promise<DiscoveryResult> {
  const q = DISCOVERY_QUERIES[1];
  const query = schoolName
    ? `${schoolName} offensive line recruiting needs 2025 2026 2029`
    : q.query;
  return runQuery(query, q.numResults);
}

export async function discoverJacobMentions(): Promise<DiscoveryResult> {
  const q = DISCOVERY_QUERIES[2];
  return runQuery(q.query, q.numResults);
}

export async function discoverCompetitors(): Promise<DiscoveryResult> {
  const q = DISCOVERY_QUERIES[3];
  return runQuery(q.query, q.numResults);
}

export async function discoverAnalysts(): Promise<DiscoveryResult> {
  const q = DISCOVERY_QUERIES[4];
  return runQuery(q.query, q.numResults);
}

/**
 * Run all 5 discovery queries. Returns results array.
 * Includes 2-second delay between queries to respect rate limits.
 */
export async function runAllDiscovery(): Promise<DiscoveryResult[]> {
  const results: DiscoveryResult[] = [];

  for (const q of DISCOVERY_QUERIES) {
    try {
      const result = await runQuery(q.query, q.numResults);
      results.push(result);
      console.info(`[exa] ${q.name}: ${result.resultCount} results`);
    } catch (err) {
      console.error(`[exa] ${q.name} failed:`, err instanceof Error ? err.message : err);
    }
    // Rate limit
    await new Promise((r) => setTimeout(r, 2000));
  }

  return results;
}
```

**Step 4: Run test to verify it passes**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/exa-engine.test.ts --environment node`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/scraper-engines/exa-engine.ts src/__tests__/unit/exa-engine.test.ts
git commit -m "feat(scraper): add Exa semantic discovery engine module"
```

---

### Task 5: Build the Playwright engine module

**Files:**
- Create: `src/lib/scraper-engines/playwright-engine.ts`
- Test: `src/__tests__/unit/playwright-engine.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/playwright-engine.test.ts
import { describe, it, expect } from "vitest";

describe("Playwright engine", () => {
  it("exports scrapeDynamicPage function", async () => {
    const mod = await import("@/lib/scraper-engines/playwright-engine");
    expect(mod.scrapeDynamicPage).toBeTypeOf("function");
  });

  it("exports scrapeForumPage function", async () => {
    const mod = await import("@/lib/scraper-engines/playwright-engine");
    expect(mod.scrapeForumPage).toBeTypeOf("function");
  });

  it("exports scrapeWithAuth function", async () => {
    const mod = await import("@/lib/scraper-engines/playwright-engine");
    expect(mod.scrapeWithAuth).toBeTypeOf("function");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/playwright-engine.test.ts --environment node`
Expected: FAIL

**Step 3: Implement playwright-engine.ts**

```typescript
// src/lib/scraper-engines/playwright-engine.ts
/**
 * Playwright engine — handles dynamic/JS-rendered pages and auth-walled sites.
 * Used for Reddit, coaching forums, and NCSA authenticated scraping.
 */

import { chromium, type Browser, type Page } from "playwright";

let _browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!_browser) {
    _browser = await chromium.launch({ headless: true });
  }
  return _browser;
}

export interface PlaywrightScrapeResult {
  url: string;
  markdown: string;
  title: string;
  wordCount: number;
  source: "playwright";
  scrapedAt: string;
}

/**
 * Scrape a dynamic page by rendering it in a headless browser.
 * Waits for network idle to ensure JS-rendered content loads.
 */
export async function scrapeDynamicPage(url: string): Promise<PlaywrightScrapeResult | null> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000); // extra wait for lazy-loaded content

    const title = await page.title();
    const textContent = await page.evaluate(() => {
      // Remove scripts, styles, navs, footers to get clean content
      const remove = document.querySelectorAll("script, style, nav, footer, header, .sidebar, .ad");
      remove.forEach((el) => el.remove());
      return document.body.innerText || "";
    });

    if (!textContent || textContent.length < 100) return null;

    return {
      url,
      markdown: textContent,
      title,
      wordCount: textContent.split(/\s+/).length,
      source: "playwright",
      scrapedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[playwright] Failed to scrape ${url}:`, err instanceof Error ? err.message : err);
    return null;
  } finally {
    await page.close();
  }
}

/**
 * Scrape a forum/Reddit page with scroll-to-load behavior.
 */
export async function scrapeForumPage(url: string): Promise<PlaywrightScrapeResult | null> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set a realistic user agent to avoid bot detection
    await page.setExtraHTTPHeaders({
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    });

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Scroll down to load more content (forums lazy-load)
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(1500);
    }

    const title = await page.title();
    const textContent = await extractForumContent(page);

    if (!textContent || textContent.length < 100) return null;

    return {
      url,
      markdown: textContent,
      title,
      wordCount: textContent.split(/\s+/).length,
      source: "playwright",
      scrapedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[playwright] Forum scrape failed for ${url}:`, err instanceof Error ? err.message : err);
    return null;
  } finally {
    await page.close();
  }
}

/**
 * Scrape with authentication (e.g. NCSA).
 * Delegates to the existing ncsa-browser-sync for NCSA-specific auth.
 */
export async function scrapeWithAuth(
  url: string,
  credentials: { email: string; password: string }
): Promise<PlaywrightScrapeResult | null> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Look for login form
    const emailInput = await page.$('input[type="email"], input[name="email"], input[name="username"]');
    const passInput = await page.$('input[type="password"]');

    if (emailInput && passInput) {
      await emailInput.fill(credentials.email);
      await passInput.fill(credentials.password);
      const submitBtn = await page.$('button[type="submit"], input[type="submit"]');
      if (submitBtn) await submitBtn.click();
      await page.waitForNavigation({ waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    }

    const title = await page.title();
    const textContent = await page.evaluate(() => document.body.innerText || "");

    if (!textContent || textContent.length < 100) return null;

    return {
      url,
      markdown: textContent,
      title,
      wordCount: textContent.split(/\s+/).length,
      source: "playwright",
      scrapedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[playwright] Auth scrape failed for ${url}:`, err instanceof Error ? err.message : err);
    return null;
  } finally {
    await page.close();
  }
}

async function extractForumContent(page: Page): Promise<string> {
  return page.evaluate(() => {
    // Remove ads, sidebars, footers
    const remove = document.querySelectorAll(
      "script, style, nav, footer, .sidebar, .ad, .cookie-banner, [role='banner']"
    );
    remove.forEach((el) => el.remove());

    // Get main content area or fall back to body
    const main = document.querySelector("main, [role='main'], .content, #content, article");
    return (main || document.body).innerText || "";
  });
}

/**
 * Close the shared browser instance. Call on CLI exit.
 */
export async function closeBrowser(): Promise<void> {
  if (_browser) {
    await _browser.close();
    _browser = null;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/playwright-engine.test.ts --environment node`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/scraper-engines/playwright-engine.ts src/__tests__/unit/playwright-engine.test.ts
git commit -m "feat(scraper): add Playwright engine module for dynamic pages"
```

---

## Group 3: Engine Orchestrator

### Task 6: Build the multi-engine orchestrator

**Files:**
- Create: `src/lib/scraper-engines/orchestrator.ts`
- Test: `src/__tests__/unit/scraper-orchestrator.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/scraper-orchestrator.test.ts
import { describe, it, expect } from "vitest";

describe("Scraper orchestrator", () => {
  it("exports scrapeWithFallback function", async () => {
    const mod = await import("@/lib/scraper-engines/orchestrator");
    expect(mod.scrapeWithFallback).toBeTypeOf("function");
  });

  it("exports ENGINE_PRIORITY array", async () => {
    const mod = await import("@/lib/scraper-engines/orchestrator");
    expect(mod.ENGINE_PRIORITY).toEqual(["firecrawl", "jina", "playwright"]);
  });

  it("exports scrapeCoachesForSchool function", async () => {
    const mod = await import("@/lib/scraper-engines/orchestrator");
    expect(mod.scrapeCoachesForSchool).toBeTypeOf("function");
  });

  it("exports scrapeResearchArticle function", async () => {
    const mod = await import("@/lib/scraper-engines/orchestrator");
    expect(mod.scrapeResearchArticle).toBeTypeOf("function");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/scraper-orchestrator.test.ts --environment node`
Expected: FAIL

**Step 3: Implement orchestrator.ts**

```typescript
// src/lib/scraper-engines/orchestrator.ts
/**
 * Multi-engine scraper orchestrator.
 * Tries engines in priority order: Firecrawl -> Jina -> Playwright.
 * Exa runs independently for discovery (not page scraping).
 */

import * as firecrawl from "./firecrawl-engine";
import * as jina from "./jina-engine";
import * as playwright from "./playwright-engine";
import type { SchoolEntry } from "@/lib/data-pipeline/mega-scraper";

export const ENGINE_PRIORITY = ["firecrawl", "jina", "playwright"] as const;

export type EngineSource = "firecrawl" | "jina" | "playwright";

export interface UnifiedScrapeResult {
  url: string;
  markdown: string;
  title: string;
  wordCount: number;
  source: EngineSource;
  scrapedAt: string;
}

/**
 * Scrape a URL trying engines in priority order.
 * Returns the first successful result, or null if all fail.
 */
export async function scrapeWithFallback(
  url: string,
  preferredEngine?: EngineSource
): Promise<UnifiedScrapeResult | null> {
  const engines: EngineSource[] = preferredEngine
    ? [preferredEngine, ...ENGINE_PRIORITY.filter((e) => e !== preferredEngine)]
    : [...ENGINE_PRIORITY];

  for (const engine of engines) {
    try {
      let result: UnifiedScrapeResult | null = null;

      switch (engine) {
        case "firecrawl":
          if (!process.env.FIRECRAWL_API_KEY) continue;
          result = await firecrawl.scrapeUrl(url);
          break;
        case "jina":
          result = await jina.scrapeUrl(url);
          break;
        case "playwright":
          result = await playwright.scrapeDynamicPage(url);
          break;
      }

      if (result) {
        console.info(`[orchestrator] ${url} scraped via ${engine} (${result.wordCount} words)`);
        return result;
      }
    } catch (err) {
      console.warn(`[orchestrator] ${engine} failed for ${url}:`, err instanceof Error ? err.message : err);
    }
  }

  console.error(`[orchestrator] All engines failed for ${url}`);
  return null;
}

/**
 * Scrape a school's coaching staff page and return parsed coaches.
 * Uses Firecrawl with full fallback chain.
 */
export async function scrapeCoachesForSchool(school: SchoolEntry): Promise<{
  raw: UnifiedScrapeResult | null;
  coaches: firecrawl.ParsedCoach[];
}> {
  // Try Firecrawl first (best at structured page extraction)
  const fcResult = await firecrawl.scrapeCoachingStaffPage(school.staffUrl);
  if (fcResult.raw && fcResult.coaches.length > 0) {
    return { raw: fcResult.raw, coaches: fcResult.coaches };
  }

  // Fallback: scrape with any engine and parse
  const raw = await scrapeWithFallback(school.staffUrl);
  if (!raw) return { raw: null, coaches: [] };

  // Re-parse the fallback content through the firecrawl parser
  const { coaches } = await firecrawl.scrapeCoachingStaffPage(school.staffUrl);
  return { raw, coaches };
}

/**
 * Scrape a research article URL with full fallback chain.
 */
export async function scrapeResearchArticle(
  url: string,
  dataType: string
): Promise<UnifiedScrapeResult | null> {
  // Forums and Reddit need Playwright
  if (url.includes("reddit.com") || url.includes("coachad.com") || url.includes("operationsports.com")) {
    return scrapeWithFallback(url, "playwright");
  }

  // Everything else: Firecrawl first
  return scrapeWithFallback(url);
}
```

**Step 4: Run test to verify it passes**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/scraper-orchestrator.test.ts --environment node`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/scraper-engines/orchestrator.ts src/__tests__/unit/scraper-orchestrator.test.ts
git commit -m "feat(scraper): add multi-engine orchestrator with fallback chain"
```

---

## Group 4: Claude AI Enrichment

### Task 7: Build the AI article enrichment module

**Files:**
- Create: `src/lib/scraper-engines/ai-enrichment.ts`
- Test: `src/__tests__/unit/ai-enrichment.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/ai-enrichment.test.ts
import { describe, it, expect } from "vitest";

describe("AI enrichment", () => {
  it("exports enrichArticle function", async () => {
    const mod = await import("@/lib/scraper-engines/ai-enrichment");
    expect(mod.enrichArticle).toBeTypeOf("function");
  });

  it("exports buildEnrichmentPrompt function", async () => {
    const mod = await import("@/lib/scraper-engines/ai-enrichment");
    expect(mod.buildEnrichmentPrompt).toBeTypeOf("function");
  });

  it("buildEnrichmentPrompt returns a string containing Jacob", async () => {
    const { buildEnrichmentPrompt } = await import("@/lib/scraper-engines/ai-enrichment");
    const prompt = buildEnrichmentPrompt("Test article about coaching", "coach_psychology");
    expect(prompt).toContain("Jacob");
    expect(prompt).toContain("offensive line");
  });

  it("exports ArticleEnrichment type shape", async () => {
    const mod = await import("@/lib/scraper-engines/ai-enrichment");
    // Verify the ENRICHMENT_SCHEMA is exported
    expect(mod.ENRICHMENT_SCHEMA).toBeDefined();
    expect(mod.ENRICHMENT_SCHEMA).toHaveProperty("summary");
    expect(mod.ENRICHMENT_SCHEMA).toHaveProperty("keyInsights");
    expect(mod.ENRICHMENT_SCHEMA).toHaveProperty("relevanceScore");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/ai-enrichment.test.ts --environment node`
Expected: FAIL

**Step 3: Implement ai-enrichment.ts**

```typescript
// src/lib/scraper-engines/ai-enrichment.ts
/**
 * Claude AI article enrichment — summarizes, extracts insights, and scores
 * research articles for recruiting relevance.
 *
 * Uses claude-haiku-4-5 for cost efficiency (~$0.001/article).
 */

import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export interface ArticleEnrichment {
  summary: string;
  keyInsights: string[];
  coachPsychology: string[];
  actionItems: string[];
  relevanceScore: number;
  tags: string[];
}

export const ENRICHMENT_SCHEMA = {
  summary: "string",
  keyInsights: "string[]",
  coachPsychology: "string[]",
  actionItems: "string[]",
  relevanceScore: "number (0-100)",
  tags: "string[]",
};

/**
 * Build the prompt for Claude to enrich an article.
 */
export function buildEnrichmentPrompt(articleText: string, dataType: string): string {
  // Truncate very long articles to stay within token limits
  const truncated = articleText.length > 8000 ? articleText.slice(0, 8000) + "\n[TRUNCATED]" : articleText;

  return `You are analyzing a recruiting research article for a Class of 2029 offensive line recruit (Jacob Rodgers, 6'4" 285 lbs, Pewaukee HS, Wisconsin).

Article category: ${dataType}

Analyze this article and return a JSON object with these exact fields:
- "summary": 2-3 sentence summary of the article
- "keyInsights": array of 3-5 actionable insights relevant to Jacob's recruiting
- "coachPsychology": array of 2-3 insights about how coaches evaluate recruits (based on this article)
- "actionItems": array of 2-3 specific things to implement on Jacob's recruiting website based on this research
- "relevanceScore": integer 0-100 (how relevant is this to an OL recruit's recruiting page)
- "tags": array of category tags (e.g., "coach-evaluation", "film-tips", "profile-optimization")

Return ONLY valid JSON. No markdown, no explanation.

ARTICLE:
${truncated}`;
}

/**
 * Enrich a single article using Claude Haiku.
 */
export async function enrichArticle(
  articleText: string,
  dataType: string
): Promise<ArticleEnrichment | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("[ai-enrichment] ANTHROPIC_API_KEY not set, skipping enrichment");
    return null;
  }

  try {
    const prompt = buildEnrichmentPrompt(articleText, dataType);
    const response = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    // Parse JSON response
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned) as ArticleEnrichment;

    // Validate shape
    if (
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.keyInsights) ||
      typeof parsed.relevanceScore !== "number"
    ) {
      console.error("[ai-enrichment] Invalid response shape");
      return null;
    }

    return parsed;
  } catch (err) {
    console.error("[ai-enrichment] Failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Batch-enrich multiple articles. 1-second delay between calls.
 * Returns map of url -> enrichment.
 */
export async function enrichArticleBatch(
  articles: { url: string; content: string; dataType: string }[]
): Promise<Map<string, ArticleEnrichment>> {
  const results = new Map<string, ArticleEnrichment>();

  for (const article of articles) {
    const enrichment = await enrichArticle(article.content, article.dataType);
    if (enrichment) {
      results.set(article.url, enrichment);
      console.info(`[ai-enrichment] Enriched: ${article.url} (score: ${enrichment.relevanceScore})`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  return results;
}
```

**Step 4: Run test to verify it passes**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/ai-enrichment.test.ts --environment node`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/scraper-engines/ai-enrichment.ts src/__tests__/unit/ai-enrichment.test.ts
git commit -m "feat(scraper): add Claude AI article enrichment module"
```

---

## Group 5: CLI Entry Point

### Task 8: Build the CLI with all subcommands

**Files:**
- Create: `scripts/recruit-cli.ts`
- Create: `src/lib/scraper-engines/commands/scrape-coaches.ts`
- Create: `src/lib/scraper-engines/commands/scrape-rosters.ts`
- Create: `src/lib/scraper-engines/commands/discover.ts`
- Create: `src/lib/scraper-engines/commands/scrape-research.ts`
- Create: `src/lib/scraper-engines/commands/enrich-articles.ts`
- Create: `src/lib/scraper-engines/commands/status.ts`
- Modify: `package.json` (add `recruit` script)
- Test: `src/__tests__/unit/recruit-cli.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/recruit-cli.test.ts
import { describe, it, expect } from "vitest";

describe("Recruit CLI commands", () => {
  it("scrape-coaches command module exports run function", async () => {
    const mod = await import("@/lib/scraper-engines/commands/scrape-coaches");
    expect(mod.run).toBeTypeOf("function");
  });

  it("scrape-rosters command module exports run function", async () => {
    const mod = await import("@/lib/scraper-engines/commands/scrape-rosters");
    expect(mod.run).toBeTypeOf("function");
  });

  it("discover command module exports run function", async () => {
    const mod = await import("@/lib/scraper-engines/commands/discover");
    expect(mod.run).toBeTypeOf("function");
  });

  it("scrape-research command module exports run function", async () => {
    const mod = await import("@/lib/scraper-engines/commands/scrape-research");
    expect(mod.run).toBeTypeOf("function");
  });

  it("enrich-articles command module exports run function", async () => {
    const mod = await import("@/lib/scraper-engines/commands/enrich-articles");
    expect(mod.run).toBeTypeOf("function");
  });

  it("status command module exports run function", async () => {
    const mod = await import("@/lib/scraper-engines/commands/status");
    expect(mod.run).toBeTypeOf("function");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/recruit-cli.test.ts --environment node`
Expected: FAIL

**Step 3: Implement each command module**

Each command module follows the same pattern:

```typescript
// src/lib/scraper-engines/commands/scrape-coaches.ts
export interface Options {
  division?: string;
  limit?: number;
}

export async function run(options: Options = {}): Promise<void> {
  const { getSchools } = await import("@/lib/data-pipeline/mega-scraper");
  const { scrapeCoachesForSchool } = await import("@/lib/scraper-engines/orchestrator");

  const schools = getSchools(options.division);
  const batch = options.limit ? schools.slice(0, options.limit) : schools;

  console.info(`[scrape-coaches] Starting: ${batch.length} schools (${options.division || "all divisions"})`);

  let totalCoaches = 0;
  let totalErrors = 0;

  for (const school of batch) {
    try {
      const { coaches } = await scrapeCoachesForSchool(school);
      totalCoaches += coaches.length;
      console.info(`  ${school.name}: ${coaches.length} coaches`);

      // Store in Supabase if configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { storeCoaches } = await import("./helpers/store-coaches");
        await storeCoaches(school, coaches);
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      totalErrors++;
      console.error(`  ${school.name}: ERROR - ${err instanceof Error ? err.message : err}`);
    }
  }

  console.info(`\n[scrape-coaches] Done: ${totalCoaches} coaches found, ${totalErrors} errors`);
}
```

Create similar modules for each command (scrape-rosters, discover, scrape-research, enrich-articles, status). Each exports a `run(options)` function.

**Step 3b: Implement the CLI entry point**

```typescript
// scripts/recruit-cli.ts
/**
 * Recruit CLI — Unified scraper and data enrichment tool.
 *
 * Usage:
 *   npx tsx scripts/recruit-cli.ts <command> [options]
 *   npm run recruit -- <command> [options]
 *
 * Commands:
 *   scrape-coaches  [--division D1_FBS] [--limit 10]
 *   scrape-rosters  [--division D1_FBS]
 *   discover        [--query "custom query"]
 *   scrape-research [--stream "Coach Decision Psychology"]
 *   sync-ncsa
 *   scrape-forums
 *   enrich-articles [--reprocess]
 *   enrich-all
 *   status
 */

// Load Next.js env vars
import "@next/env";

const [command, ...rawArgs] = process.argv.slice(2);

function parseArgs(args: string[]): Record<string, string | boolean> {
  const parsed: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        parsed[key] = next;
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }
  return parsed;
}

async function main() {
  if (!command || command === "help" || command === "--help") {
    console.info(`
Recruit CLI — Unified scraper and data enrichment

Commands:
  scrape-coaches  [--division D1_FBS] [--limit 10]   Scrape coaching staff pages
  scrape-rosters  [--division D1_FBS] [--limit 10]   Scrape roster pages for OL gaps
  discover        [--query "..."]                     Run Exa semantic discovery
  scrape-research [--stream "name"]                   Scrape research stream URLs
  sync-ncsa                                           Run NCSA browser sync (Playwright)
  scrape-forums                                       Scrape Reddit/forum URLs
  enrich-articles [--reprocess]                       AI-summarize scraped articles
  enrich-all                                          Run full pipeline
  status                                              Show scraping stats
    `);
    return;
  }

  const args = parseArgs(rawArgs);

  switch (command) {
    case "scrape-coaches": {
      const { run } = await import("../src/lib/scraper-engines/commands/scrape-coaches");
      await run({ division: args.division as string, limit: args.limit ? parseInt(args.limit as string) : undefined });
      break;
    }
    case "scrape-rosters": {
      const { run } = await import("../src/lib/scraper-engines/commands/scrape-rosters");
      await run({ division: args.division as string, limit: args.limit ? parseInt(args.limit as string) : undefined });
      break;
    }
    case "discover": {
      const { run } = await import("../src/lib/scraper-engines/commands/discover");
      await run({ query: args.query as string });
      break;
    }
    case "scrape-research": {
      const { run } = await import("../src/lib/scraper-engines/commands/scrape-research");
      await run({ stream: args.stream as string });
      break;
    }
    case "sync-ncsa": {
      const { syncNcsaDashboard } = await import("../src/lib/scraping/ncsa-browser-sync.mjs");
      const result = await syncNcsaDashboard();
      console.info(JSON.stringify(result, null, 2));
      break;
    }
    case "scrape-forums": {
      const { run } = await import("../src/lib/scraper-engines/commands/scrape-research");
      await run({ stream: "Reddit/Forum Coach Insights" });
      break;
    }
    case "enrich-articles": {
      const { run } = await import("../src/lib/scraper-engines/commands/enrich-articles");
      await run({ reprocess: args.reprocess === true });
      break;
    }
    case "enrich-all": {
      console.info("[recruit-cli] Running full pipeline...\n");
      const coaches = await import("../src/lib/scraper-engines/commands/scrape-coaches");
      await coaches.run({});
      const rosters = await import("../src/lib/scraper-engines/commands/scrape-rosters");
      await rosters.run({});
      const discover = await import("../src/lib/scraper-engines/commands/discover");
      await discover.run({});
      const research = await import("../src/lib/scraper-engines/commands/scrape-research");
      await research.run({});
      const enrich = await import("../src/lib/scraper-engines/commands/enrich-articles");
      await enrich.run({});
      console.info("\n[recruit-cli] Full pipeline complete.");
      break;
    }
    case "status": {
      const { run } = await import("../src/lib/scraper-engines/commands/status");
      await run();
      break;
    }
    default:
      console.error(`Unknown command: ${command}. Run with --help for usage.`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
```

**Step 3c: Add npm script to package.json**

Add to `scripts` in `package.json`:
```json
"recruit": "tsx scripts/recruit-cli.ts"
```

**Step 4: Run test to verify it passes**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/recruit-cli.test.ts --environment node`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/recruit-cli.ts src/lib/scraper-engines/commands/ src/__tests__/unit/recruit-cli.test.ts package.json
git commit -m "feat(cli): add unified recruit-cli with all subcommands"
```

---

## Group 6: Supabase Storage Layer

### Task 9: Build the storage helpers for each command

**Files:**
- Create: `src/lib/scraper-engines/storage.ts`
- Test: `src/__tests__/unit/scraper-storage.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/scraper-storage.test.ts
import { describe, it, expect } from "vitest";

describe("Scraper storage", () => {
  it("exports storeCoach function", async () => {
    const mod = await import("@/lib/scraper-engines/storage");
    expect(mod.storeCoach).toBeTypeOf("function");
  });

  it("exports storeResearchArticle function", async () => {
    const mod = await import("@/lib/scraper-engines/storage");
    expect(mod.storeResearchArticle).toBeTypeOf("function");
  });

  it("exports storeDiscoveryResult function", async () => {
    const mod = await import("@/lib/scraper-engines/storage");
    expect(mod.storeDiscoveryResult).toBeTypeOf("function");
  });

  it("exports updateArticleEnrichment function", async () => {
    const mod = await import("@/lib/scraper-engines/storage");
    expect(mod.updateArticleEnrichment).toBeTypeOf("function");
  });

  it("exports getScrapingStats function", async () => {
    const mod = await import("@/lib/scraper-engines/storage");
    expect(mod.getScrapingStats).toBeTypeOf("function");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/scraper-storage.test.ts --environment node`
Expected: FAIL

**Step 3: Implement storage.ts**

Uses the DB guard pattern (check env var → import db → upsert). Each function operates on the Drizzle tables defined in Task 1.

```typescript
// src/lib/scraper-engines/storage.ts
/**
 * Supabase storage layer for scraped data.
 * Uses Drizzle ORM. All functions check for DB availability first.
 */

import type { ParsedCoach } from "./firecrawl-engine";
import type { UnifiedScrapeResult } from "./orchestrator";
import type { DiscoveryResult } from "./exa-engine";
import type { ArticleEnrichment } from "./ai-enrichment";

function isDatabaseAvailable(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.DATABASE_URL);
}

async function getDb() {
  const { db } = await import("@/lib/db");
  return db;
}

export async function storeCoach(
  schoolName: string,
  division: string,
  conference: string,
  coach: ParsedCoach
): Promise<void> {
  if (!isDatabaseAvailable()) {
    console.info(`[storage] DB not configured, skipping: ${coach.name} at ${schoolName}`);
    return;
  }

  const db = await getDb();
  const { coaches } = await import("@/lib/db/schema");
  const { eq, and } = await import("drizzle-orm");

  // Upsert: check if coach exists by name + school
  const existing = await db
    .select()
    .from(coaches)
    .where(and(eq(coaches.name, coach.name), eq(coaches.schoolName, schoolName)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(coaches)
      .set({
        title: coach.title,
        xHandle: coach.xHandle,
        updatedAt: new Date(),
      })
      .where(eq(coaches.id, existing[0].id));
  } else {
    await db.insert(coaches).values({
      name: coach.name,
      title: coach.title,
      schoolName,
      division,
      conference,
      xHandle: coach.xHandle,
      priorityTier: division === "D1_FBS" ? "tier_1" : division === "D1_FCS" ? "tier_2" : "tier_3",
    });
  }
}

export async function storeResearchArticle(
  result: UnifiedScrapeResult,
  dataType: string
): Promise<void> {
  if (!isDatabaseAvailable()) {
    console.info(`[storage] DB not configured, skipping article: ${result.url}`);
    return;
  }

  const db = await getDb();
  const { researchArticles } = await import("@/lib/db/schema");

  // Upsert by URL (unique constraint)
  try {
    await db.insert(researchArticles).values({
      url: result.url,
      title: result.title,
      content: result.markdown,
      dataType,
      source: result.source,
      wordCount: result.wordCount,
    }).onConflictDoUpdate({
      target: researchArticles.url,
      set: {
        content: result.markdown,
        wordCount: result.wordCount,
        scrapedAt: new Date(),
      },
    });
  } catch (err) {
    console.error(`[storage] Failed to store article ${result.url}:`, err);
  }
}

export async function storeDiscoveryResult(result: DiscoveryResult): Promise<void> {
  if (!isDatabaseAvailable()) {
    console.info(`[storage] DB not configured, skipping discovery: ${result.query}`);
    return;
  }

  const db = await getDb();
  const { researchFindings } = await import("@/lib/db/schema");

  await db.insert(researchFindings).values({
    query: result.query,
    engine: result.engine,
    results: result.results,
    resultCount: result.resultCount,
  });
}

export async function updateArticleEnrichment(
  url: string,
  enrichment: ArticleEnrichment
): Promise<void> {
  if (!isDatabaseAvailable()) return;

  const db = await getDb();
  const { researchArticles } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  await db
    .update(researchArticles)
    .set({
      aiSummary: enrichment.summary,
      aiInsights: enrichment.keyInsights,
      aiActionItems: enrichment.actionItems,
      aiRelevanceScore: enrichment.relevanceScore,
      aiTags: enrichment.tags,
      aiProcessedAt: new Date(),
    })
    .where(eq(researchArticles.url, url));
}

export async function getScrapingStats(): Promise<{
  coaches: number;
  articles: number;
  enrichedArticles: number;
  discoveries: number;
}> {
  if (!isDatabaseAvailable()) {
    return { coaches: 0, articles: 0, enrichedArticles: 0, discoveries: 0 };
  }

  const db = await getDb();
  const { coaches, researchArticles, researchFindings } = await import("@/lib/db/schema");
  const { count, isNotNull } = await import("drizzle-orm");

  const [coachCount] = await db.select({ count: count() }).from(coaches);
  const [articleCount] = await db.select({ count: count() }).from(researchArticles);
  const [enrichedCount] = await db
    .select({ count: count() })
    .from(researchArticles)
    .where(isNotNull(researchArticles.aiProcessedAt));
  const [discoveryCount] = await db.select({ count: count() }).from(researchFindings);

  return {
    coaches: coachCount.count,
    articles: articleCount.count,
    enrichedArticles: enrichedCount.count,
    discoveries: discoveryCount.count,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/scraper-storage.test.ts --environment node`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/scraper-engines/storage.ts src/__tests__/unit/scraper-storage.test.ts
git commit -m "feat(scraper): add Supabase storage layer for scraped data"
```

---

## Group 7: Recruit Page ISR Integration

### Task 10: Build the recruit data API and ISR fetching

**Files:**
- Create: `src/app/api/recruit/data/route.ts`
- Create: `src/lib/recruit/data-fetcher.ts`
- Modify: `src/app/recruit/page.tsx` (add ISR data fetching)
- Test: `src/__tests__/unit/recruit-data.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/recruit-data.test.ts
import { describe, it, expect } from "vitest";

describe("Recruit data fetcher", () => {
  it("exports getEnrichedSchools function", async () => {
    const mod = await import("@/lib/recruit/data-fetcher");
    expect(mod.getEnrichedSchools).toBeTypeOf("function");
  });

  it("exports getCoachSignals function", async () => {
    const mod = await import("@/lib/recruit/data-fetcher");
    expect(mod.getCoachSignals).toBeTypeOf("function");
  });

  it("exports getResearchInsights function", async () => {
    const mod = await import("@/lib/recruit/data-fetcher");
    expect(mod.getResearchInsights).toBeTypeOf("function");
  });

  it("getEnrichedSchools returns array even without DB", async () => {
    const { getEnrichedSchools } = await import("@/lib/recruit/data-fetcher");
    const result = await getEnrichedSchools();
    expect(Array.isArray(result)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/recruit-data.test.ts --environment node`
Expected: FAIL

**Step 3: Implement data-fetcher.ts**

```typescript
// src/lib/recruit/data-fetcher.ts
/**
 * Data fetcher for the recruit page.
 * Pulls enriched data from Supabase for ISR rendering.
 * Returns empty arrays if DB is not configured (graceful degradation).
 */

function isDatabaseAvailable(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.DATABASE_URL);
}

export interface EnrichedSchoolData {
  name: string;
  conference: string;
  division: string;
  olGraduating: number;
  scholarshipGapScore: number;
  hasViewedProfile: boolean;
}

export interface CoachSignal {
  coachName: string;
  schoolName: string;
  division: string;
  signalType: "profile_view" | "camp_invite" | "message";
  date: string;
}

export interface ResearchInsight {
  category: string;
  insight: string;
  actionItem: string;
  relevanceScore: number;
}

export async function getEnrichedSchools(): Promise<EnrichedSchoolData[]> {
  if (!isDatabaseAvailable()) return [];

  try {
    const { db } = await import("@/lib/db");
    const { enrichedSchools } = await import("@/lib/db/schema");
    const { desc, isNotNull } = await import("drizzle-orm");

    const schools = await db
      .select()
      .from(enrichedSchools)
      .where(isNotNull(enrichedSchools.olGraduating))
      .orderBy(desc(enrichedSchools.talentScore))
      .limit(50);

    return schools.map((s) => ({
      name: s.name,
      conference: s.conference || "",
      division: s.division || "",
      olGraduating: s.olGraduating || 0,
      scholarshipGapScore: (s as Record<string, unknown>).scholarshipGapScore as number || 0,
      hasViewedProfile: false, // cross-referenced with NCSA leads
    }));
  } catch {
    return [];
  }
}

export async function getCoachSignals(): Promise<CoachSignal[]> {
  if (!isDatabaseAvailable()) return [];

  try {
    const { db } = await import("@/lib/db");
    const { ncsaLeads } = await import("@/lib/db/schema");
    const { desc } = await import("drizzle-orm");

    const leads = await db
      .select()
      .from(ncsaLeads)
      .orderBy(desc(ncsaLeads.createdAt))
      .limit(100);

    return leads.map((l) => ({
      coachName: l.coachName,
      schoolName: l.schoolName,
      division: l.division || "",
      signalType: l.source as "profile_view" | "camp_invite" | "message",
      date: l.createdAt?.toISOString() || "",
    }));
  } catch {
    return [];
  }
}

export async function getResearchInsights(): Promise<ResearchInsight[]> {
  if (!isDatabaseAvailable()) return [];

  try {
    const { db } = await import("@/lib/db");
    const { researchArticles } = await import("@/lib/db/schema");
    const { isNotNull, desc } = await import("drizzle-orm");

    const articles = await db
      .select()
      .from(researchArticles)
      .where(isNotNull(researchArticles.aiProcessedAt))
      .orderBy(desc(researchArticles.aiRelevanceScore))
      .limit(20);

    const insights: ResearchInsight[] = [];

    for (const article of articles) {
      const actionItems = (article.aiActionItems as string[]) || [];
      const keyInsights = (article.aiInsights as string[]) || [];

      for (let i = 0; i < Math.min(keyInsights.length, 2); i++) {
        insights.push({
          category: article.dataType,
          insight: keyInsights[i],
          actionItem: actionItems[i] || "",
          relevanceScore: article.aiRelevanceScore || 0,
        });
      }
    }

    return insights.slice(0, 15);
  } catch {
    return [];
  }
}
```

**Step 3b: Create the API route**

```typescript
// src/app/api/recruit/data/route.ts
import { NextResponse } from "next/server";
import {
  getEnrichedSchools,
  getCoachSignals,
  getResearchInsights,
} from "@/lib/recruit/data-fetcher";

export async function GET() {
  const [schools, coachSignals, insights] = await Promise.all([
    getEnrichedSchools(),
    getCoachSignals(),
    getResearchInsights(),
  ]);

  return NextResponse.json({
    schools,
    coachSignals,
    insights,
    generatedAt: new Date().toISOString(),
  });
}
```

**Step 4: Run test to verify it passes**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/recruit-data.test.ts --environment node`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/recruit/data-fetcher.ts src/app/api/recruit/data/route.ts src/__tests__/unit/recruit-data.test.ts
git commit -m "feat(recruit): add ISR data fetcher and API route for enriched data"
```

---

## Group 8: Command Implementations

### Task 11: Implement all 6 command modules

**Files:**
- Create: `src/lib/scraper-engines/commands/scrape-coaches.ts`
- Create: `src/lib/scraper-engines/commands/scrape-rosters.ts`
- Create: `src/lib/scraper-engines/commands/discover.ts`
- Create: `src/lib/scraper-engines/commands/scrape-research.ts`
- Create: `src/lib/scraper-engines/commands/enrich-articles.ts`
- Create: `src/lib/scraper-engines/commands/status.ts`

Each command module imports from the engine modules (Tasks 2-4), orchestrator (Task 6), and storage (Task 9).

**scrape-coaches.ts** — iterates `getSchools(division)` from mega-scraper, calls `scrapeCoachesForSchool()`, stores via `storeCoach()`.

**scrape-rosters.ts** — iterates schools, calls `scrapeRosterPage()`, updates `enrichedSchools` with OL counts and graduation data.

**discover.ts** — calls `runAllDiscovery()` from exa-engine, stores each result via `storeDiscoveryResult()`.

**scrape-research.ts** — iterates research stream URLs from `streams.ts`, calls `scrapeResearchArticle()` from orchestrator, stores via `storeResearchArticle()`.

**enrich-articles.ts** — queries `researchArticles` where `aiProcessedAt IS NULL`, runs `enrichArticle()` on each, updates via `updateArticleEnrichment()`.

**status.ts** — calls `getScrapingStats()` and prints a formatted summary.

**Step 1: Implement all 6 modules**

(Code for each module follows the patterns established in Task 8's scrape-coaches example. Each imports the appropriate engine/storage modules and iterates through the data.)

**Step 2: Run existing test from Task 8**

Run: `cd alex-recruiting && npx vitest run src/__tests__/unit/recruit-cli.test.ts --environment node`
Expected: PASS (all 6 command modules export `run`)

**Step 3: Commit**

```bash
git add src/lib/scraper-engines/commands/
git commit -m "feat(cli): implement all 6 CLI command modules"
```

---

## Execution Order

```
Task 1 (schema)
  ↓
Tasks 2, 3, 4, 5 (engines — can run in parallel)
  ↓
Task 6 (orchestrator — depends on engines)
  ↓
Task 7 (AI enrichment — independent)
  ↓
Task 9 (storage — depends on schema + engine types)
  ↓
Tasks 8, 11 (CLI + commands — depends on all above)
  ↓
Task 10 (ISR integration — depends on storage)
```

Tasks 2-5 can be parallelized. Tasks 7 and 9 can be parallelized after Task 6.
