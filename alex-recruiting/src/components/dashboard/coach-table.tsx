"use client";

import { useMemo } from "react";
import type { Coach } from "@/lib/types";
import { getSchoolLogo, getSchoolColors } from "@/lib/data/school-branding";

interface CoachTableProps {
  coaches: Coach[];
  onCoachClick: (coach: Coach) => void;
}

function getEngagementStatus(coach: Coach): { label: string; color: string } {
  if (coach.dmStatus === "replied" || coach.dmStatus === "responded") return { label: "Replied", color: "#16A34A" };
  if (coach.dmStatus === "sent") return { label: "DM Sent", color: "#F59E0B" };
  if (coach.followStatus === "following" || coach.followStatus === "followed" || coach.followStatus === "followed_back") return { label: "Followed", color: "#2563EB" };
  return { label: "No Contact", color: "#D1D5DB" };
}

export function CoachTable({ coaches, onCoachClick }: CoachTableProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, Coach[]>();
    coaches.forEach(c => {
      const key = c.schoolName || "Unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return Array.from(map.entries());
  }, [coaches]);

  return (
    <div className="space-y-4">
      {grouped.map(([schoolName, schoolCoaches]) => {
        const schoolId = schoolCoaches[0]?.schoolId || schoolName.toLowerCase().replace(/\s+/g, "-");
        const colors = getSchoolColors(schoolId);
        return (
          <div key={schoolName} className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F3F4F6]" style={{ borderLeftWidth: 4, borderLeftColor: colors.primary }}>
              <img src={getSchoolLogo(schoolId)} alt="" className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <p className="font-semibold text-[#0F1720]">{schoolName}</p>
                <p className="text-xs text-[#9CA3AF]">{schoolCoaches[0]?.conference || ""} · {schoolCoaches[0]?.division || ""}</p>
              </div>
              <span className="text-xs text-[#9CA3AF] bg-[#F5F5F4] px-2 py-0.5 rounded-full">{schoolCoaches.length} coach{schoolCoaches.length !== 1 ? "es" : ""}</span>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              {schoolCoaches.map(coach => {
                const status = getEngagementStatus(coach);
                return (
                  <button key={coach.id} onClick={() => onCoachClick(coach)} className="w-full text-left px-4 py-3 hover:bg-[#FAFAFA] transition-colors flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F1720]">{coach.name}</p>
                      <p className="text-xs text-[#9CA3AF] truncate">{coach.title || "Coach"}{coach.xHandle ? ` · ${coach.xHandle}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="text-xs text-[#6B7280]">{status.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
