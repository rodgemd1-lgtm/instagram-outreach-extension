-- Outreach Learnings — Weekly AI-generated retrospectives
-- Tracks what worked, what didn't, and strategy adjustments

CREATE TABLE IF NOT EXISTS outreach_learnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INTEGER NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  what_worked JSONB DEFAULT '[]',
  what_didnt JSONB DEFAULT '[]',
  what_to_try JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '{}',
  strategy_adjustments JSONB DEFAULT '[]',
  ab_test_results JSONB DEFAULT '[]',
  generated_by TEXT DEFAULT 'ai',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick week lookups
CREATE INDEX IF NOT EXISTS idx_outreach_learnings_week ON outreach_learnings(week_number);
CREATE INDEX IF NOT EXISTS idx_outreach_learnings_dates ON outreach_learnings(week_start, week_end);
