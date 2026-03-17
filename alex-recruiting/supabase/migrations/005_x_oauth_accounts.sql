CREATE TABLE IF NOT EXISTS x_oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'x',
  provider_user_id TEXT NOT NULL UNIQUE,
  username TEXT,
  display_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT,
  scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
  expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_x_oauth_accounts_username
  ON x_oauth_accounts (username);

CREATE UNIQUE INDEX IF NOT EXISTS idx_x_oauth_accounts_default_provider
  ON x_oauth_accounts (provider)
  WHERE is_default = TRUE;
