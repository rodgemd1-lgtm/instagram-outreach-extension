import { StudioPageHeader } from "@/components/studio-page-header";
import { NCSALeadPipeline } from "@/components/ncsa-lead-pipeline";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <StudioPageHeader
        icon="Target"
        kicker="Susan + Growth Engine"
        title="Work NCSA leads like a live funnel with visible status, not a static list."
        description="Lead status should tell the family exactly which prospects were found, researched, followed, drafted, sent, and answered."
        council={["Susan", "Dashboard", "Trey"]}
      />
      <NCSALeadPipeline />
    </div>
  );
}
