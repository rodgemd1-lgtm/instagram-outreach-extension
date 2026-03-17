# Backend Connectivity & Full System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Connect all backend APIs to the Stitch Coach UI, add PWA splash screen, implement content pipeline, DM outreach, coaching panel, and self-learning system with comprehensive testing.

**Architecture:** Reconnect 109 existing API routes to reskinned pages, add splash screen component with boot animation, upgrade PWA service worker, wire content generation + X posting pipeline, implement 4-touch DM sequences with human approval, and build self-learning engagement loop. All data flows through Supabase with X API v2 for social operations.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Supabase (PostgreSQL/Drizzle), Anthropic Claude API, X API v2, Firecrawl, Exa, CFBD, Brave Search

---

## Phase 1: Foundation (Days 1-2)

### Task 1: Environment Setup

**Files:**
- Create: `alex-recruiting/.env.local`
- Reference: `alex-recruiting/.env.example`

**Step 1: Create .env.local from template**

Copy `.env.example` to `.env.local` and populate all 47 environment variables with real API keys. The file must include:

```bash
# Core
NEXT_PUBLIC_SUPABASE_URL=<real-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<real-key>
ANTHROPIC_API_KEY=<real-key>

# X/Twitter (all 7 keys)
X_API_BEARER_TOKEN=<real>
X_API_CLIENT_ID=<real>
X_API_CLIENT_SECRET=<real>
X_API_CONSUMER_KEY=<real>
X_API_CONSUMER_SECRET=<real>
X_API_ACCESS_TOKEN=<real>
X_API_ACCESS_TOKEN_SECRET=<real>

# Scraping (all 5)
EXA_API_KEY=<real>
FIRECRAWL_API_KEY=<real>
BRAVE_API_KEY=<real>
APIFY_API_KEY=<real>
JINA_API_KEY=<real>

# All remaining keys from .env.example
```

**Step 2: Verify Supabase connection**

Run: `curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" | head -c 200`
Expected: JSON response (not an error)

**Step 3: Verify build still passes**

Run: `cd alex-recruiting && npm run build`
Expected: Build succeeds with no errors

**Step 4: Commit** (do NOT commit .env.local — it's in .gitignore)

---

### Task 2: Splash Screen Component

**Files:**
- Create: `alex-recruiting/src/components/sc/sc-splash-screen.tsx`
- Modify: `alex-recruiting/src/app/layout.tsx`
- Assets: `alex-recruiting/public/images/image-1773714384388-1.png` (crest), `alex-recruiting/public/images/image-1773714390904-1.png` (scanline bg)

**Step 1: Create the splash screen component**

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function SCSplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Scanline background */}
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/images/image-1773714390904-1.png"
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Crest emblem */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Image
              src="/images/image-1773714384388-1.png"
              alt="Jacob's Command"
              width={200}
              height={200}
              className="drop-shadow-[0_0_30px_rgba(197,5,12,0.6)]"
              priority
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            className="mt-6 font-display text-2xl font-black italic tracking-wider text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            JACOB&apos;S COMMAND
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-2 font-mono text-xs tracking-[0.3em] text-sc-accent-cyan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            INITIALIZING SYSTEMS...
          </motion.p>

          {/* Scanline sweep */}
          <motion.div
            className="absolute left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-sc-primary to-transparent"
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ delay: 1.2, duration: 1.0, ease: "linear" }}
          />

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-12 h-[2px] w-48 overflow-hidden rounded-full bg-sc-surface"
          >
            <motion.div
              className="h-full bg-sc-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.0, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Step 2: Add splash screen to root layout**

In `alex-recruiting/src/app/layout.tsx`, add the import and render the splash screen inside the body, before `<SCShell>`:

```tsx
import { SCSplashScreen } from "@/components/sc/sc-splash-screen";
```

Add inside `<body>`:
```tsx
<SCSplashScreen />
<SCShell>{children}</SCShell>
```

**Step 3: Export from barrel**

Add to `alex-recruiting/src/components/sc/index.ts`:
```tsx
export { SCSplashScreen } from "./sc-splash-screen";
```

**Step 4: Verify splash screen**

Run: `npm run dev` and open http://localhost:3000
Expected: 2.4s animated splash screen with crest, title, scanline sweep, then fade to dashboard

**Step 5: Commit**

```bash
git add alex-recruiting/src/components/sc/sc-splash-screen.tsx alex-recruiting/src/app/layout.tsx alex-recruiting/src/components/sc/index.ts
git commit -m "feat: add animated splash screen with boot sequence"
```

---

### Task 3: PWA Upgrade

**Files:**
- Modify: `alex-recruiting/public/manifest.json`
- Modify: `alex-recruiting/public/sw.js`
- Modify: `alex-recruiting/src/app/layout.tsx`

**Step 1: Update manifest.json**

Update theme_color and background_color to match Stitch Coach:

```json
{
  "name": "Jacob's Command — Elite Recruiting Intelligence",
  "short_name": "Jacob's Command",
  "description": "AI-powered recruiting command center for Jacob Rodgers | OL | Class of 2029",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "scope": "/",
  "orientation": "portrait-primary",
  "categories": ["sports", "productivity"],
  "icons": [
    { "src": "/icons/icon-192.svg", "sizes": "192x192", "type": "image/svg+xml", "purpose": "any maskable" },
    { "src": "/icons/icon-512.svg", "sizes": "512x512", "type": "image/svg+xml", "purpose": "any maskable" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" }
  ]
}
```

**Step 2: Upgrade service worker with better caching**

Replace `public/sw.js` with enhanced version that adds:
- Stale-while-revalidate for API calls (show cached, fetch fresh in background)
- Cache versioning with `CACHE_V2` name
- Pre-cache splash screen assets
- Offline indicator support (respond with custom header when offline)

**Step 3: Verify PWA installation**

Run: `npm run dev`, open Chrome DevTools → Application → Manifest
Expected: Manifest loads with correct name, icons, theme color
Test: Click "Install" in browser address bar — app installs as standalone PWA

**Step 4: Commit**

```bash
git add alex-recruiting/public/manifest.json alex-recruiting/public/sw.js
git commit -m "feat: upgrade PWA manifest and service worker for Stitch Coach"
```

---

### Task 4: Hero Image Integration + Animation System

**Files:**
- Create: `alex-recruiting/src/components/sc/sc-hero-banner.tsx`
- Create: `alex-recruiting/src/components/sc/sc-animated-number.tsx`
- Create: `alex-recruiting/src/components/sc/sc-page-transition.tsx`
- Modify: `alex-recruiting/src/components/sc/index.ts`

**Step 1: Create hero banner component with Ken Burns**

```tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const heroImages: Record<string, string> = {
  command: "/images/image-1773714341416-1.png",
  outreach: "/images/image-1773714351342-1.png",
  analytics: "/images/image-1773714357630-1.png",
  agency: "/images/image-1773714364680-1.png",
};

interface SCHeroBannerProps {
  screen: keyof typeof heroImages;
  className?: string;
}

export function SCHeroBanner({ screen, className = "" }: SCHeroBannerProps) {
  const src = heroImages[screen];
  if (!src) return null;

  return (
    <div className={`relative h-48 w-full overflow-hidden rounded-xl md:h-64 ${className}`}>
      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1, 1.05] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      >
        <Image src={src} alt="" fill className="object-cover" priority />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-sc-bg via-sc-bg/60 to-transparent" />
    </div>
  );
}
```

**Step 2: Create animated number component**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface SCAnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function SCAnimatedNumber({ value, duration = 1.2, prefix = "", suffix = "", className = "" }: SCAnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref} className={className}>{prefix}{display}{suffix}</span>;
}
```

**Step 3: Create page transition wrapper**

```tsx
"use client";

import { motion } from "framer-motion";

export function SCPageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

**Step 4: Export all from barrel**

Add to `alex-recruiting/src/components/sc/index.ts`:
```tsx
export { SCHeroBanner } from "./sc-hero-banner";
export { SCAnimatedNumber } from "./sc-animated-number";
export { SCPageTransition } from "./sc-page-transition";
export { SCSplashScreen } from "./sc-splash-screen";
```

**Step 5: Commit**

```bash
git add alex-recruiting/src/components/sc/
git commit -m "feat: add hero banner, animated numbers, and page transitions"
```

---

### Task 5: Dashboard Wiring — Reconnect Live Data

**Files:**
- Modify: `alex-recruiting/src/app/dashboard/page.tsx`

**Step 1: Verify current dashboard data fetching**

Read `src/app/dashboard/page.tsx` to confirm it already fetches from `/api/analytics`, `/api/coaches`, `/api/posts`, `/api/dms`. If it does, ensure the fetch calls use the correct response shape and map to SCStatCard props.

**Step 2: Add hero banner and animated numbers**

Import and integrate:
```tsx
import { SCHeroBanner, SCAnimatedNumber, SCPageTransition } from "@/components/sc";
```

Wrap page content in `<SCPageTransition>`. Add `<SCHeroBanner screen="command" />` above the stat cards. Replace static stat values with `<SCAnimatedNumber value={coachCount} />`.

**Step 3: Add staggered card animations**

Wrap each stat card in a Framer Motion div with staggered delay:
```tsx
import { motion } from "framer-motion";

// Per card:
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
>
  <SCStatCard ... />
</motion.div>
```

**Step 4: Verify dashboard shows live data**

Run: `npm run dev`, open http://localhost:3000/dashboard
Expected: Hero banner with Ken Burns, animated stat numbers counting up, staggered card reveals. If Supabase is connected, shows real data. If not, graceful "--" fallbacks.

**Step 5: Commit**

```bash
git add alex-recruiting/src/app/dashboard/page.tsx
git commit -m "feat: wire dashboard with hero banner, animated numbers, live data"
```

---

### Task 6: Phase 1 Smoke Tests

**Files:**
- Create: `alex-recruiting/src/__tests__/smoke/phase1.test.ts`

**Step 1: Write smoke tests**

```typescript
import { describe, it, expect } from "vitest";

describe("Phase 1 — Foundation Smoke Tests", () => {
  const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  it("app boots and returns 200", async () => {
    const res = await fetch(`${BASE}/dashboard`);
    expect(res.status).toBeLessThan(400);
  });

  it("manifest.json serves valid PWA config", async () => {
    const res = await fetch(`${BASE}/manifest.json`);
    const data = await res.json();
    expect(data.display).toBe("standalone");
    expect(data.theme_color).toBe("#0a0a0a");
    expect(data.name).toContain("Jacob");
  });

  it("service worker is accessible", async () => {
    const res = await fetch(`${BASE}/sw.js`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("javascript");
  });

  it("splash screen image assets exist", async () => {
    const crest = await fetch(`${BASE}/images/image-1773714384388-1.png`);
    expect(crest.status).toBe(200);
  });

  it("hero images exist for all screens", async () => {
    const images = [
      "image-1773714341416-1.png",
      "image-1773714351342-1.png",
      "image-1773714357630-1.png",
      "image-1773714364680-1.png",
    ];
    for (const img of images) {
      const res = await fetch(`${BASE}/images/${img}`);
      expect(res.status).toBe(200);
    }
  });

  it("API health check responds", async () => {
    const res = await fetch(`${BASE}/api/coaches`);
    // Should return 200 even if empty (graceful fallback)
    expect(res.status).toBeLessThan(500);
  });
});
```

**Step 2: Run smoke tests**

Run: `npm run dev` (in background) then `npm run test:smoke`
Expected: All 6 tests pass

**Step 3: Commit**

```bash
git add alex-recruiting/src/__tests__/smoke/phase1.test.ts
git commit -m "test: add Phase 1 foundation smoke tests"
```

---

## Phase 2: Core Flows (Days 3-5)

### Task 7: Coaches Page — Wire API + Detail Slide-Over
- Modify: `src/app/coaches/page.tsx` — reconnect `/api/coaches` fetch, wire search/filter, add detail slide-over with coach actions (Message, View X, View NCSA)
- Modify: `src/app/coaches/[id]/page.tsx` — reconnect individual coach detail with full metrics
- Add hero banner (outreach image), page transitions, animated numbers

### Task 8: Coach Data Scraping Pipeline
- Verify: `src/app/api/coaches/research/route.ts` — Firecrawl + Exa integration works
- Verify: `src/app/api/coaches/scrape-x/route.ts` — X account analysis works
- Test: POST to `/api/coaches/research` with a target school and confirm coach data returns
- Test: POST to `/api/coaches/scrape-x` with a school X handle and confirm analysis returns
- Populate initial coach database with D2/D3/NAIA targets (immediate two-way DM eligible)

### Task 9: Outreach Kanban — Wire DM Status Board
- Modify: `src/app/outreach/page.tsx` — reconnect `/api/dms` and `/api/coaches`, rebuild Kanban with 4 columns (drafted/sent/no_response/responded), wire drag-drop status updates via PUT
- Modify: `src/app/dashboard/outreach/page.tsx` — same pattern for dashboard sub-page
- Add hero banner (outreach image)

### Task 10: DM Pipeline — 4-Touch Sequence Engine
- Modify: `src/lib/alex/dm-engine.ts` — add multi-touch sequence logic (4 templates per coach, configurable delays)
- Create: `src/lib/alex/dm-templates.ts` — 4 touch templates with personalization slots (school name, coach name, OL need, recent achievement)
- Modify: `src/app/dms/page.tsx` — reconnect send flow, show sequence position per coach, human approval gate before each send
- Wire: POST `/api/dms` → calls X API v2 DM endpoint with rate limiting (5-10/day)

### Task 11: Agency Chat — Reconnect 7 Personas
- Modify: `src/app/agency/page.tsx` — reconnect team dashboard with member cards, task queue
- Modify: `src/app/agency/[member]/page.tsx` — reconnect SSE streaming to `/api/rec/team/chat`, pass live data context (coach count, recent engagement, NCAA calendar) to persona prompts
- Add hero banner (agency war room image)
- Test: Chat with Nina and verify response includes real coach data

### Task 12: Analytics Wiring
- Modify: `src/app/analytics/page.tsx` — reconnect `/api/analytics`, wire charts with Recharts, add pipeline funnel visualization
- Modify: `src/app/dashboard/analytics/page.tsx` — reconnect dashboard analytics sub-page
- Add hero banner (analytics image), animated number count-ups on all metric cards

### Task 13: Phase 2 Tests
- Create: `src/__tests__/smoke/phase2.test.ts` — coaches load, DMs page loads, agency chat endpoint responds
- Create: `src/__tests__/integration/dm-send.test.ts` — DM compose → POST → X API mock → delivery tracking
- Create: `src/__tests__/integration/coach-research.test.ts` — POST coach research → Firecrawl response → coach record created

---

## Phase 3: Content Engine (Days 6-8)

### Task 14: X Account Configuration
- Verify X API credentials work: GET `/api/x/verify` with Jacob's handle
- Verify tweet posting: POST test tweet via `/api/posts/[id]/send`
- Configure posting schedule constants (Tue-Fri, 9-10 AM CT)

### Task 15: 30-Day Content Calendar Generation
- Verify: `src/app/api/content/generate-month/route.ts` works — POST and confirm 17+ posts returned
- Modify: `src/app/content-queue/page.tsx` — wire to `/api/posts`, show calendar view with day slots, edit/approve/reject workflow per post
- Add content pillar badges (Film 40%, Training 25%, Accomplishments 20%, Engagement 15%)

### Task 16: Post to X Integration
- Verify: `src/app/api/posts/[id]/send/route.ts` — creates tweet via X API v2 with media upload
- Wire: Content Queue "Publish" button → POST `/api/posts/[id]/send` → confirm tweet appears on X
- Add: success/error toast notification after publish attempt

### Task 17: Scheduled Posting (Cron)
- Verify: `src/app/api/cron/daily/route.ts` — find approved posts scheduled for today, send via X API
- Configure: Vercel cron or external trigger for Tue-Fri 9-10 AM CT
- Add: "Scheduled" status badge in Content Queue for posts queued for future dates

### Task 18: Media Pipeline
- Modify: `src/app/media/page.tsx` — reconnect `/api/photos` grid, upload flow, favorites
- Modify: `src/app/media-upload/page.tsx` — wire upload form to POST `/api/media/upload`
- Modify: `src/app/media-lab/page.tsx` — reconnect media editing/optimization tools

### Task 19: X Engagement Tracking
- Verify: `/api/x/followers` and liking_users endpoints work
- Create: `src/lib/intelligence/engagement-tracker.ts` — poll every 15 min for new coach follows/likes, cross-reference against target coach list, store signals in Supabase
- Wire: Dashboard notification badge when coach engagement detected

### Task 20: Phase 3 Tests
- Smoke: Content queue loads, media grid loads
- Integration: Generate month → POST → 17 posts in DB → approve one → publish to X → verify via X API
- User flow: Full content pipeline from generation to X publication

---

## Phase 4: Intelligence + Research (Days 9-11)

### Task 21: Coach X Scraping
- Verify: `/api/coaches/scrape-x` — analyze school X accounts
- Wire: Intelligence page tab to trigger and display results
- Test: Scrape a real school X account, confirm engagement patterns returned

### Task 22: School Research Pipeline
- Verify: Firecrawl + Exa endpoints work with real keys
- Wire: `/api/coaches/research` — scrape staff directories, extract OL coach info
- Wire: CFBD integration — roster data, graduation lists to compute OL needs
- Populate: Initial target school database (20-30 schools across tiers)

### Task 23: Competitor Tracking
- Verify: `/api/competitor/track` endpoint works
- Modify: `src/app/competitors/page.tsx` — display Class of 2029 OL prospect profiles
- Wire: Scrape competitor X accounts and On3/247Sports profiles via Apify

### Task 24: Intelligence Dashboard
- Modify: `src/app/intelligence/page.tsx` — reconnect all 3 POST endpoints (analyze, hudl, coach-behavior)
- Wire: Multi-tab display with live data from all analysis engines
- Add: Coach behavior prediction scores (response likelihood)

### Task 25: Self-Learning System
- Create: Supabase migration for `learning_signals` table (post_id, content_type, posting_time, engagement_metrics, coach_signals, created_at)
- Create: `src/lib/intelligence/learning-loop.ts` — correlate engagement data with content attributes, generate recommendations
- Wire: Content generation pulls from learning_signals to adjust content mix and timing

### Task 26: MCP Server Integration
- Wire: Brave Search as fallback when Firecrawl/Exa insufficient
- Wire: Apify for On3/247Sports structured data scraping
- Wire: Jina for article extraction from coach/school news

### Task 27: Phase 4 Tests
- Smoke: Intelligence loads, competitors load
- Integration: Scrape coach → analyze behavior → rank → display in UI
- Integration: Post content → engagement tracked → learning_signals updated → next generation reflects learnings

---

## Phase 5: Polish + Comprehensive Testing (Days 12-14)

### Task 28: Responsive Audit
- Test every page at 375px (iPhone SE), 430px (iPhone 15 Pro), 768px (iPad), 1440px (desktop)
- Fix any overflow, truncation, or layout issues
- Verify touch targets ≥44px on mobile
- Verify bottom nav doesn't overlap content

### Task 29: Button Audit
- Click every button on every page and verify it performs its action or navigates correctly
- Document any dead buttons and wire them to correct handlers
- Verify all form submissions show loading state and success/error feedback

### Task 30: Animation Polish
- Profile all pages at 60fps using Chrome Performance tab
- Reduce or disable animations on devices with `prefers-reduced-motion`
- Ensure no layout shift from animations (CLS < 0.1)

### Task 31: Offline Mode + Error States
- Test offline: disconnect network, verify cached dashboard loads with "UPLINK OFFLINE" indicator
- Test API failures: return 500 from API, verify meaningful error UI (not blank screen)
- Test empty states: no coaches, no posts, no DMs — verify helpful empty state with CTA

### Task 32: Update CLAUDE.md
- Replace all references to shadcn/ui, dash-* tokens, 280px sidebar, light theme
- Document Stitch Coach design system: sc-* tokens, SCShell, dark theme
- Add agent team architecture and content pipeline documentation
- Add new API routes and integration documentation

### Task 33: E2E Test Suite (Playwright)
- Create: `src/__tests__/e2e/full-flow.spec.ts`
- Tests:
  1. App boots → splash screen plays → dashboard loads
  2. Navigate to coaches → search → view detail
  3. Navigate to DMs → compose → approve (mock send)
  4. Navigate to content queue → view calendar → approve post (mock publish)
  5. Navigate to agency → chat with Nina → verify response
  6. Navigate to intelligence → run analysis → view results
  7. PWA install flow on mobile viewport

### Task 34: Performance + Security Audit
- Run: Lighthouse audit targeting score > 90 on Performance, Accessibility, Best Practices
- Verify: No API keys exposed in client-side code
- Verify: Rate limiting enforced on all external API calls
- Verify: No XSS vectors in user-generated content display
- Verify: All fetch calls use proper error boundaries

### Task 35: Final Verification Matrix
- [ ] Coaches receive outreach: scraped → ranked → DM composed → approved → sent → confirmed
- [ ] Posting on X works: generated → approved → scheduled → published → engagement tracked
- [ ] DMs sent to followers: analysis → identify targets → generate DM → approve → send
- [ ] Competitors in Media Lab: scraped → displayed → comparison available
- [ ] PWA installs on iPhone + desktop, splash plays, offline works
- [ ] Coaching panel returns real data with NCAA context
- [ ] Self-learning loop active: post → engagement → recommendations shift
