import type { DMMessage, Coach } from "../types";
import { dmTemplates, fillTemplate } from "../data/templates";
import { jacobProfile } from "../data/jacob-profile";

export type DMTemplateType = keyof typeof dmTemplates;

export function generateDM(
  coach: Pick<Coach, "name" | "schoolName">,
  templateType: DMTemplateType,
  extraVars?: Record<string, string>
): string {
  const template = dmTemplates[templateType];
  const lastName = coach.name.split(" ").pop() || coach.name;

  const vars: Record<string, string> = {
    COACH_LAST_NAME: lastName,
    SCHOOL_NAME: coach.schoolName,
    NCSA_LINK: jacobProfile.ncsaProfileUrl || "[NCSA LINK]",
    CAMP_NAME: extraVars?.campName || extraVars?.CAMP_NAME || "Elite Prospects Camp",
    ...extraVars,
  };

  return fillTemplate(template.template, vars);
}

export function createDMRecord(
  coach: Pick<Coach, "id" | "name" | "schoolName">,
  templateType: DMTemplateType,
  content: string
): Omit<DMMessage, "id"> {
  return {
    coachId: coach.id,
    coachName: coach.name,
    schoolName: coach.schoolName,
    templateType,
    content,
    status: "drafted",
    sentAt: null,
    respondedAt: null,
    responseContent: null,
    createdAt: new Date().toISOString(),
  };
}

// Get DM wave recommendations based on timeline
export function getDMWaveRecommendations(
  coaches: Coach[],
  daysSinceProfileLive: number
): {
  wave: string;
  coaches: Coach[];
  templateType: DMTemplateType;
  reason: string;
}[] {
  const waves: ReturnType<typeof getDMWaveRecommendations> = [];

  // Wave 0: Immediate (Day 1) — Tier 3 D2/GLIAC/NSIC coaches
  const tier3 = coaches.filter(
    (c) => c.priorityTier === "Tier 3" && c.dmStatus === "not_sent"
  );
  if (tier3.length > 0 && daysSinceProfileLive >= 0) {
    waves.push({
      wave: "Wave 0 — Immediate",
      coaches: tier3,
      templateType: "intro",
      reason: "D2/GLIAC/NSIC coaches actively recruit on X, have open DMs, and respond to freshmen",
    });
  }

  // Wave 1: Day 30 — Tier 2 FCS coaches
  const tier2FCS = coaches.filter(
    (c) => c.priorityTier === "Tier 2" && c.division === "D1 FCS" && c.dmStatus === "not_sent"
  );
  if (tier2FCS.length > 0 && daysSinceProfileLive >= 30) {
    waves.push({
      wave: "Wave 1 — Day 30",
      coaches: tier2FCS,
      templateType: "intro",
      reason: "FCS coaches (MVFC) are active on X and follow Wisconsin freshmen with film",
    });
  }

  // Wave 2: Day 60 — Tier 2 MAC coaches
  const tier2MAC = coaches.filter(
    (c) => c.priorityTier === "Tier 2" && c.conference === "MAC" && c.dmStatus === "not_sent"
  );
  if (tier2MAC.length > 0 && daysSinceProfileLive >= 60) {
    waves.push({
      wave: "Wave 2 — Day 60",
      coaches: tier2MAC,
      templateType: "intro",
      reason: "MAC programs need big Wisconsin OL; coaches are active on X",
    });
  }

  // Wave 3: Day 90 — Tier 2 remaining
  const tier2Remaining = coaches.filter(
    (c) => c.priorityTier === "Tier 2" && c.dmStatus === "not_sent" && !tier2FCS.includes(c) && !tier2MAC.includes(c)
  );
  if (tier2Remaining.length > 0 && daysSinceProfileLive >= 90) {
    waves.push({
      wave: "Wave 3 — Day 90",
      coaches: tier2Remaining,
      templateType: "intro",
      reason: "Remaining Tier 2 programs after 90 days of profile activity",
    });
  }

  return waves;
}

export function getAvailableTemplates(): { key: DMTemplateType; name: string; useCase: string }[] {
  return Object.entries(dmTemplates).map(([key, value]) => ({
    key: key as DMTemplateType,
    name: value.name,
    useCase: value.useCase,
  }));
}
