-- Agent System Tables
-- Multi-agent recruiting intelligence system

-- Agent run history
CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  triggered_by TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  summary TEXT,
  tokens_used INTEGER DEFAULT 0,
  actions_created INTEGER DEFAULT 0,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_id ON agent_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);

-- Action approval queue
CREATE TABLE IF NOT EXISTS agent_actions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  payload JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending_approval',
  priority INTEGER DEFAULT 3,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_actions_status ON agent_actions(status);
CREATE INDEX IF NOT EXISTS idx_agent_actions_agent_id ON agent_actions(agent_id);

-- Persistent agent state
CREATE TABLE IF NOT EXISTS agent_state (
  agent_id TEXT PRIMARY KEY,
  last_run_at TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- School fit scores (placement analysis)
CREATE TABLE IF NOT EXISTS school_fit_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id TEXT REFERENCES schools(id),
  school_name TEXT NOT NULL,
  fit_score REAL DEFAULT 0,
  roster_need REAL DEFAULT 0,
  geography REAL DEFAULT 0,
  academics REAL DEFAULT 0,
  coach_engagement REAL DEFAULT 0,
  competitive_position REAL DEFAULT 0,
  offer_likelihood REAL DEFAULT 0,
  graduating_seniors_ol INTEGER DEFAULT 0,
  notes TEXT,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_fit_scores_school ON school_fit_scores(school_id);

-- Posting window scores (168-slot timing grid)
CREATE TABLE IF NOT EXISTS posting_windows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL,
  hour_start INTEGER NOT NULL,
  hour_end INTEGER NOT NULL,
  score REAL DEFAULT 0,
  coach_overlap REAL DEFAULT 0,
  avg_engagement REAL DEFAULT 0,
  season TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posting_windows_day_hour ON posting_windows(day_of_week, hour_start);

-- AI media prompts
CREATE TABLE IF NOT EXISTS media_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  prompt_type TEXT NOT NULL,
  platform TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT DEFAULT 'generated',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_prompts_type ON media_prompts(prompt_type);
