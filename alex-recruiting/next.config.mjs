/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Exclude puppeteer-core from serverless bundles (only used locally for header generation)
  experimental: {
    serverComponentsExternalPackages: ["puppeteer-core"],
    outputFileTracingExcludes: {
      "/api/**": ["./public/recruit/**"],
      "/recruit": ["./public/recruit/**"],
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
