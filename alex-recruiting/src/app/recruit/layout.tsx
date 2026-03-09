import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Jacob Rodgers | #79 | OL/DL | Class of 2029 | Pewaukee Pirates",
  description:
    "6'4\" 285 | Class of 2029 lineman with defensive-line upside, offensive-line versatility, first-place track-and-field power, and coach-first film. Pewaukee HS, Wisconsin.",
  openGraph: {
    title: "Jacob Rodgers | #79 OL/DL | Class of 2029 | Pewaukee Pirates",
    description:
      "6'4\" 285 lineman with defensive-line upside, offensive-line versatility, verified film, and multi-sport power transfer. Pewaukee HS, Wisconsin. Class of 2029.",
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
        url: "/recruit/featured-clips/jacob-impact-reel.mp4",
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
      "6'4\" 285 lineman. Defensive-line upside, offensive-line versatility, track-and-field power, and coach-first film.",
    images: ["/recruit/photos/promo-graphic.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0A",
};

export default function RecruitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="recruit-page bg-[#0A0A0A] text-white min-h-screen overflow-x-hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        touchAction: "pan-y",
      }}
    >
      {children}
    </div>
  );
}
