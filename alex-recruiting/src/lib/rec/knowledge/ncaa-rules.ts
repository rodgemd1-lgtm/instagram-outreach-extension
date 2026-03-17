// NCAA recruiting rules knowledge base
// Source: NCAA Division I Manual, current as of 2025-26 cycle

export const ncaaRules = {
  contactRules: [
    "Dead Period: No in-person contact, no official/unofficial visits. Coaches may still call, text, DM, and send mail.",
    "Quiet Period: No in-person off-campus contact. Prospects may visit campus unofficially at their own expense.",
    "Evaluation Period: Coaches may watch prospects compete or visit their schools, but no in-person off-campus contact.",
    "Contact Period: Coaches may have in-person contact with prospects on or off campus. Phone calls and electronic communication allowed.",
    "FBS programs may begin sending recruiting materials to prospects on June 15 after sophomore year.",
    "Football coaches at the Division I level may begin coach-initiated calls, texts and private electronic communication on June 15 after sophomore year.",
    "Unofficial visits are allowed at any time (prospect pays own way).",
    "Football official visits (school pays) are allowed starting April 1 of junior year, with one official visit per school under the current prospect-visit model.",
    "D2 coaches may contact prospects at any time after June 15 following sophomore year.",
    "D1 FCS follows similar rules to FBS but some conferences have more flexible contact windows.",
  ],

  recruitingCalendar: {
    "2025-06-to-07": "Summer camp and evaluation window. Younger prospects should gather verified measurables and film.",
    "2025-08": "Summer evaluation period — camps and combines",
    "2025-09-to-11": "Fall evaluation period — coaches attend high school games",
    "2025-12": "Early signing paperwork window for the current senior class",
    "2026-01-to-03": "Annual football contact/quiet/dead periods shift by year. Refresh against the NCAA football calendar before visit planning.",
    "2026-04-to-05": "Spring evaluation period",
    "2027-06-15": "Class of 2029 football coach-initiated calls, texts, private messages and recruiting materials open",
    "2028-04-01": "Class of 2029 football official visits open",
  },

  classOf2029Timeline: [
    {
      year: "Freshman (2025-26)",
      phase: "Foundation Building",
      actions: [
        "Build X profile with recruiting-optimized bio and header",
        "Post 3-5x per week: training clips, game film, character content",
        "Follow all 23 target school accounts and coaching staffs",
        "Create Hudl profile with freshman film",
        "Attend local camps for exposure and measurables",
        "Build follower base among peer recruits and recruiting media",
        "Athlete-initiated DMs are allowed, but meaningful FBS coach replies usually do not open until June 15 after sophomore year",
        "D2/D3 coaches may engage earlier — respond professionally if they reach out",
      ],
    },
    {
      year: "Sophomore (2026-27)",
      phase: "Visibility & Engagement",
      actions: [
        "Post 5-7x per week with increasing film quality",
        "June 15, 2027: FBS/FCS coach-initiated communication and recruiting materials open",
        "Attend elite regional camps (Wisconsin, Iowa, etc.)",
        "Begin unofficial visits to target schools",
        "Engage with coach content (like, repost) to build name recognition",
        "D2 coaches can now reach out — respond to all DMs within 24 hours",
        "Get NCSA profile verified and updated with sophomore film",
        "Build relationships with recruiting media and evaluation services",
      ],
    },
    {
      year: "Junior (2027-28)",
      phase: "Active Recruiting",
      actions: [
        "June 15 communication should already be active — keep your phone on, log every contact and reply quickly",
        "April 1, 2028: football official visits open",
        "Ramp posting to daily — heavy film content",
        "DM coaches directly at FBS, FCS and D2 programs when there is a clear reason to follow up",
        "Respond to all coach outreach within 12 hours",
        "Schedule and complete unofficial/official visits",
        "Narrow school list based on offers and fit",
        "Attend Junior Day events at target schools",
      ],
    },
    {
      year: "Senior (2028-29)",
      phase: "Decision & Commitment",
      actions: [
        "Continue daily posting through signing period",
        "Complete official visits and compare the real offer package at each school",
        "Early signing paperwork window: December 2028",
        "Traditional February signing window: February 2029",
        "Make commitment decision — announce on X",
        "Thank all coaches who recruited you (public and DM)",
        "Transition content to committed athlete mode",
        "Maintain grades for NCAA eligibility clearinghouse",
      ],
    },
  ],

  clickDontType:
    'The "Click Don\'t Type" rule: NCAA coaches at the D1 level can interact with recruit social media posts by clicking (liking, reposting, bookmarking) but CANNOT publicly type comments on a prospect\'s posts until after the prospect has committed. This means every like or repost from a college coach is a deliberate recruiting signal. Track these interactions carefully — a coach liking 3+ posts is equivalent to early interest. After commitment, coaches can comment publicly. This rule does not apply to DMs, which have their own timing rules by division.',

  dmRules:
    "DM rules vary by division. D1 FBS football: coaches may initiate private electronic communication starting June 15 after sophomore year, while prospects may always message first. D1 FCS football follows the same broad timing model. D2: coaches can contact prospects via calls, texts, DMs and email after June 15 following sophomore year. D3: no recruiting restrictions on electronic communication. Key strategy: before the football contact window opens, use content, camp attendance and athlete-initiated outreach to build familiarity; after it opens, move to personalized follow-up and fast response times.",
};

export function getKnowledgeContext(): string {
  const lines: string[] = [];

  lines.push("=== NCAA RECRUITING RULES ===\n");

  lines.push("CONTACT RULES:");
  for (const rule of ncaaRules.contactRules) {
    lines.push(`  - ${rule}`);
  }

  lines.push("\nRECRUITING CALENDAR (2025-26 FBS):");
  for (const [date, desc] of Object.entries(ncaaRules.recruitingCalendar)) {
    lines.push(`  ${date}: ${desc}`);
  }

  lines.push("\nCLASS OF 2029 TIMELINE:");
  for (const phase of ncaaRules.classOf2029Timeline) {
    lines.push(`\n  ${phase.year} — ${phase.phase}:`);
    for (const action of phase.actions) {
      lines.push(`    - ${action}`);
    }
  }

  lines.push(`\nCLICK DON'T TYPE RULE:\n  ${ncaaRules.clickDontType}`);
  lines.push(`\nDM RULES BY DIVISION:\n  ${ncaaRules.dmRules}`);

  return lines.join("\n");
}
