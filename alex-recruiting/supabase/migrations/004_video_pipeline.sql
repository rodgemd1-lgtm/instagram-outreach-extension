-- Video Pipeline: add category, optimized file path, and dimensions to video_assets
ALTER TABLE video_assets ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE video_assets ADD COLUMN IF NOT EXISTS optimized_file_path text;
ALTER TABLE video_assets ADD COLUMN IF NOT EXISTS width integer;
ALTER TABLE video_assets ADD COLUMN IF NOT EXISTS height integer;

CREATE INDEX IF NOT EXISTS idx_video_assets_category ON video_assets (category);
