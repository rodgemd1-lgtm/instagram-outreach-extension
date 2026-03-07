// ---------------------------------------------------------------------------
// 14-Day Content & Recruiting Action Plan — March 7–20, 2026
// ---------------------------------------------------------------------------
// Each day: content post + recruiting action + media asset assignment
// Uses the Content Psychology Framework (5 post formulas, 8 mechanisms)
// ---------------------------------------------------------------------------

export interface DayPlan {
  date: string;
  day: string;
  post: {
    formula: "spotlight_shift" | "curious_student" | "honest_progress" | "ambient_update" | "narrative_loop";
    pillar: "performance" | "work_ethic" | "character";
    mechanism: string;
    content: string;
    hashtags: string[];
    bestTime: string;
    mediaType: "video_clip" | "micro_clip" | "photo" | "text_only" | "highlight_reel";
    mediaNote: string;
  };
  recruitingAction: {
    type: "ncsa" | "coach_engage" | "follow_campaign" | "dm_draft" | "film_share" | "profile_update";
    description: string;
    targets?: string[];
  };
}

export const FOURTEEN_DAY_PLAN: DayPlan[] = [
  // ─── WEEK 1 ───────────────────────────────────────────────────────────────
  {
    date: "2026-03-07",
    day: "Saturday",
    post: {
      formula: "spotlight_shift",
      pillar: "performance",
      mechanism: "reciprocity + identity_resonance",
      content: `Watching Wisconsin OL tape from their last season. The way their left tackle sets his anchor on power rushes is a masterclass.

Studying the best to learn from the best. Shoutout to any OL coach who takes time to break down technique on film — it makes a difference for guys like me still learning.

#OffensiveLine #FilmStudy #ClassOf2029`,
      hashtags: ["#OffensiveLine", "#FilmStudy", "#ClassOf2029"],
      bestTime: "10:00 AM CST",
      mediaType: "text_only",
      mediaNote: "No media — let the film study message stand alone. Coaches engage more with thoughtful text posts on weekends.",
    },
    recruitingAction: {
      type: "ncsa",
      description: "Update NCSA profile with latest measurables and winter training stats. Add new film clips from recent workouts.",
      targets: ["NCSA Profile"],
    },
  },
  {
    date: "2026-03-08",
    day: "Sunday",
    post: {
      formula: "ambient_update",
      pillar: "work_ethic",
      mechanism: "scarcity + narrative_transportation",
      content: `Sunday film session. Just me, the iPad, and last week's practice tape.

Pausing every other play. Writing down what I see before the snap vs what actually happened.

Getting better at reading defenses. Slowly.`,
      hashtags: [],
      bestTime: "7:00 PM CST",
      mediaType: "micro_clip",
      mediaNote: "Use a 2-3 second micro clip of film on an iPad screen. Low-key, authentic. No fancy editing.",
    },
    recruitingAction: {
      type: "coach_engage",
      description: "Like and reply to 5 target school coaches' weekend posts. Substantive replies only — reference their content specifically.",
      targets: ["Wisconsin OL staff", "Iowa OL staff", "Minnesota OL staff", "Northern Iowa staff", "UW-Whitewater staff"],
    },
  },
  {
    date: "2026-03-09",
    day: "Monday",
    post: {
      formula: "curious_student",
      pillar: "work_ethic",
      mechanism: "curiosity_gap + autonomy_bias",
      content: `For any strength coaches on here — when you're training a young OL in the offseason, do you prioritize squat depth or squat weight first?

Currently hitting 350 on squats but working on getting below parallel consistently. My trainer says depth first, weight second.

Curious what the college approach is.

#OffensiveLine #StrengthTraining #ClassOf2029`,
      hashtags: ["#OffensiveLine", "#StrengthTraining", "#ClassOf2029"],
      bestTime: "7:00 AM CST",
      mediaType: "video_clip",
      mediaNote: "Attach a 15-20 second squat training clip. Show the work. Coaches want to see you in the weight room.",
    },
    recruitingAction: {
      type: "follow_campaign",
      description: "Follow all Tier 3 school OL coaching staff who aren't followed yet. D2/GLIAC/NSIC coaches follow back at highest rate.",
      targets: ["Michigan Tech", "Northern Michigan", "Ferris State", "UW-Oshkosh", "UW-Whitewater"],
    },
  },
  {
    date: "2026-03-10",
    day: "Tuesday",
    post: {
      formula: "spotlight_shift",
      pillar: "performance",
      mechanism: "reciprocity + identity_resonance",
      content: `Combo block drill from today's session. My job is to get movement on the down lineman, then release to the linebacker.

Our DT made it tough — he's gotten so much stronger this offseason. Iron sharpens iron.

Coach Henderson tells us every rep matters, even in March.`,
      hashtags: [],
      bestTime: "4:00 PM CST",
      mediaType: "video_clip",
      mediaNote: "Attach a 20-30 second combo block drill clip. Label the play. Coaches watch Tuesday film.",
    },
    recruitingAction: {
      type: "film_share",
      description: "Upload 3 new training clips to Hudl profile. Tag with technique labels: combo blocks, pass protection sets, pull blocks.",
    },
  },
  {
    date: "2026-03-11",
    day: "Wednesday",
    post: {
      formula: "narrative_loop",
      pillar: "character",
      mechanism: "curiosity_gap + commitment_consistency",
      content: `Started a new routine this week — 20 minutes of reading before bed instead of scrolling.

First book: \"The Mamba Mentality\" by Kobe.

The chapter on preparation hit different. He'd study opponents' footwork for hours before a game. I'm trying to bring that same mindset to film study.

I'll share what else I learn as I go through it.`,
      hashtags: [],
      bestTime: "8:00 PM CST",
      mediaType: "text_only",
      mediaNote: "Text only. Character posts don't need media — the vulnerability IS the content.",
    },
    recruitingAction: {
      type: "ncsa",
      description: "Check NCSA activity feed — log which coaches viewed Jacob's profile this week. Add new viewers to warm list for future outreach.",
    },
  },
  {
    date: "2026-03-12",
    day: "Thursday",
    post: {
      formula: "spotlight_shift",
      pillar: "performance",
      mechanism: "reciprocity + identity_resonance",
      content: `Thursday film breakdown. Watched our playoff game second half.

Play that stood out: 3rd & short, our guard pulled left and kicked out the end while I sealed the backside. The timing was the best it's been all year.

That's what reps in practice build. Our whole line group deserves credit for that drive.

#OffensiveLine #FilmStudy`,
      hashtags: ["#OffensiveLine", "#FilmStudy"],
      bestTime: "7:00 PM CST",
      mediaType: "video_clip",
      mediaNote: "Use a game film clip if available — the playoff game pull block play. 15-25 seconds. Coaches review film on Thursdays.",
    },
    recruitingAction: {
      type: "dm_draft",
      description: "Draft personalized DMs for 3 Tier 3 coaches who followed back this week. Reference something specific from their recent tweets.",
      targets: ["Tier 3 coaches who followed back"],
    },
  },
  {
    date: "2026-03-13",
    day: "Friday",
    post: {
      formula: "ambient_update",
      pillar: "work_ethic",
      mechanism: "scarcity + narrative_transportation",
      content: `Friday morning. Last lift of the week.

Bench went up 10 lbs this month. Small wins add up.

Have a great weekend everyone.`,
      hashtags: [],
      bestTime: "6:30 AM CST",
      mediaType: "micro_clip",
      mediaNote: "2-3 second micro clip from the weight room. Early morning light. Authentic and understated.",
    },
    recruitingAction: {
      type: "coach_engage",
      description: "Reply to any coach or recruiting analyst posts about spring practice or camp schedules. Position Jacob as engaged and aware of the calendar.",
    },
  },

  // ─── WEEK 2 ───────────────────────────────────────────────────────────────
  {
    date: "2026-03-14",
    day: "Saturday",
    post: {
      formula: "honest_progress",
      pillar: "character",
      mechanism: "commitment_consistency + narrative_transportation",
      content: `Week 2 of the reading habit. Finished \"The Mamba Mentality.\"

Biggest takeaway: obsessing over details isn't weird — it's necessary. Kobe studied the referee's positioning to know which moves he could get away with.

For OL, that translates to studying the defensive tackle's hand placement tendencies before the snap. Tiny details that create big advantages.

Next up: \"Relentless\" by Tim Grover.

What books have changed your approach to competition?`,
      hashtags: [],
      bestTime: "10:00 AM CST",
      mediaType: "text_only",
      mediaNote: "Text only. The open question at the end invites engagement from coaches and athletes.",
    },
    recruitingAction: {
      type: "ncsa",
      description: "Share NCSA profile link in bio if not already there. Ensure Hudl link is current. Cross-check that all film is properly tagged.",
    },
  },
  {
    date: "2026-03-15",
    day: "Sunday",
    post: {
      formula: "curious_student",
      pillar: "performance",
      mechanism: "curiosity_gap + reciprocity",
      content: `Watching Big Ten OL tape today. Noticed something — the best pass protectors don't lunge at the rusher. They wait.

Patient hands. Let the DE come to them. Then strike.

Is that something you can teach a young lineman, or does it come from experience? Genuinely curious.

#OffensiveLine #BigTen #ClassOf2029`,
      hashtags: ["#OffensiveLine", "#BigTen", "#ClassOf2029"],
      bestTime: "6:00 PM CST",
      mediaType: "text_only",
      mediaNote: "Text only — the question format drives coach engagement. Big Ten tag reaches the right eyes.",
    },
    recruitingAction: {
      type: "follow_campaign",
      description: "Follow Tier 2 school coaching staff — FCS and MAC programs. These coaches are the most active on X and most likely to engage.",
      targets: ["Northern Iowa", "Illinois State", "South Dakota State", "Western Michigan", "Eastern Michigan", "Central Michigan"],
    },
  },
  {
    date: "2026-03-16",
    day: "Monday",
    post: {
      formula: "spotlight_shift",
      pillar: "work_ethic",
      mechanism: "reciprocity + identity_resonance",
      content: `Monday morning speed work with the line group.

Our coach brought in a new lateral agility drill today — mirror drill with a partner. My training partner Noah pushed the pace hard. He's gotten way faster this offseason.

Competition in practice makes everyone better.`,
      hashtags: [],
      bestTime: "7:00 AM CST",
      mediaType: "video_clip",
      mediaNote: "Attach a 15-20 second agility drill clip. Show footwork. Lateral movement clips stand out for OL recruits.",
    },
    recruitingAction: {
      type: "coach_engage",
      description: "Engage with 5 Tier 2 coach posts. Like + substantive reply. Goal: get on their radar before any DM outreach.",
      targets: ["Northern Iowa OL", "Western Michigan OL", "Illinois State OL", "South Dakota State OL", "Central Michigan OL"],
    },
  },
  {
    date: "2026-03-17",
    day: "Tuesday",
    post: {
      formula: "narrative_loop",
      pillar: "performance",
      mechanism: "curiosity_gap + commitment_consistency + loss_aversion",
      content: `Spring ball starts in 2 weeks. Setting my goals now.

1. Zero sacks allowed in 7-on-7 (update from my earlier post — holding myself to it)
2. Win the combo block drill every day
3. Get one compliment from a defensive lineman about my technique

Number 3 sounds weird but think about it — when the guy across from you acknowledges your improvement, that's real.

Updates coming.`,
      hashtags: [],
      bestTime: "4:00 PM CST",
      mediaType: "text_only",
      mediaNote: "Text only. This callbacks the earlier Narrative Loop post — building a story arc that followers track.",
    },
    recruitingAction: {
      type: "film_share",
      description: "Upload 3 more clips to Hudl. Focus on pass protection reps — anchor against bull rush, kick slide technique. Update NCSA with new Hudl link.",
    },
  },
  {
    date: "2026-03-18",
    day: "Wednesday",
    post: {
      formula: "spotlight_shift",
      pillar: "character",
      mechanism: "reciprocity + identity_resonance",
      content: `Parent-teacher conferences today. 3.25 GPA and climbing.

My English teacher Mrs. Rodriguez told my parents I'm one of the most improved writers in her class this year.

Didn't expect that to mean as much as it did. Turns out the film study habit of writing down what I see is making me a better writer too.

Recruiting is more than football.`,
      hashtags: [],
      bestTime: "8:00 PM CST",
      mediaType: "text_only",
      mediaNote: "Text only. Academic character post. Coaches notice GPA mentions — it signals coachability and eligibility.",
    },
    recruitingAction: {
      type: "ncsa",
      description: "Update NCSA academic section with current GPA. Check for any new coach profile views. Log all new activity to the warm list.",
    },
  },
  {
    date: "2026-03-19",
    day: "Thursday",
    post: {
      formula: "curious_student",
      pillar: "performance",
      mechanism: "autonomy_bias + curiosity_gap",
      content: `Film question for the coaches and OL guys.

On a reach block to the backside, should the lineman's first step be a lateral bucket step or a 45-degree angle step?

I've been taught bucket step to gain width, but I keep seeing college guys take a sharper angle and get there faster.

Is it a body type thing? A scheme thing? Both?

#OffensiveLine #OLTechnique #FilmStudy`,
      hashtags: ["#OffensiveLine", "#OLTechnique", "#FilmStudy"],
      bestTime: "7:00 PM CST",
      mediaType: "video_clip",
      mediaNote: "Attach a reach block drill clip if available. The technique question paired with film is irresistible to OL coaches.",
    },
    recruitingAction: {
      type: "dm_draft",
      description: "Draft personalized DMs for 3 Tier 2 FCS coaches. Reference their spring practice posts or recent recruits. Review with Nina before sending.",
      targets: ["Northern Iowa OL coach", "South Dakota State OL coach", "Illinois State OL coach"],
    },
  },
  {
    date: "2026-03-20",
    day: "Friday",
    post: {
      formula: "honest_progress",
      pillar: "work_ethic",
      mechanism: "commitment_consistency + narrative_transportation",
      content: `End of week 2 honest check-in.

This week I:
- Hit a new squat PR (working toward 375)
- Watched 4 hours of college OL film
- Got a reply from a coach on my technique question (still processing that one)
- Read 2 chapters of \"Relentless\"

What I need to improve:
- Sleep. I'm averaging 6 hours. Need 8.
- Film study consistency — some days I skip when I'm tired
- Being more patient with the process

Two weeks down. Twelve more before camp season.

Grateful for this journey.`,
      hashtags: [],
      bestTime: "6:30 AM CST",
      mediaType: "micro_clip",
      mediaNote: "Short training montage micro clip (3-5 sec). End-of-week energy. Or text only — the honesty carries the post.",
    },
    recruitingAction: {
      type: "profile_update",
      description: "Weekly profile audit: check bio, pinned post, header image, Hudl link. Update any metrics that changed. Review follower growth and coach engagement rates for the week.",
    },
  },
];

export function getTodayPlan(): DayPlan | null {
  const today = new Date().toISOString().split("T")[0];
  return FOURTEEN_DAY_PLAN.find((p) => p.date === today) ?? null;
}

export function getUpcomingPlans(days: number = 7): DayPlan[] {
  const today = new Date().toISOString().split("T")[0];
  return FOURTEEN_DAY_PLAN.filter((p) => p.date >= today).slice(0, days);
}

export function getPlanSummary(): string {
  const lines = ["14-DAY CONTENT & RECRUITING PLAN (March 7–20, 2026)\n"];

  for (const day of FOURTEEN_DAY_PLAN) {
    lines.push(`${day.date} (${day.day})`);
    lines.push(`  POST: [${day.post.formula}] [${day.post.pillar}] @ ${day.post.bestTime}`);
    lines.push(`  Media: ${day.post.mediaType} — ${day.post.mediaNote.substring(0, 80)}`);
    lines.push(`  ACTION: [${day.recruitingAction.type}] ${day.recruitingAction.description.substring(0, 80)}`);
    if (day.recruitingAction.targets?.length) {
      lines.push(`  Targets: ${day.recruitingAction.targets.join(", ")}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
