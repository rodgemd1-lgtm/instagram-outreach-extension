// NCAA recruiting rules knowledge base
// Source: NCAA Division I Manual, current as of 2025-26 cycle

export const ncaaRules = {
  contactRules: [
    "Dead Period: No in-person contact, no official/unofficial visits. Coaches may still call, text, DM, and send mail.",
    "Quiet Period: No in-person off-campus contact. Prospects may visit campus unofficially at their own expense.",
    "Evaluation Period: Coaches may watch prospects compete or visit their schools, but no in-person off-campus contact.",
    "Contact Period: Coaches may have in-person contact with prospects on or off campus. Phone calls and electronic communication allowed.",
    "FBS programs may begin sending recruiting materials to prospects on June 15 after sophomore year.",
    "FBS coaches may begin calling/texting prospects on September 1 of junior year.",
    "Unofficial visits are allowed at any time (prospect pays own way).",
    "Official visits (school pays) are allowed starting January 1 of junior year (max 5 official visits).",
    "D2 coaches may contact prospects at any time after June 15 following sophomore year.",
    "D1 FCS follows similar rules to FBS but some conferences have more flexible contact windows.",
  ],

  recruitingCalendar: {
    "2025-06-15": "Earliest date FBS programs can send recruiting materials to Class of 2029 (after sophomore year)",
    "2025-08": "Summer evaluation period — camps and combines",
    "2025-09-01": "FBS coaches can begin calling/texting Class of 2028 juniors (Class of 2029 still restricted)",
    "2025-09-to-11": "Fall evaluation period — coaches attend high school games",
    "2025-12": "Early Signing Period for Class of 2026 (Dec 4-6, 2025)",
    "2026-01": "Contact period opens; official visits allowed for juniors (Class of 2028)",
    "2026-02-01": "National Signing Day for Class of 2026",
    "2026-04-to-05": "Spring evaluation period",
    "2026-06-15": "Materials allowed for Class of 2030; camps open for all classes",
    "2026-09-01": "FBS coaches can call/text Class of 2029 juniors (Jacob's class)",
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
        "No direct coach DMs yet (D1 FBS) — focus on visibility",
        "D2/FCS coaches may engage — respond professionally if they reach out",
      ],
    },
    {
      year: "Sophomore (2026-27)",
      phase: "Visibility & Engagement",
      actions: [
        "Post 5-7x per week with increasing film quality",
        "June 15, 2027: FBS programs can send materials — be ready",
        "Attend elite regional camps (Wisconsin, Iowa, etc.)",
        "Begin unofficial visits to target schools",
        "Engage with coach content (like, repost) to build name recognition",
        "D2/FCS coaches can now reach out — respond to all DMs within 24 hours",
        "Get NCSA profile verified and updated with sophomore film",
        "Build relationships with recruiting media and evaluation services",
      ],
    },
    {
      year: "Junior (2027-28)",
      phase: "Active Recruiting",
      actions: [
        "September 1, 2027: FBS coaches can call/text — be prepared",
        "January 2028: Official visits open (up to 5)",
        "Ramp posting to daily — heavy film content",
        "DM coaches directly at FCS and D2 programs",
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
        "Complete official visits (max 5)",
        "Early Signing Period: December 2028",
        "National Signing Day: February 2029",
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
    "DM rules vary by division. D1 FBS: Coaches cannot initiate electronic communication (including DMs) until September 1 of a prospect's junior year, but prospects can DM coaches at any time and coaches can respond. D1 FCS: Similar restrictions but some conferences allow earlier electronic contact after June 15 of sophomore year. D2: Coaches can contact prospects via any electronic means after June 15 following sophomore year. D3: No recruiting restrictions on electronic communication — coaches can DM at any time. Key strategy: For D1 FBS targets, post content that earns likes/reposts from coaches (they signal interest through clicks). For D2/FCS, initiate DMs after the contact window opens. Always be the one to reach out first when rules allow — coaches appreciate proactive recruits.",
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
