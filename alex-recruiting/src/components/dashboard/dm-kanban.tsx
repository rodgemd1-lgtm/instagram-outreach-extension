"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { DMMessage } from "@/lib/types";

interface DMKanbanProps {
  dms: DMMessage[];
  onCardClick: (dm: DMMessage) => void;
}

const COLUMNS = [
  { status: "drafted", label: "Queued", color: "border-t-dash-warning" },
  { status: "sent", label: "Sent", color: "border-t-dash-accent" },
  { status: "approved", label: "Approved", color: "border-t-dash-gold" },
  { status: "responded", label: "Replied", color: "border-t-dash-success" },
  { status: "no_response", label: "No Response", color: "border-t-dash-muted" },
] as const;

function formatTimeSince(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function DMKanban({ dms, onCardClick }: DMKanbanProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: "touch" }}>
      {COLUMNS.map((col) => {
        const columnDMs = dms.filter((dm) => dm.status === col.status);
        return (
          <div key={col.status} className="min-w-[240px] flex-1">
            {/* Column header */}
            <div className={cn("mb-3 rounded-t-lg border-t-2 px-3 py-2", col.color)}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-dash-text">
                  {col.label}
                </span>
                <span className="rounded-full bg-dash-surface-raised px-2 py-0.5 text-[10px] font-bold text-dash-muted">
                  {columnDMs.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {columnDMs.map((dm) => (
                <button
                  key={dm.id}
                  type="button"
                  onClick={() => onCardClick(dm)}
                  className="w-full rounded-lg border border-dash-border bg-dash-surface p-3 text-left transition-all hover:border-dash-accent/30 hover:bg-dash-surface-raised"
                >
                  <p className="text-sm font-medium text-dash-text">{dm.coachName}</p>
                  <p className="text-xs text-dash-muted">{dm.schoolName}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-dash-text-secondary">
                    {dm.content.slice(0, 80)}{dm.content.length > 80 ? "..." : ""}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="muted" className="text-[10px]">{dm.templateType}</Badge>
                    <span className="text-[10px] text-dash-muted">{formatTimeSince(dm.sentAt || dm.createdAt)}</span>
                  </div>
                </button>
              ))}
              {columnDMs.length === 0 && (
                <div className="rounded-lg border border-dashed border-dash-border-subtle py-8 text-center text-xs text-dash-muted/50">
                  Empty
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
