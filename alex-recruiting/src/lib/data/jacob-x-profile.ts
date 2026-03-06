// Jacob Rodgers — Complete X (Twitter) Profile Blueprint & First 30 Posts

export interface XPost {
  id: number;
  weekNumber: number;
  day: string;
  pillar: "performance" | "work_ethic" | "character";
  content: string;
  hashtags: string[];
  mediaType: "video" | "photo" | "text" | "carousel";
  notes: string;
  suggestedTime: string;
}

export const jacobXProfile = {
  // ─── Profile Setup ──────────────────────────────────────────────────────────
  displayName: "Jacob Rodgers | OL | '29",
  handle: "@JacobRodgersOL29",
  bio: 'OL | 6\'4" 285 | Pewaukee HS \'29 | WI | Training @IMGAcademy | NCSA Athlete | Film \u2B07\uFE0F',
  location: "Pewaukee, Wisconsin",
  website: "",
  headerImageDescription:
    'Action shot from game \u2014 Jacob in stance at the line. Dark overlay with stats: 6\'4" | 285 | Class of 2029 | Pewaukee, WI',
  profilePhotoDescription:
    "Professional headshot in Pewaukee jersey, clean background, shoulders visible, confident expression",

  // ─── Following / Followers (Initial Mock) ─────────────────────────────────
  followingCount: 89,
  followersCount: 47,
  joinDate: "March 2026",

  // ─── Profile Checklist ────────────────────────────────────────────────────
  checklist: [
    {
      id: "photo",
      label: "Profile photo",
      description: "Professional headshot in Pewaukee jersey, clean background, shoulders visible",
      complete: false,
    },
    {
      id: "header",
      label: "Header image",
      description: 'Action shot with stats overlay: 6\'4" | 285 | Class of 2029 | Pewaukee, WI',
      complete: false,
    },
    {
      id: "display_name",
      label: "Display name",
      description: "Jacob Rodgers | OL | '29",
      complete: true,
    },
    {
      id: "bio",
      label: "Bio",
      description: "Optimized with position, size, school, year, and IMG training",
      complete: true,
    },
    {
      id: "location",
      label: "Location",
      description: "Pewaukee, Wisconsin",
      complete: true,
    },
    {
      id: "website",
      label: "Website",
      description: "NCSA recruiting profile link",
      complete: false,
    },
    {
      id: "pinned",
      label: "Pinned post",
      description: "Recruiting card with Hudl, NCSA, and website links",
      complete: false,
    },
  ],

  // ─── Pinned Post ──────────────────────────────────────────────────────────
  pinnedPost: {
    content:
      'Jacob Rodgers | OL | 6\'4" 285 | Pewaukee HS | Class of 2029\nWisconsin | Training @IMGAcademy\nRepresented by @NCSASports\n\n\uD83D\uDCCE Full Highlights: [HUDL Link]\n\uD83D\uDCCE Recruiting Profile: [NCSA Link]\n\uD83D\uDCCE Website: [Website Link]\n\n#2029Recruit #OL #FootballRecruiting #WisconsinFootball',
    notes: "Update every 90 days with latest film. Pin immediately.",
  },

  // ─── Best Posting Times ───────────────────────────────────────────────────
  postingTimes: {
    weekday: "6:30 AM CT or 7:00 PM CT",
    saturday: "10:00 AM CT",
    sunday: "7:00 PM CT",
  },

  // ─── Hashtag Strategy ─────────────────────────────────────────────────────
  hashtagStrategy: {
    always: ["#2029Recruit", "#OL"],
    rotate: [
      "#FootballRecruiting",
      "#WisconsinFootball",
      "#OffensiveLine",
      "#BigTenFootball",
      "#PutInTheWork",
      "#FridayNightLights",
      "#IMGAcademy",
      "#NCSAathlete",
      "#HighSchoolFootball",
      "#RecruitMe",
    ],
    maxPerPost: 5,
  },

  // ─── 30-Day Goals ─────────────────────────────────────────────────────────
  thirtyDayGoals: [
    "Reach 150+ followers",
    "Post 5x/week consistently for 6 weeks",
    "Get engagement from 3+ college coaches",
    "Upload 4+ film clips",
    "Connect with 25+ recruits in Class of 2029",
  ],

  // ─── First 30 Posts — Complete 6-Week Content Calendar ────────────────────
  posts: [
    // ── WEEK 1: Introduction / Building Presence ──────────────────────────
    {
      id: 1,
      weekNumber: 1,
      day: "Monday",
      pillar: "work_ethic",
      content:
        "Back to work. Monday morning film review + footwork drills before school. Every rep matters when you're building something.\n\nNew season, new goals. Let's go.\n\n#2029Recruit #OL #PutInTheWork #WisconsinFootball #FootballRecruiting",
      hashtags: ["#2029Recruit", "#OL", "#PutInTheWork", "#WisconsinFootball", "#FootballRecruiting"],
      mediaType: "photo",
      notes: "Opening post — set the tone. Photo of early morning workout or gym.",
      suggestedTime: "6:30 AM CT",
    },
    {
      id: 2,
      weekNumber: 1,
      day: "Tuesday",
      pillar: "performance",
      content:
        "Working on first-step quickness and hand placement. Drive block from last Friday's game — finishing through the whistle every time.\n\nFull film: [NCSA Link]\n\n#OL #OffensiveLine #2029Recruit #FootballRecruiting #BigTenFootball",
      hashtags: ["#OL", "#OffensiveLine", "#2029Recruit", "#FootballRecruiting", "#BigTenFootball"],
      mediaType: "video",
      notes: "First film post. 15-20 second clip of a single dominant drive block.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 3,
      weekNumber: 1,
      day: "Wednesday",
      pillar: "character",
      content:
        "Football teaches you more than just how to play a game. Discipline. Accountability. Showing up when nobody's watching.\n\nGrateful for the coaches and teammates who push me every single day.\n\n#2029Recruit #OL #FootballRecruiting #WisconsinFootball",
      hashtags: ["#2029Recruit", "#OL", "#FootballRecruiting", "#WisconsinFootball"],
      mediaType: "text",
      notes: "Character post — authentic, no bragging. Show maturity beyond the field.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 4,
      weekNumber: 1,
      day: "Thursday",
      pillar: "performance",
      content:
        'Pass pro rep from Week 3. Keeping the pocket clean. 6\'4" 285 and moving my feet.\n\nCoaches — DMs are open.\n\n\uD83C\uDFA5 [HUDL Link]\n\n#OL #2029Recruit #OffensiveLine #FootballRecruiting #RecruitMe',
      hashtags: ["#OL", "#2029Recruit", "#OffensiveLine", "#FootballRecruiting", "#RecruitMe"],
      mediaType: "video",
      notes: "Pass protection clip. Tag the Hudl link. Make the DM invite explicit.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 5,
      weekNumber: 1,
      day: "Friday",
      pillar: "performance",
      content:
        "Game day.\n\nTime to go to work.\n\n#FridayNightLights #2029Recruit #OL #WisconsinFootball #GameDay",
      hashtags: ["#FridayNightLights", "#2029Recruit", "#OL", "#WisconsinFootball", "#GameDay"],
      mediaType: "photo",
      notes: "Short and punchy. Pre-game photo in uniform. High energy.",
      suggestedTime: "3:00 PM CT",
    },

    // ── WEEK 2: Establishing Consistency ──────────────────────────────────
    {
      id: 6,
      weekNumber: 2,
      day: "Monday",
      pillar: "work_ethic",
      content:
        "5:30 AM. Nobody else in the weight room.\n\nSquats, cleans, sled work. Building the foundation.\n\nThe grind doesn't take days off.\n\n#2029Recruit #OL #PutInTheWork #OffensiveLine #FootballRecruiting",
      hashtags: ["#2029Recruit", "#OL", "#PutInTheWork", "#OffensiveLine", "#FootballRecruiting"],
      mediaType: "video",
      notes: "Short training clip — 10 seconds of heavy squats or sled pushes.",
      suggestedTime: "6:30 AM CT",
    },
    {
      id: 7,
      weekNumber: 2,
      day: "Tuesday",
      pillar: "performance",
      content:
        "Breakdown from Friday's win:\n\n\u2022 100% snap count\n\u2022 0 sacks allowed\n\u2022 Team rushed for 210+ yards\n\nDoing my job. Getting better.\n\n\uD83C\uDFA5 Full highlights: [HUDL Link]\n\n#OL #2029Recruit #FootballRecruiting #WisconsinFootball",
      hashtags: ["#OL", "#2029Recruit", "#FootballRecruiting", "#WisconsinFootball"],
      mediaType: "video",
      notes: "Post-game stats + highlight reel. Lead with team success.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 8,
      weekNumber: 2,
      day: "Wednesday",
      pillar: "character",
      content:
        "Spent the afternoon volunteering at Pewaukee Youth Football camp. Teaching the fundamentals to the next generation.\n\nThis game gave me everything. Time to give back.\n\n#2029Recruit #OL #Community #WisconsinFootball #FootballRecruiting",
      hashtags: ["#2029Recruit", "#OL", "#Community", "#WisconsinFootball", "#FootballRecruiting"],
      mediaType: "photo",
      notes: "Community involvement. Photo with younger players. Shows leadership.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 9,
      weekNumber: 2,
      day: "Thursday",
      pillar: "performance",
      content:
        "Film don't lie. Here's a pull block from Friday — getting to the second level and sealing the edge.\n\nAlways looking to improve my angles. Feedback welcome.\n\n#OL #OffensiveLine #2029Recruit #FootballRecruiting #BigTenFootball",
      hashtags: ["#OL", "#OffensiveLine", "#2029Recruit", "#FootballRecruiting", "#BigTenFootball"],
      mediaType: "video",
      notes: "Pull block clip. Shows athleticism and football IQ. Asking for feedback = coachable.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 10,
      weekNumber: 2,
      day: "Friday",
      pillar: "performance",
      content:
        "Rivalry week. Biggest game of the year.\n\nWe've been preparing for this one all season. Time to execute.\n\nLet's ride. \uD83D\uDD25\n\n#FridayNightLights #2029Recruit #OL #WisconsinFootball",
      hashtags: ["#FridayNightLights", "#2029Recruit", "#OL", "#WisconsinFootball"],
      mediaType: "photo",
      notes: "Rivalry game energy. Photo walking out of the tunnel or team huddle.",
      suggestedTime: "3:00 PM CT",
    },

    // ── WEEK 3: Establishing Consistency (cont.) ──────────────────────────
    {
      id: 11,
      weekNumber: 3,
      day: "Monday",
      pillar: "work_ethic",
      content:
        "Monday grind. Three things I worked on today:\n\n1. Anchor strength in pass pro\n2. Punch timing off the snap\n3. Lateral movement in space\n\nSmall details, big results.\n\n#2029Recruit #OL #PutInTheWork #FootballRecruiting",
      hashtags: ["#2029Recruit", "#OL", "#PutInTheWork", "#FootballRecruiting"],
      mediaType: "carousel",
      notes: "Carousel of 3 training clips, one for each focus area.",
      suggestedTime: "6:30 AM CT",
    },
    {
      id: 12,
      weekNumber: 3,
      day: "Tuesday",
      pillar: "performance",
      content:
        "Pancake block compilation from Weeks 1-4.\n\nFinishing. Every. Single. Rep.\n\n\uD83C\uDFA5 Full season film: [HUDL Link]\n\n#OL #OffensiveLine #2029Recruit #FootballRecruiting #RecruitMe",
      hashtags: ["#OL", "#OffensiveLine", "#2029Recruit", "#FootballRecruiting", "#RecruitMe"],
      mediaType: "video",
      notes: "Compilation video (30-45 sec) of best pancake blocks. This is a highlight reel post.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 13,
      weekNumber: 3,
      day: "Wednesday",
      pillar: "character",
      content:
        "3.8 GPA and getting it done on the field.\n\nStudent first, athlete always. Balancing the books and the playbook.\n\nThe classroom builds the discipline that shows up on Friday nights.\n\n#2029Recruit #OL #StudentAthlete #FootballRecruiting #WisconsinFootball",
      hashtags: ["#2029Recruit", "#OL", "#StudentAthlete", "#FootballRecruiting", "#WisconsinFootball"],
      mediaType: "text",
      notes: "Academic post. Shows well-roundedness. Coaches value GPA.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 14,
      weekNumber: 3,
      day: "Thursday",
      pillar: "work_ethic",
      content:
        "IMG Academy training update. Working with some of the best OL coaches in the country.\n\nThe competition down here is different. D1 speed, D1 size. Exactly where I need to be.\n\n#IMGAcademy #2029Recruit #OL #FootballRecruiting #OffensiveLine",
      hashtags: ["#IMGAcademy", "#2029Recruit", "#OL", "#FootballRecruiting", "#OffensiveLine"],
      mediaType: "video",
      notes: "IMG Academy content. Training clip from IMG session. Shows elite environment.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 15,
      weekNumber: 3,
      day: "Friday",
      pillar: "performance",
      content:
        "Playoff atmosphere tonight. Under the lights. This is what we work for.\n\nLet's go Pewaukee.\n\n#FridayNightLights #2029Recruit #OL #WisconsinFootball #GameDay",
      hashtags: ["#FridayNightLights", "#2029Recruit", "#OL", "#WisconsinFootball", "#GameDay"],
      mediaType: "photo",
      notes: "Game day hype. Keep it short. Stadium lights photo or team walk-out.",
      suggestedTime: "3:00 PM CT",
    },

    // ── WEEK 4: Engagement Phase ──────────────────────────────────────────
    {
      id: 16,
      weekNumber: 4,
      day: "Monday",
      pillar: "work_ethic",
      content:
        "Offseason mentality in the middle of the season.\n\nBench: 275\nSquat: 405\nClean: 255\n\nNumbers going up. Work going in.\n\n#2029Recruit #OL #PutInTheWork #OffensiveLine #FootballRecruiting",
      hashtags: ["#2029Recruit", "#OL", "#PutInTheWork", "#OffensiveLine", "#FootballRecruiting"],
      mediaType: "photo",
      notes: "Strength numbers post. Photo in the weight room. Quantifiable progress.",
      suggestedTime: "6:30 AM CT",
    },
    {
      id: 17,
      weekNumber: 4,
      day: "Tuesday",
      pillar: "performance",
      content:
        "Coaches asked me to break down my own film this week. Here's what I found:\n\n\u2714\uFE0F Good: Hand placement, pad level on drive blocks\n\u274C Fix: Need faster recovery on inside moves\n\nSelf-scouting is how you get better.\n\n#OL #2029Recruit #FootballRecruiting #OffensiveLine #FilmStudy",
      hashtags: ["#OL", "#2029Recruit", "#FootballRecruiting", "#OffensiveLine", "#FilmStudy"],
      mediaType: "video",
      notes: "Self-scout post. Hugely valuable for coaches — shows football IQ and coachability.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 18,
      weekNumber: 4,
      day: "Wednesday",
      pillar: "character",
      content:
        "Shoutout to my O-line brothers. We don't get the stats, we don't get the highlights on SportsCenter. But we set the tone.\n\nBest unit in Wisconsin. No debate.\n\n#2029Recruit #OL #Brotherhood #WisconsinFootball #OffensiveLine",
      hashtags: ["#2029Recruit", "#OL", "#Brotherhood", "#WisconsinFootball", "#OffensiveLine"],
      mediaType: "photo",
      notes: "Team photo — the entire O-line. Celebrates the group, not just himself.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 19,
      weekNumber: 4,
      day: "Thursday",
      pillar: "performance",
      content:
        "Down block + second-level combo from last week. Communication and timing with my guard.\n\nThis is what winning in the trenches looks like.\n\n\uD83C\uDFA5 [HUDL Link]\n\n#OL #2029Recruit #OffensiveLine #FootballRecruiting #BigTenFootball",
      hashtags: ["#OL", "#2029Recruit", "#OffensiveLine", "#FootballRecruiting", "#BigTenFootball"],
      mediaType: "video",
      notes: "Combo block clip. Shows teamwork and communication at the line.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 20,
      weekNumber: 4,
      day: "Friday",
      pillar: "performance",
      content:
        "Senior night. Playing for the guys who built this program.\n\nTime to leave it all on the field.\n\n#FridayNightLights #2029Recruit #OL #WisconsinFootball",
      hashtags: ["#FridayNightLights", "#2029Recruit", "#OL", "#WisconsinFootball"],
      mediaType: "photo",
      notes: "Senior night tribute. Shows respect for the program and upperclassmen.",
      suggestedTime: "3:00 PM CT",
    },

    // ── WEEK 5: Engagement Phase (cont.) ──────────────────────────────────
    {
      id: 21,
      weekNumber: 5,
      day: "Monday",
      pillar: "work_ethic",
      content:
        "Recovery day done right.\n\nCold tub, stretching, film review, meal prep. Taking care of the body so the body takes care of me on Friday.\n\nThe little things aren't little.\n\n#2029Recruit #OL #Recovery #FootballRecruiting #PutInTheWork",
      hashtags: ["#2029Recruit", "#OL", "#Recovery", "#FootballRecruiting", "#PutInTheWork"],
      mediaType: "photo",
      notes: "Recovery post. Shows professionalism and maturity. Photo of recovery routine.",
      suggestedTime: "6:30 AM CT",
    },
    {
      id: 22,
      weekNumber: 5,
      day: "Tuesday",
      pillar: "performance",
      content:
        "Season highlight reel — updated through Week 6.\n\n45 seconds of work in the trenches. Drive blocks, pulls, pass pro.\n\nCoaches, my DMs are always open.\n\n\uD83C\uDFA5 Full film: [HUDL Link]\n\uD83D\uDCCB Profile: [NCSA Link]\n\n#OL #2029Recruit #FootballRecruiting #RecruitMe #OffensiveLine",
      hashtags: ["#OL", "#2029Recruit", "#FootballRecruiting", "#RecruitMe", "#OffensiveLine"],
      mediaType: "video",
      notes: "Mid-season highlight reel update. Include both Hudl and NCSA links.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 23,
      weekNumber: 5,
      day: "Wednesday",
      pillar: "character",
      content:
        "Had a great conversation with Coach [Name] at [University] today. Grateful for the time and the advice.\n\nLearning something new every day in this process.\n\n#2029Recruit #OL #FootballRecruiting #Blessed #WisconsinFootball",
      hashtags: ["#2029Recruit", "#OL", "#FootballRecruiting", "#Blessed", "#WisconsinFootball"],
      mediaType: "text",
      notes: "Coach interaction post. Fill in real names when applicable. Shows engagement with programs.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 24,
      weekNumber: 5,
      day: "Thursday",
      pillar: "performance",
      content:
        "Side-by-side: Week 1 vs. Week 6.\n\nSame play, same technique — but the speed, the finish, and the confidence are completely different.\n\nGrowth is a process. Trust it.\n\n#OL #2029Recruit #OffensiveLine #FootballRecruiting #Improvement",
      hashtags: ["#OL", "#2029Recruit", "#OffensiveLine", "#FootballRecruiting", "#Improvement"],
      mediaType: "video",
      notes: "Before/after comparison. Powerful visual of improvement. Coaches love progression.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 25,
      weekNumber: 5,
      day: "Friday",
      pillar: "performance",
      content:
        "Playoffs start tonight. Everything we've worked for comes down to this.\n\nPewaukee. Let's go.\n\n#FridayNightLights #2029Recruit #OL #Playoffs #WisconsinFootball",
      hashtags: ["#FridayNightLights", "#2029Recruit", "#OL", "#Playoffs", "#WisconsinFootball"],
      mediaType: "photo",
      notes: "Playoff game day. Stadium photo or team huddle. Maximum intensity.",
      suggestedTime: "3:00 PM CT",
    },

    // ── WEEK 6: Momentum ──────────────────────────────────────────────────
    {
      id: 26,
      weekNumber: 6,
      day: "Monday",
      pillar: "work_ethic",
      content:
        "Playoff win in the books. But the work doesn't stop.\n\nBack in the film room at 6 AM. Breaking down every snap. Finding every edge.\n\nChampionship mindset.\n\n#2029Recruit #OL #PutInTheWork #WisconsinFootball #FootballRecruiting",
      hashtags: ["#2029Recruit", "#OL", "#PutInTheWork", "#WisconsinFootball", "#FootballRecruiting"],
      mediaType: "photo",
      notes: "Post-playoff-win work ethic. Shows no complacency. Film room photo.",
      suggestedTime: "6:30 AM CT",
    },
    {
      id: 27,
      weekNumber: 6,
      day: "Tuesday",
      pillar: "performance",
      content:
        "Playoff game breakdown:\n\n\u2022 38 snaps, 0 pressures allowed\n\u2022 Team rushed for 280 yards\n\u2022 3 pancake blocks\n\nDoing my job. Dominating the line of scrimmage.\n\n\uD83C\uDFA5 Playoff highlights: [HUDL Link]\n\n#OL #2029Recruit #FootballRecruiting #Playoffs #OffensiveLine",
      hashtags: ["#OL", "#2029Recruit", "#FootballRecruiting", "#Playoffs", "#OffensiveLine"],
      mediaType: "video",
      notes: "Playoff stats + film. Best performance numbers yet. Capitalize on momentum.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 28,
      weekNumber: 6,
      day: "Wednesday",
      pillar: "character",
      content:
        "Six weeks ago I started this account with a goal: build my brand, share my journey, and connect with programs that fit.\n\n30 posts later, I'm just getting started.\n\nTo every coach, recruit, and supporter who's followed along — thank you. The best is ahead.\n\n#2029Recruit #OL #FootballRecruiting #WisconsinFootball",
      hashtags: ["#2029Recruit", "#OL", "#FootballRecruiting", "#WisconsinFootball"],
      mediaType: "text",
      notes: "Milestone reflection. 30-post mark. Authentic gratitude. Reaffirm commitment.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 29,
      weekNumber: 6,
      day: "Thursday",
      pillar: "performance",
      content:
        "Updated recruiting profile:\n\n\uD83D\uDCCF 6\'4\" | 285 lbs\n\uD83C\uDFE0 Pewaukee HS | Class of 2029\n\uD83C\uDFC8 Training @IMGAcademy\n\uD83D\uDCDA 3.8 GPA\n\n\uD83C\uDFA5 Hudl: [HUDL Link]\n\uD83D\uDCCB NCSA: [NCSA Link]\n\nCoaches — I'd love to hear from you.\n\n#OL #2029Recruit #FootballRecruiting #RecruitMe #OffensiveLine",
      hashtags: ["#OL", "#2029Recruit", "#FootballRecruiting", "#RecruitMe", "#OffensiveLine"],
      mediaType: "photo",
      notes: "Updated recruiting card. All links in one place. Clear call to action for coaches.",
      suggestedTime: "7:00 PM CT",
    },
    {
      id: 30,
      weekNumber: 6,
      day: "Friday",
      pillar: "performance",
      content:
        "Round 2. Bigger stage. Bigger opportunity.\n\nThis is why you put in the work all year. For nights like this.\n\nPewaukee — let's make history.\n\n#FridayNightLights #2029Recruit #OL #Playoffs #WisconsinFootball",
      hashtags: ["#FridayNightLights", "#2029Recruit", "#OL", "#Playoffs", "#WisconsinFootball"],
      mediaType: "photo",
      notes: "Playoff Round 2 game day. End the 30-post arc on a high note. Photo under the lights.",
      suggestedTime: "3:00 PM CT",
    },
  ] as XPost[],
} as const;

export type JacobXProfileData = typeof jacobXProfile;
