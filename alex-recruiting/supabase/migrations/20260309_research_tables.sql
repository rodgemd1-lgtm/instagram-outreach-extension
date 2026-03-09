CREATE TABLE IF NOT EXISTS research_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  data_type TEXT NOT NULL,
  source TEXT NOT NULL,
  word_count INTEGER,
  scraped_at TIMESTAMP DEFAULT now(),
  ai_summary TEXT,
  ai_insights JSONB,
  ai_action_items JSONB,
  ai_relevance_score INTEGER,
  ai_tags TEXT[],
  ai_processed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS research_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  engine TEXT NOT NULL DEFAULT 'exa',
  results JSONB NOT NULL,
  result_count INTEGER,
  searched_at TIMESTAMP DEFAULT now()
);

ALTER TABLE enriched_schools
  ADD COLUMN IF NOT EXISTS ol_graduating_2029 INTEGER,
  ADD COLUMN IF NOT EXISTS scholarship_gap_score INTEGER,
  ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMP;
