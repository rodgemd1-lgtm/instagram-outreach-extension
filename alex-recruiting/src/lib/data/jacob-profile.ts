// Jacob Rogers — Athlete Profile (Single Source of Truth)

export const jacobProfile = {
  name: "Jacob Rogers",
  position: "OL",
  positionFull: "Offensive Lineman",
  height: "6'4\"",
  weight: "285 lbs",
  classYear: 2028,
  school: "Pewaukee High School",
  state: "Wisconsin",
  city: "Pewaukee",
  conference: "WIAA",
  gpa: "", // Fill when available
  xHandle: "@JacobRogersOL28",
  ncsaProfileUrl: "", // Fill with NCSA link
  hudlUrl: "", // Fill with Hudl link
  websiteUrl: "", // Fill with personal website
  imgTraining: true,

  bio: 'OL | 6\'4" 285 | Pewaukee HS \'28 | WI | Training @IMGAcademy',

  bioVariations: [
    'Jacob Rogers | OL | 6\'4" 285 | Pewaukee HS | Class of 2028 | WI',
    'OL | 6\'4" 285 | Pewaukee HS \'28 | WI | NCSA Athlete | Training @IMGAcademy',
    'Jacob Rogers | Offensive Line | 6\'4" 285 | \'28 | Pewaukee, WI | Film below',
    'OL | 6\'4" 285 | Pewaukee HS | Class of 2028 | Wisconsin | @IMGAcademy',
    'Jacob Rogers | OL | 6\'4" 285 | Pewaukee HS \'28 | WI | @NCSASports Athlete',
  ],

  displayName: "Jacob Rogers | OL | '28",

  contentPillars: [
    { id: "performance", name: "On-Field Performance", percentage: 40, description: "Film clips, game highlights, game day posts, stat updates, team wins" },
    { id: "work_ethic", name: "Work Ethic & Training", percentage: 40, description: "Training videos, workout posts, camp content, IMG footage, strength & conditioning" },
    { id: "character", name: "Character & Personal Brand", percentage: 20, description: "Academic achievements, community involvement, team moments, motivational thoughts" },
  ],

  competitiveAdvantages: [
    "Physical profile: 6'4\" 285 lbs as a FRESHMAN — already at D1 OL minimum threshold with 3 years of growth remaining",
    "IMG Academy training: signals elite family investment, exposure to D1-caliber coaching, competition with nationally-ranked recruits",
    "NCSA representation: active profile signals professionalism; coaches see NCSA athletes as easier to recruit",
    "Personal recruitment website: rare for a freshman — signals ambition, organization, and long-term planning",
    "Starting at Pewaukee: WIAA top classification — starting as a freshman signals immediate readiness",
  ],

  coreMessage: "Jacob Rogers is a Class of 2028 OL who is already playing at a high level as a freshman, training at IMG Academy, represented by NCSA, and has three years to become one of the top OL prospects in Wisconsin.",
} as const;
