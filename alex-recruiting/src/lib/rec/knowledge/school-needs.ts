// School OL needs knowledge base
// Static data about the 23 target schools and their offensive line needs

export interface SchoolOLNeed {
  schoolId: string;
  name: string;
  division: string;
  conference: string;
  olNeedLevel: "high" | "medium" | "low";
  currentOLCount: number;
  seniorsGraduating2026: number;
  recruitingEmphasis: string;
  jacobFitNotes: string;
}

export const schoolNeeds: SchoolOLNeed[] = [
  // Tier 1 — Reach
  {
    schoolId: "wisconsin",
    name: "University of Wisconsin",
    division: "D1 FBS",
    conference: "Big Ten",
    olNeedLevel: "high",
    currentOLCount: 18,
    seniorsGraduating2026: 5,
    recruitingEmphasis: "Wisconsin prioritizes massive, technically sound OL. They take 3-5 OL per class and develop them through a 2-year redshirt pipeline.",
    jacobFitNotes: "Jacob's size (6'3\", 285 lbs as a freshman) and Wisconsin roots make him a natural target. UW values homegrown OL above all. Long-term play: get on their radar early.",
  },
  {
    schoolId: "northwestern",
    name: "Northwestern",
    division: "D1 FBS",
    conference: "Big Ten",
    olNeedLevel: "medium",
    currentOLCount: 15,
    seniorsGraduating2026: 3,
    recruitingEmphasis: "Northwestern targets high-academic OL who can play in the Big Ten. Smaller recruiting classes but invest heavily in development.",
    jacobFitNotes: "Academic fit is key here. If Jacob maintains a 3.0+ GPA, Northwestern becomes a strong option. They value character and intelligence as much as size.",
  },
  {
    schoolId: "iowa",
    name: "Iowa",
    division: "D1 FBS",
    conference: "Big Ten",
    olNeedLevel: "high",
    currentOLCount: 20,
    seniorsGraduating2026: 6,
    recruitingEmphasis: "Iowa is OL University. Kirk Ferentz built the program on elite OL development. They take 4-6 OL per class and have produced more NFL OL than almost any program.",
    jacobFitNotes: "Iowa actively recruits Wisconsin. Jacob's frame and fundamentals fit the Iowa mold. Their OL coach evaluates prospects early — get on film in front of Iowa staff at camps.",
  },
  {
    schoolId: "iowa-state",
    name: "Iowa State",
    division: "D1 FBS",
    conference: "Big 12",
    olNeedLevel: "high",
    currentOLCount: 16,
    seniorsGraduating2026: 4,
    recruitingEmphasis: "Iowa State has invested heavily in OL recruiting under recent coaching changes. Big 12 play demands athletic OL. Active X recruiting presence.",
    jacobFitNotes: "Iowa State's recruiting coordinators are very active on X and engage with Wisconsin prospects. Good early-contact opportunity for a D1 FBS program.",
  },

  // Tier 2 — Target
  {
    schoolId: "northern-illinois",
    name: "Northern Illinois",
    division: "D1 FBS",
    conference: "MAC",
    olNeedLevel: "high",
    currentOLCount: 14,
    seniorsGraduating2026: 4,
    recruitingEmphasis: "NIU aggressively recruits Wisconsin and Illinois OL. MAC programs offer earlier playing time and strong development.",
    jacobFitNotes: "NIU coaches are active on X and respond to DMs. Jacob could earn early attention here. MAC programs often offer before Power 5 programs commit.",
  },
  {
    schoolId: "western-michigan",
    name: "Western Michigan",
    division: "D1 FBS",
    conference: "MAC",
    olNeedLevel: "high",
    currentOLCount: 15,
    seniorsGraduating2026: 5,
    recruitingEmphasis: "WMU recruits Midwest aggressively for OL. Strong tradition of developing OL for NFL (Corey Linsley, Taylor Moton).",
    jacobFitNotes: "WMU has a history of developing OL at Jacob's size into NFL players. Their staff scouts Wisconsin actively.",
  },
  {
    schoolId: "ball-state",
    name: "Ball State",
    division: "D1 FBS",
    conference: "MAC",
    olNeedLevel: "medium",
    currentOLCount: 13,
    seniorsGraduating2026: 3,
    recruitingEmphasis: "Ball State offers early attention to strong freshmen. Smaller MAC program with active X recruiting staff.",
    jacobFitNotes: "Ball State's smaller recruiting pool means Jacob could get earlier attention. DM-open coaches who respond quickly.",
  },
  {
    schoolId: "central-michigan",
    name: "Central Michigan",
    division: "D1 FBS",
    conference: "MAC",
    olNeedLevel: "medium",
    currentOLCount: 14,
    seniorsGraduating2026: 3,
    recruitingEmphasis: "CMU coaches are active on X and recruit Midwest OL. Solid development program.",
    jacobFitNotes: "CMU regularly recruits Wisconsin prospects. Active social media presence makes engagement easy.",
  },
  {
    schoolId: "south-dakota-state",
    name: "South Dakota State",
    division: "D1 FCS",
    conference: "Missouri Valley",
    olNeedLevel: "high",
    currentOLCount: 16,
    seniorsGraduating2026: 5,
    recruitingEmphasis: "SDSU is an FCS powerhouse that produces NFL players. MVFC programs recruit Midwest OL heavily. Coaches follow and DM Wisconsin freshmen.",
    jacobFitNotes: "SDSU coaches have DM'd Wisconsin freshmen before. High probability of early engagement. Their OL development is elite for FCS.",
  },
  {
    schoolId: "north-dakota-state",
    name: "North Dakota State",
    division: "D1 FCS",
    conference: "Missouri Valley",
    olNeedLevel: "high",
    currentOLCount: 18,
    seniorsGraduating2026: 5,
    recruitingEmphasis: "NDSU is the gold standard of FCS — 9 national championships. They recruit OL like a Power 5 program. Very active on X.",
    jacobFitNotes: "NDSU has recruited Pewaukee-area players before. Elite development — multiple NDSU OL in the NFL. Jacob's size fits their mold perfectly.",
  },
  {
    schoolId: "illinois-state",
    name: "Illinois State",
    division: "D1 FCS",
    conference: "Missouri Valley",
    olNeedLevel: "medium",
    currentOLCount: 14,
    seniorsGraduating2026: 4,
    recruitingEmphasis: "ISU is a solid MVFC program with active X staff. Proximate to Wisconsin, regularly recruits Midwest OL.",
    jacobFitNotes: "Illinois State coaches have open DMs and engage with Wisconsin prospects. Good mid-tier FCS option.",
  },
  {
    schoolId: "youngstown-state",
    name: "Youngstown State",
    division: "D1 FCS",
    conference: "Missouri Valley",
    olNeedLevel: "medium",
    currentOLCount: 13,
    seniorsGraduating2026: 3,
    recruitingEmphasis: "YSU has an OL-focused program with strong Midwest recruiting. Active on X with DM-open coaches.",
    jacobFitNotes: "Youngstown State's coaches are responsive to DMs. Good option for building confidence with FCS outreach.",
  },

  // Tier 3 — Safety
  {
    schoolId: "saginaw-valley",
    name: "Saginaw Valley State",
    division: "D2",
    conference: "GLIAC",
    olNeedLevel: "high",
    currentOLCount: 12,
    seniorsGraduating2026: 4,
    recruitingEmphasis: "GLIAC programs need big OL. SVSU coaches are highly active on X and almost universally DM-open.",
    jacobFitNotes: "SVSU is a strong safety option. At Jacob's size, he'd be a priority recruit. Expect quick responses to DMs.",
  },
  {
    schoolId: "michigan-tech",
    name: "Michigan Tech",
    division: "D2",
    conference: "GLIAC",
    olNeedLevel: "high",
    currentOLCount: 11,
    seniorsGraduating2026: 3,
    recruitingEmphasis: "Michigan Tech combines academics and athletics. Active X recruiting staff. GLIAC programs respond to freshman DMs.",
    jacobFitNotes: "Academic-athletic balance similar to Northwestern but at D2 level. Jacob's size would make him an immediate priority.",
  },
  {
    schoolId: "ferris-state",
    name: "Ferris State",
    division: "D2",
    conference: "GLIAC",
    olNeedLevel: "medium",
    currentOLCount: 14,
    seniorsGraduating2026: 4,
    recruitingEmphasis: "Ferris State is a D2 powerhouse (2022 national champions). They recruit OL aggressively and coaches follow strong freshmen proactively.",
    jacobFitNotes: "Ferris State is the elite D2 option. Their coaches scout X actively. If Jacob's content is strong, they may follow first.",
  },
  {
    schoolId: "winona-state",
    name: "Winona State",
    division: "D2",
    conference: "NSIC",
    olNeedLevel: "high",
    currentOLCount: 12,
    seniorsGraduating2026: 4,
    recruitingEmphasis: "Winona State (Minnesota) has strong Wisconsin recruiting history. NSIC coaches are very active on social media with high DM response rates.",
    jacobFitNotes: "Winona State is geographically close and has a strong Wisconsin pipeline. High probability of early engagement and response.",
  },
  {
    schoolId: "minnesota-state-mankato",
    name: "Minnesota State Mankato",
    division: "D2",
    conference: "NSIC",
    olNeedLevel: "high",
    currentOLCount: 13,
    seniorsGraduating2026: 4,
    recruitingEmphasis: "MSU Mankato coaches follow 285lb Wisconsin freshmen. High follow-back probability. Strong NSIC program with active X staff.",
    jacobFitNotes: "MSU Mankato actively recruits Jacob's exact profile: big Wisconsin OL freshmen. Expect coach follows and DM engagement quickly.",
  },
];

export function getSchoolNeedById(schoolId: string): SchoolOLNeed | undefined {
  return schoolNeeds.find((s) => s.schoolId === schoolId);
}

export function getHighNeedSchools(): SchoolOLNeed[] {
  return schoolNeeds.filter((s) => s.olNeedLevel === "high");
}

export function getKnowledgeContext(): string {
  const lines: string[] = [];

  lines.push("=== SCHOOL OL NEEDS ANALYSIS ===\n");
  lines.push(`Schools tracked: ${schoolNeeds.length}`);

  const highNeed = schoolNeeds.filter((s) => s.olNeedLevel === "high");
  const medNeed = schoolNeeds.filter((s) => s.olNeedLevel === "medium");

  lines.push(`High OL need: ${highNeed.length} schools`);
  lines.push(`Medium OL need: ${medNeed.length} schools\n`);

  lines.push("HIGH-NEED SCHOOLS (best opportunities for Jacob):");
  for (const school of highNeed) {
    lines.push(
      `  - ${school.name} (${school.division}, ${school.conference}): ${school.seniorsGraduating2026} seniors graduating, ${school.currentOLCount} current OL`
    );
    lines.push(`    Fit: ${school.jacobFitNotes}`);
  }

  lines.push("\nMEDIUM-NEED SCHOOLS:");
  for (const school of medNeed) {
    lines.push(
      `  - ${school.name} (${school.division}, ${school.conference}): ${school.seniorsGraduating2026} seniors graduating`
    );
  }

  lines.push("\nKEY INSIGHT: Schools with high OL need and active X presence are the highest-priority DM targets.");
  lines.push("Total seniors graduating across all targets: " + schoolNeeds.reduce((sum, s) => sum + s.seniorsGraduating2026, 0));

  return lines.join("\n");
}
