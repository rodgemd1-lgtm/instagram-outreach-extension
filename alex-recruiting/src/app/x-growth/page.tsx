import { StudioPageHeader } from "@/components/studio-page-header";
import { XGrowthDashboard } from "@/components/x-growth-dashboard";

export const metadata = {
  title: "X Growth | Alex Recruiting",
};

export default function XGrowthPage() {
  return (
    <div className="space-y-6">
      <StudioPageHeader
        icon="TrendingUp"
        kicker="Sophie + Casey"
        title="Track follower growth, coach engagement, and posting performance across X."
        description="Growth analytics aggregated from real X data, coach behavior profiles, and posting window optimization."
        council={["Sophie", "Casey"]}
      />
      <XGrowthDashboard />
    </div>
  );
}
