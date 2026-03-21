import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SCShell } from "@/components/sc/sc-shell";
import { SCSplashScreen } from "@/components/sc/sc-splash-screen";
import { OperatorDock } from "@/components/operator-dock";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
});

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
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-sc-primary focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <SCSplashScreen />
        <OperatorDock />
        <SCShell>{children}</SCShell>
      </body>
    </html>
  );
}
