// Jacob Rodgers — Athlete Profile (Single Source of Truth)

export const jacobProfile = {
  name: "Jacob Rodgers",
  position: "OL/DL",
  positionFull: "Offensive Line / Defensive Line",
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
  imgTraining: true,
  ncsaVerified: false,

  // Strength numbers (NCSA verified)
  bench: "265",
  squat: "350",

  accolades: [],

  seasonStats: {
    pancakeBlocks: 11,
    sacks: 3,
    fumbleRecoveries: 1,
    teamRecord: "12-1",
  },

  hudlVideos: ["2025 Highlights", "2026 Spotlight"],

  bio: 'OL/DL | 6\'4" 285 | Pewaukee HS \'29 | WI | Film + training updates',

  bioVariations: [
    'OL/DL | 6\'4" 285 | Pewaukee HS \'29 | WI | Film-ready',
    'Two-way lineman | OL/DL | 6\'4" 285 | Pewaukee HS \'29 | WI | Weight-room driven',
    'OL/DL | 6\'4" 285 | Bench 265 / Squat 350 | Class of 2029 | Pewaukee, WI',
    'Class of 2029 | OL/DL | 6\'4" 285 | 3.25 GPA after first semester | Film-ready',
  ],

  displayName: "Jacob Rodgers | OL/DL | '29",

  contentPillars: [
    { id: "performance", name: "On-Field Performance", percentage: 40, description: "Film clips, game highlights, game day posts, stat updates, team wins" },
    { id: "work_ethic", name: "Work Ethic & Training", percentage: 40, description: "Training videos, workout posts, camp content, strength & conditioning" },
    { id: "character", name: "Character & Personal Brand", percentage: 20, description: "Academic achievements, community involvement, team moments, motivational thoughts" },
  ],

  competitiveAdvantages: [
    "Physical profile: 6'4\" 285 lbs as a FRESHMAN — already at D1 minimum threshold with 3 years of growth remaining",
    "Two-way versatility: plays both DT and OG, showing coaches rare positional flexibility",
    "Two-way production as a freshman: 11 pancake blocks on offense, 3 sacks and 1 fumble recovery on defense in a 12-1 season",
    "Development story: NX Level work, trench training, IMG camps, and one-on-one sessions support the long runway",
    "Strength numbers: 265 bench / 350 squat as a freshman — well ahead of position averages",
    "Early high-school film plus offseason growth gives coaches both a present snapshot and a projection story",
  ],

  coreMessage: "Jacob Rodgers is a Class of 2029 OL/DL prospect with defensive-line upside, offensive-line versatility, verified film, and a long-term development story built around year-round training.",
} as const;
