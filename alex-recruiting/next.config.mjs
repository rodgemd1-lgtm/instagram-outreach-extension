import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: false },
    // Keep large native binaries out of serverless function bundles.
    // serverExternalPackages is the Next.js 14.1+ stable key;
    // experimental.serverComponentsExternalPackages is the v13/early-v14 fallback.
    serverExternalPackages: ["puppeteer-core", "sharp", "@sparticuz/chromium"],
    experimental: {
          serverComponentsExternalPackages: ["puppeteer-core", "sharp", "@sparticuz/chromium"],
          outputFileTracingRoot: __dirname,
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
              source: "/(.*)",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "DENY" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                { key: "X-DNS-Prefetch-Control", value: "on" },
                { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
                      ],
      },
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
