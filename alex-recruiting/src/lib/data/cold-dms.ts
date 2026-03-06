// Cold DM Library — 30+ DM templates organized into multi-step sequences

export type DMSequence = "initial" | "follow_up_1" | "follow_up_2" | "follow_up_3" | "trigger" | "relationship";
export type DMTier = "Tier 1" | "Tier 2" | "Tier 3" | "all";

export interface ColdDM {
  id: string;
  name: string;
  template: string;
  sequence: DMSequence;
  tier: DMTier;
  trigger: string;
  daysSinceLast: number;
}

export const coldDMLibrary: ColdDM[] = [
  // ─── INITIAL OUTREACH (8+) ──────────────────────────────────────
  {
    id: "init-001",
    name: "Tier 1 — Respectful Introduction",
    template: `Coach {COACH_LAST_NAME}, my name is Jacob Rogers. I'm a Class of 2028 OL from Pewaukee High School in Wisconsin (6'4", 285 lbs). I have tremendous respect for {SCHOOL_NAME} and the way your program develops offensive linemen. I'd be honored to be on your radar. Here's my NCSA profile with updated film: {NCSA_LINK}. Thank you for your time, Coach.`,
    sequence: "initial",
    tier: "Tier 1",
    trigger: "First contact with a Power 4 / top-tier program coach",
    daysSinceLast: 0,
  },
  {
    id: "init-002",
    name: "Tier 1 — Program-Specific Interest",
    template: `Coach {COACH_LAST_NAME}, I'm Jacob Rogers, a 2028 OL (6'4", 285) from Pewaukee HS in Wisconsin. I've been following {SCHOOL_NAME} closely and I'm impressed by {SPECIFIC_DETAIL}. Training at @IMGAcademy and working to be the best OL in my class. I'd love to be considered as a recruit. Full film: {NCSA_LINK}. Thank you, Coach.`,
    sequence: "initial",
    tier: "Tier 1",
    trigger: "First contact when you have specific knowledge about the program",
    daysSinceLast: 0,
  },
  {
    id: "init-003",
    name: "Tier 2 — Confident Introduction",
    template: `Coach {COACH_LAST_NAME}, I'm Jacob Rogers — 2028 OL, 6'4" 285, from Pewaukee HS in Wisconsin. I train at @IMGAcademy and I'm represented by NCSA. {SCHOOL_NAME} is a program I'm very interested in, and I think my physical profile and work ethic fit what you're building. Here's my updated film: {NCSA_LINK}. Would love to connect, Coach.`,
    sequence: "initial",
    tier: "Tier 2",
    trigger: "First contact with a mid-tier program coach",
    daysSinceLast: 0,
  },
  {
    id: "init-004",
    name: "Tier 2 — Value Proposition",
    template: `Coach {COACH_LAST_NAME}, Jacob Rogers here — Class of 2028 OL from Pewaukee, WI. 6'4", 285 lbs with three years of growth ahead. I train at @IMGAcademy and I'm looking for a program where I can develop and compete. {SCHOOL_NAME} is high on my list. Film: {NCSA_LINK}. I'd love to hear about what you look for in your OL, Coach.`,
    sequence: "initial",
    tier: "Tier 2",
    trigger: "First contact emphasizing development opportunity",
    daysSinceLast: 0,
  },
  {
    id: "init-005",
    name: "Tier 3 — Direct and Ready",
    template: `Coach {COACH_LAST_NAME}, I'm Jacob Rogers, a 2028 OL (6'4", 285) from Pewaukee HS, Wisconsin. I'm actively looking at programs and {SCHOOL_NAME} is one I'm excited about. I train at IMG Academy and take my development seriously. Here's my film: {NCSA_LINK}. I'd love to set up a time to talk about the program and visit campus. Thank you, Coach.`,
    sequence: "initial",
    tier: "Tier 3",
    trigger: "First contact with a program where Jacob has a strong chance",
    daysSinceLast: 0,
  },
  {
    id: "init-006",
    name: "Tier 3 — Visit Request",
    template: `Coach {COACH_LAST_NAME}, my name is Jacob Rogers — 2028 OL, 6'4" 285, Pewaukee HS, Wisconsin. I've done my research on {SCHOOL_NAME} and I believe it could be a great fit for me both academically and athletically. I'd love to schedule a campus visit and meet with the coaching staff. My film: {NCSA_LINK}. Looking forward to connecting, Coach.`,
    sequence: "initial",
    tier: "Tier 3",
    trigger: "First contact when ready to schedule a visit",
    daysSinceLast: 0,
  },
  {
    id: "init-007",
    name: "All Tiers — NCSA Referral",
    template: `Coach {COACH_LAST_NAME}, I'm Jacob Rogers, a Class of 2028 OL from Pewaukee HS, Wisconsin (6'4", 285). My NCSA recruiting advisor suggested I reach out to {SCHOOL_NAME} based on my profile and your program's recruiting needs. I'd love to be on your board. Here's my full profile: {NCSA_LINK}. Thank you for your time, Coach.`,
    sequence: "initial",
    tier: "all",
    trigger: "When NCSA has identified the school as a match",
    daysSinceLast: 0,
  },
  {
    id: "init-008",
    name: "All Tiers — Film-Forward Introduction",
    template: `Coach {COACH_LAST_NAME}, I'll keep this short — I'm Jacob Rogers, 2028 OL, 6'4" 285, Pewaukee HS, Wisconsin. I'd rather let my film do the talking: {NCSA_LINK}. I train at @IMGAcademy and I'm working every day to be the best OL in my class. I'd be grateful for a chance to be on your radar at {SCHOOL_NAME}. Thank you, Coach.`,
    sequence: "initial",
    tier: "all",
    trigger: "First contact with any coach — film-first approach",
    daysSinceLast: 0,
  },

  // ─── FOLLOW-UP SEQUENCES (8+) ────────────────────────────────────
  {
    id: "fu1-001",
    name: "Follow-Up 1 — Film Update",
    template: `Coach {COACH_LAST_NAME}, I reached out a few weeks ago and wanted to follow up with some updated film. I've been working on my pass protection technique and footwork — the improvement is showing up on film. Here's the latest: {NCSA_LINK}. I'm Jacob Rogers, 2028 OL, 6'4" 285, Pewaukee HS, WI. Still very interested in {SCHOOL_NAME}. Thank you, Coach.`,
    sequence: "follow_up_1",
    tier: "all",
    trigger: "14-21 days after initial DM with no response",
    daysSinceLast: 14,
  },
  {
    id: "fu1-002",
    name: "Follow-Up 1 — Season Update",
    template: `Coach {COACH_LAST_NAME}, wanted to give you a quick season update. I'm Jacob Rogers, 2028 OL from Pewaukee HS, WI — we reached out earlier this year. Our team is {SEASON_RECORD} and I've been starting at {POSITION}. Updated film on my profile: {NCSA_LINK}. {SCHOOL_NAME} remains a top program for me. Hope to connect, Coach.`,
    sequence: "follow_up_1",
    tier: "all",
    trigger: "During the season after initial outreach with no response",
    daysSinceLast: 21,
  },
  {
    id: "fu1-003",
    name: "Follow-Up 1 — Achievement Mention",
    template: `Coach {COACH_LAST_NAME}, following up from my earlier message. I recently {ACHIEVEMENT} and wanted to share the update. I'm Jacob Rogers, 2028 OL (6'4", 285) from Pewaukee, WI. Still very interested in {SCHOOL_NAME} and what you're building. Updated profile: {NCSA_LINK}. Thank you for your time, Coach.`,
    sequence: "follow_up_1",
    tier: "all",
    trigger: "After a notable achievement (PR, award, camp performance)",
    daysSinceLast: 14,
  },
  {
    id: "fu2-001",
    name: "Follow-Up 2 — Brief Check-In",
    template: `Coach {COACH_LAST_NAME}, just a quick check-in. Jacob Rogers here — 2028 OL, 6'4" 285, Pewaukee HS, WI. Continuing to train hard at @IMGAcademy and my film is getting better each week. I respect how busy recruiting season is, but I wanted to stay on your radar for {SCHOOL_NAME}. Latest film: {NCSA_LINK}. Thank you, Coach.`,
    sequence: "follow_up_2",
    tier: "all",
    trigger: "14-21 days after first follow-up with no response",
    daysSinceLast: 14,
  },
  {
    id: "fu2-002",
    name: "Follow-Up 2 — Camp/Event Mention",
    template: `Coach {COACH_LAST_NAME}, I just competed at {CAMP_NAME} and wanted to reach out again. The camp coaches had great feedback on my technique and I'm continuing to develop every week. I'm Jacob Rogers, 2028 OL from Pewaukee, WI. Would love to connect about {SCHOOL_NAME} when you have a moment. Film: {NCSA_LINK}.`,
    sequence: "follow_up_2",
    tier: "all",
    trigger: "After a camp/showcase — 2nd follow-up attempt",
    daysSinceLast: 14,
  },
  {
    id: "fu3-001",
    name: "Follow-Up 3 — Final Respectful Touch",
    template: `Coach {COACH_LAST_NAME}, I know recruiting is incredibly busy and I want to be respectful of your time. I'm Jacob Rogers, 2028 OL (6'4", 285) from Pewaukee, WI. I've reached out a few times because {SCHOOL_NAME} is genuinely a program I admire. If there's ever interest in connecting, my door is always open. Updated film: {NCSA_LINK}. Thank you, Coach, and best of luck this season.`,
    sequence: "follow_up_3",
    tier: "Tier 1",
    trigger: "Final follow-up for Tier 1 schools — respectful close",
    daysSinceLast: 30,
  },
  {
    id: "fu3-002",
    name: "Follow-Up 3 — Growth Update",
    template: `Coach {COACH_LAST_NAME}, Jacob Rogers here with an update. Since my last message, I've {GROWTH_UPDATE}. I'm now {UPDATED_STATS}. My film continues to improve and I'm training year-round at @IMGAcademy. If there's ever a chance to connect about {SCHOOL_NAME}, I'm ready. Latest film: {NCSA_LINK}. Appreciate your time, Coach.`,
    sequence: "follow_up_3",
    tier: "all",
    trigger: "Final follow-up after significant physical/skill growth",
    daysSinceLast: 30,
  },
  {
    id: "fu3-003",
    name: "Follow-Up 3 — Tier 2/3 Direct",
    template: `Coach {COACH_LAST_NAME}, reaching out one more time. I'm Jacob Rogers, 2028 OL (6'4", 285) from Pewaukee, WI. I'm very interested in {SCHOOL_NAME} and I believe my skill set and physical profile are a strong match for what you're building. I'd love a chance to visit campus or get on a call. My profile: {NCSA_LINK}. Thank you, Coach.`,
    sequence: "follow_up_3",
    tier: "Tier 3",
    trigger: "Final follow-up for lower-tier schools — more direct",
    daysSinceLast: 21,
  },

  // ─── TRIGGER-BASED DMs (8+) ──────────────────────────────────────
  {
    id: "trig-001",
    name: "After Coach Follows Jacob",
    template: `Coach {COACH_LAST_NAME}, thank you for the follow! I've had {SCHOOL_NAME} on my radar for a while — I really admire what you're building there. I'm Jacob Rogers, 2028 OL, 6'4" 285, from Pewaukee HS in Wisconsin. I train at @IMGAcademy and would love the opportunity to learn more about {SCHOOL_NAME}. Full film: {NCSA_LINK}. Thank you, Coach!`,
    sequence: "trigger",
    tier: "all",
    trigger: "Coach follows Jacob on X",
    daysSinceLast: 0,
  },
  {
    id: "trig-002",
    name: "After Coach Likes a Post",
    template: `Coach {COACH_LAST_NAME}, I noticed you liked my recent post — thank you! That means a lot coming from a coach at {SCHOOL_NAME}. I'm Jacob Rogers, 2028 OL (6'4", 285) from Pewaukee, WI. I'd love to learn more about your program and share my updated film: {NCSA_LINK}. Appreciate the support, Coach.`,
    sequence: "trigger",
    tier: "all",
    trigger: "Coach likes or engages with Jacob's post",
    daysSinceLast: 0,
  },
  {
    id: "trig-003",
    name: "After Camp Performance",
    template: `Coach {COACH_LAST_NAME}, just got back from {CAMP_NAME} where I competed in OL vs. DL one-on-ones and technique sessions. I received great feedback on my {SKILL_AREA}. I'm Jacob Rogers, 2028 OL, 6'4" 285 from Pewaukee, WI. Wanted to make sure I'm on your radar at {SCHOOL_NAME}. Updated film: {NCSA_LINK}. Thank you, Coach!`,
    sequence: "trigger",
    tier: "all",
    trigger: "Within 48 hours of attending a camp or showcase",
    daysSinceLast: 0,
  },
  {
    id: "trig-004",
    name: "After Season Milestone",
    template: `Coach {COACH_LAST_NAME}, wanted to share an update — {MILESTONE_DETAIL}. The hard work is paying off and I'm continuing to develop every week. I'm Jacob Rogers, 2028 OL (6'4", 285) from Pewaukee HS, WI. {SCHOOL_NAME} is a program I'm very interested in. Latest film: {NCSA_LINK}. Thank you, Coach.`,
    sequence: "trigger",
    tier: "all",
    trigger: "After a notable milestone (award, PR, ranking, all-conference)",
    daysSinceLast: 0,
  },
  {
    id: "trig-005",
    name: "After Offer from Similar School",
    template: `Coach {COACH_LAST_NAME}, I'm excited to share that I recently received an offer from {OFFERING_SCHOOL}. As I continue to evaluate my options, {SCHOOL_NAME} is a program I have a lot of interest in. I'm Jacob Rogers, 2028 OL (6'4", 285) from Pewaukee, WI. I'd love to connect and learn more. Film: {NCSA_LINK}. Thank you, Coach.`,
    sequence: "trigger",
    tier: "all",
    trigger: "After receiving an offer from a comparable program",
    daysSinceLast: 0,
  },
  {
    id: "trig-006",
    name: "After Coach Posts About OL Need",
    template: `Coach {COACH_LAST_NAME}, I saw your post about building the OL for the future. I'm Jacob Rogers, a 2028 OL (6'4", 285) from Pewaukee HS, Wisconsin. I train at @IMGAcademy and I'm focused on becoming the best OL in my class. I'd love to be part of what you're building at {SCHOOL_NAME}. Here's my film: {NCSA_LINK}. Thank you, Coach.`,
    sequence: "trigger",
    tier: "all",
    trigger: "When a coach posts about needing OL recruits or building the trenches",
    daysSinceLast: 0,
  },
  {
    id: "trig-007",
    name: "After School Visit",
    template: `Coach {COACH_LAST_NAME}, thank you for the visit to {SCHOOL_NAME} today. The facilities, coaching staff, and culture were all impressive. I left campus even more excited about the possibility of being part of the program. I'm going to continue working hard and staying in touch. Updated film: {NCSA_LINK}. Thank you again, Coach.`,
    sequence: "trigger",
    tier: "all",
    trigger: "Within 24 hours of visiting a campus",
    daysSinceLast: 0,
  },
  {
    id: "trig-008",
    name: "After Coach's Team Wins Big Game",
    template: `Coach {COACH_LAST_NAME}, congrats on the big win this weekend! The OL play was outstanding — you can tell that group is well-coached. I'm Jacob Rogers, 2028 OL (6'4", 285) from Pewaukee, WI. Watching your program win like that makes me even more interested in {SCHOOL_NAME}. My film: {NCSA_LINK}. Great stuff, Coach.`,
    sequence: "trigger",
    tier: "all",
    trigger: "After the coach's team wins an important game",
    daysSinceLast: 0,
  },

  // ─── RELATIONSHIP BUILDING (6+) ──────────────────────────────────
  {
    id: "rel-001",
    name: "Casual Season Check-In",
    template: `Coach {COACH_LAST_NAME}, hope the season is going well for {SCHOOL_NAME}! I've been following along and the team looks great. Quick update on my end — we're {SEASON_RECORD} at Pewaukee and I'm continuing to improve every week. Updated film: {NCSA_LINK}. Go {MASCOT}!`,
    sequence: "relationship",
    tier: "all",
    trigger: "Mid-season check-in with a coach you've already contacted",
    daysSinceLast: 30,
  },
  {
    id: "rel-002",
    name: "Off-Season Training Update",
    template: `Coach {COACH_LAST_NAME}, hope the off-season is going well. Just wanted to check in — I've been training hard at @IMGAcademy this off-season and my numbers are all going up. {TRAINING_UPDATE}. Looking forward to the upcoming season and staying in touch. Film: {NCSA_LINK}.`,
    sequence: "relationship",
    tier: "all",
    trigger: "Off-season update to maintain relationship",
    daysSinceLast: 45,
  },
  {
    id: "rel-003",
    name: "Film Share — New Highlights",
    template: `Coach {COACH_LAST_NAME}, I just uploaded new film from {CONTEXT} to my NCSA profile. Wanted to make sure you got to see the latest. I'm really proud of the growth since we last connected. Check it out: {NCSA_LINK}. Always looking for feedback. Thank you, Coach.`,
    sequence: "relationship",
    tier: "all",
    trigger: "When new film is uploaded — share with coaches in pipeline",
    daysSinceLast: 30,
  },
  {
    id: "rel-004",
    name: "Camp Invite",
    template: `Coach {COACH_LAST_NAME}, I see {SCHOOL_NAME} has a camp coming up on {CAMP_DATE}. I'd love to attend and compete in front of your coaching staff. Is there still availability? I'm Jacob Rogers, 2028 OL (6'4", 285) from Pewaukee, WI. Looking forward to the opportunity. Thank you, Coach.`,
    sequence: "relationship",
    tier: "all",
    trigger: "When a target school announces a camp or prospect day",
    daysSinceLast: 0,
  },
  {
    id: "rel-005",
    name: "Academic Interest",
    template: `Coach {COACH_LAST_NAME}, I've been researching {SCHOOL_NAME}'s academic programs and I'm really interested in {ACADEMIC_PROGRAM}. The combination of strong academics and the football program you're building is exactly what I'm looking for. Would love to talk more about the student-athlete experience at {SCHOOL_NAME}. Thank you, Coach.`,
    sequence: "relationship",
    tier: "all",
    trigger: "When you've researched the school's academics — shows genuine interest",
    daysSinceLast: 30,
  },
  {
    id: "rel-006",
    name: "End of Season Wrap-Up",
    template: `Coach {COACH_LAST_NAME}, our season just wrapped up and I wanted to share my end-of-year update. We finished {SEASON_RECORD} and I {SEASON_HIGHLIGHTS}. Already back in the gym preparing for next year. Updated film and stats on my profile: {NCSA_LINK}. Looking forward to staying in touch and continuing to develop. Thank you, Coach.`,
    sequence: "relationship",
    tier: "all",
    trigger: "End of season — summary update to all coaches in pipeline",
    daysSinceLast: 0,
  },
  {
    id: "rel-007",
    name: "Congratulate Coach on Award/Achievement",
    template: `Coach {COACH_LAST_NAME}, congratulations on {COACH_ACHIEVEMENT}! Well deserved. It's clear the work you put into your players and program is paying off. I'm continuing to work toward my goal of playing at the next level and {SCHOOL_NAME} remains a program I'm very interested in. Thank you for the inspiration, Coach.`,
    sequence: "relationship",
    tier: "all",
    trigger: "When a coach receives an award, extension, or recognition",
    daysSinceLast: 0,
  },
];

// ─── Helper Functions ───────────────────────────────────────────────

export function getDMsBySequence(sequence: DMSequence): ColdDM[] {
  return coldDMLibrary.filter((dm) => dm.sequence === sequence);
}

export function getDMsByTier(tier: DMTier): ColdDM[] {
  return coldDMLibrary.filter((dm) => dm.tier === tier || dm.tier === "all");
}

export function getInitialDMs(tier: DMTier): ColdDM[] {
  return coldDMLibrary.filter(
    (dm) => dm.sequence === "initial" && (dm.tier === tier || dm.tier === "all")
  );
}

export function getFollowUpSequence(): ColdDM[] {
  return coldDMLibrary.filter((dm) =>
    dm.sequence === "follow_up_1" ||
    dm.sequence === "follow_up_2" ||
    dm.sequence === "follow_up_3"
  );
}

export function getTriggerDMs(): ColdDM[] {
  return coldDMLibrary.filter((dm) => dm.sequence === "trigger");
}

export function fillDMTemplate(template: string, vars: Record<string, string>): string {
  let filled = template;
  for (const [key, value] of Object.entries(vars)) {
    filled = filled.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return filled;
}
