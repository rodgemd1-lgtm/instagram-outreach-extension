import { PostQueue } from "@/components/post-queue";
import { StudioPageHeader } from "@/components/studio-page-header";

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <StudioPageHeader
        icon="FileText"
        kicker="Trey + Susan"
        title="Shape every X post to feel coach-relevant, restrained, and worth sending."
        description="The queue is the approval room. Review the draft, check the attached media, tighten the copy, and only publish what strengthens the recruiting narrative."
        council={["Susan", "Trey", "Prism"]}
      >
        <p className="font-semibold">Publishing standard:</p>
        <p className="mt-2 leading-6 text-[var(--app-muted)]">
          Specific beats generic. Real film beats hype. Posts should make it easier for a coach to understand Jacob in one pass.
        </p>
      </StudioPageHeader>
      <PostQueue />
    </div>
  );
}
