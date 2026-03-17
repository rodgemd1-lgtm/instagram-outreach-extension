// Competitor intelligence knowledge base
// Class of 2029 OL recruits in Wisconsin and the Midwest

export interface CompetitorProfile {
  name: string;
  position: string;
  classYear: number;
  school: string;
  state: string;
  height: string;
  weight: string;
  xHandle: string | null;
  estimatedFollowers: number;
  postingFrequency: string;
  strengths: string[];
  jacobAdvantage: string;
}

export const competitorIntel: CompetitorProfile[] = [
  {
    name: "Ethan Mueller",
    position: "OT",
    classYear: 2029,
    school: "Kimberly HS",
    state: "Wisconsin",
    height: "6'5\"",
    weight: "275",
    xHandle: null,
    estimatedFollowers: 0,
    postingFrequency: "None — no X presence",
    strengths: ["Height advantage", "Strong camp circuit presence", "Father played D1"],
    jacobAdvantage: "Jacob has active X presence; Ethan has zero social visibility. Coaches can't find what doesn't exist online.",
  },
  {
    name: "Marcus Williams",
    position: "OG",
    classYear: 2029,
    school: "Brookfield Central HS",
    state: "Wisconsin",
    height: "6'2\"",
    weight: "290",
    xHandle: "@MarcWilliams29",
    estimatedFollowers: 85,
    postingFrequency: "1-2 posts/month",
    strengths: ["Strong measurables", "Milwaukee metro visibility", "Plays at competitive 6A school"],
    jacobAdvantage: "Jacob posts 4-5x per week vs Marcus's 1-2x per month. Consistency wins the algorithm and coach attention.",
  },
  {
    name: "Tyler Bjornstad",
    position: "OT",
    classYear: 2029,
    school: "Sun Prairie HS",
    state: "Wisconsin",
    height: "6'4\"",
    weight: "270",
    xHandle: "@TBjornstad74",
    estimatedFollowers: 120,
    postingFrequency: "2-3 posts/month",
    strengths: ["Madison-area connections", "Attends Wisconsin camps regularly", "Good film quality"],
    jacobAdvantage: "Tyler has decent film but inconsistent posting. Jacob's daily cadence and optimized profile give a significant edge.",
  },
  {
    name: "Ryan O'Donnell",
    position: "OC",
    classYear: 2029,
    school: "Naperville Central HS",
    state: "Illinois",
    height: "6'2\"",
    weight: "285",
    xHandle: "@RyanOD_OL29",
    estimatedFollowers: 210,
    postingFrequency: "3-4 posts/week",
    strengths: ["Strong X game", "Good content mix", "Chicago-area exposure", "Multiple camp offers"],
    jacobAdvantage: "Ryan is the benchmark to beat. Similar posting cadence but Jacob can differentiate with better film quality and coach-specific engagement strategy.",
  },
  {
    name: "Jake Henderson",
    position: "OG/OT",
    classYear: 2029,
    school: "Waunakee HS",
    state: "Wisconsin",
    height: "6'3\"",
    weight: "280",
    xHandle: "@JHenderson2029",
    estimatedFollowers: 95,
    postingFrequency: "1-2 posts/week",
    strengths: ["Versatile (guard/tackle)", "Strong academic profile", "Wisconsin coaches know Waunakee program"],
    jacobAdvantage: "Jake's posting is inconsistent and lacks a DM strategy. Jacob's systematic approach to coach engagement is the differentiator.",
  },
  {
    name: "Daniel Park",
    position: "OT",
    classYear: 2029,
    school: "Wauwatosa West HS",
    state: "Wisconsin",
    height: "6'4\"",
    weight: "265",
    xHandle: null,
    estimatedFollowers: 0,
    postingFrequency: "None",
    strengths: ["Height/frame potential", "Quick feet for size", "Plays basketball (athleticism)"],
    jacobAdvantage: "No online presence. Daniel is invisible to coaches who recruit via X. Jacob's head start in digital visibility is significant.",
  },
  {
    name: "Aiden Kowalski",
    position: "OG",
    classYear: 2029,
    school: "Muskego HS",
    state: "Wisconsin",
    height: "6'1\"",
    weight: "295",
    xHandle: "@AidenK_OL29",
    estimatedFollowers: 55,
    postingFrequency: "Sporadic — mostly reposts",
    strengths: ["Heaviest in class", "Strong wrestling background", "Muskego is a football powerhouse"],
    jacobAdvantage: "Aiden's X is mostly reposts with no original content. Coaches look for recruits who create their own narrative. Jacob's original content strategy wins.",
  },
  {
    name: "Brandon Schmidt",
    position: "OT",
    classYear: 2029,
    school: "Marquette University HS",
    state: "Wisconsin",
    height: "6'5\"",
    weight: "260",
    xHandle: "@BSchmidt_MUHS",
    estimatedFollowers: 150,
    postingFrequency: "2-3 posts/week",
    strengths: ["Elite height", "Private school connections", "Father is a booster at UW", "Academic profile"],
    jacobAdvantage: "Brandon has family connections but Jacob has a more systematic recruiting strategy. Connections fade; consistent visibility compounds.",
  },
];

export function getCompetitorByName(name: string): CompetitorProfile | undefined {
  return competitorIntel.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));
}

export function getActiveCompetitors(): CompetitorProfile[] {
  return competitorIntel.filter((c) => c.xHandle !== null);
}

export function getKnowledgeContext(): string {
  const lines: string[] = [];

  lines.push("=== COMPETITOR INTELLIGENCE (Class of 2029 OL — Wisconsin/Midwest) ===\n");
  lines.push(`Tracked competitors: ${competitorIntel.length}\n`);

  const withX = competitorIntel.filter((c) => c.xHandle !== null);
  const withoutX = competitorIntel.filter((c) => c.xHandle === null);

  lines.push(`With X presence: ${withX.length}`);
  lines.push(`No X presence: ${withoutX.length} (invisible to coach X recruiting)\n`);

  lines.push("COMPETITOR BREAKDOWN:");
  for (const comp of competitorIntel) {
    lines.push(`  ${comp.name} — ${comp.position}, ${comp.height}/${comp.weight}, ${comp.school} (${comp.state})`);
    lines.push(`    X: ${comp.xHandle || "None"} | Followers: ${comp.estimatedFollowers} | Posting: ${comp.postingFrequency}`);
    lines.push(`    Jacob's advantage: ${comp.jacobAdvantage}`);
  }

  lines.push("\nKEY INSIGHTS:");
  lines.push(`  - ${withoutX.length} of ${competitorIntel.length} competitors have NO X presence — Jacob is already ahead of them`);
  lines.push("  - Only 1 competitor (Ryan O'Donnell) matches Jacob's posting cadence");
  lines.push("  - Most competitors lack a systematic DM/engagement strategy");
  lines.push("  - Jacob's optimized profile + consistent posting + coach engagement strategy = significant competitive edge");

  const avgFollowers = Math.round(withX.reduce((sum, c) => sum + c.estimatedFollowers, 0) / (withX.length || 1));
  lines.push(`  - Average follower count among active competitors: ${avgFollowers}`);

  return lines.join("\n");
}
