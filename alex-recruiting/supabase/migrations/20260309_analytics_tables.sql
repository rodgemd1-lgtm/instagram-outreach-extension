-- Analytics & Tracking tables
-- Migration: 20260309_analytics_tables

-- ============ ANALYTICS & TRACKING ============

CREATE TABLE IF NOT EXISTS page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  coach_id UUID REFERENCES coaches(id),
  page TEXT NOT NULL,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  user_agent TEXT,
  duration INTEGER,
  max_scroll_depth REAL,
  visited_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS section_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES page_visits(id),
  section_id TEXT NOT NULL,
  entered_at TIMESTAMP,
  exited_at TIMESTAMP,
  dwell_time INTEGER,
  interacted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS film_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES page_visits(id),
  film_id TEXT NOT NULL,
  played_at TIMESTAMP DEFAULT NOW(),
  watch_duration INTEGER,
  completed BOOLEAN DEFAULT FALSE
);

-- ============ A/B TESTING ============

CREATE TABLE IF NOT EXISTS ab_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name TEXT NOT NULL,
  variant_key TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  config JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ab_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES page_visits(id),
  experiment_name TEXT NOT NULL,
  variant_key TEXT NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW()
);

-- ============ COACH PANEL ============

CREATE TABLE IF NOT EXISTS panel_coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES coaches(id),
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  division TEXT NOT NULL,
  role TEXT,
  panel_round INTEGER,
  status TEXT DEFAULT 'invited',
  invited_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS panel_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_coach_id UUID REFERENCES panel_coaches(id),
  visit_id UUID REFERENCES page_visits(id),
  would_recruit TEXT NOT NULL,
  what_convinced TEXT,
  what_almost_made_leave TEXT,
  comparison_score INTEGER,
  would_share BOOLEAN,
  submitted_at TIMESTAMP DEFAULT NOW()
);
