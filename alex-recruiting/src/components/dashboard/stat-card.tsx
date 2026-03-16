"use client";

import { type LucideIcon } from "lucide-react";
import { AnimatedNumber } from "./animated-number";

interface StatCardProps {
  label: string;
  value: number | string | null | undefined;
  change?: string | null;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
}

export function StatCard({ label, value, change, changeType, icon: Icon }: StatCardProps) {
  const hasValue = value !== null && value !== undefined && value !== "";
  const isNumeric = hasValue && typeof value === "number";

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#0F1720] transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">{label}</p>
          <div className="mt-2 text-3xl font-bold font-mono text-[#0F1720]">
            {hasValue ? (
              isNumeric ? <AnimatedNumber value={value as number} /> : value
            ) : (
              <span className="text-[#D1D5DB]">&mdash;</span>
            )}
          </div>
          {change && (
            <p className={`text-xs mt-2 font-semibold ${
              changeType === "up" ? "text-[#16A34A]" :
              changeType === "down" ? "text-[#DC2626]" :
              "text-[#9CA3AF]"
            }`}>
              {changeType === "up" && "\u2191 "}
              {changeType === "down" && "\u2193 "}
              {change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#2DD4BF] to-[#0ea5e9] shadow-[0_0_15px_rgba(45,212,191,0.3)] group-hover:shadow-[0_0_20px_rgba(45,212,191,0.5)] transition-shadow">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
