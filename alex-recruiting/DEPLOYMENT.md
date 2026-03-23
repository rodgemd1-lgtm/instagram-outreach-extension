# Deployment Instructions — Jacob's Recruiting PWA

## Status

| Check | Status |
|-------|--------|
| TypeScript errors | ✅ 0 |
| Tests | ✅ 786/786 passing |
| Build | ✅ Clean (85/85 pages) |
| PWA manifest | ✅ Configured |
| Service worker | ✅ Active |
| Vercel config | ✅ vercel.json ready |

## Step 1: Add Missing Env Var

`SUPABASE_SERVICE_ROLE_KEY` is missing from Vercel. Add it now:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → Settings → API
2. Copy the **Service Role Key** (secret, not anon)
3. Go to [Vercel Dashboard](https://vercel.com) → alex-recruiting → Settings → Environment Variables
4. Add: `SUPABASE_SERVICE_ROLE_KEY` = (paste value) → Environment: **Production**

## Step 2: Merge the PR

PR #2 is ready: https://github.com/rodgemd1-lgtm/alex-recruiting/pull/2

Merging triggers Vercel auto-deploy. The build should succeed (all TS errors fixed, zod bumped to ^3.25.0).

## Step 3: Install as PWA (iPhone)

Once deployed:

1. Open: `https://alex-recruiting-michael-rodgers-projects-e4209a00.vercel.app`
2. Tap the **Share** icon (bottom center in Safari)
3. Scroll down → **Add to Home Screen**
4. Name: "Jacob's Command" → tap **Add**

The app will appear on Jacob's home screen and run fullscreen like a native app.

## Env Vars Reference

All are already set in Vercel EXCEPT `SUPABASE_SERVICE_ROLE_KEY`:

```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
❌ SUPABASE_SERVICE_ROLE_KEY  ← ADD THIS
✅ ANTHROPIC_API_KEY
✅ CRON_SECRET
✅ X_API_BEARER_TOKEN
✅ EXA_API_KEY
✅ FIRECRAWL_API_KEY
✅ BRAVE_API_KEY
✅ JIB_DATABASE_URL
✅ VONAGE_API_KEY + VONAGE_API_SECRET
```

## Supabase Migration

Run this migration if you haven't already (adds email_outreach table):

```bash
supabase db push  # or manually run:
# supabase/migrations/20260320_email_outreach.sql
```
