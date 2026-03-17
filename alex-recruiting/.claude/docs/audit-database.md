# Database Audit — March 17, 2026

## Summary
- 7 missing tables
- 8 tables with severely mismatched schemas (0 rows — safe to DROP + RECREATE)
- 11 missing unique constraints needed for seed upserts
- Full SQL fix script below

## Missing Tables (7)
- `conversation_history` — Chat history for REC team
- `enriched_schools` — Data pipeline enriched data
- `measurables` — Athletic measurements
- `email_outreach` — Email campaigns
- `coach_personas` — AI coach profiles
- `outreach_plans` — Per-coach outreach tracking
- `ncaa_deadlines` — NCAA calendar

## Tables Needing DROP + RECREATE (0 rows, wrong schema)
- `outreach_learnings` — wrong PK type, missing 7 columns
- `research_articles` — missing 10 columns
- `research_findings` — completely different columns
- `camps` — missing 12 columns
- `questionnaires` — missing 5 columns
- `recruiting_prospects` — missing 5 columns
- `dm_sequences` — missing 3 columns
- `growth_snapshots` — column name mismatches

## Missing Unique Constraints (11)
- `competitor_recruits(name)` — seed-intelligence
- `growth_snapshots(snapshot_date)` — seed-intelligence, seed-peers
- `coaches(name, school_name)` — cfbd, scrape-coaches
- `coaches(name, school_slug)` — seed-coaches-expanded
- `panel_surveys(panel_coach_id, would_recruit)` — seed-panel
- `engagement_actions(target_handle)` — seed-peers
- `dm_messages(coach_name, template_type)` — seed-outreach
- `posts(content)` — seed-content
- `video_assets(supabase_url)` — youtube/sync
- `outreach_learnings(week_number)` — seed-learnings
- `research_articles(url)` — storage.ts

## SQL Fix Script

Save as `fix-database.sql` and run against Supabase.

See full script in the agent output at:
`.claude/docs/audit-database-full.sql`

## Data Status (tables with data)
- `schools_v2`: 687 rows
- `scheduled_posts`: 616 rows
- `coaches`: 424 rows
- `agent_actions`: 320 rows
- `rec_tasks`: 110 rows
- `panel_surveys`: 80 rows
- `ncsa_leads`: 33 rows
- `posts`: 17 rows
- `dm_messages`: 17 rows
- `competitor_recruits`: 15 rows
- `panel_coaches`: 8 rows

## Seed Order After Fix
1. Run SQL fix script
2. `/api/data-pipeline/seed-intelligence`
3. `/api/data-pipeline/seed-learnings`
4. `/api/data-pipeline/seed-content`
5. `/api/data-pipeline/seed-outreach`
6. Manually seed `ncaa_deadlines`
7. Manually seed `measurables` with Jacob's numbers
