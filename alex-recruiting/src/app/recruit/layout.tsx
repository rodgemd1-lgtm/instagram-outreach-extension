import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Jacob Rodgers | DT/OG | Class of 2029 | Pewaukee HS",
  description:
    "6'4\" 285 | Two-way lineman | 11 Pancakes, 3 Sacks | State Champions | Pewaukee HS, Wisconsin | Class of 2029",
  openGraph: {
    title: "Jacob Rodgers | DT/OG | Class of 2029",
    description:
      "Two-way lineman out of Pewaukee HS, Wisconsin. Training since age 12. State Champion. Built different.",
    type: "website",
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
    <div className="recruit-page bg-[#0A0A0A] text-white min-h-screen overflow-x-hidden">
      {children}
    </div>
  );
}
