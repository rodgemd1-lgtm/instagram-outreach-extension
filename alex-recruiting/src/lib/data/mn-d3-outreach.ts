// Minnesota D3 Coach Outreach Campaign — Emails, DMs, and X Callout Posts
// Generated 2026-03-23 via research across MIAC + UMAC Minnesota D3 programs
// Excluded: Bethany Lutheran (no football), Macalester (0-10 2024), Crown (1-9 UMAC)
// Note: St. Thomas excluded — moved to D1 in 2022

export interface MinnesotaCoachOutreach {
  coachName: string;
  schoolName: string;
  position: string;
  email: string | null;
  emailConfirmed: boolean;
  xHandle: string | null;
  emailDraft: { subject: string; body: string };
  dmDraft: string;
  xCallout: string;
  wave: 1 | 2 | 3;
  priority: "high" | "medium" | "low";
  conference: "MIAC" | "UMAC";
  notes: string;
}

export const MN_D3_OUTREACH: MinnesotaCoachOutreach[] = [
  // ─── WAVE 1: Top Programs ────────────────────────────────────────────────────

  {
    coachName: "Ben Eli",
    schoolName: "St. John's University",
    position: "Offensive Line Coach",
    email: "beli@csbsju.edu",
    emailConfirmed: false,
    xHandle: null,
    wave: 1,
    priority: "high",
    conference: "MIAC",
    notes: "SJU went 11-1 in 2024 — won their 37th MIAC title (defeated Bethel 41-33), made NCAA D3 playoffs. HC Gary Fasching has been at SJU since 2013. The Johnnies are the gold standard of MIAC football and one of the most storied D3 programs in the country. Collegeville campus is unique (men's liberal arts, coordinate with College of St. Benedict).",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Eli,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. I'm reaching out because what St. John's did in 2024 — 11-1, the 37th MIAC title, an NCAA playoff run — represents exactly the standard I want to compete at. The Johnnies' tradition under Coach Fasching is something I've followed closely.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I play Center/Guard on offense and Defensive Tackle on defense — I've been a two-way starter since my freshman year, and that experience on both sides of the ball gives me a perspective I think translates well at the D3 level. St. John's reputation for developing linemen, combined with the academic environment in Collegeville, is a combination I find incredibly compelling.

Are there any upcoming camps, prospect days, or summer visit opportunities I should know about? I would love the chance to see the program firsthand.

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Eli — SJU's 11-1 season + 37th MIAC title in 2024 is elite D3 football. I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285, two-way starter. Would love to connect about camps or a visit to Collegeville. Thank you!`,
    xCallout: `37 MIAC titles. That's the standard @SJUJohnnies football has set. As a Class of 2029 OL/DL from Wisconsin (6'4" 285), competing at that level in the MIAC is the goal. Hoping to get to Collegeville this summer! #Johnnies #D3Football #RecruitJacob`,
  },

  {
    coachName: "Mathias Durie",
    schoolName: "Bethel University",
    position: "Offensive Line Coach",
    email: "m-durie@bethel.edu",
    emailConfirmed: false,
    xHandle: null,
    wave: 1,
    priority: "high",
    conference: "MIAC",
    notes: "Bethel went 9-2 in 2024 — MIAC runner-up (lost MIAC Championship 41-33 to SJU), made NCAA playoffs. New HC Mike McElroy (hired Jan 2024) won 2025 AFCA Region 5 Coach of the Year in his first season. m-mcelroy@bethel.edu for HC. One of the strongest MIAC programs. St. Paul campus.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Durie,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. Bethel's 9-2 season in 2024 — reaching the MIAC Championship game and the NCAA playoffs in Coach McElroy's first year — is the kind of program momentum I want to be part of.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I play Center/Guard on offense and Defensive Tackle on defense. Being a two-way starter has sharpened my understanding of blocking assignments and defensive reads in a way I think gives me an edge. Bethel's combination of competitive MIAC football and strong academics in St. Paul is exactly what I'm looking for.

Are there any upcoming camps, prospect days, or visit opportunities this spring or summer? I'd love to learn more about what you and Coach McElroy are building.

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Durie — Bethel's 9-2 season + MIAC Championship appearance in Coach McElroy's first year is incredible momentum. I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285. Any camps this summer? Would love to connect!`,
    xCallout: `Impressive first season for Coach McElroy at @BethelRoyalsFB — 9-2, MIAC Championship game, NCAA playoffs! As a Class of 2029 OL/DL from Wisconsin (6'4" 285), Bethel's trajectory is something I want to be part of. Hoping to visit St. Paul! #Royals #D3Football #RecruitJacob`,
  },

  {
    coachName: "Matt Moore",
    schoolName: "University of Northwestern",
    position: "Head Coach",
    email: "mdmoore@unwsp.edu",
    emailConfirmed: true,
    xHandle: null,
    wave: 1,
    priority: "high",
    conference: "UMAC",
    notes: "UNW went 9-3 in 2024 — 6-0 UMAC Champions, made NCAA D3 playoffs. One of the strongest UMAC programs. Note: OL coach Nolan Richardson and OC Boomer Roepke both left in 2025 offseason, so Moore (HC) is the right initial contact to get introduced before being routed to new OL staff.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Moore,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. I'm reaching out because Northwestern's 9-3 season and UMAC Championship in 2024 caught my attention — going 6-0 in conference and earning an NCAA playoff berth is a program worth watching.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I play both Center/Guard on offense and Defensive Tackle on defense. I've been a two-way starter at Pewaukee and I believe that experience on both sides of the ball gives me a deeper understanding of the game. Northwestern's faith-based environment and competitive UMAC football are both appealing to me.

I understand there were some staff changes this offseason, but I wanted to reach out directly to express my interest and learn about any camps or visit opportunities this spring or summer.

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Moore — UNW's 9-3 season + UMAC Championship in 2024 is impressive! I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285, two-way starter. Would love to connect about camps or a visit this summer. Thank you!`,
    xCallout: `UMAC Champions in 2024! @UNWEagles football's 9-3 season shows what Northwestern is building. As a Class of 2029 OL/DL from Wisconsin (6'4" 285), love the program's trajectory. Hoping to learn more this summer! #Eagles #D3Football #RecruitJacob`,
  },

  {
    coachName: "Joel King",
    schoolName: "Concordia College",
    position: "Run Game Coordinator / Offensive Line Coach",
    email: "jking@cord.edu",
    emailConfirmed: true,
    xHandle: null,
    wave: 1,
    priority: "high",
    conference: "MIAC",
    notes: "Concordia went 7-3 in 2024. HC Terry Horan is in his 25th season with a 150-84 all-time record — among the most tenured D3 coaches in the country. Joel King handles both run game coordination and OL — perfect contact. Phone: 218-299-4934. Moorhead, MN campus is close to Fargo.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach King,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. I'm reaching out because Concordia's 7-3 season in 2024 and Coach Horan's 25 years of building the program — 150 wins is a remarkable milestone — are exactly the kind of stability and culture I'm looking for.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

As Run Game Coordinator and OL Coach, I wanted to reach out to you directly. I play Center/Guard on offense with a focus on physical run blocking and technique, and I also start on the defensive line. That two-way experience gives me an understanding of footwork, leverage, and defensive reads that I think translates well to your system.

Moorhead and Concordia's academics in the MIAC are both strong draws. Are there any camps, prospect days, or visit opportunities coming up this spring or summer?

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach King — 7-3 in 2024 and Coach Horan's 150 wins in 25 seasons says everything about Concordia's program culture. I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285. Any camps this summer? Thank you, Coach!`,
    xCallout: `25 years, 150 wins — that's what Coach Horan has built at @ConcordiaCobbers football. As a Class of 2029 OL/DL from Wisconsin (6'4" 285), that kind of program culture is exactly what I want. Looking forward to connecting with Concordia this summer! #Cobbers #D3Football #RecruitJacob`,
  },

  // ─── WAVE 2: Solid Programs ──────────────────────────────────────────────────

  {
    coachName: "Matthew Paulson",
    schoolName: "St. Olaf College",
    position: "Offensive Coordinator / Offensive Line Coach",
    email: "paulso2@stolaf.edu",
    emailConfirmed: true,
    xHandle: null,
    wave: 2,
    priority: "medium",
    conference: "MIAC",
    notes: "St. Olaf went 7-3 in 2024 — their first 7-win season since 2012. HC James Kilian: kilian1@stolaf.edu. Paulson handles both OC and OL — single contact for the offense. Northfield, MN campus (also home to Carleton). Noteworthy academic reputation (consistently ranked in top liberal arts colleges nationally).",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Paulson,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. St. Olaf's 7-3 season in 2024 — the program's best since 2012 — caught my attention, and I wanted to reach out as the program continues to build momentum.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I understand you oversee both the offensive line and the OC responsibilities, so I wanted to connect directly. I play Center/Guard on offense and Defensive Tackle on defense. St. Olaf's academic reputation is something I've specifically looked at — consistently ranked among the top liberal arts colleges in the country — and competing in the MIAC adds the football challenge I'm looking for.

Are there any summer camps, prospect days, or visit opportunities in Northfield I should have on my radar?

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Paulson — St. Olaf's first 7-win season since 2012 is real program momentum! I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285. St. Olaf's academics + MIAC football is a great fit. Any camps this summer? Thank you!`,
    xCallout: `First 7-win season since 2012 at @StolafsOles football — that's program momentum. As a Class of 2029 OL/DL from Wisconsin (6'4" 285), St. Olaf's academics + MIAC competition is a compelling combination. Looking forward to visiting Northfield! #Oles #D3Football #RecruitJacob`,
  },

  {
    coachName: "Scott Van Epps",
    schoolName: "Carleton College",
    position: "Offensive Line Coach",
    email: "svanepps@carleton.edu",
    emailConfirmed: true,
    xHandle: null,
    wave: 2,
    priority: "medium",
    conference: "MIAC",
    notes: "Carleton went 5-5 in 2024. HC Tom Journell: tjournell@carleton.edu. OC Alex Balogh: abalogh@carleton.edu. Staff confirmed from athletics.carleton.edu. Notable: under prior staff, Carleton broke 23 school records and had its first winning season in 13 years. Academic powerhouse — one of the most selective LACs in the country. Northfield, MN (same city as St. Olaf).",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Van Epps,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. I'm reaching out because Carleton College is one of those places where football and academic excellence coexist in a way that's genuinely rare — and that combination appeals to me a great deal.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I play Center/Guard on offense and Defensive Tackle on defense — two-way starter since my freshman year. After the program's recent growth (23 school records broken, a first winning season in over a decade), I wanted to reach out early in the current staff's tenure. Northfield is a compelling college town, and competing in the MIAC is the challenge I'm looking for.

Are there any upcoming camps, prospect days, or visit opportunities I should have on my calendar?

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Van Epps — Carleton's 5-5 season + 23 school records in recent years shows real program growth. I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285. Carleton's academics + MIAC football is a rare combo. Any camps this summer? Thank you!`,
    xCallout: `Academic excellence meets MIAC football at @CarletonKnights — a rare combination worth pursuing. As a Class of 2029 OL/DL from Wisconsin (6'4" 285), the challenge of competing + excelling academically is what I'm looking for. Hoping to visit Northfield! #Knights #D3Football #RecruitJacob`,
  },

  {
    coachName: "Ethan Sindelir",
    schoolName: "Gustavus Adolphus College",
    position: "Offensive Line Coach",
    email: "esindelir@gustavus.edu",
    emailConfirmed: false,
    xHandle: null,
    wave: 2,
    priority: "medium",
    conference: "MIAC",
    notes: "Gustavus went 5-5 in 2024. HC Peter Haugen in his 17th year: phaugen2@gustavus.edu. OC Bob Davies left Feb 2025 for Hamline HC position — new OC TBD. Sindelir remains as OL coach. St. Peter, MN campus. MIAC program with long HC tenure.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Sindelir,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. I'm interested in Gustavus Adolphus and the football program Coach Haugen has built over 17 years in St. Peter.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I play both Center/Guard on offense and Defensive Tackle on defense — two-way starter at Pewaukee, which gives me experience understanding blocking from both sides. Gustavus's combination of MIAC competition and strong liberal arts academics is genuinely appealing to me. I'd love to learn more about the program and any camp or visit opportunities coming up.

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Sindelir — Gustavus's MIAC pedigree under 17-year HC Coach Haugen speaks for itself. I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285, two-way starter. Any camps in St. Peter this summer? Would love to connect. Thank you!`,
    xCallout: `17 years of program-building at @GustiesFootball under Coach Haugen — that's MIAC tradition. As a Class of 2029 OL/DL from Wisconsin (6'4" 285), love the culture at Gustavus. Looking forward to visiting St. Peter! #Gusties #D3Football #RecruitJacob`,
  },

  {
    coachName: "Nathan Tenut",
    schoolName: "Augsburg University",
    position: "Offensive Line Coach",
    email: "tenut@augsburg.edu",
    emailConfirmed: true,
    xHandle: null,
    wave: 2,
    priority: "medium",
    conference: "MIAC",
    notes: "Augsburg went 4-6 in 2024. HC change: Lamker resigned May 2025, KiJuan Ware hired June 2025 (first Black HC in MIAC, alongside Hamline's Davies). Tenut has been OL coach for 11+ years — extremely stable contact. Phone: 612-330-1688. Minneapolis campus. New HC brings opportunity for a 2029 OL to get in early with a new vision.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Tenut,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. I understand Coach Ware is bringing a new direction to Augsburg football, and as someone who's been anchoring the OL program for over a decade, I wanted to reach out to you directly.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I play Center/Guard on offense and Defensive Tackle on defense — two-way starter at Pewaukee. Augsburg's location in Minneapolis and MIAC competition both appeal to me, and I wanted to get on your radar early in this new chapter for the program.

Are there any camps, open practices, or visit opportunities coming up this spring or summer? I'd appreciate the chance to learn more.

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Tenut — Exciting new chapter at Augsburg with Coach Ware. With your 11+ years as OL coach, I wanted to connect early. I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285. Any camps this summer in Minneapolis? Thank you!`,
    xCallout: `Exciting new era at @AugsburgFB under Coach Ware in Minneapolis! As a Class of 2029 OL/DL from Wisconsin (6'4" 285), getting in early with programs building something new is the move. Looking forward to connecting with Augsburg! #D3Football #RecruitJacob #MIAC`,
  },

  // ─── WAVE 3: Rebuilding / Lower Priority ────────────────────────────────────

  {
    coachName: "Michael Harris",
    schoolName: "Hamline University",
    position: "Offensive Line Coach / Offensive Coordinator",
    email: "mharris22@hamline.edu",
    emailConfirmed: true,
    xHandle: null,
    wave: 3,
    priority: "low",
    conference: "MIAC",
    notes: "Hamline went 3-7 in 2024. HC Chip Taylor resigned Nov 2025; new HC Bob Davies (former Gustavus OC) hired Dec 2025. Harris was promoted from OL coach to OC for 2025 — won 2025 NFL Bill Walsh Diversity Coaching Fellowship. Both Harris (OC/OL) and Davies (new HC) are new in their expanded roles for 2025, building fresh opportunity for 2029 recruit.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Harris,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. Congratulations on your promotion to Offensive Coordinator alongside your OL responsibilities — and on being selected for the 2025 NFL Bill Walsh Diversity Coaching Fellowship. That recognition is well-earned.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I wanted to reach out as Coach Davies is getting started and a new chapter begins at Hamline. I play Center/Guard on offense and Defensive Tackle on defense — two-way starter at Pewaukee. I'd love to learn more about what you and Coach Davies are building and any camp or visit opportunities coming up.

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Harris — Congrats on the OC promotion + NFL Bill Walsh Fellowship! I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285. Excited about what you and Coach Davies are building at Hamline. Any camps this summer? Thank you!`,
    xCallout: `Congrats to @HamlinePipers OC Coach Harris on the NFL Bill Walsh Diversity Coaching Fellowship! New era at Hamline with Coach Davies. As a Class of 2029 OL/DL from Wisconsin (6'4" 285), excited to see what the new staff builds! #D3Football #RecruitJacob #MIAC`,
  },

  {
    coachName: "Paul Huebner",
    schoolName: "Martin Luther College",
    position: "Head Coach",
    email: "huebnepd@mlc-wels.edu",
    emailConfirmed: true,
    xHandle: null,
    wave: 3,
    priority: "low",
    conference: "UMAC",
    notes: "MLC went 6-4 in 2024 (4-3 UMAC, 3rd place). Huebner in 3rd year as HC. UMAC program, not MIAC. New Ulm, MN. Specific OL coach not confirmed — email Huebner who can route to OL staff. WELS Lutheran affiliated institution — unique faith-based environment.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Huebner,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. I'm reaching out because Martin Luther College's 6-4 season in 2024 caught my attention, and I wanted to learn more about the program you're building in New Ulm.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I play Center/Guard on offense and Defensive Tackle on defense. MLC's faith-based environment is something that appeals to me, and I'd love to learn more about the football program and any camp or visit opportunities coming up this spring or summer.

Could you point me to the right person on your offensive line staff, or let me know if there's a camp or prospect day I should have on my calendar?

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Huebner — MLC's 6-4 season in 2024 is solid UMAC football. I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285. Faith-based environment + competitive football is a great combination. Any camps this summer? Thank you!`,
    xCallout: `Solid 6-4 season for @MLCKnightsFB in New Ulm! As a Class of 2029 OL/DL from Wisconsin (6'4" 285), faith-based D3 football is on my radar. Looking forward to learning more about Martin Luther College! #D3Football #RecruitJacob #UMAC`,
  },
];
