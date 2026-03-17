"use client";

import dynamic from "next/dynamic";
import { SCPageHeader, SCGlassCard } from "@/components/sc";

const SchoolMap = dynamic(
  () => import("@/components/school-map").then((m) => m.SchoolMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[32px] text-slate-500">
          progress_activity
        </span>
      </div>
    ),
  }
);

export default function MapPage() {
  return (
    <div className="space-y-8">
      <SCPageHeader
        title="NATIONAL TALENT NETWORK"
        kicker="Heat Map"
        subtitle="17 target schools plotted by tier. Click a pin for coach details and school fit data."
      />

      {/* Map Container */}
      <SCGlassCard className="overflow-hidden p-0">
        <SchoolMap />
      </SCGlassCard>
    </div>
  );
}
