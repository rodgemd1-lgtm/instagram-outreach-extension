"use client";

import { StudioPageHeader } from "@/components/studio-page-header";
import { IntelligenceDashboard } from "@/components/intelligence-dashboard";

export default function IntelligencePage() {
  return (
    <div className="space-y-6">
      <StudioPageHeader
        icon="Brain"
        kicker="Susan + Innovation Studio"
        title="Use recruiting intelligence and future-back strategy to close gaps before coaches tell you they exist."
        description="This surface now combines analysis, timeline awareness, coach behavior, and a five-year Strategos lens so daily decisions connect to long-range recruiting leverage."
        council={["Susan", "Strategos", "Dashboard", "Lens"]}
      >
        <p className="font-semibold">Analysis rule:</p>
        <p className="mt-2 leading-6 text-[var(--app-muted)]">
          Treat every score as an operating signal. If the app sees weak film, thin social proof, or soft momentum, the next action should be explicit.
        </p>
      </StudioPageHeader>
      <IntelligenceDashboard />
    </div>
  );
}
