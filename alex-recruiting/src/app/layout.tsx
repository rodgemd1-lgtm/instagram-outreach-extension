import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { PWARegister } from "@/components/pwa-register";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Use the canonical production URL so OG/Twitter cards resolve correctly.
// VERCEL_URL returns a deployment-specific hash URL that is 401 to crawlers.
const metadataBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://alex-recruiting.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: "Alex Recruiting | Jacob Rodgers OL/DL '29",
  description: "AI-powered recruiting intelligence system for Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS, Wisconsin",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Alex Recruiting",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PWARegister />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
