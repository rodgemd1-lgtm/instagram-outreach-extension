-- Email outreach table — matches Drizzle schema in src/lib/db/schema.ts
CREATE TABLE IF NOT EXISTS email_outreach (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id TEXT,
  coach_name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  coach_email TEXT,
  template_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  sequence_id TEXT,
  step_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_email_outreach_status ON email_outreach(status);
CREATE INDEX IF NOT EXISTS idx_email_outreach_coach ON email_outreach(coach_name);
CREATE INDEX IF NOT EXISTS idx_email_outreach_sequence ON email_outreach(sequence_id);
