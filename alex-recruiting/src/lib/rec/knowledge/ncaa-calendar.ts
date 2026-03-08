// NCAA Dynamic Calendar — Period Detection & Class of 2029 Timeline Engine
// Replaces hardcoded dates with dynamic calculations based on today's date
// Source: NCAA Division I Manual, current as of 2025-26 cycle

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NCAARecruitingPeriod =
  | "contact_period"
  | "evaluation_period"
  | "quiet_period"
  | "dead_period";

export type NCAADivision = "D1 FBS" | "D1 FCS" | "D2" | "D3" | "NAIA";

export interface PeriodInfo {
  period: NCAARecruitingPeriod;
  label: string;
  description: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  rulesForProspect: string[];
  rulesForCoach: string[];
}

export interface PeriodChangeEvent {
  date: string; // ISO date
  fromPeriod: NCAARecruitingPeriod;
  toPeriod: NCAARecruitingPeriod;
  label: string;
  significance: string;
}

export interface ContactPermission {
  division: NCAADivision;
  canCoachInitiate: boolean;
  canCoachSendMaterials: boolean;
  canCoachCallText: boolean;
  canProspectContact: boolean;
  canOfficialVisit: boolean;
  nextMilestone: string;
  nextMilestoneDate: string;
  daysUntilNextMilestone: number;
}

export interface ClassOf2029Milestone {
  date: string; // ISO date
  label: string;
  description: string;
  division: NCAADivision | "all";
  actionItems: string[];
  isPast: boolean;
  daysAway: number;
}

export interface RecommendedAction {
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  deadline: string | null;
}

export interface CalendarSnapshot {
  today: string;
  currentPeriod: PeriodInfo;
  jacobClassYear: number;
  jacobCurrentGrade: string;
  nextPeriodChange: PeriodChangeEvent | null;
  contactPermissions: ContactPermission[];
  upcomingMilestones: ClassOf2029Milestone[];
  recommendedActions: RecommendedAction[];
  summary: string;
}

// ---------------------------------------------------------------------------
// Constants — Class of 2029 key dates
// ---------------------------------------------------------------------------

const CLASS_YEAR = 2029;

// Class of 2029 milestones (Jacob's class)
const CLASS_OF_2029_MILESTONES: Omit<ClassOf2029Milestone, "isPast" | "daysAway">[] = [
  // Freshman year (2025-26)
  {
    date: "2025-08-15",
    label: "Freshman season begins",
    description: "Jacob's first high school football season starts. Build Hudl profile with freshman film.",
    division: "all",
    actionItems: [
      "Create Hudl profile if not already active",
      "Record all game film for highlights",
      "Begin X posting cadence — 3-5 posts per week",
    ],
  },
  {
    date: "2026-01-01",
    label: "D3 coaches can contact (junior year rule does NOT apply to 2029 yet)",
    description: "D3 has no recruiting restrictions on electronic communication — coaches can reach out at any time. However, most D3 contact ramps up sophomore/junior year.",
    division: "D3",
    actionItems: [
      "Be prepared to respond professionally if D3 coaches reach out",
      "Research D3 programs that fit academically and athletically",
    ],
  },
  {
    date: "2026-06-01",
    label: "Freshman summer camps",
    description: "Attend regional camps for exposure, measurables verification, and networking. Coaches evaluate but cannot initiate contact for FBS.",
    division: "all",
    actionItems: [
      "Register for 3-5 summer camps (Wisconsin, Iowa, regional combines)",
      "Update measurables after camp weigh-ins",
      "Send camp follow-up emails to coaches — prospects CAN email at any time",
      "Post camp content on X with school tags",
    ],
  },

  // Sophomore year (2026-27)
  {
    date: "2026-08-15",
    label: "Sophomore season begins",
    description: "Second high school season. Film quality and stats matter more now. Coaches are watching.",
    division: "all",
    actionItems: [
      "Increase X posting to 5-7 times per week",
      "Update Hudl with new season film weekly during season",
      "Track coach engagement signals (likes, reposts) via Click Don't Type",
    ],
  },
  {
    date: "2027-01-01",
    label: "D3 contact fully open",
    description: "D3 coaches can contact Class of 2029 prospects with no restrictions. D3 programs with good fit should be in active communication.",
    division: "D3",
    actionItems: [
      "DM/email D3 coaches at schools of interest",
      "Schedule unofficial visits to D3 programs",
      "Request D3 coach feedback on film",
    ],
  },
  {
    date: "2027-06-15",
    label: "FBS can send recruiting materials",
    description: "D1 FBS programs can begin sending recruiting materials (mail, questionnaires) to Class of 2029 prospects after June 15 following sophomore year. This is a critical milestone.",
    division: "D1 FBS",
    actionItems: [
      "Ensure NCSA profile is fully updated before this date",
      "Have Hudl highlights polished and current",
      "Fill out every recruiting questionnaire that arrives",
      "Attend elite camps — coaches can now formally track you",
      "Follow up every questionnaire with a personal email to the OL coach",
    ],
  },
  {
    date: "2027-06-15",
    label: "D2 coaches can contact",
    description: "D2 coaches can initiate contact via any electronic means (DM, email, call, text) after June 15 following sophomore year.",
    division: "D2",
    actionItems: [
      "Be ready for D2 coach outreach — respond within 24 hours",
      "Proactively DM/email D2 coaches at target programs",
      "Schedule unofficial visits to top D2 programs",
    ],
  },
  {
    date: "2027-06-15",
    label: "FCS can send recruiting materials",
    description: "D1 FCS programs follow similar rules to FBS — can send materials after June 15 following sophomore year. Some conferences allow earlier electronic contact.",
    division: "D1 FCS",
    actionItems: [
      "DM FCS coaches — some conferences allow electronic contact now",
      "Attend FCS camps (NDSU, SDSU, etc.)",
      "Respond to all FCS questionnaires",
    ],
  },

  // Junior year (2027-28)
  {
    date: "2027-06-15",
    label: "FBS coaches can call and text",
    description: "D1 FBS coaches can initiate phone calls, texts and private electronic communication to Class of 2029 prospects starting June 15 after sophomore year. That is the true opening of coach-initiated football communication.",
    division: "D1 FBS",
    actionItems: [
      "Have your phone on and charged — FBS coaches will call",
      "Prepare a phone call script: polite, professional, ask good questions",
      "Keep a call log of every coach contact",
      "Schedule unofficial visits and April 1 junior-year official visits based on conversations",
      "Post daily on X — you are now fully in the recruiting spotlight",
    ],
  },
  {
    date: "2027-06-15",
    label: "FCS can call and text",
    description: "D1 FCS coaches can also initiate calls, texts and private electronic communication starting June 15 after sophomore year.",
    division: "D1 FCS",
    actionItems: [
      "Respond to all FCS calls within 24 hours",
      "Compare FCS and FBS opportunities objectively",
    ],
  },
  {
    date: "2028-04-01",
    label: "Official visits open",
    description: "Class of 2029 football prospects can take official visits (school-paid) starting April 1 of junior year. Current NCAA policy allows unlimited total official visits for prospects, but only one official visit per school unless a coaching-change exception applies.",
    division: "D1 FBS",
    actionItems: [
      "Narrow school list to 8-10 serious contenders",
      "Schedule official visits strategically — prioritize the schools most likely to offer or take a second eval",
      "Prepare campus visit questions and evaluation criteria",
      "Post visit recaps on X (without committing publicly)",
    ],
  },
  {
    date: "2028-01-01",
    label: "D3 contact — junior year ramp",
    description: "D3 coaches typically ramp up recruiting activity for juniors. January 1 of junior year is a key D3 milestone.",
    division: "D3",
    actionItems: [
      "Finalize D3 school list",
      "Schedule campus visits to top D3 targets",
    ],
  },

  // Senior year (2028-29)
  {
    date: "2028-12-04",
    label: "Early Signing Period",
    description: "Class of 2029 Early Signing Period (typically first Wednesday of December). Expect written athletics-aid or enrollment paperwork rather than the former National Letter of Intent model.",
    division: "all",
    actionItems: [
      "Make commitment decision before this date",
      "Coordinate signing announcement on X",
      "Thank all coaches who recruited you",
    ],
  },
  {
    date: "2029-02-01",
    label: "National Signing Day",
    description: "Traditional February signing window for Class of 2029. Final paperwork details should be confirmed against that cycle's athletics-aid calendar.",
    division: "all",
    actionItems: [
      "Finalize athletics-aid and enrollment paperwork if not already signed in the early period",
      "Post commitment content and gratitude",
      "Transition X profile to committed athlete mode",
    ],
  },
];

// ---------------------------------------------------------------------------
// FBS Recruiting Calendar periods for 2025-2026 academic year
// These rotate annually — this is the general pattern
// ---------------------------------------------------------------------------

interface CalendarPeriodDef {
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  period: NCAARecruitingPeriod;
  label: string;
}

// General FBS recruiting calendar pattern (approximate — exact dates shift annually)
const FBS_CALENDAR_PATTERN: CalendarPeriodDef[] = [
  { startMonth: 1, startDay: 1, endMonth: 1, endDay: 14, period: "contact_period", label: "January Contact Period" },
  { startMonth: 1, startDay: 15, endMonth: 2, endDay: 5, period: "quiet_period", label: "Late January/Early February Quiet Period" },
  { startMonth: 2, startDay: 6, endMonth: 2, endDay: 6, period: "dead_period", label: "National Signing Day Dead Period" },
  { startMonth: 2, startDay: 7, endMonth: 3, endDay: 31, period: "quiet_period", label: "Spring Quiet Period" },
  { startMonth: 4, startDay: 1, endMonth: 5, endDay: 31, period: "evaluation_period", label: "Spring Evaluation Period" },
  { startMonth: 6, startDay: 1, endMonth: 7, endDay: 31, period: "quiet_period", label: "Summer Quiet/Camp Period" },
  { startMonth: 8, startDay: 1, endMonth: 8, endDay: 31, period: "dead_period", label: "August Dead Period (preseason)" },
  { startMonth: 9, startDay: 1, endMonth: 11, endDay: 30, period: "evaluation_period", label: "Fall Evaluation Period" },
  { startMonth: 12, startDay: 1, endMonth: 12, endDay: 3, period: "contact_period", label: "Pre-Early Signing Contact Period" },
  { startMonth: 12, startDay: 4, endMonth: 12, endDay: 6, period: "dead_period", label: "Early Signing Period Dead Period" },
  { startMonth: 12, startDay: 7, endMonth: 12, endDay: 31, period: "contact_period", label: "December Contact Period" },
];

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Get the current NCAA recruiting period based on today's date.
 */
export function getCurrentPeriod(date?: Date): PeriodInfo {
  const now = date ?? new Date();
  const month = now.getMonth() + 1; // 1-indexed
  const day = now.getDate();
  const year = now.getFullYear();

  // Find matching period
  let matchedPeriod: CalendarPeriodDef | null = null;

  for (const periodDef of FBS_CALENDAR_PATTERN) {
    const afterStart =
      month > periodDef.startMonth ||
      (month === periodDef.startMonth && day >= periodDef.startDay);
    const beforeEnd =
      month < periodDef.endMonth ||
      (month === periodDef.endMonth && day <= periodDef.endDay);

    if (afterStart && beforeEnd) {
      matchedPeriod = periodDef;
      break;
    }
  }

  // Default to quiet period if no match (shouldn't happen with complete calendar)
  if (!matchedPeriod) {
    matchedPeriod = {
      startMonth: month,
      startDay: 1,
      endMonth: month,
      endDay: 28,
      period: "quiet_period",
      label: "General Period",
    };
  }

  const startDate = `${year}-${String(matchedPeriod.startMonth).padStart(2, "0")}-${String(matchedPeriod.startDay).padStart(2, "0")}`;
  const endDate = `${year}-${String(matchedPeriod.endMonth).padStart(2, "0")}-${String(matchedPeriod.endDay).padStart(2, "0")}`;

  return {
    period: matchedPeriod.period,
    label: matchedPeriod.label,
    description: getPeriodDescription(matchedPeriod.period),
    startDate,
    endDate,
    rulesForProspect: getProspectRules(matchedPeriod.period),
    rulesForCoach: getCoachRules(matchedPeriod.period),
  };
}

/**
 * Get the next period change event from today.
 */
export function getNextPeriodChange(date?: Date): PeriodChangeEvent | null {
  const now = date ?? new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Find current period index and the next one
  let currentIdx = -1;
  for (let i = 0; i < FBS_CALENDAR_PATTERN.length; i++) {
    const p = FBS_CALENDAR_PATTERN[i];
    const afterStart =
      month > p.startMonth || (month === p.startMonth && day >= p.startDay);
    const beforeEnd =
      month < p.endMonth || (month === p.endMonth && day <= p.endDay);
    if (afterStart && beforeEnd) {
      currentIdx = i;
      break;
    }
  }

  if (currentIdx === -1) return null;

  const current = FBS_CALENDAR_PATTERN[currentIdx];
  const nextIdx = (currentIdx + 1) % FBS_CALENDAR_PATTERN.length;
  const next = FBS_CALENDAR_PATTERN[nextIdx];

  const nextYear = nextIdx <= currentIdx ? year + 1 : year;
  const changeDate = `${nextYear}-${String(next.startMonth).padStart(2, "0")}-${String(next.startDay).padStart(2, "0")}`;

  return {
    date: changeDate,
    fromPeriod: current.period,
    toPeriod: next.period,
    label: `${current.label} ends, ${next.label} begins`,
    significance: getPeriodTransitionSignificance(current.period, next.period),
  };
}

/**
 * Determine whether a coach at a given division can contact Jacob on a given date.
 */
export function canCoachContact(
  division: NCAADivision,
  date?: Date
): ContactPermission {
  const now = date ?? new Date();
  const today = now.toISOString().split("T")[0];

  // Key dates for Class of 2029
  const fbsMaterialsDate = new Date("2027-06-15");
  const fbsCallTextDate = new Date("2027-06-15");
  const d2ContactDate = new Date("2027-06-15");
  const d1FootballOfficialVisitDate = new Date("2028-04-01");
  const d2OfficialVisitDate = new Date("2027-06-15");

  switch (division) {
    case "D1 FBS": {
      const canSendMaterials = now >= fbsMaterialsDate;
      const canCallText = now >= fbsCallTextDate;
      const canVisitOfficial = now >= d1FootballOfficialVisitDate;

      let nextMilestone: string;
      let nextMilestoneDate: string;
      if (!canSendMaterials) {
        nextMilestone = "FBS recruiting communication opens";
        nextMilestoneDate = "2027-06-15";
      } else if (!canVisitOfficial) {
        nextMilestone = "Official visits open";
        nextMilestoneDate = "2028-04-01";
      } else {
        nextMilestone = "Early Signing Period";
        nextMilestoneDate = "2028-12-04";
      }

      return {
        division,
        canCoachInitiate: canCallText,
        canCoachSendMaterials: canSendMaterials,
        canCoachCallText: canCallText,
        canProspectContact: true, // Prospects can always email/DM
        canOfficialVisit: canVisitOfficial,
        nextMilestone,
        nextMilestoneDate,
        daysUntilNextMilestone: daysBetween(now, new Date(nextMilestoneDate)),
      };
    }

    case "D1 FCS": {
      // FCS follows similar rules to FBS
      const canSendMaterials = now >= fbsMaterialsDate;
      const canCallText = now >= fbsCallTextDate;

      const canVisitOfficial = now >= d1FootballOfficialVisitDate;

      let nextMilestone: string;
      let nextMilestoneDate: string;
      if (!canSendMaterials) {
        nextMilestone = "FCS recruiting communication opens";
        nextMilestoneDate = "2027-06-15";
      } else if (!canVisitOfficial) {
        nextMilestone = "Official visits open";
        nextMilestoneDate = "2028-04-01";
      } else {
        nextMilestone = "Early Signing Period";
        nextMilestoneDate = "2028-12-04";
      }

      return {
        division,
        canCoachInitiate: canCallText,
        canCoachSendMaterials: canSendMaterials,
        canCoachCallText: canCallText,
        canProspectContact: true,
        canOfficialVisit: canVisitOfficial,
        nextMilestone,
        nextMilestoneDate,
        daysUntilNextMilestone: daysBetween(now, new Date(nextMilestoneDate)),
      };
    }

    case "D2": {
      const canContact = now >= d2ContactDate;

      return {
        division,
        canCoachInitiate: canContact,
        canCoachSendMaterials: canContact,
        canCoachCallText: canContact,
        canProspectContact: true,
        canOfficialVisit: now >= d2OfficialVisitDate,
        nextMilestone: canContact
          ? "Official visits available"
          : "D2 can contact (June 15 after sophomore year)",
        nextMilestoneDate: "2027-06-15",
        daysUntilNextMilestone: daysBetween(
          now,
          new Date("2027-06-15")
        ),
      };
    }

    case "D3": {
      // D3 has no recruiting restrictions on electronic communication
      return {
        division,
        canCoachInitiate: true,
        canCoachSendMaterials: true,
        canCoachCallText: true,
        canProspectContact: true,
        canOfficialVisit: true, // D3 doesn't have official visits in the same way
        nextMilestone: "No restrictions — D3 coaches can contact at any time",
        nextMilestoneDate: today,
        daysUntilNextMilestone: 0,
      };
    }

    case "NAIA": {
      // NAIA has minimal recruiting restrictions
      return {
        division,
        canCoachInitiate: true,
        canCoachSendMaterials: true,
        canCoachCallText: true,
        canProspectContact: true,
        canOfficialVisit: true,
        nextMilestone: "No restrictions — NAIA coaches can contact at any time",
        nextMilestoneDate: today,
        daysUntilNextMilestone: 0,
      };
    }
  }
}

/**
 * Get the full timeline for Class of 2029, annotated with current status.
 */
export function getTimelineForClass2029(date?: Date): ClassOf2029Milestone[] {
  const now = date ?? new Date();

  return CLASS_OF_2029_MILESTONES.map((m) => {
    const milestoneDate = new Date(m.date);
    const isPast = now >= milestoneDate;
    const daysAway = daysBetween(now, milestoneDate);

    return {
      ...m,
      isPast,
      daysAway: isPast ? -daysAway : daysAway,
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get recommended actions based on current date and Jacob's situation.
 */
export function getRecommendedActions(date?: Date): RecommendedAction[] {
  const now = date ?? new Date();
  const actions: RecommendedAction[] = [];

  const fbsPermission = canCoachContact("D1 FBS", now);
  const d3Permission = canCoachContact("D3", now);

  // Grade-specific recommendations
  const grade = getGradeForDate(now);

  if (grade === "Freshman") {
    actions.push({
      priority: "high",
      category: "Film",
      title: "Build your highlight reel",
      description:
        "You are in the foundation-building phase. Focus on getting quality game film on Hudl. Coaches watch film before they respond to any outreach.",
      deadline: null,
    });
    actions.push({
      priority: "high",
      category: "Social Media",
      title: "Post 3-5 times per week on X",
      description:
        "Build your X presence now. Post training clips, game highlights, and character content. Coaches are already monitoring social media for Class of 2029.",
      deadline: null,
    });
    actions.push({
      priority: "high",
      category: "Email Outreach",
      title: "Email coaches at D2 and D3 programs",
      description:
        "NCAA rules allow prospects to email coaches at any age. Start building relationships now with D2/D3 coaches via professional emails. Many coaches prefer email over DMs.",
      deadline: null,
    });
    actions.push({
      priority: "medium",
      category: "Camps",
      title: "Register for summer camps",
      description:
        "Attend 3-5 regional camps this summer for exposure and measurables verification. Camps are the #1 way coaches see freshmen compete in person.",
      deadline: "2026-06-01",
    });
  }

  if (grade === "Sophomore") {
    actions.push({
      priority: "high",
      category: "Outreach",
      title: "Ramp up D2/FCS email and DM outreach",
      description:
        "D2 contact window opens June 15, 2027. Start building relationships now so you are a known name when coaches can reach out.",
      deadline: "2027-06-15",
    });
    actions.push({
      priority: "high",
      category: "Film",
      title: "Update Hudl weekly during season",
      description:
        "Sophomore film is critical. Coaches evaluate your growth trajectory from freshman to sophomore year.",
      deadline: null,
    });
    actions.push({
      priority: "medium",
      category: "Visits",
      title: "Plan unofficial visits",
      description:
        "Unofficial visits are allowed at any time. Visit 3-5 target schools this year to show genuine interest.",
      deadline: null,
    });
  }

  // FBS countdown
  if (!fbsPermission.canCoachSendMaterials) {
    const months = Math.round(fbsPermission.daysUntilNextMilestone / 30);
    actions.push({
      priority: "medium",
      category: "NCAA Timeline",
      title: `${months} months until FBS contact window`,
      description: `You are ${fbsPermission.daysUntilNextMilestone} days from the FBS materials window (June 15, 2027). Focus on: building film, attending camps, growing social visibility, and emailing coaches proactively.`,
      deadline: fbsPermission.nextMilestoneDate,
    });
  }

  if (!fbsPermission.canCoachCallText && fbsPermission.canCoachSendMaterials) {
    actions.push({
      priority: "high",
      category: "NCAA Timeline",
      title: "Prepare for FBS call/text window",
      description: `FBS coaches can call/text starting ${fbsPermission.nextMilestoneDate}. Have your phone ready, prepare a call script, and keep a log of all coach contacts.`,
      deadline: fbsPermission.nextMilestoneDate,
    });
  }

  // D3 opportunity
  if (d3Permission.canCoachInitiate) {
    actions.push({
      priority: "low",
      category: "D3 Opportunity",
      title: "D3 coaches can contact you now",
      description:
        "D3 has no recruiting restrictions. If there are D3 programs that interest you, reach out directly. D3 offers strong academic environments and competitive football.",
      deadline: null,
    });
  }

  // Email outreach reminder — always applicable
  actions.push({
    priority: "high",
    category: "Email",
    title: "Prospects can email coaches at any age",
    description:
      "You do not need to wait for any contact window to email coaches. Send professional introduction emails to coaches at every level. Include your Hudl link, measurables, and a specific question about their program.",
    deadline: null,
  });

  return actions;
}

/**
 * Get a complete calendar snapshot for today.
 */
export function getCalendarSnapshot(date?: Date): CalendarSnapshot {
  const now = date ?? new Date();
  const today = now.toISOString().split("T")[0];

  const currentPeriod = getCurrentPeriod(now);
  const nextChange = getNextPeriodChange(now);
  const grade = getGradeForDate(now);
  const timeline = getTimelineForClass2029(now);
  const upcomingMilestones = timeline.filter((m) => !m.isPast).slice(0, 5);
  const recommendedActions = getRecommendedActions(now);

  const contactPermissions: ContactPermission[] = [
    canCoachContact("D1 FBS", now),
    canCoachContact("D1 FCS", now),
    canCoachContact("D2", now),
    canCoachContact("D3", now),
    canCoachContact("NAIA", now),
  ];

  // Build summary
  const fbsPerm = contactPermissions[0];
  const summary = buildSummary(grade, currentPeriod, fbsPerm, upcomingMilestones);

  return {
    today,
    currentPeriod,
    jacobClassYear: CLASS_YEAR,
    jacobCurrentGrade: grade,
    nextPeriodChange: nextChange,
    contactPermissions,
    upcomingMilestones,
    recommendedActions,
    summary,
  };
}

// ---------------------------------------------------------------------------
// Knowledge context for persona system prompt injection
// ---------------------------------------------------------------------------

export function getKnowledgeContext(date?: Date): string {
  const snapshot = getCalendarSnapshot(date);
  const lines: string[] = [];

  lines.push("=== NCAA DYNAMIC CALENDAR ===\n");
  lines.push(`Today: ${snapshot.today}`);
  lines.push(`Jacob's Grade: ${snapshot.jacobCurrentGrade} (Class of ${snapshot.jacobClassYear})`);
  lines.push(`Current Period: ${snapshot.currentPeriod.label} (${snapshot.currentPeriod.period})`);
  lines.push(`  ${snapshot.currentPeriod.description}`);

  if (snapshot.nextPeriodChange) {
    lines.push(`\nNext Period Change: ${snapshot.nextPeriodChange.date}`);
    lines.push(`  ${snapshot.nextPeriodChange.label}`);
  }

  lines.push("\nCONTACT PERMISSIONS BY DIVISION:");
  for (const perm of snapshot.contactPermissions) {
    lines.push(`  ${perm.division}:`);
    lines.push(`    Coach can initiate: ${perm.canCoachInitiate ? "YES" : "NO"}`);
    lines.push(`    Prospect can contact: ${perm.canProspectContact ? "YES" : "NO"}`);
    lines.push(`    Next: ${perm.nextMilestone} (${perm.daysUntilNextMilestone} days)`);
  }

  lines.push("\nUPCOMING MILESTONES:");
  for (const m of snapshot.upcomingMilestones) {
    lines.push(`  ${m.date}: ${m.label} (${m.daysAway} days away)`);
    lines.push(`    ${m.description}`);
  }

  lines.push("\nRECOMMENDED ACTIONS:");
  for (const a of snapshot.recommendedActions) {
    lines.push(`  [${a.priority.toUpperCase()}] ${a.title}`);
    lines.push(`    ${a.description}`);
  }

  lines.push(`\nSUMMARY: ${snapshot.summary}`);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs(b.getTime() - a.getTime()) / msPerDay);
}

function getGradeForDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-indexed

  // Class of 2029 graduates spring 2029
  // Academic year starts in August
  // 2025-26: Freshman
  // 2026-27: Sophomore
  // 2027-28: Junior
  // 2028-29: Senior

  if (year < 2025 || (year === 2025 && month < 8)) return "8th Grade";
  if (year < 2026 || (year === 2026 && month < 8)) return "Freshman";
  if (year < 2027 || (year === 2027 && month < 8)) return "Sophomore";
  if (year < 2028 || (year === 2028 && month < 8)) return "Junior";
  if (year < 2029 || (year === 2029 && month < 6)) return "Senior";
  return "Graduated";
}

function getPeriodDescription(period: NCAARecruitingPeriod): string {
  switch (period) {
    case "contact_period":
      return "Coaches may have in-person contact with prospects on or off campus. Phone calls and electronic communication are allowed. Most permissive period.";
    case "evaluation_period":
      return "Coaches may watch prospects compete or visit their schools, but cannot have in-person off-campus contact with prospects or their families.";
    case "quiet_period":
      return "No in-person off-campus contact. Prospects may visit campus unofficially at their own expense. Coaches can still call, text, DM, and send mail.";
    case "dead_period":
      return "No in-person contact of any kind. No official or unofficial visits. Coaches may still call, text, DM, and send mail electronically.";
  }
}

function getProspectRules(period: NCAARecruitingPeriod): string[] {
  const base = [
    "You can email coaches at any time regardless of period",
    "You can DM coaches at any time, but coach responses still depend on division and class-year contact rules",
    "You can post content on X at any time",
  ];

  switch (period) {
    case "contact_period":
      return [...base, "You can meet with coaches in person on or off campus"];
    case "evaluation_period":
      return [
        ...base,
        "Coaches may attend your games or visit your school",
        "No in-person off-campus meetings with coaches",
      ];
    case "quiet_period":
      return [
        ...base,
        "You can take unofficial visits (at your own expense)",
        "No in-person off-campus meetings with coaches",
      ];
    case "dead_period":
      return [
        ...base,
        "No in-person contact with coaches — focus on electronic outreach",
        "No campus visits during dead periods",
      ];
  }
}

function getCoachRules(period: NCAARecruitingPeriod): string[] {
  switch (period) {
    case "contact_period":
      return [
        "Can have in-person contact on or off campus",
        "Can make phone calls and send texts (if contact window is open for the prospect's class)",
        "Can send electronic communication",
        "Can host official and unofficial visits",
      ];
    case "evaluation_period":
      return [
        "Can watch prospects compete (games, camps, combines)",
        "Can visit prospect's high school",
        "Cannot have in-person off-campus contact",
        "Can still call, text, DM, and email",
      ];
    case "quiet_period":
      return [
        "No in-person off-campus contact",
        "Can host unofficial visits on campus",
        "Can call, text, DM, and email",
        "Can send recruiting materials",
      ];
    case "dead_period":
      return [
        "No in-person contact of any kind",
        "Cannot host visits (official or unofficial)",
        "Can still call, text, DM, and email",
        "Typically lasts a few days around signing periods",
      ];
  }
}

function getPeriodTransitionSignificance(
  from: NCAARecruitingPeriod,
  to: NCAARecruitingPeriod
): string {
  if (from === "dead_period" && to === "contact_period") {
    return "Dead period ending — contact period opens. Coaches can meet prospects in person again. Expect increased outreach activity.";
  }
  if (to === "evaluation_period") {
    return "Evaluation period beginning — coaches will attend high school games and camps. Prioritize performing well in competition.";
  }
  if (to === "dead_period") {
    return "Dead period approaching — no in-person contact allowed. Focus on electronic outreach (email, DM) during this window.";
  }
  if (to === "quiet_period") {
    return "Quiet period beginning — no off-campus contact, but unofficial campus visits are allowed. Good time to visit schools.";
  }
  return "Period transition — review the new period's rules and adjust outreach strategy accordingly.";
}

function buildSummary(
  grade: string,
  period: PeriodInfo,
  fbsPerm: ContactPermission,
  upcomingMilestones: ClassOf2029Milestone[]
): string {
  const parts: string[] = [];

  parts.push(
    `Jacob is currently a ${grade} (Class of ${CLASS_YEAR}).`
  );
  parts.push(
    `The current NCAA recruiting period is: ${period.label} (${period.period}).`
  );

  if (!fbsPerm.canCoachInitiate) {
    parts.push(
      `D1 FBS coaches CANNOT initiate contact yet. The next milestone is "${fbsPerm.nextMilestone}" in ${fbsPerm.daysUntilNextMilestone} days (${fbsPerm.nextMilestoneDate}).`
    );
  } else {
    parts.push(
      `D1 FBS coaches CAN initiate contact. Active recruiting is in full swing.`
    );
  }

  parts.push(
    `Prospects CAN email and DM coaches at any time — this is Jacob's primary outreach channel right now.`
  );

  if (upcomingMilestones.length > 0) {
    const next = upcomingMilestones[0];
    parts.push(
      `Next milestone: "${next.label}" on ${next.date} (${next.daysAway} days away).`
    );
  }

  return parts.join(" ");
}
