-- Video Assets table for managing football videos from Photos, Google Drive, Hudl, and manual uploads
CREATE TABLE IF NOT EXISTS video_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  source_album TEXT,
  file_path TEXT,
  supabase_url TEXT,
  storage_path TEXT,
  file_size INTEGER,
  duration INTEGER,
  mime_type TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  upload_status TEXT DEFAULT 'pending',
  uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_video_assets_source ON video_assets(source);
CREATE INDEX IF NOT EXISTS idx_video_assets_upload_status ON video_assets(upload_status);

-- Permissive RLS policy (single-user app)
ALTER TABLE video_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to video_assets" ON video_assets;
CREATE POLICY "Allow all access to video_assets" ON video_assets
  FOR ALL USING (true) WITH CHECK (true);
