import type { Metadata, Viewport } from "next";
import { Playfair_Display, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jacob Rodgers | #79 | OL/DL | Class of 2029 | Pewaukee Pirates",
  description:
    "6'4\" 285 | Class of 2029 lineman with defensive-line upside, offensive-line versatility, first-place track-and-field power, and full film library. Pewaukee HS, Wisconsin.",
  openGraph: {
    title: "Jacob Rodgers | #79 OL/DL | Class of 2029 | Pewaukee Pirates",
    description:
      "6'4\" 285 lineman with defensive-line upside, offensive-line versatility, restored film libraries, and multi-sport power transfer. Pewaukee HS, Wisconsin. Class of 2029.",
    type: "website",
    images: [
      {
        url: "/recruit/photos/promo-graphic.jpg",
        width: 1200,
        height: 630,
        alt: "Jacob Rodgers #79 — Pewaukee Pirates Football",
      },
    ],
    videos: [
      {
        url: "/recruit/featured-clips/jacob-capcut-highlight.mp4",
        width: 1280,
        height: 720,
        type: "video/mp4",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jacob Rodgers | #79 OL/DL | Pewaukee Pirates",
    description:
      "6'4\" 285 lineman. Defensive-line upside, offensive-line versatility, restored film, and track-and-field power.",
    images: ["/recruit/photos/promo-graphic.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RecruitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`recruit-page bg-black text-white min-h-screen overflow-x-hidden ${playfair.variable} ${jetbrains.variable}`}
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        touchAction: "pan-y",
      }}
    >
      {children}
    </div>
  );
}
