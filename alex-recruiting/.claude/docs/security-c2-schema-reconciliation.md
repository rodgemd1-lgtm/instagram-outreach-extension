# Task C2 — Schema Reconciliation Report
## Date: 2026-03-17 | Engineer: Backend Security Agent

---

## 1. Drizzle ORM vs Supabase REST API — camelCase / snake_case Mapping

The `coaches` route uses the Supabase REST client directly with raw snake_case column names.
The Drizzle schema defines camelCase field names that map to snake_case DB columns.

### Coaches Table Mapping Verification

| Drizzle camelCase field | DB column (snake_case) | coaches/route.ts CoachRow field | Status |
|-------------------------|------------------------|---------------------------------|--------|
| `schoolId`              | `school_id`            | `school_id`                     | CORRECT |
| `schoolSlug`            | `school_slug`          | not in CoachRow                 | MISSING — CoachRow lacks `school_slug`, mapRow silently drops it |
| `schoolName`            | `school_name`          | `school_name`                   | CORRECT |
| `xHandle`               | `x_handle`             | `x_handle`                      | CORRECT |
| `dmOpen`                | `dm_open`              | `dm_open`                       | CORRECT |
| `followStatus`          | `follow_status`        | `follow_status`                 | CORRECT |
| `dmStatus`              | `dm_status`            | `dm_status`                     | CORRECT |
| `priorityTier`          | `priority_tier`        | `priority_tier`                 | CORRECT |
| `olNeedScore`           | `ol_need_score`        | `ol_need_score`                 | CORRECT |
| `dlNeedScore`           | `dl_need_score`        | not in CoachRow                 | MISSING — CoachRow lacks `dl_need_score`; mapRow drops it |
| `positionType`          | `position_type`        | not in CoachRow                 | MISSING — CoachRow lacks `position_type`; mapRow drops it |
| `xActivityScore`        | `x_activity_score`     | `x_activity_score`              | CORRECT |
| `lastEngaged`           | `last_engaged`         | `last_engaged`                  | CORRECT |
| `createdAt`             | `created_at`           | `created_at`                    | CORRECT |
| `updatedAt`             | `updated_at`           | `updated_at`                    | CORRECT |

**Finding C2-1 (Low Severity):** `CoachRow` interface in `coaches/route.ts` is missing three Drizzle schema columns: `school_slug`, `dl_need_score`, and `position_type`. These columns exist in the `coaches` table (confirmed by Drizzle schema) but are not mapped in the REST query path. Data is silently dropped when reading coaches from Supabase. The GET query uses `select("*")` so the columns are fetched — they just aren't surfaced in the response type.

---

## 2. onConflict Constraint Audit

All seed/pipeline endpoints that call `.upsert(..., { onConflict: "..." })` require a matching
unique constraint in the database. The Drizzle schema is the source of truth.

### Unique Constraints Defined in schema.ts

| Table              | Column(s)    | Constraint Type     |
|--------------------|--------------|---------------------|
| `schools_v2`       | `slug`       | `.unique()` on column |
| `hudl_profiles`    | `profile_id` | `.unique()` on column |
| `research_articles`| `url`        | `.unique()` on column |

### onConflict Usages and Constraint Status

| File                               | Table               | onConflict column(s)        | Constraint in schema.ts | Status |
|------------------------------------|---------------------|-----------------------------|-------------------------|--------|
| seed-coaches-expanded/route.ts     | `schools_v2`        | `slug`                      | YES — `.unique()`       | OK |
| seed-coaches-expanded/route.ts     | `coaches`           | `name,school_slug`          | NO                      | **MISSING** |
| seed-schools/route.ts              | `schools_v2`        | `slug`                      | YES — `.unique()`       | OK |
| seed-schools/route.ts              | `schools_v2`        | `slug` (second call)        | YES — `.unique()`       | OK |
| seed-content/route.ts              | `posts`             | `content`                   | NO                      | **MISSING** |
| seed-outreach/route.ts             | `dm_sequences`      | `id`                        | PK — OK                 | OK |
| seed-outreach/route.ts             | `dm_messages`       | `coach_name,template_type`  | NO                      | **MISSING** |
| seed-peers/route.ts                | `engagement_actions`| `target_handle`             | NO                      | **MISSING** |
| seed-peers/route.ts                | `growth_snapshots`  | `snapshot_date`             | NO                      | **MISSING** |
| seed-panel/route.ts                | `panel_coaches`     | `name,school`               | NO                      | **MISSING** |
| seed-panel/route.ts                | `panel_surveys`     | `panel_coach_id,would_recruit`| NO                    | **MISSING** |
| seed-intelligence/route.ts         | `competitor_recruits`| `name`                     | NO                      | **MISSING** |
| seed-intelligence/route.ts         | `growth_snapshots`  | `snapshot_date`             | NO                      | **MISSING** |
| seed-learnings/route.ts            | `outreach_learnings`| `week_number`               | NO                      | **MISSING** |
| seed-tasks/route.ts                | `rec_tasks`         | `id`                        | PK — OK                 | OK |
| bulk-seed/route.ts                 | `schools_v2`        | `slug`                      | YES — `.unique()`       | OK |
| cfbd/route.ts                      | `schools_v2`        | `slug`                      | YES — `.unique()`       | OK |
| cfbd/route.ts                      | `coaches`           | `name,school_name`          | NO                      | **MISSING** |
| scrape-coaches/route.ts            | `coaches`           | `name,school_name`          | NO                      | **MISSING** |
| youtube/sync/route.ts              | `video_assets`      | `supabase_url`              | NO                      | **MISSING** |

### Summary: 11 Missing Unique Constraints in schema.ts

These upserts will fail at runtime with a Postgres error unless the constraints exist as
database-level constraints (applied via a migration, not visible in schema.ts if using raw SQL).
If the constraints were added via Supabase SQL editor without a Drizzle migration, they won't
appear in schema.ts — this is the most likely cause given the prior audit noted 11 missing constraints.

**Recommended Action:** Add the missing constraints to `schema.ts` using Drizzle's `uniqueIndex()`
so they are tracked and reproducible. Example:

```typescript
import { pgTable, uniqueIndex, ... } from "drizzle-orm/pg-core";

export const coaches = pgTable("coaches", {
  // ... existing fields ...
}, (t) => [
  uniqueIndex("coaches_name_school_name_idx").on(t.name, t.schoolName),
  uniqueIndex("coaches_name_school_slug_idx").on(t.name, t.schoolSlug),
]);
```

---

## 3. CoachRow Missing Fields — Fix Recommendation

File: `src/app/api/coaches/route.ts`

Add `school_slug`, `dl_need_score`, and `position_type` to `CoachRow` and `mapRow` so all
Drizzle schema columns are surfaced in the API response. This is a data completeness fix, not
a security fix, but ensures the coaches Zod schema (now added in C4) matches available data.
