-- Alex Recruiting Intelligence System — Supabase Schema
-- Matches Drizzle ORM schema from src/lib/db/schema.ts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ CORE TABLES ============

CREATE TABLE schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  division TEXT NOT NULL,
  conference TEXT NOT NULL,
  state TEXT,
  priority_tier TEXT NOT NULL,
  ol_need_score INTEGER DEFAULT 0,
  why_jacob TEXT,
  roster_url TEXT,
  staff_url TEXT,
  official_x_handle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coaches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  school_id TEXT REFERENCES schools(id),
  school_name TEXT NOT NULL,
  division TEXT NOT NULL,
  conference TEXT,
  x_handle TEXT,
  dm_open BOOLEAN DEFAULT FALSE,
  follow_status TEXT DEFAULT 'not_followed',
  dm_status TEXT DEFAULT 'not_sent',
  priority_tier TEXT NOT NULL,
  ol_need_score INTEGER DEFAULT 0,
  x_activity_score INTEGER DEFAULT 0,
  last_engaged TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  pillar TEXT NOT NULL,
  hashtags JSONB DEFAULT '[]'::jsonb,
  media_url TEXT,
  scheduled_for TIMESTAMPTZ,
  best_time TEXT,
  status TEXT DEFAULT 'draft',
  x_post_id TEXT,
  impressions INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  engagement_rate REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dm_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id),
  coach_name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'drafted',
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE engagement_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  coach_id UUID REFERENCES coaches(id),
  coach_name TEXT,
  school_name TEXT,
  post_id UUID REFERENCES posts(id),
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profile_audits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT NOW(),
  photo_quality BOOLEAN DEFAULT FALSE,
  header_image BOOLEAN DEFAULT FALSE,
  bio_completeness BOOLEAN DEFAULT FALSE,
  pinned_post BOOLEAN DEFAULT FALSE,
  post_cadence BOOLEAN DEFAULT FALSE,
  pillar_distribution BOOLEAN DEFAULT FALSE,
  engagement_rate_check BOOLEAN DEFAULT FALSE,
  coach_follow_count BOOLEAN DEFAULT FALSE,
  dm_log BOOLEAN DEFAULT FALSE,
  constitution_compliance BOOLEAN DEFAULT FALSE,
  total_score INTEGER DEFAULT 0,
  recommendations JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE competitor_recruits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  x_handle TEXT,
  position TEXT,
  class_year INTEGER,
  school TEXT,
  state TEXT,
  height TEXT,
  weight TEXT,
  follower_count INTEGER DEFAULT 0,
  post_cadence REAL DEFAULT 0,
  engagement_rate REAL DEFAULT 0,
  top_content_types JSONB DEFAULT '[]'::jsonb,
  school_interest_signals JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT NOW(),
  total_followers INTEGER DEFAULT 0,
  coach_follows INTEGER DEFAULT 0,
  dms_sent INTEGER DEFAULT 0,
  dm_response_rate REAL DEFAULT 0,
  posts_published INTEGER DEFAULT 0,
  avg_engagement_rate REAL DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,
  audit_score INTEGER DEFAULT 0
);

-- ============ INTELLIGENCE TABLES ============

CREATE TABLE hudl_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id TEXT NOT NULL UNIQUE,
  profile_url TEXT NOT NULL,
  athlete_name TEXT NOT NULL,
  position TEXT,
  position_details JSONB DEFAULT '[]'::jsonb,
  height TEXT,
  weight TEXT,
  grad_year INTEGER,
  high_school TEXT,
  city TEXT,
  state TEXT,
  jersey_number TEXT,
  gpa TEXT,
  sat_score INTEGER,
  act_score INTEGER,
  highlight_reels JSONB DEFAULT '[]'::jsonb,
  game_film_count INTEGER DEFAULT 0,
  total_plays_tagged INTEGER DEFAULT 0,
  recruiting_opt_in BOOLEAN DEFAULT FALSE,
  contact_email TEXT,
  contact_phone TEXT,
  bio TEXT,
  profile_views INTEGER,
  scrape_source TEXT DEFAULT 'jina',
  raw_markdown TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tweet_patterns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tweet_id TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_name TEXT,
  tweet_text TEXT NOT NULL,
  pattern_type TEXT NOT NULL,
  confidence REAL DEFAULT 0,
  school_mentions JSONB DEFAULT '[]'::jsonb,
  coach_mentions JSONB DEFAULT '[]'::jsonb,
  hashtags JSONB DEFAULT '[]'::jsonb,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  tweet_created_at TIMESTAMPTZ,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE offer_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  athlete_handle TEXT NOT NULL,
  athlete_name TEXT,
  school_name TEXT NOT NULL,
  school_handle TEXT,
  coach_name TEXT,
  coach_handle TEXT,
  offer_date TIMESTAMPTZ,
  source_tweet_id TEXT,
  source_tweet_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  division TEXT,
  conference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coach_behavior_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id),
  coach_name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  division TEXT,
  conference TEXT,
  engagement_style TEXT,
  dm_open_probability REAL DEFAULT 0,
  follow_back_probability REAL DEFAULT 0,
  avg_response_time REAL,
  tweet_frequency REAL DEFAULT 0,
  peak_activity_hours JSONB DEFAULT '[]'::jsonb,
  common_hashtags JSONB DEFAULT '[]'::jsonb,
  interacts_with_recruits BOOLEAN DEFAULT FALSE,
  best_approach_method TEXT,
  best_approach_steps JSONB DEFAULT '[]'::jsonb,
  estimated_response_rate REAL DEFAULT 0,
  optimal_contact_months JSONB DEFAULT '[]'::jsonb,
  optimal_contact_hours JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE intelligence_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  athlete_id TEXT NOT NULL,
  athlete_name TEXT NOT NULL,
  overall_score INTEGER DEFAULT 0,
  film_score INTEGER DEFAULT 0,
  social_presence_score INTEGER DEFAULT 0,
  recruiting_momentum_score INTEGER DEFAULT 0,
  academic_score INTEGER DEFAULT 0,
  physical_profile_score INTEGER DEFAULT 0,
  tier_projection TEXT,
  projected_tier TEXT,
  data_completeness REAL DEFAULT 0,
  recommendations JSONB DEFAULT '[]'::jsonb,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scrape_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL,
  target_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  result JSONB,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ X PROFILE DESIGN TABLES ============

CREATE TABLE x_profile_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT 'Jacob Rogers',
  handle TEXT NOT NULL DEFAULT '@JacobRogersOL28',
  bio TEXT DEFAULT '',
  location TEXT DEFAULT 'Pewaukee, WI',
  website TEXT DEFAULT '',
  pinned_post_content TEXT DEFAULT '',
  header_image_url TEXT,
  profile_image_url TEXT,
  brand_colors JSONB DEFAULT '["#1e3a5f", "#c8102e", "#ffffff"]'::jsonb,
  visual_style_notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ INDEXES ============

CREATE INDEX idx_coaches_school ON coaches(school_id);
CREATE INDEX idx_coaches_tier ON coaches(priority_tier);
CREATE INDEX idx_coaches_follow ON coaches(follow_status);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_pillar ON posts(pillar);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_for);
CREATE INDEX idx_dm_messages_coach ON dm_messages(coach_id);
CREATE INDEX idx_dm_messages_status ON dm_messages(status);
CREATE INDEX idx_engagement_log_type ON engagement_log(event_type);
CREATE INDEX idx_engagement_log_coach ON engagement_log(coach_id);
CREATE INDEX idx_tweet_patterns_author ON tweet_patterns(author_handle);
CREATE INDEX idx_tweet_patterns_type ON tweet_patterns(pattern_type);
CREATE INDEX idx_offer_events_school ON offer_events(school_name);
CREATE INDEX idx_coach_behavior_coach ON coach_behavior_profiles(coach_id);
CREATE INDEX idx_intelligence_athlete ON intelligence_scores(athlete_id);
CREATE INDEX idx_scrape_jobs_status ON scrape_jobs(status);

-- ============ ROW LEVEL SECURITY ============

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_recruits ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE hudl_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweet_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_behavior_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE x_profile_config ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (single-user app)
CREATE POLICY "Allow all for anon" ON schools FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON coaches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON dm_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON engagement_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON profile_audits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON competitor_recruits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON analytics_snapshots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON hudl_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON tweet_patterns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON offer_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON coach_behavior_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON intelligence_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON scrape_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON x_profile_config FOR ALL USING (true) WITH CHECK (true);

-- ============ SEED DATA ============

-- Insert default X profile config
INSERT INTO x_profile_config (display_name, handle, bio, location, website)
VALUES (
  'Jacob Rogers',
  '@JacobRogersOL28',
  '6''4" 285 | OL | Pewaukee HS (WI) | Class of 2028 | 3.8 GPA | Building every day',
  'Pewaukee, WI',
  'hudl.com/profile/jacobrogers'
);
