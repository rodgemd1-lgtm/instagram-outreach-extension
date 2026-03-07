/**
 * Centralized API Key Registry
 * All external service credentials in one place.
 * Keys are read from environment variables — never hardcoded.
 */

export interface APIKeyStatus {
  service: string;
  configured: boolean;
  envVar: string;
  description: string;
}

export function getAPIKeyStatus(): APIKeyStatus[] {
  return [
    {
      service: "Supabase",
      configured: !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co"
      ),
      envVar: "NEXT_PUBLIC_SUPABASE_URL",
      description: "PostgreSQL database + storage + auth",
    },
    {
      service: "Supabase Service Role",
      configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      envVar: "SUPABASE_SERVICE_ROLE_KEY",
      description: "Server-side admin access (bypasses RLS)",
    },
    {
      service: "Anthropic Claude",
      configured: !!process.env.ANTHROPIC_API_KEY,
      envVar: "ANTHROPIC_API_KEY",
      description: "AI chat, content generation, persona system",
    },
    {
      service: "X/Twitter Bearer",
      configured: !!process.env.X_API_BEARER_TOKEN,
      envVar: "X_API_BEARER_TOKEN",
      description: "Read-only X API access (search, followers, tweets)",
    },
    {
      service: "X/Twitter OAuth 2.0",
      configured: !!(process.env.X_API_CLIENT_ID && process.env.X_API_CLIENT_SECRET),
      envVar: "X_API_CLIENT_ID + X_API_CLIENT_SECRET",
      description: "User-context actions (DMs, posting)",
    },
    {
      service: "X/Twitter OAuth 1.0a",
      configured: !!(process.env.X_API_CONSUMER_KEY && process.env.X_API_ACCESS_TOKEN),
      envVar: "X_API_CONSUMER_KEY + X_API_ACCESS_TOKEN",
      description: "Profile updates, tweet posting (v1.1)",
    },
    {
      service: "FAL.AI",
      configured: !!process.env.FAL_KEY,
      envVar: "FAL_KEY",
      description: "AI image generation",
    },
    {
      service: "Google Gemini",
      configured: !!process.env.GEMINI_API_KEY,
      envVar: "GEMINI_API_KEY",
      description: "Multimodal AI (vision, text)",
    },
    {
      service: "Jina AI",
      configured: !!(process.env.JINA_API_KEY && process.env.JINA_API_KEY !== "your_jina_key"),
      envVar: "JINA_API_KEY",
      description: "Web scraping (Hudl profiles, coach pages)",
    },
    {
      service: "Exa",
      configured: !!(process.env.EXA_API_KEY && process.env.EXA_API_KEY !== "your_exa_key"),
      envVar: "EXA_API_KEY",
      description: "Semantic search across the web",
    },
    {
      service: "Firecrawl",
      configured: !!(process.env.FIRECRAWL_API_KEY && process.env.FIRECRAWL_API_KEY !== "your_firecrawl_key"),
      envVar: "FIRECRAWL_API_KEY",
      description: "Web scraping and crawling",
    },
    {
      service: "Brave Search",
      configured: !!(process.env.BRAVE_API_KEY && process.env.BRAVE_API_KEY !== "your_brave_key"),
      envVar: "BRAVE_API_KEY",
      description: "Web search API",
    },
    {
      service: "Cron Secret",
      configured: !!(process.env.CRON_SECRET && process.env.CRON_SECRET !== "your_cron_secret_here"),
      envVar: "CRON_SECRET",
      description: "Vercel cron job authentication",
    },
    {
      service: "NCSA",
      configured: !!(process.env.NCSA_EMAIL && process.env.NCSA_PASSWORD),
      envVar: "NCSA_EMAIL + NCSA_PASSWORD",
      description: "NCSA recruiting platform login",
    },
    {
      service: "YouTube Data API",
      configured: !!process.env.YOUTUBE_API_KEY,
      envVar: "YOUTUBE_API_KEY",
      description: "YouTube channel stats and video metadata",
    },
  ];
}

export function getConfiguredServices(): string[] {
  return getAPIKeyStatus()
    .filter((k) => k.configured)
    .map((k) => k.service);
}

export function getMissingServices(): string[] {
  return getAPIKeyStatus()
    .filter((k) => !k.configured)
    .map((k) => k.service);
}
