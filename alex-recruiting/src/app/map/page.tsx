"use client";

import dynamic from "next/dynamic";

const SchoolMap = dynamic(
  () => import("@/components/school-map").then((m) => m.SchoolMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <p className="text-sm text-[var(--app-muted)]">Loading map...</p>
      </div>
    ),
  }
);

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--app-navy-strong)]">Target School Map</h1>
        <p className="mt-1 text-sm text-[var(--app-muted)]">
          17 target schools plotted by tier. Click a pin for coach details and school fit data.
        </p>
      </div>
      <SchoolMap />
    </div>
  );
}
