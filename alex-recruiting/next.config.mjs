import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ["puppeteer-core"],
  outputFileTracingExcludes: {
    "*": [
      "./public/recruit/**/*",
      "./public/optimized-media/**/*",
      "./public/Media Clips For Mike to Add/**/*",
    ],
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
