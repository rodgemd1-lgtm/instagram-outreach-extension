// Comments Library — 80+ comment templates for engaging on coaches' posts

export type CommentCategory =
  | "coach_film"
  | "coach_recruiting"
  | "coach_team"
  | "coach_win"
  | "coach_inspirational"
  | "coach_camp_event"
  | "general_engagement";

export type CommentTone = "respectful" | "enthusiastic" | "professional" | "casual";
export type SafetyLevel = "always_safe" | "context_check" | "coach_specific";

export interface Comment {
  id: string;
  text: string;
  category: CommentCategory;
  tone: CommentTone;
  safetyLevel: SafetyLevel;
}

export const commentsLibrary: Comment[] = [
  // ─── COACH FILM POSTS (15+) ──────────────────────────────────────
  {
    id: "cf-001",
    text: "Great scheme execution. Love how your OL is coached — the combo blocks are textbook.",
    category: "coach_film",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-002",
    text: "That offensive line is playing with a nasty attitude. Great coaching up front.",
    category: "coach_film",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-003",
    text: "The technique on those pull blocks is outstanding. Your OL coach is doing great work.",
    category: "coach_film",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-004",
    text: "Love the physicality up front. That's how the game is supposed to be played.",
    category: "coach_film",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-005",
    text: "Great film. The pad level on those run blocks is elite.",
    category: "coach_film",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-006",
    text: "You can tell that line has put in the work. The cohesion shows on film.",
    category: "coach_film",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-007",
    text: "Pass protection looks locked in. Those guys are well-coached.",
    category: "coach_film",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-008",
    text: "The finish on every block — that's coaching. Great stuff, Coach.",
    category: "coach_film",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-009",
    text: "That zone scheme is clicking. The second-level blocks are creating huge lanes.",
    category: "coach_film",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-010",
    text: "Love seeing OL get highlighted. Those guys deserve the recognition.",
    category: "coach_film",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-011",
    text: "The footwork on that pass set is clean. Great coaching.",
    category: "coach_film",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-012",
    text: "Great rep. The hand placement and drive are exactly what coaches look for.",
    category: "coach_film",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-013",
    text: "Film like this makes me want to get in the weight room right now. Impressive.",
    category: "coach_film",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-014",
    text: "That OL is creating movement at the point of attack. Running downhill. Great stuff.",
    category: "coach_film",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-015",
    text: "The combination blocks and communication up front are excellent. That's a well-coached unit.",
    category: "coach_film",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "cf-016",
    text: "Great example of what finishing through the whistle looks like. That effort is contagious.",
    category: "coach_film",
    tone: "professional",
    safetyLevel: "always_safe",
  },

  // ─── COACH RECRUITING POSTS (15+) ────────────────────────────────
  {
    id: "cr-001",
    text: "Awesome pickup for the program! Congrats to the new commit.",
    category: "coach_recruiting",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "cr-002",
    text: "Great get. That class is looking strong, Coach.",
    category: "coach_recruiting",
    tone: "casual",
    safetyLevel: "always_safe",
  },
  {
    id: "cr-003",
    text: "Congrats! Building something special over there.",
    category: "coach_recruiting",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "cr-004",
    text: "Another great addition to the class. The future is bright.",
    category: "coach_recruiting",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "cr-005",
    text: "Great class coming together. That program keeps getting better every year.",
    category: "coach_recruiting",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "cr-006",
    text: "Congrats to the commit and the coaching staff. Great fit.",
    category: "coach_recruiting",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "cr-007",
    text: "The talent keeps coming. Great job building this program, Coach.",
    category: "coach_recruiting",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "cr-008",
    text: "Love seeing programs invest in the trenches. Great pickup on the OL.",
    category: "coach_recruiting",
    tone: "professional",
    safetyLevel: "context_check",
  },
  {
    id: "cr-009",
    text: "Exciting times for the program. That's a strong recruiting class.",
    category: "coach_recruiting",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "cr-010",
    text: "Congrats! That's a player who's going to make an impact. Great find.",
    category: "coach_recruiting",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "cr-011",
    text: "The program keeps leveling up. Respect the process, Coach.",
    category: "coach_recruiting",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "cr-012",
    text: "Great offer for a deserving player. Programs like yours develop guys the right way.",
    category: "coach_recruiting",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "cr-013",
    text: "Another strong addition. That class is going to be special.",
    category: "coach_recruiting",
    tone: "casual",
    safetyLevel: "always_safe",
  },
  {
    id: "cr-014",
    text: "Love to see it. Great pick-up for the program and a great opportunity for the player.",
    category: "coach_recruiting",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "cr-015",
    text: "The culture you're building is attracting top talent. Well deserved, Coach.",
    category: "coach_recruiting",
    tone: "professional",
    safetyLevel: "always_safe",
  },

  // ─── COACH TEAM POSTS (10+) ──────────────────────────────────────
  {
    id: "ct-001",
    text: "That's a program built on toughness. Respect.",
    category: "coach_team",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "ct-002",
    text: "You can see the culture in how they practice. Great stuff, Coach.",
    category: "coach_team",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "ct-003",
    text: "That's what a championship culture looks like. The work shows.",
    category: "coach_team",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "ct-004",
    text: "Love seeing the off-season work. That's where championships are built.",
    category: "coach_team",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "ct-005",
    text: "Great team energy. That's what happens when the culture is right.",
    category: "coach_team",
    tone: "casual",
    safetyLevel: "always_safe",
  },
  {
    id: "ct-006",
    text: "Hard work in the off-season shows up under the lights. Great preparation, Coach.",
    category: "coach_team",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "ct-007",
    text: "That's a team that plays for each other. You can see it in every rep.",
    category: "coach_team",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "ct-008",
    text: "The discipline and effort in that practice clip is outstanding. Well coached.",
    category: "coach_team",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "ct-009",
    text: "Team first mentality. That's what programs are built on. Respect.",
    category: "coach_team",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "ct-010",
    text: "Spring ball looking strong, Coach. The improvement from last year is clear.",
    category: "coach_team",
    tone: "professional",
    safetyLevel: "context_check",
  },
  {
    id: "ct-011",
    text: "Love the intensity. That's a program that competes every single day.",
    category: "coach_team",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },

  // ─── COACH WIN POSTS (10+) ───────────────────────────────────────
  {
    id: "cw-001",
    text: "Congrats on the win, Coach! That OL was dominant tonight.",
    category: "coach_win",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "cw-002",
    text: "Great win! The preparation showed up on the field. Well coached.",
    category: "coach_win",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "cw-003",
    text: "Big win. Your program just keeps building. Congrats, Coach.",
    category: "coach_win",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "cw-004",
    text: "Dominant performance. That team was ready to play tonight.",
    category: "coach_win",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "cw-005",
    text: "Congrats on the W! That's what off-season work looks like when it pays off.",
    category: "coach_win",
    tone: "casual",
    safetyLevel: "always_safe",
  },
  {
    id: "cw-006",
    text: "The trenches won that game. Great coaching up front, Coach.",
    category: "coach_win",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "cw-007",
    text: "Playoff W. Congrats, Coach! That team is on a mission.",
    category: "coach_win",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "cw-008",
    text: "Conference champs! Well deserved. The work your staff puts in is showing.",
    category: "coach_win",
    tone: "respectful",
    safetyLevel: "context_check",
  },
  {
    id: "cw-009",
    text: "Great team win. You can tell those guys play for each other and their coaches.",
    category: "coach_win",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "cw-010",
    text: "Another one. That program is rolling. Congrats, Coach.",
    category: "coach_win",
    tone: "casual",
    safetyLevel: "always_safe",
  },
  {
    id: "cw-011",
    text: "Big road win. That takes toughness. Well coached team, Coach.",
    category: "coach_win",
    tone: "professional",
    safetyLevel: "always_safe",
  },

  // ─── COACH INSPIRATIONAL POSTS (10+) ─────────────────────────────
  {
    id: "ci-001",
    text: "Needed to hear this today. Thank you, Coach.",
    category: "coach_inspirational",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "ci-002",
    text: "This is the mindset. Saved this one. Thank you for sharing.",
    category: "coach_inspirational",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "ci-003",
    text: "Facts. The process is what makes the result meaningful.",
    category: "coach_inspirational",
    tone: "casual",
    safetyLevel: "always_safe",
  },
  {
    id: "ci-004",
    text: "Great perspective, Coach. This applies on and off the field.",
    category: "coach_inspirational",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "ci-005",
    text: "This is what it's all about. Appreciate you sharing this, Coach.",
    category: "coach_inspirational",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "ci-006",
    text: "Screenshotted this. Going to read it before every workout.",
    category: "coach_inspirational",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "ci-007",
    text: "The mentality of a champion right here. Thank you, Coach.",
    category: "coach_inspirational",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "ci-008",
    text: "This is why coaching matters beyond the game. Appreciate you.",
    category: "coach_inspirational",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "ci-009",
    text: "Real talk. Hard work beats talent when talent doesn't work hard.",
    category: "coach_inspirational",
    tone: "casual",
    safetyLevel: "always_safe",
  },
  {
    id: "ci-010",
    text: "Applying this to everything I do. On and off the field. Great message, Coach.",
    category: "coach_inspirational",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "ci-011",
    text: "This is the standard. Thank you for setting the bar high, Coach.",
    category: "coach_inspirational",
    tone: "respectful",
    safetyLevel: "always_safe",
  },

  // ─── COACH CAMP/EVENT POSTS (10+) ────────────────────────────────
  {
    id: "ce-001",
    text: "Looking forward to competing at this! Great opportunity.",
    category: "coach_camp_event",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "ce-002",
    text: "Registered and ready to compete. Can't wait, Coach.",
    category: "coach_camp_event",
    tone: "enthusiastic",
    safetyLevel: "coach_specific",
  },
  {
    id: "ce-003",
    text: "Great event. Looking forward to the opportunity to learn and compete.",
    category: "coach_camp_event",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "ce-004",
    text: "This camp produces top talent every year. Excited to be a part of it.",
    category: "coach_camp_event",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "ce-005",
    text: "The coaching staff at this camp is elite. Great learning opportunity.",
    category: "coach_camp_event",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "ce-006",
    text: "Looking forward to testing myself against top competition. See you there, Coach.",
    category: "coach_camp_event",
    tone: "enthusiastic",
    safetyLevel: "coach_specific",
  },
  {
    id: "ce-007",
    text: "Events like this are what make camp season special. Counting down the days.",
    category: "coach_camp_event",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "ce-008",
    text: "Great opportunity for recruits to get coached and compete. Looking forward to it.",
    category: "coach_camp_event",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "ce-009",
    text: "Had a great time at this last year. Coming back to compete even harder this time.",
    category: "coach_camp_event",
    tone: "enthusiastic",
    safetyLevel: "context_check",
  },
  {
    id: "ce-010",
    text: "Best camp in the region. The competition and coaching are always top-tier.",
    category: "coach_camp_event",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "ce-011",
    text: "Signed up. Ready to work. Let's go.",
    category: "coach_camp_event",
    tone: "casual",
    safetyLevel: "always_safe",
  },

  // ─── GENERAL ENGAGEMENT (10+) ────────────────────────────────────
  {
    id: "ge-001",
    text: "This is what it's all about. Great stuff.",
    category: "general_engagement",
    tone: "casual",
    safetyLevel: "always_safe",
  },
  {
    id: "ge-002",
    text: "Respect. Nothing but respect for this.",
    category: "general_engagement",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "ge-003",
    text: "Love this. The game needs more of this.",
    category: "general_engagement",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "ge-004",
    text: "This is why football is the best sport. The brotherhood and the grind.",
    category: "general_engagement",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "ge-005",
    text: "Outstanding. The work always shows up eventually.",
    category: "general_engagement",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "ge-006",
    text: "Nothing better. Hard work pays off every time.",
    category: "general_engagement",
    tone: "casual",
    safetyLevel: "always_safe",
  },
  {
    id: "ge-007",
    text: "This motivates me to get back in the gym. Great content.",
    category: "general_engagement",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "ge-008",
    text: "Earned, not given. That's the way it should be.",
    category: "general_engagement",
    tone: "respectful",
    safetyLevel: "always_safe",
  },
  {
    id: "ge-009",
    text: "The dedication is real. Respect the grind.",
    category: "general_engagement",
    tone: "casual",
    safetyLevel: "always_safe",
  },
  {
    id: "ge-010",
    text: "This is excellence. Period.",
    category: "general_engagement",
    tone: "professional",
    safetyLevel: "always_safe",
  },
  {
    id: "ge-011",
    text: "Love seeing people put in the work and get the results. Well deserved.",
    category: "general_engagement",
    tone: "enthusiastic",
    safetyLevel: "always_safe",
  },
  {
    id: "ge-012",
    text: "The game rewards those who prepare. Great example right here.",
    category: "general_engagement",
    tone: "professional",
    safetyLevel: "always_safe",
  },
];

// ─── Helper Functions ───────────────────────────────────────────────

export function getCommentsByCategory(category: string): Comment[] {
  return commentsLibrary.filter((c) => c.category === category);
}

export function getCommentsByTone(tone: CommentTone): Comment[] {
  return commentsLibrary.filter((c) => c.tone === tone);
}

export function getSafeComments(): Comment[] {
  return commentsLibrary.filter((c) => c.safetyLevel === "always_safe");
}

export function getRandomComment(category?: CommentCategory): Comment {
  const pool = category ? getCommentsByCategory(category) : commentsLibrary;
  return pool[Math.floor(Math.random() * pool.length)];
}
