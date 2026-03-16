"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { OLNeedMeter } from "./ol-need-meter";
import { EngagementDot } from "./engagement-dot";
import { StitchBadge } from "./stitch-badge";
import { getSchoolLogo } from "@/lib/data/school-branding";

interface CoachRowProps {
  schoolId: string;
  schoolName: string;
  coachName?: string;
  division: string;
  conference: string;
  tier: string;
  olNeed: number;
  followStatus: "replied" | "sent" | "unsent" | "none";
  dmStatus: "replied" | "sent" | "unsent" | "none";
  onClick?: () => void;
  className?: string;
}

export function CoachRow({
  schoolId,
  schoolName,
  coachName,
  division,
  conference,
  tier,
  olNeed,
  followStatus,
  dmStatus,
  onClick,
  className,
}: CoachRowProps) {
  const logoPath = getSchoolLogo(schoolId);
  const tierVariant = tier === "Tier 1" ? "tier1" : tier === "Tier 2" ? "tier2" : "tier3";

  return (
    <tr
      className={cn(
        "border-b border-white/5 transition-colors hover:bg-white/[0.03]",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* School */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
            {logoPath ? (
              <Image src={logoPath} alt={schoolName} width={24} height={24} />
            ) : (
              <span className="text-xs font-bold text-white/40">
                {schoolName.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{schoolName}</p>
            {coachName && (
              <p className="text-[11px] text-white/40">{coachName}</p>
            )}
          </div>
        </div>
      </td>

      {/* Division / Conference */}
      <td className="px-4 py-3">
        <p className="text-xs text-white/50">{division}</p>
        <p className="text-[10px] text-white/30">{conference}</p>
      </td>

      {/* Tier */}
      <td className="px-4 py-3">
        <StitchBadge variant={tierVariant as "tier1" | "tier2" | "tier3"}>
          {tier}
        </StitchBadge>
      </td>

      {/* OL Need */}
      <td className="px-4 py-3">
        <OLNeedMeter level={olNeed} />
      </td>

      {/* Follow */}
      <td className="px-4 py-3">
        <EngagementDot status={followStatus} />
      </td>

      {/* DM */}
      <td className="px-4 py-3">
        <EngagementDot status={dmStatus} />
      </td>
    </tr>
  );
}
