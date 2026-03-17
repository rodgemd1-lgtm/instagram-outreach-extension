# Frontend Page Audit — March 17, 2026

## 51 pages audited

### Critical Issues

**1. Empty Shell Composers (4 pages)**
- `/dashboard/calendar` — "New Post" composer opens but has NO form fields
- `/dashboard/content` — Same empty composer
- `/dashboard/outreach` — "New DM" composer shows placeholder text only
- `/dashboard/coaches` — Coach detail panel is view-only (no actions)

**2. Hardcoded Fake Data (2 pages)**
- `/connections/[id]` — "Interaction Radar" shows hardcoded percentages (40%, 60%, 20%, 50%, 30%)
- `/manage` — Performance tab uses `MOCK_PERFORMANCE` with fake likes/retweets/impressions

**3. Buttons Without Handlers (6 pages)**
- `/coaches` — "New Target" and "Export DB" buttons: no onClick
- `/coaches/[id]` — "Connect" and "Follow" buttons: no onClick
- `/outreach` — DM and Engage buttons on coach cards: no onClick
- `/competitors` — "Discover" and "Refresh" buttons: no onClick
- `/connections` — "Follow" and "View on X" buttons: no onClick
- `/hooks` — "Use in Post" button: no handler

**4. Missing: "What to do today" section**
- No single page tells Jacob "here are your 3 tasks for today"
- `/dashboard` shows generic AI recommendations
- This is the #1 UX feature needed

**5. Broken upload page**
- `/media-upload` — files only stored in React local state, never uploaded to server
- `/media-import` is the working upload page

### Pages Where Jacob Can Actually DO Something (19 pages)
1. `/create` — Write and post content to X
2. `/posts` — Approve, reject, edit, send posts to X
3. `/content-queue` — Generate month, approve/reject
4. `/dms` — Edit and send DMs via X
5. `/agency/leads` — NCSA pipeline, follow coaches
6. `/agency/[member]` — Chat with AI team
7. `/dashboard/team` — Chat with AI team
8. `/media-import` — Upload photos/videos (WORKING)
9. `/media` — Import and organize photos
10. `/videos` — Import, scan, optimize videos
11. `/capture` — Camera capture
12. `/media-lab` — Build media snapshot
13. `/profile-studio` — Edit and push X profile
14. `/accomplishments` — Log PRs, post to X
15. `/agents` — Run agents, approve/reject
16. `/camps` — Camp registrations, results
17. `/intelligence` — Run recruiting analysis
18. `/prompt-studio` — Generate AI images
19. `/audit` — Run profile audit

### Duplicate/Overlapping Pages (confusing for Jacob)
- Coach management: `/coaches` AND `/dashboard/coaches`
- Calendar: `/calendar` AND `/dashboard/calendar` AND `/content-queue`
- Outreach/DMs: `/outreach` AND `/dashboard/outreach` AND `/dms` AND `/cold-dms`
- Analytics: `/analytics` AND `/dashboard/analytics`

### User-Requested Features Status
| Feature | Status |
|---------|--------|
| Content library | EXISTS at `/content-queue`, `/posts`, `/captions`, `/hooks`, `/comments` |
| Calendar visibility | EXISTS at `/calendar`, `/dashboard/calendar`, `/content-queue` |
| Upload functionality | EXISTS at `/media-import` (working), `/capture` (camera). `/media-upload` is BROKEN |
| Build a snapshot | EXISTS at `/media-lab` — "Build Snapshot" button |
| "What to do today" | **MISSING** — must be built |
