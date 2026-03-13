"use client";

import type { Coach } from "@/lib/types";
import { getSchoolLogo, getSchoolColors } from "@/lib/data/school-branding";

interface CoachCardProps {
  coach: Coach;
  onClick: () => void;
}

export function CoachCard({ coach, onClick }: CoachCardProps) {
  const schoolId = coach.schoolId || coach.schoolName?.toLowerCase().replace(/\s+/g, "-") || "";
  const colors = getSchoolColors(schoolId);

  const status = coach.dmStatus === "replied" || coach.dmStatus === "responded" ? { label: "Replied", color: "#16A34A" }
    : coach.dmStatus === "sent" ? { label: "DM Sent", color: "#F59E0B" }
    : coach.followStatus === "following" || coach.followStatus === "followed" || coach.followStatus === "followed_back" ? { label: "Followed", color: "#2563EB" }
    : { label: "No Contact", color: "#D1D5DB" };

  return (
    <button onClick={onClick} className="text-left bg-white border border-[#E5E7EB] rounded-lg p-4 hover:shadow-sm transition-shadow" style={{ borderLeftWidth: 4, borderLeftColor: colors.primary }}>
      <div className="flex items-start gap-3">
        <img src={getSchoolLogo(schoolId)} alt="" className="w-10 h-10 rounded-full" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[#0F1720]">{coach.name}</p>
          <p className="text-xs text-[#9CA3AF] truncate">{coach.title || "Coach"}</p>
          <p className="text-xs text-[#9CA3AF]">{coach.schoolName}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
        <span className="text-xs text-[#6B7280]">{status.label}</span>
      </div>
    </button>
  );
}
