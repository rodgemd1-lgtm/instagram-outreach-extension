# Scraper CLI & Data Enrichment Pipeline — Design Document

**Date:** 2026-03-09
**Status:** Approved
**Approach:** A — Engine-First CLI (all 4 scraping engines unified)

## Problem

The recruiting website has great design and structure, but runs on handwritten copy. The scraping infrastructure is scaffolding with no actual data flowing through it:
- Research streams define 66 URLs but have never been scraped
- `/api/research/ingest` is a stub (logs to console, returns 0 chunks)
- Exa is installed but its 5 search functions are never called from a CLI
- No unified way to run scrapers, enrich data, or feed results to the recruit page

## Solution

A unified `recruit-cli` with 4 scraping engines, Claude AI summarization, and Supabase ISR integration for the recruit page.

## Decisions

- **Data storage:** Supabase + Next.js ISR (revalidate every 24h)
- **School scope:** All NCAA (500+ schools across D1 FBS, D1 FCS, D2, D3, NAIA)
- **CLI structure:** Single CLI with subcommands (`npx tsx scripts/recruit-cli.ts <command>`)
- **AI summarization:** Claude Haiku for cost efficiency (~$0.001/article, ~$0.07 total)

---

## 1. CLI Architecture

**Entry point:** `scripts/recruit-cli.ts`

```
npx tsx scripts/recruit-cli.ts <command> [options]

# Alias in package.json:
npm run recruit -- <command> [options]
```

### Subcommands

| Command | Engine | Description |
|---------|--------|-------------|
| `scrape-coaches [--division D1_FBS] [--limit N]` | Firecrawl + Jina fallback | Scrape coaching staff pages. Parse name, title, email, X handle. Store in `coaches`. |
| `scrape-rosters [--division D1_FBS]` | Firecrawl | Scrape roster pages. Find OL graduation gaps, scholarship openings. Store in `enrichedSchools`. |
| `discover [--query "..."]` | Exa semantic | Run all 5 Exa discovery functions. Store in `researchFindings`. |
| `scrape-research [--stream coach-psychology]` | Firecrawl + Jina | Scrape 66 URLs from research streams. Store in `researchArticles`. |
| `sync-ncsa` | Playwright | Run existing NCSA browser sync (authenticated). Already works. |
| `scrape-forums` | Playwright | Scrape Reddit/coaching forum URLs from stream 4. Store in `researchArticles`. |
| `enrich-articles [--reprocess]` | Claude API | Run AI summarization over unprocessed articles. |
| `enrich-all` | All engines | Run everything in sequence: coaches -> rosters -> discover -> research -> forums -> enrich. |
| `status` | None | Show scrape stats: coaches found, schools covered, articles scraped, last run times. |

### Engine Selection Logic

1. Try Firecrawl first (best quality, structured extraction)
2. If Firecrawl fails (rate limit, auth wall, timeout) -> fall back to Jina reader mode
3. If Jina fails (dynamic page requiring JS) -> queue for Playwright
4. Exa runs independently for semantic discovery (neural search, finds content keyword search misses)

### Existing Code to Reuse

| File | What it provides |
|------|-----------------|
| `src/lib/data-pipeline/mega-scraper.ts` | 500+ NCAA school entries with staffUrl/rosterUrl/xHandle, coach parsing logic |
| `src/lib/integrations/exa.ts` | 5 Exa search functions (coach handles, school needs, Jacob mentions, competitors, analysts) |
| `src/lib/integrations/firecrawl.ts` | Firecrawl client, staff/roster scraping, markdown parsing |
| `src/lib/scraping/ncsa-browser-sync.mjs` | Full Playwright pipeline for NCSA authenticated scraping |
| `src/lib/scraping/ncsa-scraper.ts` | Firecrawl + Jina two-tier fallback pattern |
| `src/lib/research/streams.ts` | 66 URLs organized into 5 research streams |

---

## 2. New Database Tables

### `researchArticles`
```sql
CREATE TABLE research_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,                -- full extracted text
  data_type TEXT NOT NULL,     -- coach_psychology, competitive_profiles, etc.
  source TEXT NOT NULL,        -- firecrawl, jina, playwright
  word_count INTEGER,
  scraped_at TIMESTAMPTZ DEFAULT now(),
  -- AI enrichment columns
  ai_summary TEXT,
  ai_insights JSONB,          -- string[]
  ai_action_items JSONB,      -- string[]
  ai_relevance_score INTEGER, -- 0-100
  ai_tags TEXT[],
  ai_processed_at TIMESTAMPTZ
);
```

### `researchFindings`
```sql
CREATE TABLE research_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  engine TEXT NOT NULL DEFAULT 'exa',
  results JSONB NOT NULL,     -- ExaSearchResult[]
  result_count INTEGER,
  searched_at TIMESTAMPTZ DEFAULT now()
);
```

### New columns on existing `enrichedSchools`
- `ol_graduating_2029` INTEGER — OL seniors graduating in Jacob's window
- `scholarship_gap_score` INTEGER — 0-100 likelihood of OL scholarship opening
- `last_scraped_at` TIMESTAMPTZ

---

## 3. Claude AI Summarization Layer

Every scraped article gets AI-processed before storage.

### Input/Output Shape
```typescript
// Input: raw article text
// Output:
interface ArticleEnrichment {
  summary: string;           // 2-3 sentence summary
  keyInsights: string[];     // 3-5 actionable insights for Jacob's recruiting
  coachPsychology: string[]; // What this tells us about how coaches evaluate
  actionItems: string[];     // Specific things to change on the recruit page
  relevanceScore: number;    // 0-100 how relevant to OL recruiting
  tags: string[];            // auto-categorized tags
}
```

### Processing
- Model: `claude-haiku-4-5` for cost efficiency
- Batch size: 10 articles with 1-second delays
- Estimated cost: ~$0.07 for 66 articles
- Command: `enrich-articles [--reprocess]`
- Skips already-processed articles unless `--reprocess` flag

---

## 4. Data Enrichment Pipeline

After scraping, raw data flows through enrichment layers:

### Coach Enrichment
- Cross-reference X handles from Exa discovery + RecruitingMasterList scrape
- Match coaches to NCSA leads (did this coach view Jacob's profile?)
- Calculate `coachRelevanceScore`:
  - OL coach: +50 points
  - Recruiting coordinator: +30 points
  - Viewed Jacob's NCSA profile: +100 points
  - Same state (Wisconsin): +20 points
  - Has X handle: +10 points

### School Enrichment
- Count current OL on roster, graduating seniors, scholarship gaps
- Pull recruiting class data from Exa semantic search
- Calculate `schoolFitScore`:
  - OL need signal (0-100): based on graduating count / roster size
  - Geographic proximity: Big Ten/MAC/MVC bonus
  - Division match: D1 FBS = 100, FCS = 80, D2 = 60
  - Recent interest: NCSA view = +50, camp invite = +75

### Research Enrichment (Claude AI)
- Summarize each article into insights
- Tag with categories
- Extract action items for recruit page content

---

## 5. Recruit Page Integration

The recruit page shifts from hardwritten copy to data-driven content via Supabase + ISR.

### Data Fetching
```typescript
// src/app/recruit/page.tsx (Server Component)
export const revalidate = 86400; // ISR: revalidate every 24 hours

async function getRecruitData() {
  return {
    schools: await getEnrichedSchools(),       // schools with OL need
    coachSignals: await getCoachSignals(),      // who viewed Jacob
    insights: await getResearchInsights(),      // AI-processed research
  };
}
```

### Section Changes

| Section | Data Source |
|---------|-----------|
| Social Proof | Real `enrichedSchools` — schools with OL need that viewed Jacob's NCSA profile |
| Film Reel | Stats from `jacob-profile.ts` + Hudl profile view count from DB |
| The Fit | Per-school fit data: "Wisconsin has 3 OL graduating in 2029" |
| Contact | Coach data from UTM params — shows visiting coach's school info |
| Origin Story | Enhanced with research-backed framing from AI `actionItems` |

### New API Route
- `GET /api/recruit/data` — returns all enriched data for the recruit page, cached aggressively

---

## 6. Data Volume Estimates

| Data Type | Volume |
|-----------|--------|
| Coach records | ~2,500 (500 schools x ~5 coaches each) |
| School enrichment | ~500 records with roster/need data |
| Research articles | ~66 full-text articles (~130K words) |
| AI summaries | ~66 structured enrichment objects |
| Exa discoveries | ~125 results across 5 queries |
| **Total estimated** | **~5-10 MB in Supabase** |
