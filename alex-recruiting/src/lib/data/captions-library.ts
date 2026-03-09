// Captions Library — 60+ ready-to-post captions for Jacob Rodgers' X account

export type CaptionPillar = "performance" | "work_ethic" | "character";
export type CaptionMediaType = "film_clip" | "training_video" | "photo" | "graphic" | "text_only";
export type EngagementLevel = "low" | "medium" | "high" | "viral";

export interface Caption {
  id: string;
  title: string;
  fullCaption: string;
  pillar: CaptionPillar;
  hashtags: string[];
  mediaType: CaptionMediaType;
  estimatedEngagement: EngagementLevel;
}

export const captionsLibrary: Caption[] = [
  // ─── FILM CAPTIONS (15+) ─────────────────────────────────────────
  {
    id: "fc-001",
    title: "Drive Block Finish",
    fullCaption: `Watch how I finish this drive block through the whistle. Pad level, hand placement, and leg drive — the three things I focus on every rep.

Full film on my NCSA profile. Link in bio.

#OL #OffensiveLine #2029Recruit #FootballRecruiting #WisconsinFootball`,
    pillar: "performance",
    hashtags: ["#OL", "#OffensiveLine", "#2029Recruit", "#FootballRecruiting", "#WisconsinFootball"],
    mediaType: "film_clip",
    estimatedEngagement: "high",
  },
  {
    id: "fc-002",
    title: "Pass Protection Anchor",
    fullCaption: `Pass protection from last Friday. The bull rush is coming — watch the anchor at 0:05. 285 lbs with a low center of gravity. That's the advantage.

Working on getting even better every week.

#OL #PassProtection #2029Recruit #FootballRecruiting #PewaukeeFootball`,
    pillar: "performance",
    hashtags: ["#OL", "#PassProtection", "#2029Recruit", "#FootballRecruiting", "#PewaukeeFootball"],
    mediaType: "film_clip",
    estimatedEngagement: "high",
  },
  {
    id: "fc-003",
    title: "Combo Block to Second Level",
    fullCaption: `Inside zone — combo block with my guard, then climbing to the second level to pick up the linebacker. Communication + execution = big gain.

This is what OL play looks like when it's done right.

#OffensiveLine #OL #2029Recruit #FootballRecruiting #FilmDontLie`,
    pillar: "performance",
    hashtags: ["#OffensiveLine", "#OL", "#2029Recruit", "#FootballRecruiting", "#FilmDontLie"],
    mediaType: "film_clip",
    estimatedEngagement: "high",
  },
  {
    id: "fc-004",
    title: "Pancake Block Highlight",
    fullCaption: `When you win the pad level battle, this is what happens. Drive block, full extension, pancake.

The offensive line doesn't get highlight reels very often. Here's mine.

#OL #Pancake #2029Recruit #OffensiveLine #FootballRecruiting`,
    pillar: "performance",
    hashtags: ["#OL", "#Pancake", "#2029Recruit", "#OffensiveLine", "#FootballRecruiting"],
    mediaType: "film_clip",
    estimatedEngagement: "viral",
  },
  {
    id: "fc-005",
    title: "Pull Block Execution",
    fullCaption: `Pull block from the backside on a counter play. 285 lbs pulling across the formation and sealing the edge. That's what they train us to do.

The running back scored on this play. That's the OL's job — make their job easy.

#OL #OffensiveLine #2029Recruit #FootballRecruiting #WIHSFootball`,
    pillar: "performance",
    hashtags: ["#OL", "#OffensiveLine", "#2029Recruit", "#FootballRecruiting", "#WIHSFootball"],
    mediaType: "film_clip",
    estimatedEngagement: "high",
  },
  {
    id: "fc-006",
    title: "Short Yardage Domination",
    fullCaption: `4th and 1. They know we're running. We score anyway.

This is the mentality of the Pewaukee OL. When we need a yard, we get it. Every time.

#OL #OffensiveLine #2029Recruit #FootballRecruiting #Pewaukee`,
    pillar: "performance",
    hashtags: ["#OL", "#OffensiveLine", "#2029Recruit", "#FootballRecruiting", "#Pewaukee"],
    mediaType: "film_clip",
    estimatedEngagement: "viral",
  },
  {
    id: "fc-007",
    title: "Blitz Pickup",
    fullCaption: `Pre-snap read, identify the blitz, adjust protection, and shut it down. Being an OL isn't just about being big — it's about being smart.

6'4" 285 with a high football IQ. That's the complete package.

#OL #OffensiveLine #2029Recruit #FootballRecruiting #FilmStudy`,
    pillar: "performance",
    hashtags: ["#OL", "#OffensiveLine", "#2029Recruit", "#FootballRecruiting", "#FilmStudy"],
    mediaType: "film_clip",
    estimatedEngagement: "high",
  },
  {
    id: "fc-008",
    title: "First Step Quickness",
    fullCaption: `First step off the snap. That initial explosion is everything for an OL — it sets the tone for the entire block.

Been working on this all off-season at @IMGAcademy. The difference is showing up on film.

#OL #OffensiveLine #2029Recruit #IMGAcademy #FootballRecruiting`,
    pillar: "performance",
    hashtags: ["#OL", "#OffensiveLine", "#2029Recruit", "#IMGAcademy", "#FootballRecruiting"],
    mediaType: "film_clip",
    estimatedEngagement: "high",
  },
  {
    id: "fc-009",
    title: "Red Zone Execution",
    fullCaption: `Red zone. Tight quarters. No room for error. Watch how the OL creates the lane for the touchdown.

This is where games are won — at the point of attack.

#OL #OffensiveLine #2029Recruit #FootballRecruiting #WisconsinFootball`,
    pillar: "performance",
    hashtags: ["#OL", "#OffensiveLine", "#2029Recruit", "#FootballRecruiting", "#WisconsinFootball"],
    mediaType: "film_clip",
    estimatedEngagement: "high",
  },
  {
    id: "fc-010",
    title: "Technique Breakdown",
    fullCaption: `Breaking down my technique on this rep:
- Hand placement on the chest plate
- Knee bend for leverage
- Feet never stop moving
- Finish through the whistle

This is what I'm working to perfect every single day.

#OL #OffensiveLine #2029Recruit #FootballRecruiting #Technique`,
    pillar: "performance",
    hashtags: ["#OL", "#OffensiveLine", "#2029Recruit", "#FootballRecruiting", "#Technique"],
    mediaType: "film_clip",
    estimatedEngagement: "high",
  },
  {
    id: "fc-011",
    title: "Season Highlight Reel",
    fullCaption: `Season highlights from my sophomore year. Drive blocks, pull blocks, pass protection — the full toolkit.

6'4" 285. Class of 2029. Pewaukee HS, Wisconsin. Training at @IMGAcademy.

Full film on my NCSA profile. Link in bio.

#OL #OffensiveLine #2029Recruit #FootballRecruiting #Highlights`,
    pillar: "performance",
    hashtags: ["#OL", "#OffensiveLine", "#2029Recruit", "#FootballRecruiting", "#Highlights"],
    mediaType: "film_clip",
    estimatedEngagement: "viral",
  },
  {
    id: "fc-012",
    title: "Game Film Resume",
    fullCaption: `Film is my resume. Every rep tells coaches who I am as a player.

This clip? It says I finish. I compete. I don't take plays off.

Updated film on my profile. Coaches, I'd love to be on your radar.

#OL #2029Recruit #FootballRecruiting #CFBRecruiting #FilmDontLie`,
    pillar: "performance",
    hashtags: ["#OL", "#2029Recruit", "#FootballRecruiting", "#CFBRecruiting", "#FilmDontLie"],
    mediaType: "film_clip",
    estimatedEngagement: "high",
  },
  {
    id: "fc-013",
    title: "Double Team Execution",
    fullCaption: `Double team at the point of attack — watch how we collapse the D-line and create movement. Then I climb to the second level.

The details matter. Timing, hip placement, who peels off — all of it.

#OL #OffensiveLine #2029Recruit #FootballRecruiting #Pewaukee`,
    pillar: "performance",
    hashtags: ["#OL", "#OffensiveLine", "#2029Recruit", "#FootballRecruiting", "#Pewaukee"],
    mediaType: "film_clip",
    estimatedEngagement: "high",
  },
  {
    id: "fc-014",
    title: "Fourth Quarter Finish",
    fullCaption: `4th quarter. We're ahead. They know we're running the clock. We still move the pile.

That's what OL toughness looks like. You play all 48 minutes the same way.

#OL #OffensiveLine #2029Recruit #FootballRecruiting #4thQuarter`,
    pillar: "performance",
    hashtags: ["#OL", "#OffensiveLine", "#2029Recruit", "#FootballRecruiting", "#4thQuarter"],
    mediaType: "film_clip",
    estimatedEngagement: "high",
  },
  {
    id: "fc-015",
    title: "Lateral Movement Showcase",
    fullCaption: `285 lbs doesn't mean slow. Watch the lateral movement on this pass set — mirroring the edge rusher step for step.

Size + athleticism. That's what I'm building at @IMGAcademy.

#OL #OffensiveLine #2029Recruit #IMGAcademy #FootballRecruiting`,
    pillar: "performance",
    hashtags: ["#OL", "#OffensiveLine", "#2029Recruit", "#IMGAcademy", "#FootballRecruiting"],
    mediaType: "film_clip",
    estimatedEngagement: "viral",
  },
  {
    id: "fc-016",
    title: "Week to Week Improvement",
    fullCaption: `Left clip: Week 2. Right clip: Week 8. Same play, better execution.

The difference? Hundreds of reps in practice, film study every night, and coaching that pushes me to improve.

Growth is the goal. Every week.

#OL #2029Recruit #FootballRecruiting #Improvement #OffensiveLine`,
    pillar: "performance",
    hashtags: ["#OL", "#2029Recruit", "#FootballRecruiting", "#Improvement", "#OffensiveLine"],
    mediaType: "film_clip",
    estimatedEngagement: "viral",
  },

  // ─── TRAINING CAPTIONS (15+) ─────────────────────────────────────
  {
    id: "tc-001",
    title: "Early Morning Grind",
    fullCaption: `5 AM alarm. Dark outside. Cold garage gym. Nobody watching.

This is where the separation happens. While everyone else sleeps, I'm getting 1% better.

285 lbs and growing. Class of 2029.

#PutInTheWork #2029Recruit #OffSeason #FootballTraining #OL`,
    pillar: "work_ethic",
    hashtags: ["#PutInTheWork", "#2029Recruit", "#OffSeason", "#FootballTraining", "#OL"],
    mediaType: "training_video",
    estimatedEngagement: "high",
  },
  {
    id: "tc-002",
    title: "Bench Press PR",
    fullCaption: `New bench PR today — 225 for reps. Six months ago this was my max single.

The strength program at @IMGAcademy raises the standard every day. Grateful for coaches who push me beyond what I think is possible.

The numbers don't lie. The work is paying off.

#BenchPress #2029Recruit #FootballTraining #IMGAcademy #OL`,
    pillar: "work_ethic",
    hashtags: ["#BenchPress", "#2029Recruit", "#FootballTraining", "#IMGAcademy", "#OL"],
    mediaType: "training_video",
    estimatedEngagement: "high",
  },
  {
    id: "tc-003",
    title: "IMG Academy Training Session",
    fullCaption: `Another day at @IMGAcademy. Position-specific work with some of the best OL coaches in the country.

Today's focus: pass set mechanics and recovery technique. The details at this level are what separate good from great.

Blessed to train alongside elite competition every day.

#IMGAcademy #2029Recruit #OL #OffensiveLine #FootballTraining`,
    pillar: "work_ethic",
    hashtags: ["#IMGAcademy", "#2029Recruit", "#OL", "#OffensiveLine", "#FootballTraining"],
    mediaType: "training_video",
    estimatedEngagement: "high",
  },
  {
    id: "tc-004",
    title: "Footwork Drill Session",
    fullCaption: `Footwork is the foundation of everything an OL does. Quick feet, balanced base, controlled movements.

Today's session: lateral shuffles, kick slides, and mirror drills. 285 lbs moving like this doesn't happen by accident.

#Footwork #OL #2029Recruit #FootballTraining #GetAfterIt`,
    pillar: "work_ethic",
    hashtags: ["#Footwork", "#OL", "#2029Recruit", "#FootballTraining", "#GetAfterIt"],
    mediaType: "training_video",
    estimatedEngagement: "high",
  },
  {
    id: "tc-005",
    title: "Film Study Session",
    fullCaption: `Film study Saturday. Watching my reps from Friday, identifying what I did well and what needs work.

The best players are their own toughest critics. I grade every single rep — good and bad.

Can't fix what you don't study.

#FilmStudy #2029Recruit #OL #FootballRecruiting #GetBetter`,
    pillar: "work_ethic",
    hashtags: ["#FilmStudy", "#2029Recruit", "#OL", "#FootballRecruiting", "#GetBetter"],
    mediaType: "photo",
    estimatedEngagement: "medium",
  },
  {
    id: "tc-006",
    title: "Squat Day",
    fullCaption: `Squat day. Building the base that everything else depends on.

Leg drive, hip power, explosiveness — it all starts here. When I'm under the bar, I'm building the player I want to become.

The weight room is where games are won in March.

#SquatDay #2029Recruit #FootballTraining #OL #Strength`,
    pillar: "work_ethic",
    hashtags: ["#SquatDay", "#2029Recruit", "#FootballTraining", "#OL", "#Strength"],
    mediaType: "training_video",
    estimatedEngagement: "medium",
  },
  {
    id: "tc-007",
    title: "Sprint and Conditioning Work",
    fullCaption: `285 lbs running sprints. Not everyone's favorite part of training — but the 4th quarter doesn't care if you're tired.

Conditioning is what separates a good first half from a dominant full game. Every sprint is an investment.

#Conditioning #2029Recruit #OL #FootballTraining #PutInTheWork`,
    pillar: "work_ethic",
    hashtags: ["#Conditioning", "#2029Recruit", "#OL", "#FootballTraining", "#PutInTheWork"],
    mediaType: "training_video",
    estimatedEngagement: "high",
  },
  {
    id: "tc-008",
    title: "Hand Fighting Drills",
    fullCaption: `Hand fighting drills with the boys. An OL's hands are his weapons — placement, speed, power, and timing all matter.

Working on my punch, inside hand control, and reset technique. The reps add up.

#HandFighting #OL #2029Recruit #FootballTraining #OffensiveLine`,
    pillar: "work_ethic",
    hashtags: ["#HandFighting", "#OL", "#2029Recruit", "#FootballTraining", "#OffensiveLine"],
    mediaType: "training_video",
    estimatedEngagement: "medium",
  },
  {
    id: "tc-009",
    title: "Power Clean PR",
    fullCaption: `New power clean PR. Explosiveness is everything for an offensive lineman — it's the difference between getting to your block and being late.

This is why we train. Not just to be strong — to be explosive.

#PowerClean #2029Recruit #OL #FootballTraining #Explosive`,
    pillar: "work_ethic",
    hashtags: ["#PowerClean", "#2029Recruit", "#OL", "#FootballTraining", "#Explosive"],
    mediaType: "training_video",
    estimatedEngagement: "high",
  },
  {
    id: "tc-010",
    title: "Off-Season Daily Routine",
    fullCaption: `Off-season daily routine:
- 5:30 AM: Wake up + meal prep
- 6:00 AM: Lift
- 7:30 AM: School
- 3:30 PM: Position work
- 5:00 PM: Film study
- 9:00 PM: Recovery + sleep

Every day. No days off from getting better.

#OffSeason #2029Recruit #OL #Routine #FootballTraining`,
    pillar: "work_ethic",
    hashtags: ["#OffSeason", "#2029Recruit", "#OL", "#Routine", "#FootballTraining"],
    mediaType: "graphic",
    estimatedEngagement: "viral",
  },
  {
    id: "tc-011",
    title: "Sled Push Work",
    fullCaption: `Sled pushes. Building the drive power that shows up in run blocking.

The sled doesn't care how big you are — you have to earn every inch. That's the mentality I bring to every rep on the field.

#SledPush #2029Recruit #OL #FootballTraining #Grind`,
    pillar: "work_ethic",
    hashtags: ["#SledPush", "#2029Recruit", "#OL", "#FootballTraining", "#Grind"],
    mediaType: "training_video",
    estimatedEngagement: "medium",
  },
  {
    id: "tc-012",
    title: "Agility Ladder Work",
    fullCaption: `Agility ladder for a 285-lb lineman. Coaches, if you want an OL who can move — here's your guy.

Athleticism isn't just for skill players. The modern OL has to be an athlete first.

#Agility #OL #2029Recruit #FootballTraining #BigManCan`,
    pillar: "work_ethic",
    hashtags: ["#Agility", "#OL", "#2029Recruit", "#FootballTraining", "#BigManCan"],
    mediaType: "training_video",
    estimatedEngagement: "high",
  },
  {
    id: "tc-013",
    title: "Nutrition and Recovery",
    fullCaption: `Fueling 285 lbs the right way. Meal prep Sunday — 6 meals a day, high protein, clean carbs. Building a D1 body takes D1 nutrition.

Recovery is just as important as the workout. Ice bath, stretching, 8+ hours of sleep. Every night.

#Nutrition #Recovery #2029Recruit #OL #FootballTraining`,
    pillar: "work_ethic",
    hashtags: ["#Nutrition", "#Recovery", "#2029Recruit", "#OL", "#FootballTraining"],
    mediaType: "photo",
    estimatedEngagement: "medium",
  },
  {
    id: "tc-014",
    title: "Deadlift Session",
    fullCaption: `Deadlift day. Building the posterior chain strength that creates dominant run blockers.

Every pound I add to the bar shows up on the field. That's the direct connection between the weight room and Friday nights.

#Deadlift #2029Recruit #OL #FootballTraining #Strength`,
    pillar: "work_ethic",
    hashtags: ["#Deadlift", "#2029Recruit", "#OL", "#FootballTraining", "#Strength"],
    mediaType: "training_video",
    estimatedEngagement: "medium",
  },
  {
    id: "tc-015",
    title: "Training Partner Push",
    fullCaption: `Iron sharpens iron. Training with guys who push me to be better every single day.

You're the average of the people you train with. That's why I'm at @IMGAcademy — the competition makes everyone better.

Grateful for training partners who don't let me slack.

#IronSharpensIron #2029Recruit #OL #IMGAcademy #TeamWork`,
    pillar: "work_ethic",
    hashtags: ["#IronSharpensIron", "#2029Recruit", "#OL", "#IMGAcademy", "#TeamWork"],
    mediaType: "training_video",
    estimatedEngagement: "medium",
  },
  {
    id: "tc-016",
    title: "Flexibility and Mobility",
    fullCaption: `Flexibility work. The strongest OL in the world is useless if he can't get into the right position.

Hip flexibility, ankle mobility, shoulder rotation — these are the things that let 285 lbs play fast and low.

Not glamorous. Absolutely necessary.

#Mobility #2029Recruit #OL #FootballTraining #Flexibility`,
    pillar: "work_ethic",
    hashtags: ["#Mobility", "#2029Recruit", "#OL", "#FootballTraining", "#Flexibility"],
    mediaType: "training_video",
    estimatedEngagement: "medium",
  },

  // ─── GAME DAY CAPTIONS (10+) ─────────────────────────────────────
  {
    id: "gd-001",
    title: "Pre-Game Energy",
    fullCaption: `Game day. Pewaukee OL is ready to dominate.

All the off-season work, all the early mornings, all the extra reps — it comes down to tonight. Time to perform.

#GameDay #2029Recruit #OL #PewaukeeFootball #FridayNightLights`,
    pillar: "performance",
    hashtags: ["#GameDay", "#2029Recruit", "#OL", "#PewaukeeFootball", "#FridayNightLights"],
    mediaType: "photo",
    estimatedEngagement: "high",
  },
  {
    id: "gd-002",
    title: "Big Win Recap",
    fullCaption: `Big win tonight. The OL set the tone from the first drive — 300+ rushing yards and 0 sacks allowed.

Proud of the effort from every single guy up front. That's Pewaukee OL culture.

Film coming soon.

#PewaukeeFootball #2029Recruit #OL #FridayNightLights #DubCity`,
    pillar: "performance",
    hashtags: ["#PewaukeeFootball", "#2029Recruit", "#OL", "#FridayNightLights", "#DubCity"],
    mediaType: "photo",
    estimatedEngagement: "high",
  },
  {
    id: "gd-003",
    title: "Playoff Game Hype",
    fullCaption: `Playoff football. This is what we've worked all year for. Pewaukee OL is locked in and ready to compete.

Win or go home. We're choosing to win.

#Playoffs #2029Recruit #OL #PewaukeeFootball #PostSeason`,
    pillar: "performance",
    hashtags: ["#Playoffs", "#2029Recruit", "#OL", "#PewaukeeFootball", "#PostSeason"],
    mediaType: "photo",
    estimatedEngagement: "high",
  },
  {
    id: "gd-004",
    title: "Tough Loss Response",
    fullCaption: `Tough one tonight. It hurts. But this team will respond the right way — we'll watch film, learn from it, and get back to work Monday.

Adversity reveals character. Ours is strong.

#PewaukeeFootball #2029Recruit #OL #KeepGoing #NextPlay`,
    pillar: "character",
    hashtags: ["#PewaukeeFootball", "#2029Recruit", "#OL", "#KeepGoing", "#NextPlay"],
    mediaType: "text_only",
    estimatedEngagement: "medium",
  },
  {
    id: "gd-005",
    title: "OL Stat Line",
    fullCaption: `Tonight's OL stat line:
- 350+ rushing yards
- 0 sacks allowed
- 3 rushing TDs
- 0 holding penalties

The offensive line doesn't show up in the box score. But we show up in the results.

#OL #2029Recruit #OffensiveLine #PewaukeeFootball #StatLine`,
    pillar: "performance",
    hashtags: ["#OL", "#2029Recruit", "#OffensiveLine", "#PewaukeeFootball", "#StatLine"],
    mediaType: "graphic",
    estimatedEngagement: "viral",
  },
  {
    id: "gd-006",
    title: "Under the Lights",
    fullCaption: `Friday night lights. There's nothing like it. The crowd, the energy, the competition.

This is why we put in the work all week. For moments like these.

#FridayNightLights #2029Recruit #OL #PewaukeeFootball #GameDay`,
    pillar: "performance",
    hashtags: ["#FridayNightLights", "#2029Recruit", "#OL", "#PewaukeeFootball", "#GameDay"],
    mediaType: "photo",
    estimatedEngagement: "high",
  },
  {
    id: "gd-007",
    title: "Homecoming Victory",
    fullCaption: `Homecoming W. Special night for Pewaukee. The OL came out with a nasty attitude and set the tone early.

Grateful to play in front of our community. This one was for them.

#Homecoming #PewaukeeFootball #2029Recruit #OL #CommunityFirst`,
    pillar: "performance",
    hashtags: ["#Homecoming", "#PewaukeeFootball", "#2029Recruit", "#OL", "#CommunityFirst"],
    mediaType: "photo",
    estimatedEngagement: "high",
  },
  {
    id: "gd-008",
    title: "Rivalry Game",
    fullCaption: `Rivalry week. The biggest game of the year. The energy this week has been unmatched.

Pewaukee OL is ready to impose our will. Let's ride.

#Rivalry #PewaukeeFootball #2029Recruit #OL #BigGame`,
    pillar: "performance",
    hashtags: ["#Rivalry", "#PewaukeeFootball", "#2029Recruit", "#OL", "#BigGame"],
    mediaType: "photo",
    estimatedEngagement: "high",
  },
  {
    id: "gd-009",
    title: "Season Opener",
    fullCaption: `Season opener tonight. 365 days of preparation for this moment. New season, new goals, same mentality.

Pewaukee OL is coming out with something to prove. Week 1. Let's set the tone.

#SeasonOpener #2029Recruit #OL #PewaukeeFootball #NewSeason`,
    pillar: "performance",
    hashtags: ["#SeasonOpener", "#2029Recruit", "#OL", "#PewaukeeFootball", "#NewSeason"],
    mediaType: "photo",
    estimatedEngagement: "high",
  },
  {
    id: "gd-010",
    title: "Post-Game Team Photo",
    fullCaption: `Nothing better than winning with your brothers. This OL group is special — we play for each other every single snap.

Team over everything.

#Brotherhood #PewaukeeFootball #2029Recruit #OL #TeamFirst`,
    pillar: "character",
    hashtags: ["#Brotherhood", "#PewaukeeFootball", "#2029Recruit", "#OL", "#TeamFirst"],
    mediaType: "photo",
    estimatedEngagement: "high",
  },
  {
    id: "gd-011",
    title: "Conference Championship",
    fullCaption: `Conference champions. The work we put in during the off-season just paid off. This team is built on toughness, discipline, and brotherhood.

The OL led the way all season. Proud of every guy in the trenches.

#ConferenceChamps #PewaukeeFootball #2029Recruit #OL #Champions`,
    pillar: "performance",
    hashtags: ["#ConferenceChamps", "#PewaukeeFootball", "#2029Recruit", "#OL", "#Champions"],
    mediaType: "photo",
    estimatedEngagement: "viral",
  },

  // ─── CHARACTER CAPTIONS (10+) ─────────────────────────────────────
  {
    id: "cc-001",
    title: "Academic Achievement",
    fullCaption: `3.8 GPA and 285 lbs. They told me I had to choose one — I chose both.

Being a student-athlete means giving 100% in the classroom and on the field. No shortcuts in either.

College coaches recruit the whole person. I'm building the whole package.

#StudentAthlete #2029Recruit #OL #Academics #FootballRecruiting`,
    pillar: "character",
    hashtags: ["#StudentAthlete", "#2029Recruit", "#OL", "#Academics", "#FootballRecruiting"],
    mediaType: "graphic",
    estimatedEngagement: "viral",
  },
  {
    id: "cc-002",
    title: "Community Service",
    fullCaption: `Spent the morning volunteering at the Pewaukee youth football camp. Teaching the next generation of offensive linemen the basics — stance, first step, hand placement.

This game has given me so much. Giving back is the least I can do.

#GivingBack #Community #2029Recruit #OL #Pewaukee`,
    pillar: "character",
    hashtags: ["#GivingBack", "#Community", "#2029Recruit", "#OL", "#Pewaukee"],
    mediaType: "photo",
    estimatedEngagement: "high",
  },
  {
    id: "cc-003",
    title: "Family Gratitude",
    fullCaption: `None of this is possible without my family. The early morning drives to workouts, the camps across the country, the support through every up and down.

Mom and Dad — thank you for investing in my dream. I won't waste it.

#Family #Grateful #2029Recruit #OL #Support`,
    pillar: "character",
    hashtags: ["#Family", "#Grateful", "#2029Recruit", "#OL", "#Support"],
    mediaType: "photo",
    estimatedEngagement: "high",
  },
  {
    id: "cc-004",
    title: "Leadership Moment",
    fullCaption: `Named team captain by my teammates. This is the honor that means the most — being chosen to lead by the guys who line up next to you every day.

Leadership isn't about being the loudest. It's about being the most consistent, the most prepared, and the first one to take accountability.

#Captain #Leadership #2029Recruit #OL #PewaukeeFootball`,
    pillar: "character",
    hashtags: ["#Captain", "#Leadership", "#2029Recruit", "#OL", "#PewaukeeFootball"],
    mediaType: "photo",
    estimatedEngagement: "high",
  },
  {
    id: "cc-005",
    title: "Honor Roll Post",
    fullCaption: `Honor roll. Again. The grind doesn't stop at the weight room — it carries over to every class, every assignment, every exam.

Discipline is discipline. It doesn't take days off.

#HonorRoll #StudentAthlete #2029Recruit #OL #Academics`,
    pillar: "character",
    hashtags: ["#HonorRoll", "#StudentAthlete", "#2029Recruit", "#OL", "#Academics"],
    mediaType: "graphic",
    estimatedEngagement: "medium",
  },
  {
    id: "cc-006",
    title: "Coach Appreciation",
    fullCaption: `Grateful for the coaches who push me every day. Coach believed in me before I believed in myself — and never let me settle for less than my best.

Good coaches teach football. Great coaches teach life. I'm lucky to have both.

#CoachAppreciation #Grateful #2029Recruit #OL #PewaukeeFootball`,
    pillar: "character",
    hashtags: ["#CoachAppreciation", "#Grateful", "#2029Recruit", "#OL", "#PewaukeeFootball"],
    mediaType: "photo",
    estimatedEngagement: "medium",
  },
  {
    id: "cc-007",
    title: "Balance Post",
    fullCaption: `A week in my life:
- 15+ hours of school
- 10+ hours of football (practice, film, weights)
- 5+ hours of training outside of school
- Community service
- Time with family and friends

Balance is the hardest thing in recruiting. But it's what makes the best athletes.

#Balance #StudentAthlete #2029Recruit #OL #RecruitLife`,
    pillar: "character",
    hashtags: ["#Balance", "#StudentAthlete", "#2029Recruit", "#OL", "#RecruitLife"],
    mediaType: "graphic",
    estimatedEngagement: "high",
  },
  {
    id: "cc-008",
    title: "Team First Mentality",
    fullCaption: `OL is the ultimate team position. Nobody succeeds alone in the trenches — it takes all five working as one.

I don't need my name in the paper. I need the team's name on the scoreboard. That's OL mentality.

#TeamFirst #OL #2029Recruit #OffensiveLine #Brotherhood`,
    pillar: "character",
    hashtags: ["#TeamFirst", "#OL", "#2029Recruit", "#OffensiveLine", "#Brotherhood"],
    mediaType: "text_only",
    estimatedEngagement: "high",
  },
  {
    id: "cc-009",
    title: "Mentoring Younger Players",
    fullCaption: `Spent time after practice working with the freshman linemen. Teaching them what I've learned, the same way the upperclassmen taught me.

That's how you build a program — not just develop players, but develop leaders who develop the next generation.

#Mentorship #OL #2029Recruit #PewaukeeFootball #NextGeneration`,
    pillar: "character",
    hashtags: ["#Mentorship", "#OL", "#2029Recruit", "#PewaukeeFootball", "#NextGeneration"],
    mediaType: "photo",
    estimatedEngagement: "medium",
  },
  {
    id: "cc-010",
    title: "Thanksgiving Gratitude",
    fullCaption: `Grateful season. Thankful for:
- A family that supports my dreams
- Coaches who invest their time in me
- Teammates who are brothers
- The opportunity to play the game I love
- Health and the ability to compete

Never take any of it for granted.

#Grateful #Thankful #2029Recruit #OL #Blessed`,
    pillar: "character",
    hashtags: ["#Grateful", "#Thankful", "#2029Recruit", "#OL", "#Blessed"],
    mediaType: "text_only",
    estimatedEngagement: "high",
  },

  // ─── CAMP CAPTIONS (10+) ─────────────────────────────────────────
  {
    id: "cpc-001",
    title: "Camp Announcement",
    fullCaption: `Excited to announce I'll be competing at the @IMGAcademy OL camp this weekend. Going up against some of the best talent in the country.

6'4" 285. Class of 2029. Ready to prove myself. Let's work.

#IMGAcademy #Camp #2029Recruit #OL #Compete`,
    pillar: "work_ethic",
    hashtags: ["#IMGAcademy", "#Camp", "#2029Recruit", "#OL", "#Compete"],
    mediaType: "graphic",
    estimatedEngagement: "high",
  },
  {
    id: "cpc-002",
    title: "Camp Recap Success",
    fullCaption: `Great day at camp. Competed in OL vs. DL one-on-ones, worked on technique with elite coaches, and tested myself against top competition.

Key takeaways:
- My anchor in pass pro is improving
- Need to keep working on first-step explosion
- Hand placement timing getting sharper

Grateful for the experience. Back to work tomorrow.

#Camp #2029Recruit #OL #GetBetter #FootballRecruiting`,
    pillar: "work_ethic",
    hashtags: ["#Camp", "#2029Recruit", "#OL", "#GetBetter", "#FootballRecruiting"],
    mediaType: "photo",
    estimatedEngagement: "high",
  },
  {
    id: "cpc-003",
    title: "Camp Competition",
    fullCaption: `OL vs. DL one-on-ones. The ultimate test. You, the defender, and nowhere to hide.

Competed against some of the best DL in my class today. Won some, learned from others. That's what camps are for — finding out where you stand.

#CampSeason #2029Recruit #OL #1on1 #FootballRecruiting`,
    pillar: "performance",
    hashtags: ["#CampSeason", "#2029Recruit", "#OL", "#1on1", "#FootballRecruiting"],
    mediaType: "training_video",
    estimatedEngagement: "high",
  },
  {
    id: "cpc-004",
    title: "Showcase Prep",
    fullCaption: `Showcase this weekend. Here's how I'm preparing:
- Film study on the DL I'll be facing
- Extra position work this week
- Visualization and mental prep
- Rest and recovery

Preparation is the foundation of confidence. I'm ready.

#Showcase #2029Recruit #OL #Preparation #FootballRecruiting`,
    pillar: "work_ethic",
    hashtags: ["#Showcase", "#2029Recruit", "#OL", "#Preparation", "#FootballRecruiting"],
    mediaType: "graphic",
    estimatedEngagement: "medium",
  },
  {
    id: "cpc-005",
    title: "Camp Invite",
    fullCaption: `Honored to receive an invite to {CAMP_NAME}. Another opportunity to compete against top talent and get coached by the best.

Every camp is a chance to get better and show coaches what I bring to the table. Let's go.

#CampInvite #2029Recruit #OL #FootballRecruiting #Compete`,
    pillar: "performance",
    hashtags: ["#CampInvite", "#2029Recruit", "#OL", "#FootballRecruiting", "#Compete"],
    mediaType: "graphic",
    estimatedEngagement: "high",
  },
  {
    id: "cpc-006",
    title: "Multi-Camp Summer",
    fullCaption: `Camp schedule this summer:
- @IMGAcademy OL Camp
- {CAMP_2}
- {CAMP_3}
- {CAMP_4}

Going to compete at every one. The goal isn't just to attend — it's to stand out. Let's work.

#CampSeason #Summer #2029Recruit #OL #FootballRecruiting`,
    pillar: "work_ethic",
    hashtags: ["#CampSeason", "#Summer", "#2029Recruit", "#OL", "#FootballRecruiting"],
    mediaType: "graphic",
    estimatedEngagement: "high",
  },
  {
    id: "cpc-007",
    title: "Coach Feedback at Camp",
    fullCaption: `Best part of camp isn't the competition — it's the coaching. Got incredible feedback today on my hand timing and kick slide technique.

Taking notes, recording drills, and bringing it all back to my daily training. Every camp makes me better.

#Coaching #Camp #2029Recruit #OL #LearningEveryDay`,
    pillar: "work_ethic",
    hashtags: ["#Coaching", "#Camp", "#2029Recruit", "#OL", "#LearningEveryDay"],
    mediaType: "photo",
    estimatedEngagement: "medium",
  },
  {
    id: "cpc-008",
    title: "Camp MVP Announcement",
    fullCaption: `Honored to be named Camp MVP at {CAMP_NAME}. Competed against some of the best OL and DL in the 2029 class and left it all on the field.

This means a lot, but the work doesn't stop here. Back to training tomorrow.

#CampMVP #2029Recruit #OL #FootballRecruiting #Earned`,
    pillar: "performance",
    hashtags: ["#CampMVP", "#2029Recruit", "#OL", "#FootballRecruiting", "#Earned"],
    mediaType: "photo",
    estimatedEngagement: "viral",
  },
  {
    id: "cpc-009",
    title: "Camp Measurement Day",
    fullCaption: `Camp measurements:
- Height: 6'4"
- Weight: 285 lbs
- Arm length: 34"
- Hand size: 10.5"

The measurables are there. Now it's about proving it on film and in competition. Let's work.

#Measurables #Camp #2029Recruit #OL #FootballRecruiting`,
    pillar: "performance",
    hashtags: ["#Measurables", "#Camp", "#2029Recruit", "#OL", "#FootballRecruiting"],
    mediaType: "graphic",
    estimatedEngagement: "high",
  },
  {
    id: "cpc-010",
    title: "Camp Networking",
    fullCaption: `One of the best parts of camp season: meeting and competing with other top recruits from across the country. Iron sharpens iron.

Made some great connections this weekend. The recruiting journey is better when you have respect for your competition.

#CampSeason #Networking #2029Recruit #OL #IronSharpensIron`,
    pillar: "character",
    hashtags: ["#CampSeason", "#Networking", "#2029Recruit", "#OL", "#IronSharpensIron"],
    mediaType: "photo",
    estimatedEngagement: "medium",
  },
];

// ─── Helper Functions ───────────────────────────────────────────────

export function getCaptionsByPillar(pillar: string): Caption[] {
  return captionsLibrary.filter((c) => c.pillar === pillar);
}

export function getCaptionsByMediaType(mediaType: CaptionMediaType): Caption[] {
  return captionsLibrary.filter((c) => c.mediaType === mediaType);
}

export function getCaptionsByEngagement(level: EngagementLevel): Caption[] {
  return captionsLibrary.filter((c) => c.estimatedEngagement === level);
}

export function getRandomCaption(pillar?: string): Caption {
  const pool = pillar ? getCaptionsByPillar(pillar) : captionsLibrary;
  return pool[Math.floor(Math.random() * pool.length)];
}
