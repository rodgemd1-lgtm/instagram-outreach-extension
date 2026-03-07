import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Jacob Rodgers | #79 | DT/OG | Class of 2029 | Pewaukee Pirates",
  description:
    "6'4\" 285 | Two-way lineman | 405 Deadlift | 11 Pancakes, 3 Sacks | Pewaukee HS, Wisconsin | Class of 2029 | Watch film highlights",
  openGraph: {
    title: "Jacob Rodgers | #79 DT/OG | Class of 2029 | Pewaukee Pirates",
    description:
      "6'4\" 285 two-way lineman. 405 deadlift. Freshman starter. Pewaukee HS, Wisconsin. Class of 2029. Watch his film.",
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
        url: "/recruit/micro-reel.mp4",
        width: 1280,
        height: 720,
        type: "video/mp4",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jacob Rodgers | #79 DT/OG | Pewaukee Pirates",
    description:
      "6'4\" 285 two-way lineman. 405 deadlift. Freshman starter. Class of 2029. Watch film.",
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
