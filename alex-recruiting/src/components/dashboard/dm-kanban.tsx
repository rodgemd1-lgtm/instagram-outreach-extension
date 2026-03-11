"use client";

import { Badge } from "@/components/dashboard/badge";

// ─── Public card interface ──────────────────────────────────────────────────
export interface DMCard {
  id: string;
  coachId: string;
  coachName: string;
  schoolName: string;
  content: string;
  templateType: string;
  status: string;
  sentAt: string | null;
  respondedAt: string | null;
  createdAt: string;
}

interface DMKanbanProps {
  dms: DMCard[];
  coaches: { id: string; priorityTier: string }[];
  onCardClick: (dm: DMCard) => void;
}

// ─── Column definitions ─────────────────────────────────────────────────────
interface Column {
  key: string;
  label: string;
  statuses: string[];
}

const COLUMNS: Column[] = [
  { key: "queued", label: "Queued", statuses: ["drafted", "not_sent"] },
  { key: "approved", label: "Approved", statuses: ["approved"] },
  { key: "sent", label: "Sent", statuses: ["sent"] },
  { key: "replied", label: "Replied", statuses: ["responded"] },
  { key: "no_response", label: "No Response", statuses: ["no_response"] },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 30) return `${diffDays}d ago`;
  const months = Math.floor(diffDays / 30);
  return `${months}mo ago`;
}

function tierBadgeVariant(tier: string): "accent" | "success" | "muted" {
  switch (tier) {
    case "Tier 1":
      return "accent";
    case "Tier 2":
      return "success";
    default:
      return "muted";
  }
}

function templateLabel(type: string): string {
  switch (type) {
    case "intro":
      return "Intro";
    case "postCamp":
      return "Post-Camp";
    case "postFollow":
      return "After Follow";
    case "valueAdd":
      return "Value Add";
    default:
      return type;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────
export function DMKanban({ dms, coaches, onCardClick }: DMKanbanProps) {
  const coachMap = new Map(coaches.map((c) => [c.id, c.priorityTier]));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const cards = dms.filter((dm) => col.statuses.includes(dm.status));

        return (
          <div key={col.key} className="w-64 shrink-0 md:w-72">
            {/* Column header */}
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-dash-muted">
                {col.label}
              </h3>
              <Badge variant="muted">{cards.length}</Badge>
            </div>

            {/* Card stack */}
            <div className="flex flex-col gap-2">
              {cards.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-dash-border">
                  <span className="text-xs text-dash-muted/50">No messages</span>
                </div>
              ) : (
                cards.map((dm) => {
                  const tier = coachMap.get(dm.coachId) ?? "";

                  return (
                    <button
                      key={dm.id}
                      type="button"
                      onClick={() => onCardClick(dm)}
                      className="cursor-pointer rounded-xl border border-dash-border bg-dash-surface p-3 text-left transition-colors hover:bg-dash-surface-raised"
                    >
                      {/* Coach + school */}
                      <p className="text-sm font-semibold text-dash-text">
                        {dm.coachName}
                      </p>
                      <p className="mt-0.5 text-xs text-dash-muted">
                        {dm.schoolName}
                      </p>

                      {/* Message preview */}
                      <p className="mt-2 line-clamp-2 text-xs text-dash-text-secondary">
                        {dm.content}
                      </p>

                      {/* Footer: tier + template + time */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {tier && (
                          <Badge variant={tierBadgeVariant(tier)}>{tier}</Badge>
                        )}
                        {dm.templateType && dm.templateType !== "manual" && (
                          <Badge variant="default">
                            {templateLabel(dm.templateType)}
                          </Badge>
                        )}
                        <span className="ml-auto text-[10px] text-dash-muted">
                          {timeAgo(dm.sentAt ?? dm.createdAt)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
