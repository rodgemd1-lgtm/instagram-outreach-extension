-- Coach inquiry submissions from the recruiting page contact form
CREATE TABLE IF NOT EXISTS coach_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_name TEXT NOT NULL,
  coach_title TEXT,
  school_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for listing by status and recency
CREATE INDEX IF NOT EXISTS idx_coach_inquiries_status_created
  ON coach_inquiries (status, created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_coach_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coach_inquiries_updated_at
  BEFORE UPDATE ON coach_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_coach_inquiries_updated_at();

-- RLS: enable but allow service_role full access (API route uses admin client)
ALTER TABLE coach_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow service_role (admin client) full access
CREATE POLICY "service_role_all" ON coach_inquiries
  FOR ALL
  USING (true)
  WITH CHECK (true);
