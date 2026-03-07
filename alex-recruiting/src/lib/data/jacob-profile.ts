// Jacob Rodgers — Athlete Profile (Single Source of Truth)

export const jacobProfile = {
  name: "Jacob Rodgers",
  position: "DT/OG",
  positionFull: "Defensive Tackle / Offensive Guard",
  height: "6'4\"",
  weight: "285 lbs",
  jerseyNumber: 79,
  classYear: 2029,
  school: "Pewaukee High School",
  state: "Wisconsin",
  city: "Pewaukee",
  conference: "WIAA",
  gpa: "3.25",
  xHandle: "@JacobRodge52987",
  ncsaProfileUrl: "", // Fill with NCSA link
  hudlUrl: "", // Fill with Hudl link
  websiteUrl: "", // Fill with personal website
  imgTraining: false,
  ncsaVerified: true,

  // Strength numbers (NCSA verified)
  bench: "265",
  squat: "350",

  accolades: ["All-Conference", "State Champion"],

  seasonStats: {
    pancakeBlocks: 11,
    sacks: 3,
    fumbleRecoveries: 1,
    teamRecord: "12-1",
  },

  hudlVideos: ["2025 Highlights", "2026 Spotlight"],

  bio: 'DT/OG | 6\'4" 285 | Pewaukee HS \'29 | WI | NCSA Athlete',

  bioVariations: [
    'DT/OG | 6\'4" 285 | 11 pancakes, 3 sacks, 1 FR | Pewaukee HS \'29 | State Champs',
    'Two-way lineman: DT + OG | 6\'4" 285 | Pewaukee HS \'29 | WI | All-Conference | DMs open',
    'DT/OG | 6\'4" 285 | Bench 265 / Squat 350 | Class of 2029 | Pewaukee, WI | NCSA Athlete',
    '12-1 State Champs | DT/OG | 6\'4" 285 | 3.25 GPA | Pewaukee HS \'29 | Coaches -- DMs open',
  ],

  displayName: "Jacob Rodgers | DT/OG | '29",

  contentPillars: [
    { id: "performance", name: "On-Field Performance", percentage: 40, description: "Film clips, game highlights, game day posts, stat updates, team wins" },
    { id: "work_ethic", name: "Work Ethic & Training", percentage: 40, description: "Training videos, workout posts, camp content, strength & conditioning" },
    { id: "character", name: "Character & Personal Brand", percentage: 20, description: "Academic achievements, community involvement, team moments, motivational thoughts" },
  ],

  competitiveAdvantages: [
    "Physical profile: 6'4\" 285 lbs as a FRESHMAN — already at D1 minimum threshold with 3 years of growth remaining",
    "Two-way versatility: plays both DT and OG, showing coaches rare positional flexibility",
    "Two-way production as a freshman: 11 pancake blocks on offense, 3 sacks and 1 fumble recovery on defense in a 12-1 State Championship season",
    "NCSA representation: active verified profile signals professionalism; coaches see NCSA athletes as easier to recruit",
    "Strength numbers: 265 bench / 350 squat as a freshman — well ahead of position averages",
    "Starting at Pewaukee: WIAA top classification — starting as a freshman signals immediate readiness",
  ],

  coreMessage: "Jacob Rodgers is a Class of 2029 DT/OG who played both sides of the ball as a freshman — 11 pancakes, 3 sacks, 1 fumble recovery — on a 12-1 State Championship team, represented by NCSA, with three years to become one of the top two-way lineman prospects in Wisconsin.",
} as const;
