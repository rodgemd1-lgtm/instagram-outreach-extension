import { ProfileAudit } from "@/components/profile-audit";
import { StudioPageHeader } from "@/components/studio-page-header";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <StudioPageHeader
        icon="ShieldCheck"
        kicker="Lens + Susan"
        title="Audit the recruiting machine like a staff review, not a checklist."
        description="This surface tracks whether Jacob’s profile, media, cadence, coach engagement, and DM execution are actually ready for coach scrutiny."
        council={["Susan", "Lens", "Marcus"]}
      >
        <p className="font-semibold">What matters here:</p>
        <p className="mt-2 leading-6 text-[var(--app-muted)]">
          Eliminate the blockers that cost trust fast: unclear profile copy, weak pinned post, stale cadence, thin coach activity, or poor media readiness.
        </p>
      </StudioPageHeader>
      <ProfileAudit />
    </div>
  );
}
