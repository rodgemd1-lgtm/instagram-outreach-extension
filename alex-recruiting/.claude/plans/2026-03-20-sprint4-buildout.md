# Sprint 4+ Buildout Plan — 6 Features

**Date**: 2026-03-20
**Branch**: sprint2/ux-cleanup
**Goal**: Build 6 high-impact features to complete the app for testing/shipping

## What Exists Today

The app has a solid foundation:
- **APIs already built**: measurables CRUD, camps GET, email outreach (generate/list/analytics/queue), DM generate/batch, videos CRUD, coaches CRUD
- **UI pattern**: "use client" + custom hooks + SC design system (SCPageHeader, SCGlassCard, SCBadge) + Tailwind
- **Pages exist but may need enhancement**: /camps (full camp tracker UI), /recruit (cinematic profile)
- **Lib layer**: Full knowledge base in src/lib/rec/knowledge/ (measurables, camps, NCAA rules, coach DB, etc.)

## Build Order & Steps

### Feature 1: Measurables Tracker UI
**API**: Already exists (`/api/rec/measurables` with GET/POST, percentiles, progress charts)
**What to build**: Interactive component with input forms + progress visualization
- **Step 1.1**: Create `src/components/measurables-tracker.tsx`
  - Form to log new measurements (dropdown for type, number input, date picker)
  - Progress bars showing current vs D3 benchmarks
  - History table with trend arrows
  - Uses existing `/api/rec/measurables?percentiles=true&progress=true`
- **Step 1.2**: Wire into existing page (likely `/recruit` or create `/measurables/page.tsx`)

### Feature 2: Camp Discovery UI Enhancement
**API**: Already exists (`/api/camps`, `/api/rec/camps`)
**What to build**: Enhanced camp cards with registration flow
- **Step 2.1**: Create `src/components/camp-tracker.tsx` (or enhance existing camps page)
  - Calendar view of upcoming camps
  - Registration status badges (not registered → registered → confirmed)
  - Coach contacts at each camp
  - Post-camp results logging
- **Step 2.2**: Already wired at `/camps`

### Feature 3: Email Outreach UI
**API**: Already exists (`/api/outreach/email` with full CRUD + analytics)
**What to build**: Email composer + tracking dashboard
- **Step 3.1**: Create `src/components/email-composer.tsx`
  - Template selector (intro, follow-up, camp thank you, film share)
  - Coach selector with auto-populated merge fields
  - Preview pane
  - Send/schedule buttons
- **Step 3.2**: Create `src/components/email-tracker.tsx`
  - Sent emails list with open/response status
  - Analytics cards (sent, opened, responded rates)
- **Step 3.3**: Wire into `/outreach` page or create dedicated email tab

### Feature 4: Notification Center
**API**: Need to create `/api/notifications/route.ts`
**What to build**: Bell icon + notification drawer
- **Step 4.1**: Create `src/lib/notifications.ts` (in-memory notification store)
  - Notification types: coach_view, dm_response, deadline, camp_reminder, content_approved
  - Read/unread state
- **Step 4.2**: Create `src/app/api/notifications/route.ts` (GET/POST/PATCH)
- **Step 4.3**: Create `src/components/notification-center.tsx`
  - Bell icon with unread count badge in operator dock
  - Dropdown panel with notification list
  - Mark as read, dismiss, action links
- **Step 4.4**: Wire into operator dock layout

### Feature 5: Hudl/Film Integration
**API**: Partially exists (`/api/videos`, `/api/intelligence/hudl`)
**What to build**: Film library browser + coach view tracking
- **Step 5.1**: Create `src/components/film-library.tsx`
  - Grid of highlight clips with thumbnails
  - Tag by play type, game, position
  - Shareable link generator
  - Coach view counter (which coaches watched, when)
- **Step 5.2**: Wire into `/videos` or create `/film` page

### Feature 6: DM Delivery via X API
**API**: Partially exists (`/api/dms/generate`, `/api/auth/twitter`)
**What to build**: Send button + delivery tracking
- **Step 6.1**: Create `src/components/dm-sender.tsx`
  - "Send via X" button on approved DMs
  - Delivery status (draft → queued → sent → delivered → read)
  - Rate limit indicator
- **Step 6.2**: Create `src/app/api/dms/send/route.ts`
  - Calls X API to send DM
  - Updates status in database
  - Rate limit handling
- **Step 6.3**: Wire into existing DM flow

## Files to Create/Modify

**New files** (~10):
- `src/components/measurables-tracker.tsx`
- `src/components/camp-tracker.tsx` (or enhance camps/page.tsx)
- `src/components/email-composer.tsx`
- `src/components/email-tracker.tsx`
- `src/components/notification-center.tsx`
- `src/lib/notifications.ts`
- `src/app/api/notifications/route.ts`
- `src/components/film-library.tsx`
- `src/components/dm-sender.tsx`
- `src/app/api/dms/send/route.ts`

**Modified files** (~4):
- Operator dock (add notification bell)
- Outreach page (add email tab)
- DMs page (add send button)
- Videos/film page (add film library)

## Risks
- X API rate limits on DM sending (mitigate: queue + rate limit indicator)
- No real Twitter OAuth connected yet (mitigate: mock mode with status display)
- Node v25.5.0 vitest issue prevents running tests (mitigate: TypeScript check only)

## Verification
- `npx tsc --noEmit` after each feature
- Visual verification via dev server
- All new components render without errors
