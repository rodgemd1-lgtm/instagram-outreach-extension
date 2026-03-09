import { StudioPageHeader } from "@/components/studio-page-header";
import { MediaLabDashboard } from "@/components/media-lab-dashboard";

export const metadata = {
  title: "Media Lab | Alex Recruiting",
};

export default function MediaLabPage() {
  return (
    <div className="space-y-6">
      <StudioPageHeader
        icon="Clapperboard"
        kicker="Jordan + Prism"
        title="Turn Jacob’s real media into a recruit-grade library, reel, and publishing engine."
        description="This lab scores the footage, surfaces the strongest visuals, and packages what belongs in the website, reels, and coach-facing X queue."
        council={["Susan", "Jordan", "Prism", "Lens"]}
      >
        <p className="font-semibold">Selection rule:</p>
        <p className="mt-2 leading-6 text-[var(--app-muted)]">
          Choose the plays and frames that show force, finish, range, and clarity. High-signal reps beat filler every time.
        </p>
      </StudioPageHeader>
      <MediaLabDashboard />
    </div>
  );
}
