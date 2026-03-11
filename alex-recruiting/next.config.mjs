/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    serverComponentsExternalPackages: ["puppeteer-core"],
    // Exclude large media from serverless function bundles (250 MB limit).
    // Files still serve fine as static assets from Vercel's CDN.
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
