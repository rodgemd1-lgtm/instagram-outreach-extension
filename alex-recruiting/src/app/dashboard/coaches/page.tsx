import { Users } from "lucide-react";

export default function CoachesPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-dash-text">
          Coach CRM
        </h1>
        <p className="mt-1 text-sm text-dash-muted">
          Track coaches by tier, status, and recruiting fit score.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-24">
        <Users className="h-12 w-12 text-dash-muted/50" />
        <p className="mt-4 text-sm font-medium text-dash-muted">
          Coach CRM coming in v2.0 Phase 2
        </p>
        <p className="mt-1 text-xs text-dash-muted/70">
          DataTable with tier, status, last contact, fit score. Click-through
          to coach detail with DM history and notes.
        </p>
      </div>
    </div>
  );
}
