"use client";

import { cn } from "@/lib/utils";
import type { DMMessage } from "@/lib/types";

interface DMKanbanProps {
  dms: DMMessage[];
  onCardClick: (dm: DMMessage) => void;
}

const COLUMNS = [
  { status: "drafted", label: "Queued", color: "border-t-[#F59E0B]" },
  { status: "sent", label: "Sent", color: "border-t-[#22C55E]" },
  { status: "approved", label: "Approved", color: "border-t-[#ff000c]" },
  { status: "responded", label: "Replied", color: "border-t-[#22C55E]" },
  { status: "no_response", label: "No Response", color: "border-t-white/20" },
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
            <div className={cn("mb-3 rounded-t-xl border-t-2 bg-[#0A0A0A] border border-white/5 px-3 py-2", col.color)}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  {col.label}
                </span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/40">
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
                  className="w-full rounded-lg border border-white/5 bg-[#111111] p-3 text-left transition-colors hover:border-[#ff000c]/30"
                >
                  <p className="text-sm font-semibold text-white">{dm.coachName}</p>
                  <p className="text-xs text-white/60">{dm.schoolName}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-white/40">
                    {dm.content.slice(0, 80)}{dm.content.length > 80 ? "..." : ""}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white/40">{dm.templateType}</span>
                    <span className="text-[10px] text-white/40">{formatTimeSince(dm.sentAt || dm.createdAt)}</span>
                  </div>
                </button>
              ))}
              {columnDMs.length === 0 && (
                <div className="rounded-lg border border-dashed border-white/5 py-8 text-center text-xs text-white/30">
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
