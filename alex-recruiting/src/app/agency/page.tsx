import { StudioPageHeader } from "@/components/studio-page-header";
import { AgencyDashboard } from "@/components/agency-dashboard";

export default function AgencyPage() {
  return (
    <div className="space-y-6">
      <StudioPageHeader
        icon="UsersRound"
        kicker="Full Design Studio Team"
        title="Coordinate the recruiting company like an operating team, not a pile of features."
        description="Agency mode turns the app into a working room for tasks, leads, approvals, and specialist roles so the system feels staffed and accountable."
        council={["Susan", "Marcus", "Prism", "Lens", "Dashboard"]}
      >
        <p className="font-semibold">Operating rule:</p>
        <p className="mt-2 leading-6 text-[var(--app-muted)]">
          Every team member should have clear ownership, visible work, and a direct connection to recruiting outcomes.
        </p>
      </StudioPageHeader>
      <AgencyDashboard />
    </div>
  );
}
