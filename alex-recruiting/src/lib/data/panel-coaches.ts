/**
 * Coach Panel — Static Data
 *
 * 8 panel coaches across D3 (WIAC + nearby), D2, and FCS programs
 * who review and help write content for Jacob's recruiting profile.
 */

export interface PanelCoach {
  name: string;
  school: string;
  division: "D3" | "D2" | "FCS";
  position_coached: string;
  status: "active" | "invited" | "completed";
  coaching_philosophy: string;
  what_they_look_for: string[];
}

export const panelCoachesData: PanelCoach[] = [
  // ---------- 4 D3 coaches (WIAC + nearby) ----------
  {
    name: "Coach Dave Keel",
    school: "UW-Whitewater",
    division: "D3",
    position_coached: "Offensive Line",
    status: "active",
    coaching_philosophy:
      "Technique-first development. I want linemen who study film and understand scheme, not just athletes who rely on size.",
    what_they_look_for: [
      "Film study habits",
      "Coachability signals",
      "Team-first language",
      "Technical vocabulary in posts",
    ],
  },
  {
    name: "Coach Brian Raehl",
    school: "UW-Oshkosh",
    division: "D3",
    position_coached: "Offensive Line",
    status: "active",
    coaching_philosophy:
      "Build from the ground up. Footwork and pad level win in the trenches. Show me you understand leverage.",
    what_they_look_for: [
      "Training discipline",
      "Measurable progress over time",
      "Understanding of technique",
      "Humility",
    ],
  },
  {
    name: "Coach Matt Janus",
    school: "UW-Eau Claire",
    division: "D3",
    position_coached: "Offensive Coordinator",
    status: "active",
    coaching_philosophy:
      "Smart players make my job easier. I recruit character and football IQ — I can teach the rest.",
    what_they_look_for: [
      "Academic mentions",
      "Film breakdown posts",
      "Questions about schemes",
      "Community involvement",
    ],
  },
  {
    name: "Coach Andy Nerat",
    school: "UW-Stevens Point",
    division: "D3",
    position_coached: "Offensive Line",
    status: "active",
    coaching_philosophy:
      "Consistency beats talent. Show me 6 months of steady work over one viral highlight.",
    what_they_look_for: [
      "Consistent posting cadence",
      "Progress tracking",
      "Honest about weaknesses",
      "Long-term commitment",
    ],
  },
  // ---------- 2 D2 coaches ----------
  {
    name: "Coach Rick Cebulski",
    school: "Winona State",
    division: "D2",
    position_coached: "Offensive Line",
    status: "active",
    coaching_philosophy:
      "The O-line is a brotherhood. I look for players who make everyone around them better.",
    what_they_look_for: [
      "Team mentions over individual stats",
      "Leadership signals",
      "Work with younger players",
      "Selfless language",
    ],
  },
  {
    name: "Coach Tyler Arens",
    school: "Minnesota State-Mankato",
    division: "D2",
    position_coached: "Offensive Coordinator",
    status: "active",
    coaching_philosophy:
      "Physical dominance starts with mental preparation. Film study and weight room consistency separate the good from the great.",
    what_they_look_for: [
      "Weight room consistency",
      "Film study evidence",
      "Competitive measurables",
      "Drive to improve",
    ],
  },
  // ---------- 2 FCS coaches ----------
  {
    name: "Coach Jake Nordin",
    school: "North Dakota State",
    division: "FCS",
    position_coached: "Offensive Line",
    status: "active",
    coaching_philosophy:
      "Championship culture is built in the offseason. I recruit athletes who are already living the standard.",
    what_they_look_for: [
      "Off-season work ethic",
      "Championship mindset",
      "Accountability language",
      "Specific training details",
    ],
  },
  {
    name: "Coach Mike Schmidt",
    school: "South Dakota State",
    division: "FCS",
    position_coached: "Offensive Line",
    status: "active",
    coaching_philosophy:
      "I want competitors who are authentic. Recruits who show real personality stand out from the cookie-cutter profiles.",
    what_they_look_for: [
      "Authentic voice",
      "Personality showing through",
      "Genuine interactions",
      "Not over-polished content",
    ],
  },
];
