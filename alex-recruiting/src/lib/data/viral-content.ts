// Viral Content Library — 40+ proven X post format templates for maximum engagement

export type ViralCategory =
  | "before_after"
  | "day_in_the_life"
  | "bold_statement"
  | "question_post"
  | "thread_format"
  | "list_post"
  | "film_breakdown"
  | "gratitude_milestone";

export interface ViralContentTemplate {
  id: string;
  title: string;
  format: string;
  examplePost: string;
  viralPotential: number;
  bestDay: string;
  mediaRequired: boolean;
  category: ViralCategory;
}

export const viralContentLibrary: ViralContentTemplate[] = [
  // ─── BEFORE/AFTER (8+) ───────────────────────────────────────────
  {
    id: "ba-001",
    title: "Freshman vs Now Transformation",
    format: `[BEFORE LABEL] → [AFTER LABEL]

[Brief description of growth]

[Closing statement about the journey]

[Hashtags]`,
    examplePost: `Freshman year → Sophomore year. 6'4" 285 and just getting started.

Gained 25 lbs of muscle, dropped my 40 time by 0.3 seconds, and added 60 lbs to my bench.

Three more years to grow. The best is ahead.

#2029Recruit #OL #Transformation #FootballRecruiting`,
    viralPotential: 10,
    bestDay: "Monday",
    mediaRequired: true,
    category: "before_after",
  },
  {
    id: "ba-002",
    title: "Film Improvement Side-by-Side",
    format: `Left: [TIME PERIOD 1] | Right: [TIME PERIOD 2]

Same play. Different execution. That's what [NUMBER] months of work looks like.

[Technical detail about what improved]

[Hashtags]`,
    examplePost: `Left: Week 1 | Right: Week 10

Same inside zone play. Different execution. That's what 10 weeks of coaching and film study looks like.

Watch the pad level, hand placement, and finish. Every detail got sharper.

#OL #FilmDontLie #2029Recruit #FootballRecruiting #Improvement`,
    viralPotential: 9,
    bestDay: "Tuesday",
    mediaRequired: true,
    category: "before_after",
  },
  {
    id: "ba-003",
    title: "Strength Progress",
    format: `[MONTH 1]: [OLD NUMBERS]
[MONTH 2]: [NEW NUMBERS]

[Months] months of consistent work. No shortcuts.

[Motivational closer]

[Hashtags]`,
    examplePost: `January: Bench 185 | Squat 315 | Clean 205
July: Bench 255 | Squat 405 | Clean 275

6 months of consistent work. No shortcuts. No days off.

The weight room is where the season is won.

#StrengthGains #2029Recruit #OL #PutInTheWork #FootballTraining`,
    viralPotential: 9,
    bestDay: "Wednesday",
    mediaRequired: true,
    category: "before_after",
  },
  {
    id: "ba-004",
    title: "Body Transformation",
    format: `What [TIME AGO] looked like vs. today.

[HEIGHT] [WEIGHT] and still growing.

[Details about the transformation]

[Hashtags]`,
    examplePost: `What 8th grade looked like vs. today.

6'4" 285 and still growing. Added 40 lbs of muscle, increased my arm length, and completely changed my body composition.

This is just the beginning. Three more years of development ahead.

#Transformation #2029Recruit #OL #Growth #FootballRecruiting`,
    viralPotential: 10,
    bestDay: "Monday",
    mediaRequired: true,
    category: "before_after",
  },
  {
    id: "ba-005",
    title: "Season 1 vs Season 2 Film",
    format: `Season [N-1] → Season [N]

[Number] more games of experience. [Number] more hours of film study. [Number] more reps in the weight room.

The difference shows up on film.

[Hashtags]`,
    examplePost: `Season 1 → Season 2

10 more games of experience. 200+ more hours of film study. 500+ more reps in the weight room.

The difference shows up on film. Bigger, stronger, faster, smarter.

#OL #2029Recruit #GrowthMindset #FootballRecruiting #FilmStudy`,
    viralPotential: 8,
    bestDay: "Tuesday",
    mediaRequired: true,
    category: "before_after",
  },
  {
    id: "ba-006",
    title: "Speed Transformation",
    format: `"Big guys can't move."

Watch this.

[BEFORE time] → [AFTER time] in the [drill name].

285 lbs. [Closing statement].

[Hashtags]`,
    examplePost: `"Big guys can't move."

Watch this.

5.8 → 5.3 in the 40-yard dash. In 6 months.

285 lbs and getting faster every day. Size AND speed.

#OL #Speed #2029Recruit #BigManCan #FootballRecruiting`,
    viralPotential: 10,
    bestDay: "Thursday",
    mediaRequired: true,
    category: "before_after",
  },
  {
    id: "ba-007",
    title: "Technique Evolution",
    format: `My [technique] then vs. now.

Then: [Description of old technique]
Now: [Description of improved technique]

The coaching at [location] changed everything.

[Hashtags]`,
    examplePost: `My pass set then vs. now.

Then: High pad level, narrow base, lunging at the rusher.
Now: Low center of gravity, wide base, patient hands, anchored.

The coaching at @IMGAcademy changed everything. Technique is a daily investment.

#PassProtection #OL #2029Recruit #IMGAcademy #Technique`,
    viralPotential: 8,
    bestDay: "Tuesday",
    mediaRequired: true,
    category: "before_after",
  },
  {
    id: "ba-008",
    title: "Meal Prep Transformation",
    format: `How I used to eat vs. how I fuel now.

Before: [Old eating habits]
Now: [Current nutrition plan]

Nutrition is [percentage]% of the game. You can't outwork a bad diet.

[Hashtags]`,
    examplePost: `How I used to eat vs. how I fuel now.

Before: Fast food, random meals, no plan.
Now: 6 meals/day, 4000+ calories, tracked macros, meal prep every Sunday.

Nutrition is 50% of the game. You can't outwork a bad diet when you're building a D1 body.

#Nutrition #2029Recruit #OL #MealPrep #FootballTraining`,
    viralPotential: 7,
    bestDay: "Sunday",
    mediaRequired: true,
    category: "before_after",
  },

  // ─── DAY IN THE LIFE (5+) ────────────────────────────────────────
  {
    id: "ditl-001",
    title: "School Day Schedule",
    format: `A day in the life of a Class of [YEAR] recruit:

[TIME] — [ACTIVITY]
[TIME] — [ACTIVITY]
...

[Closing line about the grind]

[Hashtags]`,
    examplePost: `A day in the life of a Class of 2029 OL recruit:

5:00 AM — Wake up
5:30 AM — Gym session
7:00 AM — Breakfast (1200 calories)
7:30 AM — School
3:30 PM — Practice
6:00 PM — Film study
7:00 PM — Homework
8:30 PM — Meal prep for tomorrow
9:30 PM — Recovery + sleep

Every. Single. Day. No days off from the dream.

#DayInTheLife #2029Recruit #OL #RecruitLife #FootballRecruiting`,
    viralPotential: 9,
    bestDay: "Monday",
    mediaRequired: false,
    category: "day_in_the_life",
  },
  {
    id: "ditl-002",
    title: "Camp Day Schedule",
    format: `Camp day. Here's how it went:

[TIME] — [ACTIVITY]
[TIME] — [ACTIVITY]
...

[Takeaway from the day]

[Hashtags]`,
    examplePost: `Camp day at @IMGAcademy. Here's how it went:

6:00 AM — Wake up, stretch, mental prep
7:00 AM — Breakfast + hydration
8:30 AM — Warm-ups and measurements
9:00 AM — OL technique drills
10:30 AM — 1-on-1s vs. DL
12:00 PM — Lunch + recovery
1:30 PM — Team drills
3:00 PM — Cool down + coach feedback

12 hours of competing. Wouldn't trade it for anything.

#CampDay #IMGAcademy #2029Recruit #OL #Compete`,
    viralPotential: 8,
    bestDay: "Saturday",
    mediaRequired: false,
    category: "day_in_the_life",
  },
  {
    id: "ditl-003",
    title: "Game Day Schedule",
    format: `Game day routine:

[Pre-game timeline]

It's not superstition — it's preparation.

[Hashtags]`,
    examplePost: `Game day routine:

8:00 AM — Film review (opponent tendencies)
10:00 AM — Pre-game meal (steak, rice, veggies)
12:00 PM — Mental visualization
2:00 PM — Team meeting
4:00 PM — Arrive at field, walk-through
5:30 PM — Pre-game warm-up
7:00 PM — Kickoff. Time to dominate.

It's not superstition — it's preparation. Every detail matters.

#GameDay #2029Recruit #OL #FridayNightLights #Preparation`,
    viralPotential: 8,
    bestDay: "Friday",
    mediaRequired: false,
    category: "day_in_the_life",
  },
  {
    id: "ditl-004",
    title: "Off-Season Weekend",
    format: `Off-season Saturday:

[Timeline of training activities]

[Closing about off-season mindset]

[Hashtags]`,
    examplePost: `Off-season Saturday:

7:00 AM — Wake up + breakfast
8:00 AM — Position-specific work (2 hours)
10:00 AM — Film study (last week's reps)
12:00 PM — Lunch + recovery
2:00 PM — Speed/agility work
4:00 PM — Meal prep for the week
6:00 PM — Family time

The off-season is where the next season is built. While others rest, I'm investing.

#OffSeason #2029Recruit #OL #Saturday #FootballTraining`,
    viralPotential: 7,
    bestDay: "Saturday",
    mediaRequired: false,
    category: "day_in_the_life",
  },
  {
    id: "ditl-005",
    title: "Summer Training Week",
    format: `What a week of summer training looks like for a D1 hopeful:

Monday: [Focus]
Tuesday: [Focus]
...

[Summary of weekly volume]

[Hashtags]`,
    examplePost: `What a week of summer training looks like for a D1 hopeful:

Monday: Heavy upper body + pass pro drills
Tuesday: Speed work + film study
Wednesday: Heavy lower body + pull technique
Thursday: Agility + hand fighting
Friday: Full body power + conditioning
Saturday: Position work at @IMGAcademy
Sunday: Recovery, meal prep, mental reset

24+ hours of training. Every week. All summer.

#SummerGrind #2029Recruit #OL #FootballTraining #WorkWeek`,
    viralPotential: 8,
    bestDay: "Sunday",
    mediaRequired: false,
    category: "day_in_the_life",
  },

  // ─── BOLD STATEMENTS (8+) ────────────────────────────────────────
  {
    id: "bold-001",
    title: "Size at Age Statement",
    format: `[MEASUREMENT] at [AGE] years old.

[FACT about what this means]

[Forward-looking statement]

[Hashtags]`,
    examplePost: `6'4" 285 at 15 years old.

Most college freshmen OL aren't this size. I have three more years to grow.

Remember the name: Jacob Rodgers. Pewaukee, Wisconsin. Class of 2029.

#2029Recruit #OL #Size #FootballRecruiting #RememberTheName`,
    viralPotential: 10,
    bestDay: "Wednesday",
    mediaRequired: true,
    category: "bold_statement",
  },
  {
    id: "bold-002",
    title: "OL Appreciation Statement",
    format: `[Bold claim about OL position]

[Supporting argument]

[Call to action or closer]

[Hashtags]`,
    examplePost: `The offensive line is the most important position group in football. Period.

You can have a 5-star QB, but without protection, he's on his back. You can have a 4.3 running back, but without a hole, he's going nowhere.

Championships are won in the trenches. Always have been. Always will be.

#OL #OffensiveLine #Trenches #2029Recruit #FootballRecruiting`,
    viralPotential: 9,
    bestDay: "Tuesday",
    mediaRequired: false,
    category: "bold_statement",
  },
  {
    id: "bold-003",
    title: "Wisconsin Pride",
    format: `[Statement about where you come from]

[What that means for your mentality/development]

[Hashtags]`,
    examplePost: `Wisconsin builds offensive linemen different.

The cold weather, the blue-collar mentality, the toughness that runs through every program in this state. Pewaukee raised me to be physical, disciplined, and relentless.

Small town. Big-time football. That's Wisconsin.

#Wisconsin #WisconsinFootball #OL #2029Recruit #SmallTownBigDreams`,
    viralPotential: 8,
    bestDay: "Thursday",
    mediaRequired: false,
    category: "bold_statement",
  },
  {
    id: "bold-004",
    title: "IMG Academy Statement",
    format: `[Statement about training environment]

[What it means for development]

[Hashtags]`,
    examplePost: `Training at @IMGAcademy means going against future D1 and NFL talent every single day.

When your practice competition is that high, Friday night games feel like a warm-up. The standard is different here. The expectations are higher. And that's exactly what I need.

#IMGAcademy #2029Recruit #OL #EliteCompetition #FootballRecruiting`,
    viralPotential: 8,
    bestDay: "Wednesday",
    mediaRequired: false,
    category: "bold_statement",
  },
  {
    id: "bold-005",
    title: "Three Years to Grow",
    format: `I'm [AGE/CLASS YEAR].

I'm already [CURRENT STATS].

I have [TIME LEFT] to get better.

[Rhetorical question or bold closer]

[Hashtags]`,
    examplePost: `I'm a sophomore.

I'm already 6'4" 285 with varsity starting experience and IMG Academy training.

I have two full off-seasons and two more seasons to get better.

What am I going to look like as a senior?

#2029Recruit #OL #JustGettingStarted #FootballRecruiting #Potential`,
    viralPotential: 10,
    bestDay: "Monday",
    mediaRequired: false,
    category: "bold_statement",
  },
  {
    id: "bold-006",
    title: "POV Post",
    format: `POV: [Scenario from opponent's perspective]

[Visual or film clip of Jacob]

[Hashtags]`,
    examplePost: `POV: You're a 220-lb defensive end and you look across the line and see 6'4" 285 staring back at you.

Good luck.

#POV #OL #2029Recruit #BigManOnCampus #FootballRecruiting`,
    viralPotential: 10,
    bestDay: "Thursday",
    mediaRequired: true,
    category: "bold_statement",
  },
  {
    id: "bold-007",
    title: "Coaches Want Big OL",
    format: `Coaches say they want [ATTRIBUTE in OL].

Here's what that actually looks like: [EVIDENCE]

[Closing CTA]

[Hashtags]`,
    examplePost: `Every college coach says they want big, athletic offensive linemen who can move.

Here's what that actually looks like: 6'4" 285. Running the agility ladder. Pulling across the formation. Finishing blocks 5 yards downfield.

Coaches — I'm what you're looking for.

#OL #2029Recruit #FootballRecruiting #CFBRecruiting #BigAndAthletic`,
    viralPotential: 9,
    bestDay: "Tuesday",
    mediaRequired: true,
    category: "bold_statement",
  },
  {
    id: "bold-008",
    title: "Nobody Outworks Me",
    format: `[Bold statement about work ethic]

[Evidence/schedule that backs it up]

[Hashtags]`,
    examplePost: `I might not be the most talented OL in the 2029 class. But nobody is going to outwork me.

5 AM workouts. Year-round training at @IMGAcademy. Film study every night. Extra reps after every practice.

Talent gets you noticed. Work ethic gets you recruited. Consistency gets you a scholarship.

#WorkEthic #2029Recruit #OL #Grind #FootballRecruiting`,
    viralPotential: 9,
    bestDay: "Monday",
    mediaRequired: false,
    category: "bold_statement",
  },

  // ─── QUESTION POSTS (5+) ─────────────────────────────────────────
  {
    id: "q-001",
    title: "What Coaches Look For",
    format: `[Question about recruiting/position]

Drop your answers below.

[Hashtags]`,
    examplePost: `What do college coaches look for FIRST in an OL recruit?

A) Size
B) Film
C) Athleticism
D) Character/Grades

Drop your answers below. I want to hear from coaches, players, and recruiters.

#OL #FootballRecruiting #2029Recruit #RecruitingAdvice #CFBRecruiting`,
    viralPotential: 9,
    bestDay: "Wednesday",
    mediaRequired: false,
    category: "question_post",
  },
  {
    id: "q-002",
    title: "Rate My Film",
    format: `Rate my [TECHNIQUE] on a scale of 1-10.

[Video clip]

Honest feedback only. I'm trying to get better.

[Hashtags]`,
    examplePost: `Rate my pass set on a scale of 1-10.

Honest feedback only. I want to hear what I'm doing well and what needs work. That's how you get better.

Coaches, players, analysts — all opinions welcome.

#RateMyFilm #OL #2029Recruit #PassProtection #FootballRecruiting`,
    viralPotential: 9,
    bestDay: "Tuesday",
    mediaRequired: true,
    category: "question_post",
  },
  {
    id: "q-003",
    title: "Recruiting Debate",
    format: `[Debate question about recruiting or OL play]

Reply with your take.

[Hashtags]`,
    examplePost: `Recruiting debate: Is it better for an OL recruit to be the biggest guy with average feet, or an average-sized guy with elite footwork?

I'm trying to be both. But I want to hear your take. Reply below.

#RecruitingDebate #OL #FootballRecruiting #2029Recruit #OLTalk`,
    viralPotential: 8,
    bestDay: "Thursday",
    mediaRequired: false,
    category: "question_post",
  },
  {
    id: "q-004",
    title: "Best OL Coach",
    format: `Who is the best OL coach in college football right now?

[Context about why you're asking]

[Hashtags]`,
    examplePost: `Who is the best OL coach in college football right now?

As a 2029 OL recruit, I'm studying every program. I want to play for a coach who develops linemen at the highest level.

Drop your picks below. I'm taking notes.

#OLCoach #FootballRecruiting #2029Recruit #CFB #OL`,
    viralPotential: 8,
    bestDay: "Wednesday",
    mediaRequired: false,
    category: "question_post",
  },
  {
    id: "q-005",
    title: "What Would You Do?",
    format: `Question for recruits: [Recruiting scenario question]

What would you do? Reply below.

[Hashtags]`,
    examplePost: `Question for recruits: If you had to choose between a top 25 program where you might redshirt, or a mid-major where you'd start immediately — what would you pick?

Genuine question. I think about this stuff all the time. Reply below.

#RecruitLife #FootballRecruiting #2029Recruit #OL #Decision`,
    viralPotential: 8,
    bestDay: "Thursday",
    mediaRequired: false,
    category: "question_post",
  },

  // ─── THREAD FORMATS (5+) ─────────────────────────────────────────
  {
    id: "thread-001",
    title: "Recruiting Journey Thread",
    format: `My recruiting journey so far. A thread.

1/ [Beginning of journey]
2/ [Key milestone]
3/ [Training decision]
...
[Final tweet with current status and CTA]`,
    examplePost: `My recruiting journey so far. A thread.

1/ Started playing football in 5th grade. Immediately loved the trenches. Something about the physicality just clicked.

2/ By 8th grade I was 6'2" 240. My youth coaches told my parents I had D1 potential if I kept developing.

3/ Freshman year — made varsity at Pewaukee HS. Starting OL at 14 years old. The learning curve was steep but I embraced it.

4/ Started training at @IMGAcademy. The competition and coaching changed everything about my development.

5/ Now: 6'4" 285. Sophomore. Working every day to become the best OL in the 2029 class. The journey is just getting started.

Full film: link in bio.

#Thread #2029Recruit #OL #RecruitingJourney #FootballRecruiting`,
    viralPotential: 9,
    bestDay: "Sunday",
    mediaRequired: false,
    category: "thread_format",
  },
  {
    id: "thread-002",
    title: "OL Technique Breakdown Thread",
    format: `Breaking down OL technique. A thread for linemen.

1/ [Technique topic]
2/ [Key principle]
3/ [Drill recommendation]
...
[Final tweet with encouragement]`,
    examplePost: `Breaking down pass protection fundamentals. A thread for fellow OL.

1/ It all starts with the stance. Balanced weight, inside hand down, outside foot slightly back. You can't win the rep if you lose the start.

2/ The kick slide. Short, controlled steps. Never cross your feet. Maintain inside leverage on the rusher.

3/ Hand timing. Too early and you're lunging. Too late and you're beaten. The punch has to be on time and on target.

4/ The anchor. When the bull rush comes, it's about hip drop, pad level, and core strength. This is where the gym pays off.

5/ Recovery. You will get beat sometimes. The great OL recover. Quick hands, reset feet, and compete on every rep.

What technique do you want me to break down next?

#OLTechnique #Thread #PassProtection #OL #2029Recruit`,
    viralPotential: 8,
    bestDay: "Tuesday",
    mediaRequired: false,
    category: "thread_format",
  },
  {
    id: "thread-003",
    title: "What I've Learned Thread",
    format: `[NUMBER] things I've learned about [TOPIC]. A thread.

1/ [Lesson]
2/ [Lesson]
...
[Closing tweet]`,
    examplePost: `7 things I've learned about recruiting as a sophomore OL. A thread.

1/ Film is everything. Your social media gets attention, but your film gets offers. Post it everywhere.

2/ Engage with coaches before you DM. Like, comment, retweet. Build familiarity before you ask for anything.

3/ Grades matter more than you think. Coaches won't recruit a player they can't get admitted.

4/ Camps are not optional. You have to compete in person. Film only tells part of the story.

5/ Be yourself. Coaches can spot a fake from a mile away. Authenticity wins.

6/ The process takes time. Don't get discouraged by no responses early. Keep working.

7/ Train year-round. The guys getting recruited are never not working. There is no off-season.

What would you add to this list?

#RecruitingAdvice #Thread #2029Recruit #OL #FootballRecruiting`,
    viralPotential: 9,
    bestDay: "Sunday",
    mediaRequired: false,
    category: "thread_format",
  },
  {
    id: "thread-004",
    title: "IMG Academy Experience Thread",
    format: `What it's like training at @IMGAcademy. A thread.

1/ [First impression]
2/ [Training details]
...
[Impact on development]`,
    examplePost: `What it's like training at @IMGAcademy as a high school OL. A thread.

1/ The first thing you notice is the competition level. Every guy in the room is big, fast, and talented. There's nowhere to hide.

2/ The coaching is world-class. Every drill has a purpose. Every rep is corrected. You learn more in a week than most guys learn in a month.

3/ The facilities are incredible. Weight room, film room, turf fields, recovery center — everything you need to develop.

4/ The mental game. Training with elite athletes teaches you how to compete, how to handle adversity, and how to push through discomfort.

5/ The result: I'm a completely different player than I was before IMG. Technically sharper, physically stronger, mentally tougher.

Grateful for this opportunity. It's an investment that's already paying off.

#IMGAcademy #Thread #2029Recruit #OL #EliteTraining`,
    viralPotential: 8,
    bestDay: "Wednesday",
    mediaRequired: false,
    category: "thread_format",
  },
  {
    id: "thread-005",
    title: "Season Recap Thread",
    format: `[YEAR] season recap. A thread.

1/ [Season overview]
2/ [Best moment]
3/ [Biggest lesson]
...
[Off-season goals]`,
    examplePost: `My sophomore season recap. A thread.

1/ Team record: 9-2. Playoff run ended in the quarterfinals. Proud of this group but hungry for more.

2/ Best moment: Our 4th quarter comeback in Week 7. The OL took over and we rushed for 200 yards in the 2nd half.

3/ Biggest lesson: Consistency. The best players show up every Friday, not just on the big nights.

4/ Growth areas: I need to improve my pass pro anchor and my pull speed. Already working on both.

5/ Off-season plan: @IMGAcademy training, camp circuit, and hitting the weight room harder than ever.

Junior year is going to be special. I can feel it.

#SeasonRecap #Thread #2029Recruit #OL #PewaukeeFootball`,
    viralPotential: 7,
    bestDay: "Sunday",
    mediaRequired: false,
    category: "thread_format",
  },

  // ─── LIST POSTS (5+) ─────────────────────────────────────────────
  {
    id: "list-001",
    title: "Things Learned at IMG",
    format: `[NUMBER] things I learned at [LOCATION/EVENT]:

1. [Lesson]
2. [Lesson]
...

[Closing thought]

[Hashtags]`,
    examplePost: `5 things I learned at @IMGAcademy this summer:

1. Technique beats strength every time. The best OL win with leverage, not power alone.
2. Film study is non-negotiable. The smartest players are always the most prepared.
3. Recovery matters as much as training. Sleep, nutrition, and stretching aren't optional.
4. Competition brings out the best in you. Iron sharpens iron.
5. The mental game separates good from great. Confidence comes from preparation.

Best summer of my football career. Can't wait to go back.

#IMGAcademy #2029Recruit #OL #LessonsLearned #FootballRecruiting`,
    viralPotential: 8,
    bestDay: "Sunday",
    mediaRequired: false,
    category: "list_post",
  },
  {
    id: "list-002",
    title: "What I Bring to a Program",
    format: `What I bring to your program:

✓ [Attribute]
✓ [Attribute]
...

[Closing CTA for coaches]

[Hashtags]`,
    examplePost: `What I bring to your program:

- 6'4" 285 lbs with room to grow
- Varsity starting experience as a sophomore
- IMG Academy-trained technique
- 3.8 GPA — no academic risk
- Year-round training commitment
- Leadership and team-first mentality
- Coachable attitude — I want to be coached hard

Film and recruiting links are in my profile.

#2029Recruit #OL #FootballRecruiting #OffensiveLine #WisconsinFootball`,
    viralPotential: 9,
    bestDay: "Monday",
    mediaRequired: false,
    category: "list_post",
  },
  {
    id: "list-003",
    title: "Recruiting Checklist",
    format: `My recruiting checklist for [YEAR/SEASON]:

☐ [Goal]
☑ [Completed goal]
...

[Progress update]

[Hashtags]`,
    examplePost: `My recruiting checklist for this off-season:

Done: NCSA profile updated
Done: New film uploaded to Hudl
Done: Personal recruiting website live
Done: IMG Academy camp registered
In progress: Contacting coaches at target schools
In progress: Camp circuit schedule finalized
Next: Junior season film will be the best yet

The process is happening. One step at a time.

#RecruitingChecklist #2029Recruit #OL #FootballRecruiting #Process`,
    viralPotential: 7,
    bestDay: "Wednesday",
    mediaRequired: false,
    category: "list_post",
  },
  {
    id: "list-004",
    title: "What I Look For in a Program",
    format: `What I'm looking for in a college program:

1. [Priority]
2. [Priority]
...

[Statement about the search]

[Hashtags]`,
    examplePost: `What I'm looking for in a college program:

1. OL development track record — show me your linemen getting better every year
2. Strong academics — I want a degree that matters
3. Culture of toughness — I want to be pushed every day
4. Coaching staff stability — I want to play for the coaches who recruit me
5. Brotherhood — I want teammates who become family

It's not just about football. It's about the total experience.

#CollegeSearch #2029Recruit #OL #FootballRecruiting #Priorities`,
    viralPotential: 8,
    bestDay: "Thursday",
    mediaRequired: false,
    category: "list_post",
  },
  {
    id: "list-005",
    title: "Daily Non-Negotiables",
    format: `My daily non-negotiables:

1. [Habit]
2. [Habit]
...

[Why consistency matters]

[Hashtags]`,
    examplePost: `My daily non-negotiables:

1. 8+ hours of sleep
2. 4000+ calories, clean
3. At least 1 hour of training
4. Film study — even if it's just 20 minutes
5. Homework done before anything else
6. Positive attitude — no matter what

Champions are built by daily habits, not single moments. Consistency wins.

#NonNegotiables #2029Recruit #OL #DailyHabits #Discipline`,
    viralPotential: 8,
    bestDay: "Monday",
    mediaRequired: false,
    category: "list_post",
  },

  // ─── FILM BREAKDOWN (5+) ─────────────────────────────────────────
  {
    id: "fb-001",
    title: "Pass Pro Technique Breakdown",
    format: `Breaking down my [TECHNIQUE] — watch the [DETAIL] at [TIMESTAMP].

[Technical explanation]

[Self-critique + what I'm working on]

[Hashtags]`,
    examplePost: `Breaking down my pass pro technique — watch the anchor at 0:08.

The bull rush is coming. I drop my hips, widen my base, and absorb the contact. Then I reset my hands and redirect.

What I like: the anchor is solid and I stay square.
What I'm working on: my initial punch timing needs to be quicker.

Coaches — I'm always looking for feedback. Let me know what you see.

#FilmBreakdown #OL #PassProtection #2029Recruit #Technique`,
    viralPotential: 8,
    bestDay: "Tuesday",
    mediaRequired: true,
    category: "film_breakdown",
  },
  {
    id: "fb-002",
    title: "Run Block Breakdown",
    format: `[RUN SCHEME] breakdown. Watch [WHAT TO LOOK FOR].

[Step-by-step technical explanation]

[Hashtags]`,
    examplePost: `Inside zone breakdown. Watch how I work the combo block with my guard.

Step 1: Get hip-to-hip with the guard on the double team.
Step 2: Create movement at the point of attack.
Step 3: Read the linebacker's flow.
Step 4: Climb to the second level and seal.

The timing on the peel-off is everything. One second too early and the DT splits. One second too late and the LB fills the hole.

#InsideZone #OL #FilmBreakdown #2029Recruit #RunGame`,
    viralPotential: 8,
    bestDay: "Tuesday",
    mediaRequired: true,
    category: "film_breakdown",
  },
  {
    id: "fb-003",
    title: "Pull Technique Analysis",
    format: `Pulling technique analysis — [PLAY TYPE]

[Breakdown of mechanics]

[Self-assessment]

[Hashtags]`,
    examplePost: `Pulling technique analysis — counter play.

Opening my hips, getting flat down the line, and kicking out the end man on the line of scrimmage.

285 lbs moving this fast in space is what coaches want to see from a modern OL. The key is staying low through the pull and delivering the block with proper leverage.

Grade: B+. I need to get flatter on the pull path. Working on it.

#PullBlock #OL #FilmBreakdown #2029Recruit #Technique`,
    viralPotential: 7,
    bestDay: "Wednesday",
    mediaRequired: true,
    category: "film_breakdown",
  },
  {
    id: "fb-004",
    title: "Blitz Pickup Breakdown",
    format: `Blitz pickup breakdown — how I read and react.

Pre-snap: [What I see]
Post-snap: [What I do]

[Analysis]

[Hashtags]`,
    examplePost: `Blitz pickup breakdown — how I read and react.

Pre-snap: I see the linebacker creeping to the edge. Safety rotating down. Blitz is coming.
Post-snap: I communicate the adjustment, slide my protection, and pick up the blitzer in space.

An OL's brain is his most important tool. You have to see it before it happens. This is what film study is for.

#BlitzPickup #OL #FilmBreakdown #2029Recruit #FootballIQ`,
    viralPotential: 7,
    bestDay: "Tuesday",
    mediaRequired: true,
    category: "film_breakdown",
  },
  {
    id: "fb-005",
    title: "Good Rep vs. Bad Rep",
    format: `Honest self-evaluation. Good rep vs. bad rep.

Good rep: [Description + timestamp]
Bad rep: [Description + timestamp]

[What I learned and what I'm fixing]

[Hashtags]`,
    examplePost: `Honest self-evaluation. Good rep vs. bad rep.

Good rep (0:00): Drive block. Low pad level, great hand placement, finish through the whistle. This is the standard.

Bad rep (0:15): Pass set. Feet too narrow, lunged at the rusher, got beat inside. This is what I'm fixing.

I post both because accountability drives improvement. I'm not perfect — but I'm getting better every week.

#HonestFilm #OL #FilmBreakdown #2029Recruit #SelfEvaluation`,
    viralPotential: 9,
    bestDay: "Tuesday",
    mediaRequired: true,
    category: "film_breakdown",
  },

  // ─── GRATITUDE/MILESTONE (5+) ────────────────────────────────────
  {
    id: "gm-001",
    title: "Offer Announcement",
    format: `Blessed to receive an offer from [SCHOOL NAME].

[Brief thoughts on the program]

Thank you to [COACHES] for believing in me. The work continues.

[School graphic/logo]

[Hashtags]`,
    examplePost: `Blessed to receive an offer from {SCHOOL_NAME}.

This program's commitment to developing offensive linemen is something I deeply respect. I'm grateful for the opportunity and excited to continue building this relationship.

Thank you, Coach {COACH_LAST_NAME}, for believing in me. The work continues.

#Offer #2029Recruit #OL #FootballRecruiting #Blessed`,
    viralPotential: 10,
    bestDay: "Any",
    mediaRequired: true,
    category: "gratitude_milestone",
  },
  {
    id: "gm-002",
    title: "PR Celebration",
    format: `New PR: [LIFT] — [WEIGHT]

[Context about the journey to this number]

[What's next]

[Hashtags]`,
    examplePost: `New PR: Bench Press — 275 lbs.

Six months ago, 225 was a grind. Today, 275 moved clean. That's what happens when you show up every single day and trust the process.

Next target: 300. It's coming.

#NewPR #BenchPress #2029Recruit #OL #Strength #FootballTraining`,
    viralPotential: 8,
    bestDay: "Any",
    mediaRequired: true,
    category: "gratitude_milestone",
  },
  {
    id: "gm-003",
    title: "Award/Recognition",
    format: `Honored to be named [AWARD].

[What it means and who to thank]

[Commitment to keep improving]

[Hashtags]`,
    examplePost: `Honored to be named All-Conference Offensive Lineman.

This award belongs to my teammates, my coaches, and my family. Nothing an OL does is alone — every block, every rep, every win is a team effort.

Grateful for the recognition, but the goal is bigger. Back to work.

#AllConference #2029Recruit #OL #Honored #PewaukeeFootball`,
    viralPotential: 8,
    bestDay: "Any",
    mediaRequired: true,
    category: "gratitude_milestone",
  },
  {
    id: "gm-004",
    title: "Follower/Engagement Milestone",
    format: `[NUMBER] followers. Didn't start this account for the numbers — started it to get recruited.

[Gratitude + what it means]

[Recommitment to the process]

[Hashtags]`,
    examplePost: `1,000 followers. Didn't start this account for the numbers — started it to get recruited and share my journey.

Thank you to everyone who follows, engages, and supports. Coaches, analysts, fellow recruits, and fans — I appreciate every single one of you.

The content gets better from here. The work never stops.

#Milestone #2029Recruit #OL #Grateful #FootballRecruiting`,
    viralPotential: 7,
    bestDay: "Any",
    mediaRequired: false,
    category: "gratitude_milestone",
  },
  {
    id: "gm-005",
    title: "Season Milestone",
    format: `[MILESTONE ACHIEVEMENT] this season.

[Context about what it took]

[Gratitude]

[Hashtags]`,
    examplePost: `Started every game this season as a sophomore. 10 games. 0 sacks allowed.

The amount of work that goes into that stat line — the film study, the extra reps, the coaching, the trust from my teammates — is something I'll never take for granted.

Grateful. Motivated. Hungry for more.

#SeasonStats #2029Recruit #OL #PewaukeeFootball #AllGasNoBrakes`,
    viralPotential: 9,
    bestDay: "Sunday",
    mediaRequired: false,
    category: "gratitude_milestone",
  },
];

// ─── Helper Functions ───────────────────────────────────────────────

export function getViralContentByCategory(category: ViralCategory): ViralContentTemplate[] {
  return viralContentLibrary.filter((v) => v.category === category);
}

export function getHighViralContent(minPotential: number): ViralContentTemplate[] {
  return viralContentLibrary.filter((v) => v.viralPotential >= minPotential);
}

export function getContentByDay(day: string): ViralContentTemplate[] {
  return viralContentLibrary.filter(
    (v) => v.bestDay.toLowerCase() === day.toLowerCase() || v.bestDay === "Any"
  );
}

export function getTextOnlyContent(): ViralContentTemplate[] {
  return viralContentLibrary.filter((v) => !v.mediaRequired);
}
