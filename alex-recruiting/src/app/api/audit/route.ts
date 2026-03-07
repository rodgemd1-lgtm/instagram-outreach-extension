import { NextResponse } from "next/server";
import { runProfileAudit, getScoreInterpretation } from "@/lib/alex/profile-audit";

export async function GET() {
  // Run audit with current state (defaults for initial setup)
  const audit = runProfileAudit({
    hasProfilePhoto: false,
    hasHeaderImage: false,
    bioHasAllElements: false,
    hasPinnedPost: false,
    pinnedPostAge: 0,
    postsLast30Days: [],
    coaches: [],
    dmsLast30Days: [],
    constitutionViolations: 0,
  });

  const interpretation = getScoreInterpretation(audit.totalScore);

  return NextResponse.json({
    audit,
    interpretation,
  });
}
