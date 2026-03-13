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
            <div className="mb-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                  {col.label}
                </span>
                <span className="bg-[#F5F5F4] text-[#6B7280] rounded-full px-2 py-0.5 text-xs font-semibold">
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
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white p-3 text-left transition-all hover:border-[#9CA3AF] hover:shadow-sm"
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
                        <p className="text-sm font-semibold text-[#0F1720] truncate">
                          {dm.coachName}
                        </p>
                        <p className="text-xs text-[#9CA3AF] truncate">
                          {dm.schoolName}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-[#6B7280] line-clamp-2">
                      {dm.content.slice(0, 100)}
                      {dm.content.length > 100 ? "..." : ""}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-[#9CA3AF]">
                        {formatTimeSince(dm.sentAt || dm.createdAt)}
                      </span>
                    </div>
                  </button>
                );
              })}
              {columnDMs.length === 0 && (
                <div className="rounded-lg border border-dashed border-[#E5E7EB] py-8 text-center text-xs text-[#9CA3AF]">
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
