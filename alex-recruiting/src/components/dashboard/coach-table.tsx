"use client";

import { useMemo } from "react";
import type { Coach } from "@/lib/types";
import { getSchoolLogo } from "@/lib/data/school-branding";
import { ChevronRight } from "lucide-react";

interface CoachTableProps {
  coaches: Coach[];
  onCoachClick: (coach: Coach) => void;
}

function getEngagementStatus(coach: Coach): { label: string; color: string } {
  if (coach.dmStatus === "responded") return { label: "Replied", color: "#16A34A" };
  if (coach.dmStatus === "sent") return { label: "DM Sent", color: "#F59E0B" };
  if (coach.followStatus === "followed" || coach.followStatus === "followed_back") return { label: "Followed", color: "#2563EB" };
  return { label: "No Contact", color: "#D1D5DB" };
}

export function CoachTable({ coaches, onCoachClick }: CoachTableProps) {
  return (
    <div className="bg-white border text-left border-gray-200 rounded-xl overflow-hidden shadow-sm shadow-gray-200/50">
      <table className="w-full text-sm text-left align-middle border-collapse divide-y divide-gray-200">
        <thead className="bg-[#0F1720] text-white">
          <tr>
            <th className="font-semibold p-4 pl-6">Coach & School</th>
            <th className="font-semibold p-4">Division</th>
            <th className="font-semibold p-4 text-center">OL Need</th>
            <th className="font-semibold p-4">Engagement</th>
            <th className="font-semibold p-4 text-right pr-6">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-[#F8FAFC]">
          {coaches.map((coach) => {
            const status = getEngagementStatus(coach);
            return (
              <tr 
                key={coach.id} 
                className="hover:bg-white cursor-pointer transition-colors group"
                onClick={() => onCoachClick(coach)}
              >
                <td className="p-4 pl-6 relative">
                  <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-[#2DD4BF] transition-colors" />
                  <div className="flex items-center gap-3">
                    <img 
                      src={getSchoolLogo(coach.schoolId || coach.schoolName?.toLowerCase().replace(/\s+/g, "-") || "")} 
                      alt="" 
                      className="w-9 h-9 rounded-full border border-gray-200 shadow-sm bg-white" 
                    />
                    <div>
                      <p className="font-bold text-base text-[#0F1720]">{coach.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{coach.schoolName} · {coach.title || "Coach"}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 shadow-sm">
                    {coach.division || "NCAA"}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex gap-1 justify-center">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const isActive = n <= parseInt((coach as any).olNeedScore || "3");
                      return (
                        <div 
                          key={n} 
                          className={`h-2.5 w-2.5 rounded-full transition-colors ${
                            isActive 
                              ? "bg-[#2DD4BF] shadow-[0_0_6px_rgba(45,212,191,0.6)]" 
                              : "bg-gray-200"
                          }`} 
                        />
                      );
                    })}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 font-medium text-gray-700 text-sm bg-white border border-gray-200 rounded-full px-3 py-1 w-max shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
                    {status.label}
                  </div>
                </td>
                <td className="p-4 text-right pr-6">
                  <ChevronRight className="inline-block h-5 w-5 text-gray-400 group-hover:text-[#0F1720] transition-colors transform group-hover:translate-x-1" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
