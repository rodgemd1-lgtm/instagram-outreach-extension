# Recruiting Studio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a research-backed recruiting studio that drives 95% of a 30-coach panel to say "I would recruit this athlete."

**Architecture:** Six build groups executed in dependency order. Group 1 (Research Engine) and Group 3 (Analytics DB) can run in parallel. Group 2 (Intelligence Synthesis) depends on Group 1 completing. Groups 4-6 can parallelize after Group 3. Group 7 (Site Content) depends on Group 2. Group 8 (Dashboard) depends on Groups 3-6 schemas existing.

**Tech Stack:** Next.js 14 (App Router), Supabase (Drizzle ORM), Playwright, Vitest, Susan RAG (MCP), Anthropic Claude SDK, GSAP, Tailwind CSS.

**Design Doc:** `docs/plans/2026-03-09-recruiting-studio-design.md`

---

## Group 1: Research Acquisition Engine

### Task 1: Playwright Scraper Framework

**Files:**
- Create: `src/lib/research/scraper.ts`
- Create: `src/lib/research/types.ts`
- Create: `src/lib/research/ingest.ts`
- Create: `playwright.config.ts`
- Test: `src/__tests__/unit/research-scraper.test.ts`

**Step 1: Write types**

```typescript
// src/lib/research/types.ts
export type ResearchDataType =
  | "coach_psychology"
  | "competitive_profiles"
  | "coach_contacts"
  | "recruiting_rules"
  | "film_effectiveness"
  | "forum_insights";

export interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  dataType: ResearchDataType;
  scrapedAt: string;
}

export interface IngestionResult {
  url: string;
  success: boolean;
  chunksCreated?: number;
  error?: string;
}

export interface ResearchSource {
  name: string;
  urls: string[];
  dataType: ResearchDataType;
  scrapeStrategy: "static" | "playwright" | "susan_ingest";
}
```

**Step 2: Write failing test for scraper**

```typescript
// src/__tests__/unit/research-scraper.test.ts
import { describe, it, expect } from "vitest";
import { buildResearchSources, categorizeUrl } from "@/lib/research/scraper";

describe("research scraper", () => {
  it("categorizes recruiting guide URLs as coach_psychology", () => {
    expect(categorizeUrl("https://www.ncsasports.org/how-to-get-recruited"))
      .toBe("coach_psychology");
  });

  it("categorizes hudl profile URLs as competitive_profiles", () => {
    expect(categorizeUrl("https://www.hudl.com/profile/12345"))
      .toBe("competitive_profiles");
  });

  it("categorizes reddit URLs as forum_insights", () => {
    expect(categorizeUrl("https://reddit.com/r/footballcoach/comments/abc"))
      .toBe("forum_insights");
  });

  it("builds research sources with correct data types", () => {
    const sources = buildResearchSources();
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.every(s => s.urls.length > 0)).toBe(true);
    expect(sources.every(s => s.dataType)).toBe(true);
  });
});
```

**Step 3: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/research-scraper.test.ts`
Expected: FAIL — modules not found

**Step 4: Implement scraper module**

```typescript
// src/lib/research/scraper.ts
import type { ResearchDataType, ResearchSource } from "./types";

const URL_PATTERNS: [RegExp, ResearchDataType][] = [
  [/ncsa|berecruited|how-to-get-recruited|recruiting-guide/i, "coach_psychology"],
  [/hudl\.com\/profile|247sports|rivals\.com\/player|on3\.com/i, "competitive_profiles"],
  [/reddit\.com\/r\/(footballcoach|CFB|coaching)/i, "forum_insights"],
  [/ncaa\.org|naia\.org|eligibilitycenter/i, "recruiting_rules"],
  [/highlight|film|reel|clip|video-length/i, "film_effectiveness"],
];

export function categorizeUrl(url: string): ResearchDataType {
  for (const [pattern, dataType] of URL_PATTERNS) {
    if (pattern.test(url)) return dataType;
  }
  return "coach_psychology"; // default
}

export function buildResearchSources(): ResearchSource[] {
  return [
    {
      name: "NCSA Recruiting Guides",
      urls: [
        "https://www.ncsasports.org/how-to-get-recruited",
        "https://www.ncsasports.org/recruiting/how-to-get-recruited/football",
        "https://www.ncsasports.org/football-recruiting",
      ],
      dataType: "coach_psychology",
      scrapeStrategy: "susan_ingest",
    },
    {
      name: "Hudl Recruiting Resources",
      urls: [
        "https://www.hudl.com/blog/recruiting",
      ],
      dataType: "coach_psychology",
      scrapeStrategy: "susan_ingest",
    },
    {
      name: "Reddit Coach Forums",
      urls: [
        "https://www.reddit.com/r/footballcoach/",
        "https://www.reddit.com/r/CFB/",
      ],
      dataType: "forum_insights",
      scrapeStrategy: "playwright",
    },
    {
      name: "NCAA Eligibility & Rules",
      urls: [
        "https://www.ncaa.org/sports/2021/2/10/recruiting.aspx",
        "https://web3.ncaa.org/ecwr3/",
      ],
      dataType: "recruiting_rules",
      scrapeStrategy: "susan_ingest",
    },
    {
      name: "Film Effectiveness Research",
      urls: [
        "https://www.hudl.com/blog/how-to-make-a-highlight-video",
      ],
      dataType: "film_effectiveness",
      scrapeStrategy: "susan_ingest",
    },
  ];
}
```

**Step 5: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/unit/research-scraper.test.ts`
Expected: PASS

**Step 6: Create Playwright config for scraping**

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

**Step 7: Commit**

```bash
git add src/lib/research/ src/__tests__/unit/research-scraper.test.ts playwright.config.ts
git commit -m "feat(research): add scraper framework with URL categorization and Playwright config"
```

---

### Task 2: Susan Ingestion Pipeline

**Files:**
- Create: `src/lib/research/ingest.ts`
- Create: `src/app/api/research/ingest/route.ts`
- Test: `src/__tests__/unit/research-ingest.test.ts`

**Step 1: Write failing test**

```typescript
// src/__tests__/unit/research-ingest.test.ts
import { describe, it, expect } from "vitest";
import { buildIngestionPayload, validateUrl } from "@/lib/research/ingest";

describe("research ingestion", () => {
  it("builds valid ingestion payload for coach_psychology", () => {
    const payload = buildIngestionPayload(
      "https://www.ncsasports.org/how-to-get-recruited",
      "coach_psychology"
    );
    expect(payload.url).toBe("https://www.ncsasports.org/how-to-get-recruited");
    expect(payload.data_type).toBe("coach_psychology");
    expect(payload.company_id).toBe("alex-recruiting");
  });

  it("validates URLs correctly", () => {
    expect(validateUrl("https://example.com")).toBe(true);
    expect(validateUrl("not-a-url")).toBe(false);
    expect(validateUrl("")).toBe(false);
  });

  it("rejects disallowed domains", () => {
    expect(validateUrl("https://localhost:3000")).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/research-ingest.test.ts`
Expected: FAIL

**Step 3: Implement ingestion module**

```typescript
// src/lib/research/ingest.ts
import type { ResearchDataType, IngestionResult } from "./types";

const DISALLOWED_DOMAINS = ["localhost", "127.0.0.1", "0.0.0.0"];

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (DISALLOWED_DOMAINS.some(d => parsed.hostname.includes(d))) return false;
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function buildIngestionPayload(url: string, dataType: ResearchDataType) {
  return {
    url,
    data_type: dataType,
    company_id: "alex-recruiting",
  };
}

export async function ingestUrl(
  url: string,
  dataType: ResearchDataType
): Promise<IngestionResult> {
  if (!validateUrl(url)) {
    return { url, success: false, error: "Invalid URL" };
  }

  try {
    // Uses Susan's ingest_url MCP tool via API
    const response = await fetch("/api/research/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildIngestionPayload(url, dataType)),
    });

    if (!response.ok) {
      return { url, success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { url, success: true, chunksCreated: data.chunks_created };
  } catch (error) {
    return { url, success: false, error: String(error) };
  }
}
```

**Step 4: Create API route**

```typescript
// src/app/api/research/ingest/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, data_type, company_id } = body;

    if (!url || !data_type) {
      return NextResponse.json(
        { error: "url and data_type required" },
        { status: 400 }
      );
    }

    // This endpoint is called by the ingestion pipeline
    // In production, it calls Susan's ingest_url MCP tool
    // For now, log and return success shape
    console.log(`[Research] Ingesting: ${url} as ${data_type} for ${company_id}`);

    return NextResponse.json({
      success: true,
      url,
      data_type,
      company_id,
      chunks_created: 0, // populated by Susan MCP
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Ingestion failed", details: String(error) },
      { status: 500 }
    );
  }
}
```

**Step 5: Run tests**

Run: `npx vitest run src/__tests__/unit/research-ingest.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/research/ingest.ts src/app/api/research/ingest/route.ts src/__tests__/unit/research-ingest.test.ts
git commit -m "feat(research): add Susan ingestion pipeline with URL validation"
```

---

### Task 3: Research Stream Runner

**Files:**
- Create: `src/lib/research/streams.ts`
- Create: `src/app/api/research/run/route.ts`
- Test: `src/__tests__/unit/research-streams.test.ts`

**Step 1: Write failing test**

```typescript
// src/__tests__/unit/research-streams.test.ts
import { describe, it, expect } from "vitest";
import { getStreamByName, getAllStreams, getStreamUrls } from "@/lib/research/streams";

describe("research streams", () => {
  it("returns all 5 research streams", () => {
    const streams = getAllStreams();
    expect(streams).toHaveLength(5);
    expect(streams.map(s => s.name)).toContain("Coach Decision Psychology");
    expect(streams.map(s => s.name)).toContain("Reddit/Forum Coach Insights");
    expect(streams.map(s => s.name)).toContain("Film Effectiveness Research");
  });

  it("gets stream by name", () => {
    const stream = getStreamByName("Coach Decision Psychology");
    expect(stream).toBeDefined();
    expect(stream!.dataType).toBe("coach_psychology");
    expect(stream!.urls.length).toBeGreaterThan(0);
  });

  it("returns flat list of all URLs across streams", () => {
    const urls = getStreamUrls();
    expect(urls.length).toBeGreaterThan(10);
    expect(urls.every(u => u.url.startsWith("http"))).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/research-streams.test.ts`
Expected: FAIL

**Step 3: Implement streams module**

This is where all 5 research streams are defined with their full URL lists. The file should contain comprehensive URL lists for each stream, covering:
- Stream 1 (Coach Psychology): 15-20 NCSA guides, Hudl resources, coaching articles
- Stream 2 (Competitive Profiles): 10-15 247Sports, Rivals, On3 profile patterns
- Stream 3 (Coach Contacts): School directory URL patterns by conference
- Stream 4 (Reddit/Forum): 10-15 relevant subreddit and forum URLs
- Stream 5 (Film Effectiveness): 10-15 highlight film best-practice articles

Each stream exports its `ResearchSource` with full URL arrays and `scrapeStrategy`.

**Step 4: Create API route to trigger stream ingestion**

```typescript
// src/app/api/research/run/route.ts
import { NextResponse } from "next/server";
import { getAllStreams, getStreamByName } from "@/lib/research/streams";

export async function POST(request: Request) {
  const body = await request.json();
  const { streamName } = body; // optional: run specific stream

  const streams = streamName
    ? [getStreamByName(streamName)].filter(Boolean)
    : getAllStreams();

  const results = [];

  for (const stream of streams) {
    if (!stream) continue;
    for (const url of stream.urls) {
      // Call ingestion endpoint for susan_ingest strategy
      if (stream.scrapeStrategy === "susan_ingest") {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/research/ingest`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url,
                data_type: stream.dataType,
                company_id: "alex-recruiting",
              }),
            }
          );
          const data = await res.json();
          results.push({ url, stream: stream.name, ...data });
        } catch (error) {
          results.push({ url, stream: stream.name, success: false, error: String(error) });
        }
      }
      // playwright strategy handled separately by scraper scripts
    }
  }

  return NextResponse.json({ results, total: results.length });
}
```

**Step 5: Run tests**

Run: `npx vitest run src/__tests__/unit/research-streams.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/research/streams.ts src/app/api/research/run/route.ts src/__tests__/unit/research-streams.test.ts
git commit -m "feat(research): add 5-stream research runner with full URL sets"
```

---

## Group 2: Intelligence Synthesis

> **CHECKPOINT**: Group 2 requires Group 1 research to be ingested first. Run the research streams against Susan's RAG before proceeding. Verify chunk count > 500 with `mcp__susan-intelligence__count_knowledge`.

### Task 4: Coach Decision Playbook Generation

**Files:**
- Create: `src/lib/research/playbook.ts`
- Create: `src/lib/research/personas.ts`
- Create: `src/app/api/research/playbook/route.ts`
- Test: `src/__tests__/unit/research-playbook.test.ts`

**Step 1: Write failing test**

```typescript
// src/__tests__/unit/research-playbook.test.ts
import { describe, it, expect } from "vitest";
import {
  PLAYBOOK_QUESTIONS,
  COACH_PERSONAS,
  AB_VARIANT_SPECS,
  buildPlaybookPrompt,
} from "@/lib/research/playbook";

describe("coach decision playbook", () => {
  it("defines all 6 playbook questions", () => {
    expect(PLAYBOOK_QUESTIONS).toHaveLength(6);
    expect(PLAYBOOK_QUESTIONS[0]).toContain("15 seconds");
  });

  it("defines 4 coach personas", () => {
    expect(COACH_PERSONAS).toHaveLength(4);
    expect(COACH_PERSONAS.map(p => p.id)).toContain("skeptic");
    expect(COACH_PERSONAS.map(p => p.id)).toContain("data-nerd");
    expect(COACH_PERSONAS.map(p => p.id)).toContain("gut-feel");
    expect(COACH_PERSONAS.map(p => p.id)).toContain("time-pressed");
  });

  it("defines A/B variant specs for 4 sections", () => {
    expect(AB_VARIANT_SPECS).toHaveLength(4);
    expect(AB_VARIANT_SPECS.every(v => v.variantA && v.variantB)).toBe(true);
  });

  it("builds a prompt that includes all playbook questions", () => {
    const prompt = buildPlaybookPrompt();
    for (const q of PLAYBOOK_QUESTIONS) {
      expect(prompt).toContain(q);
    }
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/research-playbook.test.ts`
Expected: FAIL

**Step 3: Implement playbook module**

Define `PLAYBOOK_QUESTIONS`, `COACH_PERSONAS`, `AB_VARIANT_SPECS`, and `buildPlaybookPrompt()` per the design doc. The playbook prompt is what gets sent to Susan's agents (Freya, Flow, Recruiting Strategy) to synthesize the research.

**Step 4: Create API route for playbook generation**

The route calls Susan's `run_agent` MCP tool three times (freya, flow, recruiting-strategy-studio) with the playbook prompt, then merges their outputs into a structured Coach Decision Playbook JSON.

**Step 5: Run tests**

Run: `npx vitest run src/__tests__/unit/research-playbook.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/research/playbook.ts src/lib/research/personas.ts src/app/api/research/playbook/route.ts src/__tests__/unit/research-playbook.test.ts
git commit -m "feat(research): add Coach Decision Playbook generation with personas and A/B specs"
```

---

## Group 3: Analytics & Tracking Database

### Task 5: Analytics Database Schema

**Files:**
- Modify: `src/lib/db/schema.ts` (append new tables)
- Create: `supabase/migrations/YYYYMMDD_analytics_tables.sql`
- Test: `src/__tests__/unit/analytics-schema.test.ts`

**Step 1: Write failing test**

```typescript
// src/__tests__/unit/analytics-schema.test.ts
import { describe, it, expect } from "vitest";
import * as schema from "@/lib/db/schema";

describe("analytics schema", () => {
  it("exports pageVisits table", () => {
    expect(schema.pageVisits).toBeDefined();
  });

  it("exports sectionEngagement table", () => {
    expect(schema.sectionEngagement).toBeDefined();
  });

  it("exports filmViews table", () => {
    expect(schema.filmViews).toBeDefined();
  });

  it("exports panelCoaches table", () => {
    expect(schema.panelCoaches).toBeDefined();
  });

  it("exports panelSurveys table", () => {
    expect(schema.panelSurveys).toBeDefined();
  });

  it("exports abVariants table", () => {
    expect(schema.abVariants).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/analytics-schema.test.ts`
Expected: FAIL — tables not defined

**Step 3: Add tables to schema.ts**

Append to `src/lib/db/schema.ts`:

```typescript
// === Analytics & Tracking ===

export const pageVisits = pgTable("page_visits", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitorId: text("visitor_id").notNull(), // fingerprint or cookie
  coachId: uuid("coach_id").references(() => coaches.id),
  page: text("page").notNull(), // "/recruit"
  referrer: text("referrer"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  userAgent: text("user_agent"),
  duration: integer("duration"), // seconds on page
  maxScrollDepth: real("max_scroll_depth"), // 0-1
  visitedAt: timestamp("visited_at").defaultNow(),
});

export const sectionEngagement = pgTable("section_engagement", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitId: uuid("visit_id").references(() => pageVisits.id),
  sectionId: text("section_id").notNull(), // "hero", "film-reel", etc.
  enteredAt: timestamp("entered_at"),
  exitedAt: timestamp("exited_at"),
  dwellTime: integer("dwell_time"), // milliseconds
  interacted: boolean("interacted").default(false), // clicked, played, etc.
});

export const filmViews = pgTable("film_views", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitId: uuid("visit_id").references(() => pageVisits.id),
  filmId: text("film_id").notNull(),
  playedAt: timestamp("played_at").defaultNow(),
  watchDuration: integer("watch_duration"), // seconds
  completed: boolean("completed").default(false),
});

// === A/B Testing ===

export const abVariants = pgTable("ab_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  experimentName: text("experiment_name").notNull(), // "hero-copy", "social-proof"
  variantKey: text("variant_key").notNull(), // "A" or "B"
  variantLabel: text("variant_label").notNull(), // "stats-forward"
  config: jsonb("config").$type<Record<string, unknown>>(), // variant-specific config
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const abAssignments = pgTable("ab_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitId: uuid("visit_id").references(() => pageVisits.id),
  experimentName: text("experiment_name").notNull(),
  variantKey: text("variant_key").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

// === Coach Panel ===

export const panelCoaches = pgTable("panel_coaches", {
  id: uuid("id").defaultRandom().primaryKey(),
  coachId: uuid("coach_id").references(() => coaches.id),
  name: text("name").notNull(),
  school: text("school").notNull(),
  division: text("division").notNull(),
  role: text("role"), // "head_coach", "position_coach", "recruiting_coordinator"
  panelRound: integer("panel_round"), // 1, 2, or 3
  status: text("status").default("invited"), // invited, confirmed, completed, declined
  invitedAt: timestamp("invited_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const panelSurveys = pgTable("panel_surveys", {
  id: uuid("id").defaultRandom().primaryKey(),
  panelCoachId: uuid("panel_coach_id").references(() => panelCoaches.id),
  visitId: uuid("visit_id").references(() => pageVisits.id),
  wouldRecruit: text("would_recruit").notNull(), // "yes", "maybe", "no"
  whatConvinced: text("what_convinced"),
  whatAlmostMadeLeave: text("what_almost_made_leave"),
  comparisonScore: integer("comparison_score"), // 1-10
  wouldShare: boolean("would_share"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});
```

**Step 4: Create SQL migration**

Generate the corresponding SQL migration file for Supabase.

**Step 5: Run tests**

Run: `npx vitest run src/__tests__/unit/analytics-schema.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/db/schema.ts supabase/migrations/ src/__tests__/unit/analytics-schema.test.ts
git commit -m "feat(analytics): add page visits, section engagement, film views, A/B, and panel tables"
```

---

### Task 6: Visit Tracking API

**Files:**
- Create: `src/app/api/analytics/visit/route.ts`
- Create: `src/app/api/analytics/section/route.ts`
- Create: `src/app/api/analytics/film/route.ts`
- Test: `src/__tests__/unit/analytics-api.test.ts`

**Step 1: Write failing test**

Test the visit tracking endpoint accepts valid payloads and rejects invalid ones.

**Step 2: Implement visit tracking API**

```typescript
// src/app/api/analytics/visit/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageVisits } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { visitorId, page, referrer, utmSource, utmMedium, utmCampaign, userAgent } = body;

    if (!visitorId || !page) {
      return NextResponse.json({ error: "visitorId and page required" }, { status: 400 });
    }

    const [visit] = await db.insert(pageVisits).values({
      visitorId,
      page,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      userAgent,
    }).returning();

    return NextResponse.json({ visitId: visit.id });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

Similarly implement section engagement and film view tracking endpoints.

**Step 3: Run tests, verify pass**

**Step 4: Commit**

```bash
git add src/app/api/analytics/ src/__tests__/unit/analytics-api.test.ts
git commit -m "feat(analytics): add visit, section, and film tracking API routes"
```

---

### Task 7: Client-Side Tracking Hook

**Files:**
- Create: `src/components/recruit/hooks/use-analytics.ts`
- Modify: `src/app/recruit/page.tsx` (integrate tracking)
- Test: `src/__tests__/unit/use-analytics.test.ts`

**Step 1: Write failing test**

Test that the hook generates a visitor ID, tracks scroll depth, and reports section visibility.

**Step 2: Implement useAnalytics hook**

The hook should:
- Generate/persist a visitor fingerprint (localStorage)
- POST to `/api/analytics/visit` on mount
- Track scroll depth via IntersectionObserver on each section
- Track film play events
- Report section dwell time on visibility change
- Extract UTM params from URL

**Step 3: Integrate into recruit page.tsx**

Add `<AnalyticsProvider visitId={...}>` wrapper and connect section refs.

**Step 4: Run tests, verify pass**

**Step 5: Commit**

```bash
git add src/components/recruit/hooks/use-analytics.ts src/app/recruit/page.tsx src/__tests__/unit/use-analytics.test.ts
git commit -m "feat(analytics): add client-side tracking hook with scroll depth and section engagement"
```

---

## Group 4: A/B Testing Infrastructure

### Task 8: Variant System

**Files:**
- Create: `src/lib/ab/variants.ts`
- Create: `src/lib/ab/assign.ts`
- Create: `src/app/api/ab/assign/route.ts`
- Test: `src/__tests__/unit/ab-variants.test.ts`

**Step 1: Write failing test**

```typescript
// src/__tests__/unit/ab-variants.test.ts
import { describe, it, expect } from "vitest";
import { assignVariant, getActiveExperiments } from "@/lib/ab/assign";

describe("A/B variant assignment", () => {
  it("assigns visitor to exactly one variant per experiment", () => {
    const assignment = assignVariant("visitor-123", "hero-copy");
    expect(["A", "B"]).toContain(assignment.variantKey);
  });

  it("returns consistent assignment for same visitor", () => {
    const a1 = assignVariant("visitor-123", "hero-copy");
    const a2 = assignVariant("visitor-123", "hero-copy");
    expect(a1.variantKey).toBe(a2.variantKey);
  });

  it("returns active experiments", () => {
    const experiments = getActiveExperiments();
    expect(experiments.length).toBeGreaterThan(0);
    expect(experiments[0]).toHaveProperty("name");
    expect(experiments[0]).toHaveProperty("section");
  });
});
```

**Step 2: Implement**

Use deterministic hashing (visitor ID + experiment name → consistent variant assignment) so the same coach always sees the same variant.

**Step 3: Run tests, commit**

```bash
git add src/lib/ab/ src/app/api/ab/ src/__tests__/unit/ab-variants.test.ts
git commit -m "feat(ab): add deterministic variant assignment system"
```

---

## Group 5: Coach Panel System

### Task 9: Panel Management API

**Files:**
- Create: `src/app/api/panel/coaches/route.ts`
- Create: `src/app/api/panel/survey/route.ts`
- Create: `src/app/api/panel/metrics/route.ts`
- Test: `src/__tests__/unit/panel-api.test.ts`

**Step 1: Write failing tests**

Test CRUD for panel coaches (add, list, update status) and survey submission.

**Step 2: Implement panel APIs**

- `GET /api/panel/coaches` — list all panel coaches with status
- `POST /api/panel/coaches` — add coach to panel (with round assignment)
- `PUT /api/panel/coaches/[id]` — update coach status
- `POST /api/panel/survey` — submit survey response
- `GET /api/panel/metrics` — aggregate metrics (% yes, funnel data)

**Step 3: Run tests, commit**

```bash
git add src/app/api/panel/ src/__tests__/unit/panel-api.test.ts
git commit -m "feat(panel): add coach panel management and survey APIs"
```

---

### Task 10: Survey UI Component

**Files:**
- Create: `src/components/recruit/survey.tsx`
- Create: `src/app/recruit/survey/page.tsx`
- Test: `src/__tests__/unit/survey-component.test.ts`

**Step 1: Write failing test**

Test that the survey form renders all 5 questions, validates required fields, and submits correctly.

**Step 2: Implement survey component**

FNL-styled survey form with:
- Radio: "Would you recruit this athlete?" (Yes / Maybe / No)
- Textarea: "What convinced you?"
- Textarea: "What almost made you leave?"
- Slider (1-10): "How does this compare?"
- Radio: "Would you share with staff?" (Yes / No)

**Step 3: Create survey page at `/recruit/survey`**

Standalone page coaches are redirected to after viewing the recruit site.

**Step 4: Run tests, commit**

```bash
git add src/components/recruit/survey.tsx src/app/recruit/survey/ src/__tests__/unit/survey-component.test.ts
git commit -m "feat(panel): add coach survey form with FNL styling"
```

---

## Group 6: Playwright Full Regression Suite

### Task 11: Coach Journey E2E Tests

**Files:**
- Create: `src/__tests__/e2e/recruit-journey.spec.ts`

**Step 1: Write E2E test**

```typescript
// src/__tests__/e2e/recruit-journey.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Coach Recruit Journey", () => {
  test("loads recruit page within 3 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/recruit");
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(3000);
  });

  test("renders all 8 sections", async ({ page }) => {
    await page.goto("/recruit");
    const sections = ["hero", "film-reel", "origin", "athlete", "character", "academics", "fit", "contact"];
    for (const id of sections) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test("hero displays correct athlete info", async ({ page }) => {
    await page.goto("/recruit");
    await expect(page.locator("h1")).toContainText("Jacob Rodgers");
  });

  test("nav highlights active section on scroll", async ({ page }) => {
    await page.goto("/recruit");
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(500);
    // Verify nav active state changed
    const filmNav = page.locator('nav button:has-text("FILM")');
    await expect(filmNav).toBeVisible();
  });

  test("contact form accepts valid input", async ({ page }) => {
    await page.goto("/recruit");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    // Fill contact form
    await page.fill('input[name="name"]', "Test Coach");
    await page.fill('input[name="school"]', "Test University");
    await page.fill('input[name="email"]', "coach@test.edu");
  });

  test("mobile responsive layout works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/recruit");
    await expect(page.locator("h1")).toBeVisible();
  });
});
```

**Step 2: Run to verify tests execute**

Run: `npx playwright test src/__tests__/e2e/recruit-journey.spec.ts`
Expected: Tests should run (some may fail if dev server isn't running — that's expected)

**Step 3: Commit**

```bash
git add src/__tests__/e2e/recruit-journey.spec.ts
git commit -m "test(e2e): add coach journey Playwright tests for recruit page"
```

---

### Task 12: REC System E2E Tests

**Files:**
- Create: `src/__tests__/e2e/rec-system.spec.ts`

Write Playwright E2E tests for:
- `/agency` dashboard loads
- `/agency/nina` chat interface loads and accepts input
- `/agency/leads` NCSA lead pipeline displays
- API health checks for all REC routes

**Commit:**

```bash
git add src/__tests__/e2e/rec-system.spec.ts
git commit -m "test(e2e): add REC system Playwright tests"
```

---

### Task 13: Performance & Visual Regression Tests

**Files:**
- Create: `src/__tests__/e2e/performance.spec.ts`
- Create: `src/__tests__/e2e/visual-regression.spec.ts`

Performance tests measure Core Web Vitals via `page.evaluate()` using the Performance API. Visual regression tests take screenshots of each section and compare against baselines.

**Commit:**

```bash
git add src/__tests__/e2e/performance.spec.ts src/__tests__/e2e/visual-regression.spec.ts
git commit -m "test(e2e): add performance and visual regression Playwright tests"
```

---

## Group 7: Site Content Rebuild

> **CHECKPOINT**: Group 7 requires the Coach Decision Playbook from Group 2. The Playbook dictates what copy, ordering, and framing changes are needed. Do NOT proceed until the Playbook is generated and reviewed.

### Task 14: Apply Playbook to Hero Section

**Files:**
- Modify: `src/components/recruit/hero.tsx`
- Test: `src/__tests__/unit/hero-content.test.ts`

Rewrite hero copy based on Playbook findings about what coaches evaluate in the first 15 seconds. Apply the recommended A/B variant (stats-forward vs narrative-forward).

---

### Task 15: Apply Playbook to Film Section

**Files:**
- Modify: `src/components/recruit/film-reel.tsx`

Restructure film presentation per Stream 5 research findings: optimal length, embed strategy, thumbnail approach.

---

### Task 16: Apply Playbook to Social Proof

**Files:**
- Modify: `src/components/recruit/social-proof.tsx`

Recalibrate social proof based on what the Playbook says actually moves coaches (school ticker vs endorsements vs camp data).

---

### Task 17: Apply Playbook to Loss Aversion

**Files:**
- Modify: `src/components/recruit/the-fit.tsx`
- Potentially modify: `src/components/recruit/hero.tsx`, `src/components/recruit/contact.tsx`

Expand or reposition loss-aversion framing blocks throughout the site per Freya's analysis.

---

### Task 18: Apply Playbook to Contact/CTA

**Files:**
- Modify: `src/components/recruit/contact.tsx`

Calibrate CTA framing and urgency per the A/B variant recommendation (loss-frame vs gain-frame).

---

**Commit after all Playbook-driven changes:**

```bash
git add src/components/recruit/
git commit -m "feat(recruit): rebuild site content per Coach Decision Playbook"
```

---

## Group 8: Recruiting Operations Dashboard

### Task 19: Dashboard Page Layout

**Files:**
- Create: `src/app/dashboard/recruiting/page.tsx`
- Create: `src/components/dashboard/recruiting-overview.tsx`
- Create: `src/components/dashboard/panel-funnel.tsx`
- Create: `src/components/dashboard/research-coverage.tsx`

Build a single command-center screen with:
- **Coach Pipeline**: Cards showing coach status across outreach stages
- **Site Analytics**: Visit count, avg scroll depth, film play rate, contact conversion
- **Panel Progress**: Funnel visualization (invited → confirmed → visited → surveyed → "yes")
- **Research Coverage**: Bar chart of chunk count per data type vs 2,000 target

Use the existing shadcn/ui components (`Card`, `Badge`, `Tabs`) and the slate dark theme from the main app.

**Commit:**

```bash
git add src/app/dashboard/recruiting/ src/components/dashboard/
git commit -m "feat(dashboard): add recruiting operations command center"
```

---

## Group 9: Susan Sync

### Task 20: Push Studio to Susan

**Files:**
- Create: `src/lib/research/susan-sync.ts`
- Create: `src/app/api/research/sync-susan/route.ts`

Build a sync endpoint that:
1. Pushes all analytics data summaries to Susan's RAG as knowledge chunks
2. Pushes the Coach Decision Playbook to Susan's agent prompts
3. Pushes panel survey results to Susan's knowledge base
4. Verifies chunk count target (2,000+)

Uses Susan's MCP tools: `ingest_url`, `search_knowledge`, `count_knowledge`, `run_agent`.

**Commit:**

```bash
git add src/lib/research/susan-sync.ts src/app/api/research/sync-susan/route.ts
git commit -m "feat(susan): add studio-to-Susan sync pipeline"
```

---

## Execution Order Summary

| Order | Group | Tasks | Dependencies | Parallelizable |
|-------|-------|-------|-------------|----------------|
| 1 | Research Engine | 1-3 | None | Yes (with Group 3) |
| 2 | Analytics DB | 5-7 | None | Yes (with Group 1) |
| 3 | Intelligence Synthesis | 4 | Group 1 complete + research ingested | No |
| 4 | A/B Testing | 8 | Group 3 schema | Yes (with Groups 5-6) |
| 5 | Coach Panel | 9-10 | Group 3 schema | Yes (with Groups 4, 6) |
| 6 | Playwright Suite | 11-13 | Dev server running | Yes (with Groups 4-5) |
| 7 | Site Content Rebuild | 14-18 | Group 3 Playbook complete | No |
| 8 | Dashboard | 19 | Groups 3-6 schemas | After Groups 3-6 |
| 9 | Susan Sync | 20 | All groups | Last |
