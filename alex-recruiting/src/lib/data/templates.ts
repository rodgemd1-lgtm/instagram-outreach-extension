// Post and DM Templates — Section 3.3 of the Playbook

export const postTemplates = {
  pinned: {
    name: "Pinned Post",
    template: `Jacob Rodgers | OL | 6'4" 285 | Pewaukee HS | Class of 2029
Wisconsin | NCSA Recruiting Profile: {NCSA_LINK}
Training with @IMGAcademy | Represented by @NCSASports
Full Highlights: {HUDL_LINK} | Website: {WEBSITE_LINK}
#2029Recruit #OL #FootballRecruiting #WI`,
    notes: "Update every 90 days with new/better film. Native highlight video upload.",
  },

  highlightClip: {
    name: "Highlight Clip",
    template: `{OPENING_LINE}

Full film: {NCSA_LINK}
#OL #OffensiveLine #FootballRecruiting #2029Recruit {SCHOOL_HASHTAG}`,
    notes: "Opening line must be specific and technical. 15-45 second native video.",
    examples: [
      "Working on my first-step quickness and hand placement this week",
      "Drive block technique from Friday's game — finishing through the whistle",
      "Pass protection set from the left side — working on my anchor",
    ],
  },

  trainingPost: {
    name: "Training / Work Ethic",
    template: `{TRAINING_DESCRIPTION}

{HASHTAGS}`,
    notes: "Show year-round commitment. IMG footage is premium content.",
    examples: [
      "Back to work this Monday — film review + footwork drills",
      "Early morning session at @IMGAcademy — competing against the best",
      "Bench PR today. 6'4\" 285 and getting stronger every week",
    ],
  },

  characterPost: {
    name: "Character / Brand",
    template: `{CHARACTER_CONTENT}

{HASHTAGS}`,
    notes: "Makes Jacob three-dimensional. Academic, community, team moments.",
    examples: [
      "Honor roll this semester — balancing the books and the field",
      "Great team win tonight. Nothing better than winning with your brothers",
      "Volunteered at the Pewaukee youth football camp this weekend — giving back to the game that gave me everything",
    ],
  },

  gameDayPost: {
    name: "Game Day",
    template: `{GAME_DAY_CONTENT}

#2029Recruit #OL #FootballRecruiting {SCHOOL_HASHTAGS}`,
    notes: "Post within 2 hours of game end. Recency matters.",
    examples: [
      "Game day. Let's work.",
      "Big win tonight — 42-14. Grateful for this team",
      "Playoff football. Pewaukee OL coming to dominate tonight",
    ],
  },

  campAnnouncement: {
    name: "Camp/Event Announcement",
    template: `{CAMP_DETAILS}

{HASHTAGS}`,
    notes: "Post BEFORE and AFTER every camp, combine, 7v7, or school visit.",
    examples: [
      "Excited to compete at the @IMGAcademy OL camp this weekend",
      "Just wrapped up at {CAMP_NAME}. Great feedback on my footwork and hand placement — grateful for the coaching",
    ],
  },

  milestonePost: {
    name: "Milestone Announcement",
    template: `{MILESTONE_CONTENT}

{LINKS}
{HASHTAGS}`,
    notes: "Every offer, camp invite, workout PR, honor roll, HUDL feature = a post.",
  },
};

export const dmTemplates = {
  intro: {
    name: "Introduction DM",
    template: `Coach {COACH_LAST_NAME}, my name is Jacob Rodgers. I'm a Class of 2029 OL from Pewaukee High School in Wisconsin (6'4", 285). I've been following {SCHOOL_NAME} football and admire how your program develops offensive linemen. I'd love to be on your radar — here's my film: {NCSA_LINK}. Excited to keep working and hopefully connect!`,
    useCase: "First contact with a target coach",
  },

  postCamp: {
    name: "Post-Camp Follow-Up",
    template: `Coach {COACH_LAST_NAME}, just got back from {CAMP_NAME}. Worked hard and got some great feedback on my footwork and hand placement. Wanted to stay on your radar — I'm Jacob Rodgers, 2029 OL from Pewaukee HS, WI. Updated film: {NCSA_LINK}. Looking forward to continuing to improve!`,
    useCase: "After attending a camp or showcase",
  },

  postFollow: {
    name: "After Coach Follows Jacob",
    template: `Coach {COACH_LAST_NAME}, thank you for the follow! I've had {SCHOOL_NAME} on my radar for a while — I love what you're building there. I'm Jacob Rodgers, 2029 OL, 6'4" 285, from Pewaukee HS in Wisconsin. Would love the opportunity to talk more about {SCHOOL_NAME} and what you look for in your OL. Here's my full film: {NCSA_LINK}. Thank you!`,
    useCase: "Trigger: coach follows Jacob's account",
  },
};

export function fillTemplate(template: string, vars: Record<string, string>): string {
  let filled = template;
  for (const [key, value] of Object.entries(vars)) {
    filled = filled.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return filled;
}
