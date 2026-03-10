# Recruit Contact Runbook

## Canonical Targets

- Vercel project: `alex-recruiting`
- App root: `/Users/mikerodgers/Desktop/alex-recruiting-project/alex-recruiting`
- Canonical production URL: `https://alex-recruiting.vercel.app/recruit`

Do not deploy the recruiting app from the repo root project `alex-recruiting-project`. That root Vercel link is a different project.

## Permanent Fix Sequence

1. Use Node 20 for all local work.
   - `cd /Users/mikerodgers/Desktop/alex-recruiting-project/alex-recruiting`
   - `nvm use`
2. Verify the live table shape before touching production:
   - `npm run check:supabase-schema`
3. Apply the production repair migration:
   - Run `/Users/mikerodgers/Desktop/alex-recruiting-project/alex-recruiting/supabase/migrations/20260310_coach_inquiries_alignment.sql`
4. Run the focused contact test:
   - `npm run test:contact`
5. Deploy from the app project only.
6. Smoke test the live form on `https://alex-recruiting.vercel.app/recruit`
   - Submit a test inquiry with `name`, `title`, `school`, and `email`
   - Confirm the request returns `200`
   - Confirm Vercel logs do not show `school_name` or `coaching_position` insert errors

## Failure Modes This Prevents

- Repo code using `school_name` after production moved to `school`
- Form allowing blank coaching title while production requires `coaching_position`
- Vercel logs from an old/stale project alias being mistaken for the canonical production app
- Silent false-success responses when Supabase rejects the insert
