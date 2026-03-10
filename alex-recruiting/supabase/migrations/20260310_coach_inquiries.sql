-- Coach inquiry submissions from the recruiting page contact form
CREATE TABLE IF NOT EXISTS coach_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id UUID,
  coach_name TEXT NOT NULL,
  school TEXT NOT NULL,
  coaching_position TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  ncaa_compliant BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  coach_title TEXT
);

-- Index for listing by status and recency
CREATE INDEX IF NOT EXISTS idx_coach_inquiries_status_created
  ON coach_inquiries (status, created_at DESC);

-- RLS: enable but allow service_role full access (API route uses admin client)
ALTER TABLE coach_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow service_role (admin client) full access
CREATE POLICY "service_role_all" ON coach_inquiries
  FOR ALL
  USING (true)
  WITH CHECK (true);
