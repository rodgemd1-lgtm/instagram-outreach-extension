import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-dash-text">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-dash-muted">
          Engagement, growth, and recruiting funnel metrics.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-24">
        <BarChart3 className="h-12 w-12 text-dash-muted/50" />
        <p className="mt-4 text-sm font-medium text-dash-muted">
          Analytics dashboard coming in v2.0 Phase 2
        </p>
        <p className="mt-1 text-xs text-dash-muted/70">
          Follower growth chart, engagement trends, posting streak, and
          recruiting funnel visualization.
        </p>
      </div>
    </div>
  );
}
