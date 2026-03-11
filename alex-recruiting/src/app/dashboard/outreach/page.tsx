import { Mail } from "lucide-react";

export default function OutreachPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-dash-text">
          DM Outreach
        </h1>
        <p className="mt-1 text-sm text-dash-muted">
          Review, approve, and track coach outreach sequences.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-24">
        <Mail className="h-12 w-12 text-dash-muted/50" />
        <p className="mt-4 text-sm font-medium text-dash-muted">
          Outreach pipeline coming in v2.0 Phase 3
        </p>
        <p className="mt-1 text-xs text-dash-muted/70">
          Kanban view: Queued &rarr; Sent &rarr; Viewed &rarr; Replied &rarr;
          Meeting. Human-in-the-loop approval for every DM.
        </p>
      </div>
    </div>
  );
}
