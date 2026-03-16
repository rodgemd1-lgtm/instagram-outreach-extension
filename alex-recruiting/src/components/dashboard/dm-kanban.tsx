"use client";

import type { DMMessage } from "@/lib/types";
import { getSchoolLogo } from "@/lib/data/school-branding";

interface DMKanbanProps {
  dms: DMMessage[];
  onCardClick: (dm: DMMessage) => void;
}

const COLUMNS = [
  { status: "drafted", label: "Queued" },
  { status: "approved", label: "Approved" },
  { status: "sent", label: "Sent" },
  { status: "responded", label: "Replied" },
  { status: "no_response", label: "No Response" },
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
    <div
      className="flex gap-4 overflow-x-auto pb-4"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {COLUMNS.map((col) => {
        const columnDMs = dms.filter((dm) => dm.status === col.status);
        return (
          <div key={col.status} className="min-w-[240px] flex-1">
            {/* Column header */}
            <div className="mb-3 bg-white/70 border border-[rgba(15,40,75,0.08)] rounded-[16px] px-3 py-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--app-muted)] uppercase tracking-wide">
                  {col.label}
                </span>
                <span className="bg-[rgba(15,40,75,0.05)] text-[var(--app-navy-strong)] rounded-[10px] px-2 py-0.5 text-[10px] font-bold">
                  {columnDMs.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {columnDMs.map((dm) => {
                const logoUrl = dm.coachId ? getSchoolLogo(dm.coachId) : null;
                return (
                  <button
                    key={dm.id}
                    type="button"
                    onClick={() => onCardClick(dm)}
                    className="w-full rounded-[20px] border border-[rgba(15,40,75,0.08)] bg-white/80 p-3 text-left transition-all hover:border-[rgba(15,40,75,0.16)] hover:shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      {logoUrl && (
                        <img
                          src={logoUrl}
                          alt=""
                          className="w-5 h-5 rounded-full mt-0.5 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--app-navy-strong)] truncate">
                          {dm.coachName}
                        </p>
                        <p className="text-xs text-[var(--app-muted)] truncate">
                          {dm.schoolName}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-[#6B7280] line-clamp-2">
                      {dm.content.slice(0, 100)}
                      {dm.content.length > 100 ? "..." : ""}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-[var(--app-muted)] font-medium">
                        {formatTimeSince(dm.sentAt || dm.createdAt)}
                      </span>
                    </div>
                  </button>
                );
              })}
              {columnDMs.length === 0 && (
                <div className="rounded-[20px] border border-dashed border-[rgba(15,40,75,0.1)] bg-white/40 py-8 text-center text-xs text-[var(--app-muted)] font-medium">
                  No messages
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
