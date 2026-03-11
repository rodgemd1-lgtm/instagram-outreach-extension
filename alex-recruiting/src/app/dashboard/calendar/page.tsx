import { Calendar } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-dash-text">
          Content Calendar
        </h1>
        <p className="mt-1 text-sm text-dash-muted">
          Schedule posts, camps, visits, and deadlines in one view.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-24">
        <Calendar className="h-12 w-12 text-dash-muted/50" />
        <p className="mt-4 text-sm font-medium text-dash-muted">
          Calendar coming in v2.0 Phase 2
        </p>
        <p className="mt-1 text-xs text-dash-muted/70">
          Full month view with drag-to-schedule, post composer sidebar, and
          event integration.
        </p>
      </div>
    </div>
  );
}
