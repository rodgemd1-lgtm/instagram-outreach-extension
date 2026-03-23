// Michigan D3 Coach Outreach Campaign — Emails, DMs, and X Callout Posts
// Generated 2026-03-23 via research across 8 Michigan MIAA D3 programs
// Conference: MIAA (Michigan Intercollegiate Athletic Association)
// Excluded: Finlandia (closed), Concordia Ann Arbor (NAIA/discontinued), Rochester (no football)

export interface MichiganCoachOutreach {
  coachName: string;
  schoolName: string;
  position: string;
  email: string | null;
  emailConfirmed: boolean; // true = verified from source; false = estimated pattern
  xHandle: string | null;
  emailDraft: { subject: string; body: string };
  dmDraft: string;
  xCallout: string;
  wave: 1 | 2 | 3;
  priority: "high" | "medium" | "low";
  notes: string;
}

export const MI_D3_OUTREACH: MichiganCoachOutreach[] = [
  // ─── WAVE 1: Top Programs ────────────────────────────────────────────────────

  {
    coachName: "Hunter Thompson",
    schoolName: "Hope College",
    position: "Offensive Line Coach / Recruiting Coordinator",
    email: "hthompson@hope.edu",
    emailConfirmed: false, // estimated — verify at athletics.hope.edu/staff-directory
    xHandle: null,
    wave: 1,
    priority: "high",
    notes: "Best program in Michigan D3 in 2024. Hope went 10-0 (first in 122-year history), outright MIAA champs, NCAA D3 playoffs. Thompson is OL coach AND Recruiting Coordinator — he's the exact right contact. HC Peter Stuursma won AFCA Region 4 Coach of Year + MIAA Coach of Year. Phone: 616-395-7070.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Thompson,

My name is Jacob Rodgers and I'm a sophomore offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin (Class of 2029). I'm reaching out because what Hope College did in 2024 was remarkable — going 10-0 in the regular season for the first time in 122 years, winning the MIAA outright, and making the NCAA D3 playoffs under Coach Stuursma. That kind of program-building is exactly what I want to be part of.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I play both Center/Guard on offense and Defensive Tackle on defense — I love the physicality and technique involved in playing in the trenches on both sides of the ball. I believe that two-way experience gives me an edge in understanding both blocking schemes and defensive tendencies. Hope's culture of competing at the highest level while getting an outstanding education in Holland is a combination I find incredibly compelling.

Are there any spring or summer camps, prospect days, or visit opportunities I should know about? I'd love to learn more about the program and how I might fit into what you're building.

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Thompson — Hope's 10-0 season + MIAA title is incredible — 122 years of history made in one year! I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285, two-way starter. Would love to connect about camps or a visit this summer. Thank you!`,
    xCallout: `What @HopeFlyingDutch football did in 2024 — 10-0, MIAA champs — is program-building at its finest. As a Class of 2029 OL/DL from Wisconsin (6'4" 285), Hope's culture is everything I'm looking for. Hoping to visit Holland this summer! #MIAAFootball #D3Football #RecruitJacob`,
  },

  {
    coachName: "Jason Polmanteer",
    schoolName: "Alma College",
    position: "Offensive Line Coach / Recruiting Coordinator",
    email: "jpolmanteer@alma.edu",
    emailConfirmed: false, // estimated — verify at almascots.com/sports/football/coaches
    xHandle: null,
    wave: 1,
    priority: "high",
    notes: "8-2 season in 2024, 6-1 MIAA (2nd place), NCAA D3 playoff appearance. Polmanteer handles BOTH OL and recruiting — perfect contact for Jacob. HC Jason Couch won 2023 MIAA Coach of the Year, 7th season. Consistent program.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Polmanteer,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. I'm reaching out because Alma College has consistently been one of the top programs in the MIAA, and your 8-2 season and playoff appearance in 2024 under Coach Couch caught my attention.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

As someone who handles both the offensive line room and recruiting, I wanted to reach out directly. I play Center/Guard on offense and Defensive Tackle on defense — I've been a two-way starter since my freshman year, and I think that versatility and understanding of both sides of the line of scrimmage could translate well at the D3 level.

Alma's combination of competitive football in the MIAA alongside strong academics in Alma, Michigan is exactly the environment I'm looking for. I'd love to learn more about your program and any camp or visit opportunities this spring or summer.

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Polmanteer — Alma's 8-2 season + D3 playoff run in 2024 is impressive. I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285, two-way starter. Would love to connect about camps this summer. Thank you, Coach!`,
    xCallout: `Impressed by @AlmaScots football's 8-2 season and D3 playoff appearance in 2024! As a Class of 2029 OL/DL from Wisconsin (6'4" 285), competing at that level in the MIAA is the goal. Looking forward to learning more about Alma this summer! #D3Football #RecruitJacob #MIAAFootball`,
  },

  {
    coachName: "Kyle Avaloy",
    schoolName: "Albion College",
    position: "Offensive Line Coach",
    email: "kavaloy@albion.edu",
    emailConfirmed: true, // CONFIRMED from gobrits.com/staff-directory/kyle-avaloy/242
    xHandle: null,
    wave: 1,
    priority: "high",
    notes: "Solid 7-3 season in 2024, 5-2 MIAA. Albion's offense ranked #5 in D3 nationally in passing yards/game (320.4 ypg). HC Travis Rundle also serves as DC. Avaloy's email is confirmed. OC Stephen Wasil has been there since 2018.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Avaloy,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. I'm reaching out because Albion had a strong 7-3 season in 2024, and with an offense that ranked in the top 5 in all of D3 in passing yards per game (320.4 ypg), it's clear the Britons know how to develop an O-line.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I'm a two-way lineman — Center/Guard on offense and Defensive Tackle on defense. I love competing in the trenches on both sides of the ball, and I think that dual perspective makes me a more complete lineman. Albion's academics and the MIAA's level of competition are both really appealing to me.

I'd love to connect and learn about any upcoming camp or visit opportunities. Are there prospect days or summer camps coming up that I should have on my radar?

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Avaloy — Albion's 7-3 season + top-5 D3 passing offense (320 ypg) shows elite OL development. I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285. Any camps this summer? Would love to connect. Thank you!`,
    xCallout: `Shoutout to @AlbionBritsFB for a strong 7-3 season and a top-5 D3 passing offense in 2024! As a Class of 2029 OL/DL from Wisconsin (6'4" 285), that kind of program development is what I'm looking for. Hope to visit Albion this summer! #GoBreits #D3Football #RecruitJacob`,
  },

  // ─── WAVE 2: Mid-Tier / New Regime / Build Opportunities ─────────────────────

  {
    coachName: "Ed Reny",
    schoolName: "Olivet College",
    position: "Offensive Line Coach / Recruiting Coordinator",
    email: "EReny@UOlivet.edu",
    emailConfirmed: true, // CONFIRMED from olivetcomets.com/sports/fball/coaches/RenyEd
    xHandle: null,
    wave: 2,
    priority: "medium",
    notes: "Major coaching change Nov 2024 — Dan Musielewicz fired after 3-7 season. New HC: Erik Ieuter (formerly Muskingum). Ed Reny is the confirmed OL/TE/Recruiting Coordinator under the new staff. OPPORTUNITY: new regime means coaches are actively building their roster — getting in early with a 2029 recruit could be valuable.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Reny,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. I noticed that Coach Ieuter joined Olivet this year and is building a new staff, and I wanted to reach out early in this new chapter for the program.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I play both Center/Guard on offense and Defensive Tackle on defense — I've been a two-way starter for Pewaukee and I take pride in my technique and football IQ on both sides of the ball. I understand you're handling both the offensive line and recruiting, so I wanted to connect directly with you.

Olivet's location in Michigan and MIAA competition are both on my radar as I think about where I want to spend the next four years. I'd love to learn more about what Coach Ieuter and the new staff are building and see if there's a fit.

Are there any upcoming camps, open practices, or visit opportunities? I appreciate your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Reny — Congrats on joining Coach Ieuter's new staff at Olivet! I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285, two-way starter. Would love to connect early about the program and camps this summer. Thank you!`,
    xCallout: `Excited to learn about the new direction at @OlivetComets football under Coach Ieuter! As a Class of 2029 OL/DL from Wisconsin (6'4" 285), reaching out early to programs building something special. Look forward to connecting! #D3Football #RecruitJacob #MIAAFootball`,
  },

  {
    coachName: "Chris Hedden",
    schoolName: "Trine University",
    position: "Run Game Coordinator / Offensive Line Coach",
    email: "chedden@trine.edu",
    emailConfirmed: false, // estimated — verify at trinethunder.com/staff-directory/chris-hedden/260
    xHandle: null,
    wave: 2,
    priority: "medium",
    notes: "Trine went 6-4 in 2024, 4-3 MIAA. HC Troy Abbs has a 67-31 record (.683) in 11 seasons — best in program history. Hedden returned for his 2nd stint at Trine as Run Game Coordinator/OL Coach in summer 2024. Consistent winning program on the MI/IN border.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Hedden,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. I'm interested in Trine University's football program — Coach Abbs has built something remarkable in Angola, and an 11-season record of 67-31 (.683 win percentage) speaks for itself.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

As Run Game Coordinator and OL Coach, I wanted to reach out directly. I play Center/Guard on offense with a focus on run blocking — I love physical, downhill football and take pride in opening holes in the run game. I also play Defensive Tackle, which gives me a good understanding of what defensive linemen are looking for when they line up across from me.

Trine's location in Angola and the MIAA schedule both appeal to me. I'd love to learn more about the program and any camp or prospect day opportunities this spring or summer.

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Hedden — Trine's 67-31 record under Coach Abbs shows a program that knows how to win. I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285, run-first mindset. Any camps or visits this summer? Thank you, Coach!`,
    xCallout: `Respect for what @TrineThunder football has built under Coach Abbs — 67-31 over 11 seasons is a winning culture. As a Class of 2029 OL/DL from Wisconsin (6'4" 285), that consistency is exactly what I'm looking for. Hope to get to Angola this summer! #D3Football #RecruitJacob`,
  },

  {
    coachName: "Austin Garde",
    schoolName: "Calvin University",
    position: "Offensive Line Coach",
    email: "austin.garde@calvin.edu",
    emailConfirmed: true, // CONFIRMED from calvinknights.com/news/2024/5/30/...
    xHandle: null,
    wave: 2,
    priority: "medium",
    notes: "Calvin played its FIRST-EVER varsity football season in 2024 (went 2-10, 0-7 MIAA — expected for Year 1). Garde was hired specifically for the OL position in May 2024. Getting in with a brand-new program in Year 1 as a Class of 2029 OL means you could be part of something built from the ground up. First program win was 50-6 over Oberlin. OC Ben Dixon won a Hansen Ratings OC of the Week award.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Garde,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. I know you're building something from the ground up at Calvin University — launching a varsity football program in 2024 is an exciting challenge, and I wanted to reach out early as you're building your roster for the future.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I play Center/Guard on offense and Defensive Tackle on defense. I've thought a lot about what it would mean to be part of a program that's writing its history from scratch — to be one of the foundational pieces that sets the standard for Calvin football going forward. Grand Rapids and Calvin's academics are both things I find genuinely compelling.

I know a Class of 2029 recruit reaching out in Year 1 of your program might be early, but I figured it's exactly the right time. Are there camps or visit opportunities this spring or summer I should know about?

Thank you for everything you're building, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Garde — Being part of building Calvin football from the ground up in Year 1 is something special. I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285. Would love to connect early about the program and summer camps. Thank you!`,
    xCallout: `Excited to follow @CalvinKnightsFB as they build something from scratch in Grand Rapids. As a Class of 2029 OL/DL from Wisconsin (6'4" 285), being part of building a program's history is a unique opportunity. Looking forward to learning more! #D3Football #RecruitJacob #MIAA`,
  },

  // ─── WAVE 3: Additional Programs ─────────────────────────────────────────────

  {
    coachName: "D.J. Haskins",
    schoolName: "Adrian College",
    position: "Offensive Line Coach",
    email: "djhaskins@adrian.edu",
    emailConfirmed: false, // estimated — verify at adrianbulldogs.com
    xHandle: null,
    wave: 3,
    priority: "low",
    notes: "Adrian went 6-4 in 2024 (3-4 MIAA, 5th place). New HC Joe Palka in his first season (hired Nov 2023). OC Tyler Palka (Joe's son) led offense to a school-record 209 completions in a season. Palka regime is new — still finding their footing.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Haskins,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. I'm interested in Adrian College and the direction Coach Palka and the new staff are taking the program.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I play Center/Guard on offense and Defensive Tackle on defense — two-way lineman with experience on both sides of the ball. Adrian's location in southern Michigan and the MIAA schedule both interest me. I'd love to learn more about the program and any camp or visit opportunities this spring or summer.

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Haskins — I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285, two-way starter. Interested in what the new staff is building at Adrian. Any camps this summer? Would love to connect. Thank you!`,
    xCallout: `Looking at @AdrianBulldogs football as Coach Palka builds the program in Adrian, MI. As a Class of 2029 OL/DL from Wisconsin (6'4" 285), excited to see what the new staff builds in the MIAA. #D3Football #RecruitJacob #MIAAFootball`,
  },

  {
    coachName: "John Krajacic",
    schoolName: "Kalamazoo College",
    position: "Head Coach (formerly OL Coach — promoted Dec 2025)",
    email: "jkrajacic@kzoo.edu",
    emailConfirmed: false, // estimated — verify at hornets.kzoo.edu
    xHandle: null,
    wave: 3,
    priority: "low",
    notes: "Kalamazoo went 4-6 in 2024, 1-6 MIAA (7th place). HC Jamie Zorbo stepped down and Krajacic (who was OL/Co-OC) was named HC in Dec 2025. A new HC from an OL background is a good contact for an OL recruit. Small liberal arts school in Kalamazoo. K-Plan is a distinctive academic model.",
    emailDraft: {
      subject: "Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)",
      body: `Coach Krajacic,

My name is Jacob Rodgers and I'm a Class of 2029 offensive and defensive lineman at Pewaukee High School in Pewaukee, Wisconsin. Congratulations on being named head coach at Kalamazoo — as someone who came through the offensive line room, I knew reaching out to you directly made sense.

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

I play Center/Guard on offense and Defensive Tackle on defense — I've been a two-way starter since my freshman year. Kalamazoo's K-Plan and the college's reputation for academics are things I've specifically looked at. I'd love to learn about what you're building as you take over the program and any camp or visit opportunities coming up this spring or summer.

Thank you for your time, Coach.

Jacob Rodgers`,
    },
    dmDraft: `Coach Krajacic — Congrats on taking over as HC at Kalamazoo! As an OL-background coach, I wanted to connect. I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285. Any camps this summer? Thank you!`,
    xCallout: `Congrats to @KZooHornets football's new HC Coach Krajacic on the promotion! As a Class of 2029 OL/DL from Wisconsin (6'4" 285), excited to see what the program builds in Kalamazoo. #D3Football #RecruitJacob #MIAA`,
  },
];
