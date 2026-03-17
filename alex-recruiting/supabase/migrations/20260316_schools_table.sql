-- Migration: Expand schools table for ALL NCAA football programs (~680+)
-- Adds a new normalized schools table with slug-based lookups and
-- links coaches to schools via school_slug foreign key.

-- ============ NEW SCHOOLS TABLE (slug-based, all divisions) ============

CREATE TABLE IF NOT EXISTS schools_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,              -- "wisconsin", "ferris-state", etc.
  name TEXT NOT NULL,                      -- "University of Wisconsin"
  mascot TEXT,                             -- "Badgers"
  division TEXT NOT NULL,                  -- "D1 FBS", "D1 FCS", "D2", "D3"
  conference TEXT,                         -- "Big Ten", "GLIAC", etc.
  city TEXT,
  state TEXT,
  logo_url TEXT,
  athletics_url TEXT,
  staff_url TEXT,
  roster_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  ol_roster_count INTEGER DEFAULT 0,
  dl_roster_count INTEGER DEFAULT 0,
  ol_graduating INTEGER DEFAULT 0,
  dl_graduating INTEGER DEFAULT 0,
  ol_need_score INTEGER DEFAULT 0,
  dl_need_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast division/conference filtering
CREATE INDEX IF NOT EXISTS idx_schools_v2_division ON schools_v2(division);
CREATE INDEX IF NOT EXISTS idx_schools_v2_conference ON schools_v2(conference);
CREATE INDEX IF NOT EXISTS idx_schools_v2_state ON schools_v2(state);

-- ============ ADD school_slug TO coaches ============

ALTER TABLE coaches ADD COLUMN IF NOT EXISTS school_slug TEXT REFERENCES schools_v2(slug);

CREATE INDEX IF NOT EXISTS idx_coaches_school_slug ON coaches(school_slug);

-- ============ ADD DL NEED SCORE TO coaches ============
-- Jacob can play both OL and DL, so we track need for both positions

ALTER TABLE coaches ADD COLUMN IF NOT EXISTS dl_need_score INTEGER DEFAULT 0;
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS position_type TEXT DEFAULT 'OL'; -- 'OL' | 'DL' | 'both'

-- ============ AUTO-UPDATE updated_at TRIGGER ============

CREATE OR REPLACE FUNCTION update_schools_v2_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_schools_v2_updated_at
  BEFORE UPDATE ON schools_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_schools_v2_updated_at();
