// X/Twitter playbook for college football recruiting
// Best practices for building visibility with college coaches on X

export const xPlaybook = {
  profileOptimization: {
    handle:
      "Use real name + position + class year. Format: @FirstLastPosition##. Example: @JacobRodgersOL29. Avoid numbers that aren't class year. Keep it professional — no memes, jokes, or slang in handle. This is what coaches see first.",
    bio: "Line 1: Position | Class of 20XX | School, State. Line 2: Height/Weight/GPA (if 3.0+). Line 3: Hudl or recruiting link. If contact is needed, use a parent/recruiting email or website instead of 'DMs open.' Use relevant emojis sparingly. Include school-specific hashtag only if committed. Max 160 characters — every word must earn its spot.",
    headerImage:
      "Action shot in game uniform preferred. Must be high-resolution (1500x500px minimum). Include name, position, class year, school, and measurables as text overlay. Update seasonally with new film stills. Avoid generic stock photos or motivational quotes.",
    pinnedPost:
      "Pin your best highlight reel or most impressive game film clip. Update this every time you have new top-tier content. The pinned post is the first thing a coach sees after your bio. It should answer: 'Can this kid play?' Include measurables in the caption. Tag relevant schools/coaches.",
    profilePhoto:
      "Professional headshot in school uniform or clean athletic photo. Face clearly visible, good lighting. Not a group photo, not a cartoon/avatar, not a selfie. Coaches need to see your face and associate it with your name. Update annually.",
  },

  postingCadence: {
    minimumPerWeek: 4,
    bestDays: ["Tuesday", "Wednesday", "Thursday", "Saturday", "Sunday"],
    bestTimes: [
      "6:00-7:30 AM CT (coaches check feeds before morning meetings)",
      "12:00-1:00 PM CT (lunch break engagement)",
      "7:00-9:00 PM CT (evening film review — coaches browse X while reviewing film)",
    ],
    contentMix: {
      trainingFilm: "40% — Weight room clips, agility work, technique drills. Show the work ethic.",
      gameFilm: "30% — Game highlights, key plays, drive breakdowns. This is the proof.",
      character:
        "15% — Community service, academic achievements, team leadership. Coaches recruit people, not just players.",
      engagement:
        "10% — Reposts of target school content, congratulations to teammates, camp recaps.",
      personal: "5% — Appropriate personal content that shows personality and maturity.",
    },
  },

  dmStrategy: {
    etiquette: [
      "Always introduce yourself: name, position, class year, school, state",
      "Keep first DM under 100 words — coaches scan, they don't read novels",
      "Include your Hudl link in every initial DM",
      "Never mass-DM the same message — personalize for each school",
      "Reference something specific about the program: recent game, coaching philosophy, OL tradition",
      "End with a clear ask: visit, camp invite, film review request",
      "Follow up once after 7 days if no response. Never follow up more than twice.",
      "Time DMs for Tuesday-Thursday, 9 AM - 4 PM CT (business hours)",
      "Never DM during games, recruiting dead periods, or late at night",
      "If a coach responds, reply within 12 hours — always",
    ],
    templateStructure: {
      opening: "Coach [LastName], my name is [Name] — [Position], Class of [Year], [School], [State].",
      hook: "One sentence about why this specific program matters to you.",
      proof: "Key measurables + Hudl link.",
      ask: "Clear, specific request (visit, camp, film review).",
      close: "Thank you for your time. I look forward to connecting.",
    },
    timing: {
      d2Programs: "DM immediately after following and engaging for 1-2 weeks",
      fcsPrograms: "DM after 2-4 weeks of following and engaging with their content",
      fbsPrograms:
        "You can send athlete-initiated DMs now, but most meaningful FBS coach replies open June 15 after sophomore year. Before then, lead with camps, film updates and profile-building rather than repeated cold follow-ups.",
    },
  },

  followStrategy: {
    whoToFollow: {
      coaches:
        "Head coach, OL coach, recruiting coordinator, and strength coach at every target school. Also follow offensive coordinator if they have X presence.",
      recruits:
        "Peer recruits in your class and position (Class of 2029 OL). Follow committed players at your target schools. Build a network of prospect peers.",
      programs:
        "Official team accounts, recruiting accounts (@[School]Recruits), athletics department accounts. Also follow NIL collectives at target schools.",
      media:
        "Recruiting services (Rivals, 247Sports, On3), state recruiting accounts (@WiscoFBRecruiting), position-specific accounts, and high school football accounts in your region.",
    },
    orderOfOperations: [
      "1. Follow all 23 target school official accounts",
      "2. Follow OL coaches and recruiting coordinators at each target",
      "3. Follow head coaches at Tier 2 and Tier 3 schools",
      "4. Follow peer Class of 2029 OL recruits in the Midwest",
      "5. Follow recruiting media and evaluation services",
      "6. Follow committed players at target schools",
      "7. Engage (like + repost) coach content 3-5x before any DM",
      "8. Monitor follow-backs — a coach following you back is a strong signal",
    ],
  },
};

export function getKnowledgeContext(): string {
  const lines: string[] = [];

  lines.push("=== X/TWITTER RECRUITING PLAYBOOK ===\n");

  lines.push("PROFILE OPTIMIZATION:");
  for (const [field, advice] of Object.entries(xPlaybook.profileOptimization)) {
    lines.push(`  ${field}: ${advice}`);
  }

  lines.push(`\nPOSTING CADENCE:`);
  lines.push(`  Minimum: ${xPlaybook.postingCadence.minimumPerWeek} posts/week`);
  lines.push(`  Best days: ${xPlaybook.postingCadence.bestDays.join(", ")}`);
  lines.push(`  Best times: ${xPlaybook.postingCadence.bestTimes.join("; ")}`);
  lines.push(`  Content mix:`);
  for (const [type, pct] of Object.entries(xPlaybook.postingCadence.contentMix)) {
    lines.push(`    ${type}: ${pct}`);
  }

  lines.push(`\nDM STRATEGY:`);
  lines.push(`  Etiquette:`);
  for (const rule of xPlaybook.dmStrategy.etiquette) {
    lines.push(`    - ${rule}`);
  }
  lines.push(`  Timing:`);
  for (const [div, timing] of Object.entries(xPlaybook.dmStrategy.timing)) {
    lines.push(`    ${div}: ${timing}`);
  }

  lines.push(`\nFOLLOW STRATEGY:`);
  lines.push(`  Who to follow:`);
  for (const [group, advice] of Object.entries(xPlaybook.followStrategy.whoToFollow)) {
    lines.push(`    ${group}: ${advice}`);
  }
  lines.push(`  Order of operations:`);
  for (const step of xPlaybook.followStrategy.orderOfOperations) {
    lines.push(`    ${step}`);
  }

  return lines.join("\n");
}
