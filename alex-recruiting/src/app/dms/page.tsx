import { DMCampaign } from "@/components/dm-campaign";
import { StudioPageHeader } from "@/components/studio-page-header";

export default function DMsPage() {
  return (
    <div className="space-y-6">
      <StudioPageHeader
        icon="Mail"
        kicker="Susan + Trey"
        title="Write outreach that feels personal, respectful, and easy for a coach to answer."
        description="The DM engine should move real conversations forward. Use it to stage clean intros, keep tone disciplined, and send only when the profile supports the message."
        council={["Susan", "Trey", "Lens"]}
      >
        <p className="font-semibold">Outreach standard:</p>
        <p className="mt-2 leading-6 text-[var(--app-muted)]">
          One concise reason to care, one link that matters, and no fluff. The goal is a reply, not a speech.
        </p>
      </StudioPageHeader>
      <DMCampaign />
    </div>
  );
}
