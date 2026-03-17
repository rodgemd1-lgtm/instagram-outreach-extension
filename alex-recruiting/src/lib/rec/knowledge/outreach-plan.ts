// ---------------------------------------------------------------------------
// DM Outreach Plan & Follow Campaign — March 2026
// ---------------------------------------------------------------------------
// Prioritized coach outreach by tier, with DM templates and follow schedule.
// ---------------------------------------------------------------------------

export interface OutreachTarget {
  schoolId: string;
  name: string;
  division: string;
  conference: string;
  xHandle: string;
  olNeedLevel: "high" | "medium" | "low";
  tier: 1 | 2 | 3;
  dmReady: boolean;
  dmTimelineDay: number;
  dmMessageStrategy: string;
  engagementStrategy: string;
  jacobFitNotes: string;
  status: "not_started" | "followed" | "engaging" | "dm_sent" | "dm_replied" | "conversation_active";
}

export const OUTREACH_TARGETS: OutreachTarget[] = [
  // ─── TIER 3 — DM IMMEDIATELY (D2 Coaches) ──────────────────────────────
  {
    schoolId: "minnesota-state-mankato",
    name: "Minnesota State Mankato",
    division: "D2",
    conference: "NSIC",
    xHandle: "@MNMavsFootball",
    olNeedLevel: "high",
    tier: 3,
    dmReady: true,
    dmTimelineDay: 1,
    dmMessageStrategy: "Lead with your exact profile match (285lb WI OL), Hudl link, ask about their OL development",
    engagementStrategy: "Like and reply to their recruiting posts immediately",
    jacobFitNotes: "Actively recruit Jacob's exact profile. High follow-back probability. Coaches follow 285lb Wisconsin freshmen proactively.",
    status: "not_started",
  },
  {
    schoolId: "saginaw-valley",
    name: "Saginaw Valley State",
    division: "D2",
    conference: "GLIAC",
    xHandle: "@SVSUFootball",
    olNeedLevel: "high",
    tier: 3,
    dmReady: true,
    dmTimelineDay: 1,
    dmMessageStrategy: "Introduce yourself, share Hudl link, mention Wisconsin roots, ask about OL needs",
    engagementStrategy: "Follow coaching staff, engage with their content",
    jacobFitNotes: "Strong Wisconsin feeder history. GLIAC coaches highly active on X and almost universally DM-open.",
    status: "not_started",
  },
  {
    schoolId: "michigan-tech",
    name: "Michigan Tech",
    division: "D2",
    conference: "GLIAC",
    xHandle: "@MTUFootball",
    olNeedLevel: "high",
    tier: 3,
    dmReady: true,
    dmTimelineDay: 1,
    dmMessageStrategy: "Lead with academics + athleticism, Hudl link, ask about freshman development pipeline",
    engagementStrategy: "Show interest in their program and academic focus",
    jacobFitNotes: "Academic + athletic balance. Active X recruiting staff. Jacob's size = immediate priority.",
    status: "not_started",
  },
  {
    schoolId: "ferris-state",
    name: "Ferris State",
    division: "D2",
    conference: "GLIAC",
    xHandle: "@FerrisFootball",
    olNeedLevel: "medium",
    tier: 3,
    dmReady: true,
    dmTimelineDay: 2,
    dmMessageStrategy: "Respect their program legacy (2022 national champions), share film, ask what they look for in OL freshmen",
    engagementStrategy: "Follow and engage with coaching staff posts",
    jacobFitNotes: "D2 powerhouse. Coaches follow strong freshmen proactively. Elite D2 program.",
    status: "not_started",
  },
  {
    schoolId: "winona-state",
    name: "Winona State",
    division: "D2",
    conference: "NSIC",
    xHandle: "@WinonaStateFB",
    olNeedLevel: "high",
    tier: 3,
    dmReady: true,
    dmTimelineDay: 1,
    dmMessageStrategy: "Mention Wisconsin connection, share Hudl, ask about NSIC competition level",
    engagementStrategy: "Follow staff, reply to their posts with thoughtful comments",
    jacobFitNotes: "Minnesota-based. Strong Wisconsin recruiting history. NSIC coaches very active on social.",
    status: "not_started",
  },

  // ─── TIER 2 — ENGAGE FIRST, DM LATER (FCS/MAC) ────────────────────────
  {
    schoolId: "north-dakota-state",
    name: "North Dakota State",
    division: "D1 FCS",
    conference: "Missouri Valley",
    xHandle: "@NDSUfootball",
    olNeedLevel: "high",
    tier: 2,
    dmReady: false,
    dmTimelineDay: 30,
    dmMessageStrategy: "Reference their specific recruiting posts, express genuine interest in NDSU legacy, ask about evaluation timeline",
    engagementStrategy: "Like/repost OL-focused content, reply thoughtfully to their posts, share film clips",
    jacobFitNotes: "Dynasty FCS program (9 national championships). Very active X recruiting. NDSU has recruited Pewaukee-area players.",
    status: "not_started",
  },
  {
    schoolId: "south-dakota-state",
    name: "South Dakota State",
    division: "D1 FCS",
    conference: "Missouri Valley",
    xHandle: "@GoJacksFB",
    olNeedLevel: "high",
    tier: 2,
    dmReady: false,
    dmTimelineDay: 30,
    dmMessageStrategy: "Reference their recent recruiting posts, mention Wisconsin connection, ask about freshman redshirt timeline",
    engagementStrategy: "Engage with their content heavily, share your game film, build relationship first",
    jacobFitNotes: "MVFC powerhouse. Coaches follow and DM Wisconsin freshmen. Active X recruiting.",
    status: "not_started",
  },
  {
    schoolId: "illinois-state",
    name: "Illinois State",
    division: "D1 FCS",
    conference: "Missouri Valley",
    xHandle: "@RedbirdFB",
    olNeedLevel: "medium",
    tier: 2,
    dmReady: false,
    dmTimelineDay: 30,
    dmMessageStrategy: "Personalized message mentioning their recruiting approach, your film, your interest in their program",
    engagementStrategy: "Reply to their OL-related posts, share your training progress, show genuine interest",
    jacobFitNotes: "Solid MVFC program. Active X staff. Proximate to Wisconsin. Regularly recruits Midwest OL.",
    status: "not_started",
  },
  {
    schoolId: "youngstown-state",
    name: "Youngstown State",
    division: "D1 FCS",
    conference: "Missouri Valley",
    xHandle: "@ysabordfb",
    olNeedLevel: "medium",
    tier: 2,
    dmReady: false,
    dmTimelineDay: 30,
    dmMessageStrategy: "Direct introduction with Hudl link, ask about their evaluation criteria for OL",
    engagementStrategy: "Show interest in their program, engage with coaching staff posts, share film",
    jacobFitNotes: "OL-focused program. Active on X. DM-open coaches. Strong Midwest recruiting.",
    status: "not_started",
  },
  {
    schoolId: "northern-illinois",
    name: "Northern Illinois",
    division: "D1 FBS",
    conference: "MAC",
    xHandle: "@NIU_Football",
    olNeedLevel: "high",
    tier: 2,
    dmReady: false,
    dmTimelineDay: 60,
    dmMessageStrategy: "Reference their MAC conference position, your desire to play sooner, ask about development pipeline",
    engagementStrategy: "Engage for 2-4 weeks, build familiarity, show serious interest",
    jacobFitNotes: "MAC flagship. Strong OL development. Frequently recruits Wisconsin.",
    status: "not_started",
  },
  {
    schoolId: "western-michigan",
    name: "Western Michigan",
    division: "D1 FBS",
    conference: "MAC",
    xHandle: "@WMU_Football",
    olNeedLevel: "high",
    tier: 2,
    dmReady: false,
    dmTimelineDay: 60,
    dmMessageStrategy: "Mention their OL success at your size, ask about their 2029 recruiting targets",
    engagementStrategy: "Show interest in their OL development legacy, engage with coaching content",
    jacobFitNotes: "MAC program. Active X recruiting. Strong OL development (Corey Linsley, Taylor Moton to NFL). Scouts Wisconsin actively.",
    status: "not_started",
  },
  {
    schoolId: "ball-state",
    name: "Ball State",
    division: "D1 FBS",
    conference: "MAC",
    xHandle: "@BallStateFB",
    olNeedLevel: "medium",
    tier: 2,
    dmReady: false,
    dmTimelineDay: 45,
    dmMessageStrategy: "Introduce yourself professionally, share Hudl, ask about their approach to freshman development",
    engagementStrategy: "Engage frequently, show Ball State-specific interest, reply to their posts",
    jacobFitNotes: "Smaller MAC program. Active X staff. Earlier attention to strong freshmen.",
    status: "not_started",
  },
  {
    schoolId: "central-michigan",
    name: "Central Michigan",
    division: "D1 FBS",
    conference: "MAC",
    xHandle: "@CMU_Football",
    olNeedLevel: "medium",
    tier: 2,
    dmReady: false,
    dmTimelineDay: 45,
    dmMessageStrategy: "Mention Wisconsin connection, ask about their recruiting process for freshmen",
    engagementStrategy: "Engage with CMU content, show genuine interest in their program",
    jacobFitNotes: "MAC program. Coaches active on X. Regularly recruits Wisconsin prospects.",
    status: "not_started",
  },

  // ─── TIER 1 — CONTENT ENGAGEMENT ONLY (Big Ten/Big 12) ────────────────
  {
    schoolId: "wisconsin",
    name: "University of Wisconsin",
    division: "D1 FBS",
    conference: "Big Ten",
    xHandle: "@BadgerFootball",
    olNeedLevel: "high",
    tier: 1,
    dmReady: false,
    dmTimelineDay: 548, // Sept 1, 2027 (junior year)
    dmMessageStrategy: "Reference their specific OL development pipeline, mention Wisconsin connection, ask about evaluation process",
    engagementStrategy: "Post 3-5x per week: game film, training clips, strength progress, character content. Tag @BadgerFootball occasionally.",
    jacobFitNotes: "Home state flagship. Decades-long OL tradition. Jacob's Wisconsin roots make him natural target.",
    status: "not_started",
  },
  {
    schoolId: "iowa",
    name: "Iowa",
    division: "D1 FBS",
    conference: "Big Ten",
    xHandle: "@HawkeyeFootball",
    olNeedLevel: "high",
    tier: 1,
    dmReady: false,
    dmTimelineDay: 548,
    dmMessageStrategy: "Reference their specific OL coach, mention Iowa's NFL pipeline, express genuine interest in their development system",
    engagementStrategy: "Post game film, training footage, technique breakdowns. Iowa coaches monitor X for OL talent.",
    jacobFitNotes: "OL University. Kirk Ferentz built program on elite OL. Takes 4-6 OL per class. Actively recruits Wisconsin.",
    status: "not_started",
  },
  {
    schoolId: "northwestern",
    name: "Northwestern",
    division: "D1 FBS",
    conference: "Big Ten",
    xHandle: "@NUFBFamily",
    olNeedLevel: "medium",
    tier: 1,
    dmReady: false,
    dmTimelineDay: 548,
    dmMessageStrategy: "Lead with academics, mention school balance, ask about their approach to recruiting smart OL",
    engagementStrategy: "Post game film + academic/character content. Northwestern values intelligence and character.",
    jacobFitNotes: "Academic-athletic balance. Smaller OL preference but monitors Wisconsin prospects.",
    status: "not_started",
  },
  {
    schoolId: "iowa-state",
    name: "Iowa State",
    division: "D1 FBS",
    conference: "Big 12",
    xHandle: "@CycloneFB",
    olNeedLevel: "high",
    tier: 1,
    dmReady: false,
    dmTimelineDay: 365, // Can DM sophomore year if engagement is strong
    dmMessageStrategy: "Can reach out Year 2 if coaches haven't engaged. Definitely DM junior year.",
    engagementStrategy: "Post 3-5x per week with OL film focus. Iowa State's recruiting coordinators are very active on X.",
    jacobFitNotes: "Mid-range D1. Strong OL development. Frequent Wisconsin recruiting.",
    status: "not_started",
  },
];

// ─── FOLLOW CAMPAIGN SCHEDULE ────────────────────────────────────────────
// 5 follows per day, spread across tiers

export interface FollowCampaignDay {
  day: number;
  date: string;
  targets: string[]; // schoolIds
  notes: string;
}

export const FOLLOW_CAMPAIGN: FollowCampaignDay[] = [
  {
    day: 1,
    date: "2026-03-07",
    targets: ["minnesota-state-mankato", "saginaw-valley", "michigan-tech", "winona-state", "ferris-state"],
    notes: "Tier 3 D2 schools — highest follow-back rate. DM immediately after follow-back.",
  },
  {
    day: 2,
    date: "2026-03-08",
    targets: ["north-dakota-state", "south-dakota-state", "youngstown-state", "illinois-state", "northern-illinois"],
    notes: "Tier 2 FCS + MAC schools — begin engagement period.",
  },
  {
    day: 3,
    date: "2026-03-09",
    targets: ["western-michigan", "ball-state", "central-michigan", "wisconsin", "iowa"],
    notes: "Remaining Tier 2 MAC + start Tier 1 Big Ten.",
  },
  {
    day: 4,
    date: "2026-03-10",
    targets: ["northwestern", "iowa-state"],
    notes: "Final Tier 1 schools. After this, begin following individual OL coaching staff at each school.",
  },
];

// ─── DM TEMPLATES ────────────────────────────────────────────────────────

export const DM_TEMPLATES = {
  tier3_initial: `Coach [Name],

My name is Jacob Rodgers — I'm a freshman OL/DL at Pewaukee HS in Wisconsin (6'4", 285, Class of 2029).

I've been studying film and training hard this offseason. I'd love to learn more about [School Name]'s program and what you look for in offensive linemen.

Here's my Hudl profile: [HUDL_LINK]

Thank you for your time. I'm a student of this position and always looking to improve.

Jacob Rodgers
@JacobRodge52987`,

  tier2_after_engagement: `Coach [Name],

I've really enjoyed following [School Name]'s program on here. [Reference a specific post or achievement].

My name is Jacob Rodgers — I'm a freshman two-way lineman at Pewaukee HS in Wisconsin (6'4", 285, Class of 2029). We made the state playoffs this past season.

I'd love to learn more about your program and the kind of linemen you develop. Here's my film: [HUDL_LINK]

Thank you for your time.

Jacob Rodgers`,

  tier1_junior_year: `Coach [Name],

My name is Jacob Rodgers — I'm a junior OL/DL at Pewaukee HS in Wisconsin (6'4", [UPDATED_WEIGHT], Class of 2029).

I've been following [School Name]'s program closely and have huge respect for your offensive line development. [Reference specific player or achievement].

I'm reaching out because playing at [School Name] would be a dream. Here's my updated film: [HUDL_LINK]

I'd welcome any feedback on my game and the opportunity to visit campus.

Jacob Rodgers
@JacobRodge52987`,
};

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────

export function getReadyToDM(): OutreachTarget[] {
  return OUTREACH_TARGETS.filter((t) => t.dmReady && t.status !== "dm_sent" && t.status !== "dm_replied");
}

export function getEngagementTargets(): OutreachTarget[] {
  return OUTREACH_TARGETS.filter((t) => !t.dmReady && t.tier === 2);
}

export function getContentTargets(): OutreachTarget[] {
  return OUTREACH_TARGETS.filter((t) => t.tier === 1);
}

export function getOutreachSummary(): string {
  const lines = ["OUTREACH PLAN SUMMARY\n"];

  const tiers = [
    { tier: 3, label: "TIER 3 — DM IMMEDIATELY (D2)" },
    { tier: 2, label: "TIER 2 — ENGAGE THEN DM (FCS/MAC)" },
    { tier: 1, label: "TIER 1 — CONTENT ONLY (Big Ten/Big 12)" },
  ];

  for (const { tier, label } of tiers) {
    const targets = OUTREACH_TARGETS.filter((t) => t.tier === tier);
    lines.push(`\n${label}`);
    for (const t of targets) {
      lines.push(`  ${t.name} (${t.xHandle}) — ${t.olNeedLevel} OL need — Status: ${t.status}`);
      lines.push(`    DM Day: ${t.dmTimelineDay} | Strategy: ${t.dmMessageStrategy.substring(0, 80)}`);
    }
  }

  lines.push(`\nTotal: ${OUTREACH_TARGETS.length} schools`);
  lines.push(`DM Ready Now: ${getReadyToDM().length}`);
  lines.push(`Engagement Phase: ${getEngagementTargets().length}`);
  lines.push(`Content Only: ${getContentTargets().length}`);

  return lines.join("\n");
}
