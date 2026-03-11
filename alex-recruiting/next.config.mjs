/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Exclude puppeteer-core from serverless bundles (only used locally for header generation)
  serverExternalPackages: ["puppeteer-core"],
  experimental: {
    // Exclude large media directories from ALL serverless function bundles.
    // public/recruit/ is 264 MB of video/photo files — exceeds Vercel's 250 MB limit.
    // Using '*' wildcard to cover every route, not just /api/**.
    outputFileTracingExcludes: {
      "*": [
        "./public/recruit/**/*",
        "./public/optimized-media/**/*",
        "./public/Media Clips For Mike to Add/**/*",
      ],
    },
  },
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    },
    {
      source: "/manifest.json",
      headers: [
        { key: "Content-Type", value: "application/manifest+json" },
      ],
    },
  ],
};

export default nextConfig;
