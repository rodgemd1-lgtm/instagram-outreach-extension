// Compliance Guardian — NCAA rules validation layer
// Checks all outbound communications against NCAA rules BEFORE they are sent.
// This module is the last gate before any DM or post reaches the X API.

import { ncaaRules } from "@/lib/rec/knowledge/ncaa-rules";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Division = "D1-FBS" | "D1-FCS" | "D2" | "D3" | "NAIA";

export interface ValidateDMParams {
  coachName: string;
  schoolName: string;
  division: Division;
  messageContent: string;
  athleteClassYear: number; // e.g. 2029
}

export interface ValidateDMResult {
  allowed: boolean;
  reason?: string;
  rule?: string;
}

export interface ValidatePostParams {
  content: string;
  mentionsCoach: boolean;
  mentionsSchool: boolean;
  platform: "x" | "instagram";
}

export interface ValidatePostResult {
  allowed: boolean;
  reason?: string;
  violations?: string[];
}

export interface PhaseInfo {
  phase: string;
  description: string;
  allowedActions: string[];
  restrictedActions: string[];
  nextMilestone: { date: string; description: string };
}

export interface ContactabilityResult {
  allowed: boolean;
  method: string[];
  restrictions: string[];
}

// ---------------------------------------------------------------------------
// Content violation patterns
// ---------------------------------------------------------------------------

const SCHOLARSHIP_GUARANTEE_PATTERNS = [
  /\bguarantee\w*\s+(scholarship|offer|ride|full ride|money)/i,
  /\byou('re| are| will be)\s+(getting|receiving)\s+(a\s+)?(scholarship|offer)/i,
  /\bpromise\w*\s+(scholarship|offer|spot|position|playing time)/i,
  /\blocked\s*(in|up)\s+(scholarship|offer|spot)/i,
  /\bsecured?\s+(your\s+)?(scholarship|offer|spot)/i,
];

const PLAYING_TIME_GUARANTEE_PATTERNS = [
  /\bguarantee\w*\s+(playing time|starter|starting|reps)/i,
  /\byou('ll| will)\s+(start|be\s+a\s+starter|get\s+playing\s+time)/i,
  /\bpromise\w*\s+(playing time|starter|starting position)/i,
];

const NEGATIVE_SCHOOL_PATTERNS = [
  /\b(don'?t|do not|never|avoid)\s+(go|commit|sign|visit)\s+(to|with|at)\s/i,
  /\b(terrible|awful|worst|bad|trash|garbage)\s+(program|school|team|coaches?|facilities)/i,
  /\b(better than|worse than)\s+\w+\s+(university|college|state|tech)/i,
  /\bstay\s+away\s+from\b/i,
];

const CONFIDENTIAL_RECRUITING_PATTERNS = [
  /\b(other|another)\s+(school|program|coach)\s+(offered|is\s+offering|wants|is\s+interested)/i,
  /\b(between\s+us|off\s+the\s+record|confidential|don'?t\s+tell|keep\s+this\s+quiet)/i,
  /\b(insider|inside)\s+(info|information|knowledge|scoop)/i,
];

const UNAUTHORIZED_CLAIM_PATTERNS = [
  /\b(official\s+visit|OV)\s+(scheduled|confirmed|booked|set\s+up)/i,
  /\b(received|got)\s+(an?\s+)?(offer|scholarship)\s+from/i,
  /\bcommitted\s+to\b/i,
  /\boffered\s+by\b/i,
];

const LOGO_USAGE_PATTERNS = [
  /\b(using|use|attach|include)\s+(the|their|our)?\s*(logo|trademark|brand)/i,
];

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function today(): Date {
  return new Date();
}

/** Parse an academic year like "Freshman (2025-26)" into a start year (2025). */
function parseAcademicStartYear(label: string): number | null {
  const m = label.match(/\((\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Determine the academic phase for a given class year based on today's date.
 * Class year 2029 means graduation in 2029.
 * - Freshman year: 2025-26  (start Aug 2025)
 * - Sophomore year: 2026-27
 * - Junior year: 2027-28
 * - Senior year: 2028-29
 */
function getAcademicYear(classYear: number): {
  label: string;
  yearIndex: number; // 0=fresh, 1=soph, 2=jr, 3=sr
} {
  const now = today();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Academic year starts in August (month 7)
  const academicStartYear = currentMonth >= 7 ? currentYear : currentYear - 1;

  // Freshman year starts in (classYear - 4), e.g. 2029 - 4 = 2025
  const freshmanStartYear = classYear - 4;
  const yearIndex = academicStartYear - freshmanStartYear;

  const labels = [
    `Freshman (${freshmanStartYear}-${(freshmanStartYear + 1).toString().slice(2)})`,
    `Sophomore (${freshmanStartYear + 1}-${(freshmanStartYear + 2).toString().slice(2)})`,
    `Junior (${freshmanStartYear + 2}-${(freshmanStartYear + 3).toString().slice(2)})`,
    `Senior (${freshmanStartYear + 3}-${(freshmanStartYear + 4).toString().slice(2)})`,
  ];

  const clamped = Math.max(0, Math.min(3, yearIndex));
  return { label: labels[clamped], yearIndex: clamped };
}

// ---------------------------------------------------------------------------
// Key date milestones for a class year
// ---------------------------------------------------------------------------

function getMilestones(classYear: number) {
  const freshStart = classYear - 4; // e.g. 2025 for Class of 2029
  return {
    materialsAllowed: new Date(`${freshStart + 1}-06-15`), // June 15 after soph year
    fbsCallTexts: new Date(`${freshStart + 2}-09-01`), // Sep 1 of junior year
    officialVisits: new Date(`${freshStart + 2}-01-01`), // Jan 1 of junior year
    earlySigningPeriod: new Date(`${freshStart + 3}-12-04`), // Early Dec of senior year
    nationalSigningDay: new Date(`${classYear}-02-01`), // Feb 1 of grad year
    d2Contact: new Date(`${freshStart + 1}-06-15`), // June 15 after soph year
  };
}

// ---------------------------------------------------------------------------
// Dead period check (simplified — real calendars are conference-specific)
// ---------------------------------------------------------------------------

interface DeadPeriod {
  start: string; // MM-DD
  end: string; // MM-DD
  label: string;
}

// Approximate dead periods for football (FBS). Real ones shift yearly.
const DEAD_PERIODS: DeadPeriod[] = [
  { start: "12-02", end: "12-07", label: "Early Signing Period dead period" },
  { start: "12-23", end: "01-01", label: "Winter holiday dead period" },
  { start: "02-05", end: "02-28", label: "Post-NSD dead period (approximate)" },
];

function isInDeadPeriod(): { inDeadPeriod: boolean; label: string | null } {
  const now = today();
  const mmdd =
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");

  for (const dp of DEAD_PERIODS) {
    // Handle wrap-around (Dec-Jan)
    if (dp.start > dp.end) {
      if (mmdd >= dp.start || mmdd <= dp.end) {
        return { inDeadPeriod: true, label: dp.label };
      }
    } else {
      if (mmdd >= dp.start && mmdd <= dp.end) {
        return { inDeadPeriod: true, label: dp.label };
      }
    }
  }
  return { inDeadPeriod: false, label: null };
}

// ---------------------------------------------------------------------------
// Core validation: validateDM
// ---------------------------------------------------------------------------

export async function validateDM(params: ValidateDMParams): Promise<ValidateDMResult> {
  const { coachName, schoolName, division, messageContent, athleteClassYear } = params;
  const now = today();
  const milestones = getMilestones(athleteClassYear);
  const { yearIndex } = getAcademicYear(athleteClassYear);

  // ------------------------------------------------------------------
  // Rule 1: Athlete-initiated contact is ALWAYS allowed.
  // The system is helping the athlete compose and send messages, which
  // counts as athlete-initiated under NCAA bylaws. However, the system
  // must not mass-automate messages that could appear coach-solicited.
  // We check content, not direction, so athlete-to-coach DMs are fine
  // as long as content is compliant.
  // ------------------------------------------------------------------

  // ------------------------------------------------------------------
  // Rule 2: Content compliance checks
  // ------------------------------------------------------------------

  // Check for scholarship/offer guarantees
  for (const pattern of SCHOLARSHIP_GUARANTEE_PATTERNS) {
    if (pattern.test(messageContent)) {
      return {
        allowed: false,
        reason: `DM to ${coachName} at ${schoolName} contains language that could be interpreted as a scholarship guarantee. Remove guarantee language and let the coach initiate offer discussions.`,
        rule: "NCAA Bylaw 13.4 — No guarantees of financial aid prior to signing NLI",
      };
    }
  }

  // Check for playing time guarantees
  for (const pattern of PLAYING_TIME_GUARANTEE_PATTERNS) {
    if (pattern.test(messageContent)) {
      return {
        allowed: false,
        reason: `DM to ${coachName} at ${schoolName} contains language guaranteeing playing time. This is not compliant — playing time claims can only come from the institution.`,
        rule: "NCAA recruiting best practices — prospects should not claim or expect guaranteed playing time",
      };
    }
  }

  // Check for negative comments about other schools
  for (const pattern of NEGATIVE_SCHOOL_PATTERNS) {
    if (pattern.test(messageContent)) {
      return {
        allowed: false,
        reason: `DM to ${coachName} at ${schoolName} contains negative language about another program. Remove any comparisons or criticisms of other schools.`,
        rule: "NCAA sportsmanship standards — no disparagement of other member institutions",
      };
    }
  }

  // Check for sharing confidential recruiting info
  for (const pattern of CONFIDENTIAL_RECRUITING_PATTERNS) {
    if (pattern.test(messageContent)) {
      return {
        allowed: false,
        reason: `DM to ${coachName} at ${schoolName} appears to share confidential recruiting information from other programs. Do not disclose other schools' recruiting communications.`,
        rule: "NCAA Bylaw 13.1 — Recruiting communications are generally considered confidential",
      };
    }
  }

  // Check for unauthorized claims about offers/visits
  for (const pattern of UNAUTHORIZED_CLAIM_PATTERNS) {
    if (pattern.test(messageContent)) {
      return {
        allowed: false,
        reason: `DM to ${coachName} at ${schoolName} contains claims about offers or visits that should be verified before sending. Only reference confirmed, publicly announced offers and scheduled visits.`,
        rule: "NCAA Bylaw 13 — Misrepresenting recruiting status can result in eligibility issues",
      };
    }
  }

  // ------------------------------------------------------------------
  // Rule 3: Division-specific timing warnings (advisory, not blocking
  // for athlete-initiated contact, but we flag it)
  // ------------------------------------------------------------------

  const normalizedDivision = normalizeDivision(division);

  if (normalizedDivision === "D1-FBS" && yearIndex < 2) {
    // Before junior year for FBS
    // Athlete CAN still DM coaches — but we add a warning
    if (now < milestones.materialsAllowed) {
      return {
        allowed: true,
        reason: `Advisory: D1 FBS coaches at ${schoolName} cannot send recruiting materials until ${milestones.materialsAllowed.toLocaleDateString()}. Your DM to ${coachName} is allowed (athlete-initiated contact is always permitted), but the coach may not be able to respond with recruiting-specific information yet.`,
        rule: "NCAA Bylaw 13.4.1 — FBS recruiting materials restriction; athlete-initiated contact exception",
      };
    }
  }

  if (normalizedDivision === "D1-FCS" && yearIndex < 1) {
    return {
      allowed: true,
      reason: `Advisory: D1 FCS programs follow similar contact windows to FBS. Your DM to ${coachName} at ${schoolName} is allowed as athlete-initiated contact, but the coach's ability to respond may be limited before June 15 after sophomore year.`,
      rule: "NCAA Bylaw 13.4.1 — FCS contact rules; athlete-initiated contact exception",
    };
  }

  // D2 and D3: No blocking restrictions on athlete-initiated contact
  // D3 has no recruiting calendar restrictions at all

  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Core validation: validatePost
// ---------------------------------------------------------------------------

export async function validatePost(params: ValidatePostParams): Promise<ValidatePostResult> {
  const { content, mentionsCoach, mentionsSchool } = params;
  const violations: string[] = [];

  // Check for scholarship/offer guarantees in posts
  for (const pattern of SCHOLARSHIP_GUARANTEE_PATTERNS) {
    if (pattern.test(content)) {
      violations.push("Post contains language that could be interpreted as a scholarship guarantee");
    }
  }

  // Check for playing time guarantees
  for (const pattern of PLAYING_TIME_GUARANTEE_PATTERNS) {
    if (pattern.test(content)) {
      violations.push("Post contains language guaranteeing playing time");
    }
  }

  // Check for negative comments about schools
  for (const pattern of NEGATIVE_SCHOOL_PATTERNS) {
    if (pattern.test(content)) {
      violations.push("Post contains negative language about a program or school");
    }
  }

  // Check for confidential recruiting info
  for (const pattern of CONFIDENTIAL_RECRUITING_PATTERNS) {
    if (pattern.test(content)) {
      violations.push("Post appears to disclose confidential recruiting information");
    }
  }

  // Check for unauthorized claims
  for (const pattern of UNAUTHORIZED_CLAIM_PATTERNS) {
    if (pattern.test(content)) {
      violations.push("Post contains unverified claims about offers or visits — confirm before posting");
    }
  }

  // Check for logo/trademark claims
  for (const pattern of LOGO_USAGE_PATTERNS) {
    if (pattern.test(content)) {
      violations.push("Post references using institutional logos — ensure permission has been granted");
    }
  }

  // Check for tagging coaches in a way that could pressure them publicly
  if (mentionsCoach && mentionsSchool) {
    // Not a hard violation, but a warning — tagging a coach AND school in the same
    // post can pressure coaches who are in a restricted contact phase.
    violations.push(
      "Post tags both a coach and their school — this can create public pressure on coaching staff during restricted periods. Consider mentioning only the school or only engaging with their content."
    );
  }

  // Run the existing constitution check patterns inline
  const constitutionPatterns = [
    { pattern: /\b(democrat|republican|liberal|conservative|trump|biden|politics|vote|election)\b/i, rule: "No politics or social controversy" },
    { pattern: /\b(hate|stupid|terrible|worst|trash|garbage|sucks)\b/i, rule: "No criticism of coaches, players, referees, or opponents" },
    { pattern: /\b(damn|hell|ass|shit|fuck|crap|wtf|stfu|lmao)\b/i, rule: "No profanity or inappropriate language" },
    { pattern: /\b(unfair|rigged|bench|playing time|should\s+have\s+started)\b/i, rule: "No complaints about playing time or coaching decisions" },
    { pattern: /\b(beer|drunk|wasted|high|vape|smoke|420)\b/i, rule: "No alcohol, drugs, or inappropriate imagery references" },
    { pattern: /\b(some people|not naming names|you know who|they know)\b/i, rule: "No sub-tweets or indirect callouts" },
  ];

  for (const { pattern, rule } of constitutionPatterns) {
    if (pattern.test(content)) {
      violations.push(`Constitution violation: ${rule}`);
    }
  }

  if (violations.length > 0) {
    return {
      allowed: false,
      reason: `Post has ${violations.length} compliance issue(s) that must be resolved before publishing.`,
      violations,
    };
  }

  return { allowed: true };
}

// ---------------------------------------------------------------------------
// getCurrentPhase
// ---------------------------------------------------------------------------

export function getCurrentPhase(classYear: number): PhaseInfo {
  const { label, yearIndex } = getAcademicYear(classYear);
  const milestones = getMilestones(classYear);
  const now = today();

  // Pull the matching timeline entry from ncaaRules
  const timeline = ncaaRules.classOf2029Timeline[yearIndex] || ncaaRules.classOf2029Timeline[0];

  // Build allowed vs restricted actions for the current phase
  const allowedActions: string[] = [];
  const restrictedActions: string[] = [];
  const deadPeriod = isInDeadPeriod();

  // Always allowed: athlete-initiated contact, posting, building profile
  allowedActions.push(
    "Post content on X/Twitter (all pillars)",
    "Athlete-initiated DMs to coaches at any division",
    "Follow coaches and school accounts",
    "Attend camps (when available)",
    "Create and update Hudl profile",
    "Unofficial visits (prospect pays own way)"
  );

  // Division-specific restrictions by year
  if (yearIndex < 2) {
    // Before junior year
    restrictedActions.push(
      "D1 FBS coaches cannot initiate calls/texts until September 1 of junior year",
      "Official visits not available until January 1 of junior year"
    );

    if (now < milestones.materialsAllowed) {
      restrictedActions.push(
        `D1 FBS programs cannot send recruiting materials until ${milestones.materialsAllowed.toLocaleDateString()}`
      );
    } else {
      allowedActions.push("D1 FBS programs may now send recruiting materials");
    }

    if (now >= milestones.d2Contact) {
      allowedActions.push("D2 coaches can contact via any electronic means");
    } else {
      restrictedActions.push(
        `D2 coaches cannot initiate electronic contact until ${milestones.d2Contact.toLocaleDateString()}`
      );
    }

    allowedActions.push("D3 coaches can communicate at any time (no recruiting calendar)");
  }

  if (yearIndex >= 2) {
    // Junior year and beyond
    allowedActions.push(
      "D1 FBS coaches can call and text",
      "D2 coaches can contact freely",
      "D3 coaches can communicate at any time"
    );

    if (now >= milestones.officialVisits) {
      allowedActions.push("Official visits available (max 5)");
    } else {
      restrictedActions.push(
        `Official visits open ${milestones.officialVisits.toLocaleDateString()}`
      );
    }
  }

  if (deadPeriod.inDeadPeriod) {
    restrictedActions.push(
      `Currently in dead period: ${deadPeriod.label} — no in-person contact allowed`
    );
    allowedActions.push(
      "During dead periods: coaches may still call, text, DM, and send mail"
    );
  }

  // Determine next milestone
  const upcomingMilestones = [
    { date: milestones.materialsAllowed, description: "FBS programs can send recruiting materials (June 15 after sophomore year)" },
    { date: milestones.d2Contact, description: "D2 coaches can initiate electronic contact (June 15 after sophomore year)" },
    { date: milestones.fbsCallTexts, description: "FBS coaches can call/text (September 1 of junior year)" },
    { date: milestones.officialVisits, description: "Official visits open (January 1 of junior year)" },
    { date: milestones.earlySigningPeriod, description: "Early Signing Period" },
    { date: milestones.nationalSigningDay, description: "National Signing Day" },
  ]
    .filter((m) => m.date > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const nextMilestone = upcomingMilestones[0] || {
    date: milestones.nationalSigningDay,
    description: "National Signing Day",
  };

  return {
    phase: timeline.phase,
    description: `${label} — ${timeline.phase}. ${timeline.actions.length} key actions for this phase.`,
    allowedActions,
    restrictedActions,
    nextMilestone: {
      date: nextMilestone.date.toISOString().split("T")[0],
      description: nextMilestone.description,
    },
  };
}

// ---------------------------------------------------------------------------
// canContactDivision
// ---------------------------------------------------------------------------

export function canContactDivision(
  division: string,
  classYear: number
): ContactabilityResult {
  const now = today();
  const milestones = getMilestones(classYear);
  const { yearIndex } = getAcademicYear(classYear);
  const normalizedDivision = normalizeDivision(division);

  const result: ContactabilityResult = {
    allowed: true, // Athlete-initiated is always allowed
    method: [],
    restrictions: [],
  };

  switch (normalizedDivision) {
    case "D1-FBS": {
      // Athlete can always reach out
      result.method.push("athlete-initiated DMs", "athlete-initiated email");

      if (now >= milestones.fbsCallTexts) {
        result.method.push("coach-initiated calls", "coach-initiated texts", "coach-initiated DMs");
      } else if (now >= milestones.materialsAllowed) {
        result.method.push("coach-sent recruiting materials (mail)");
        result.restrictions.push(
          `Coaches cannot call/text until ${milestones.fbsCallTexts.toLocaleDateString()}`
        );
      } else {
        result.restrictions.push(
          `Coaches cannot send materials until ${milestones.materialsAllowed.toLocaleDateString()}`,
          `Coaches cannot call/text until ${milestones.fbsCallTexts.toLocaleDateString()}`
        );
      }

      if (yearIndex >= 2 && now >= milestones.officialVisits) {
        result.method.push("official visits (max 5)");
      }

      result.method.push("unofficial visits (any time, prospect pays)");
      break;
    }

    case "D1-FCS": {
      result.method.push("athlete-initiated DMs", "athlete-initiated email");

      // FCS follows similar rules to FBS but some conferences are more flexible
      if (now >= milestones.materialsAllowed) {
        result.method.push("coach-initiated electronic communication", "coach-sent recruiting materials");
      } else {
        result.restrictions.push(
          `Coach-initiated contact restricted until approximately ${milestones.materialsAllowed.toLocaleDateString()}`
        );
      }

      if (now >= milestones.fbsCallTexts) {
        result.method.push("coach-initiated calls", "coach-initiated texts");
      }

      result.method.push("unofficial visits (any time, prospect pays)");
      break;
    }

    case "D2": {
      result.method.push("athlete-initiated DMs", "athlete-initiated email");

      if (now >= milestones.d2Contact) {
        result.method.push(
          "coach-initiated calls",
          "coach-initiated texts",
          "coach-initiated DMs",
          "coach-initiated email",
          "coach-sent recruiting materials"
        );
      } else {
        result.restrictions.push(
          `Coaches cannot initiate contact until ${milestones.d2Contact.toLocaleDateString()}`
        );
      }

      result.method.push("unofficial visits (any time, prospect pays)");
      break;
    }

    case "D3": {
      // D3 has no recruiting calendar restrictions on communication
      result.method.push(
        "athlete-initiated DMs",
        "coach-initiated DMs",
        "coach-initiated calls",
        "coach-initiated texts",
        "coach-initiated email",
        "unofficial visits (any time)",
        "coach-sent recruiting materials"
      );
      // D3 does not offer athletic scholarships
      result.restrictions.push(
        "D3 does not offer athletic scholarships (academic/merit aid only)"
      );
      break;
    }

    case "NAIA": {
      result.method.push(
        "athlete-initiated DMs",
        "coach-initiated DMs",
        "coach-initiated calls",
        "coach-initiated email",
        "unofficial visits"
      );
      result.restrictions.push(
        "NAIA has its own eligibility center — verify NAIA-specific rules for this school"
      );
      break;
    }

    default: {
      result.restrictions.push(`Unknown division "${division}" — verify contact rules manually`);
    }
  }

  // Dead period check (applies to all divisions for in-person contact)
  const deadPeriod = isInDeadPeriod();
  if (deadPeriod.inDeadPeriod) {
    result.restrictions.push(
      `Currently in dead period (${deadPeriod.label}) — no in-person contact. Electronic communication still allowed.`
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalize various division string formats to the canonical form. */
function normalizeDivision(division: string): Division {
  const d = division.toUpperCase().replace(/\s+/g, "").replace(/_/g, "-");
  if (d.includes("FBS") || d === "D1FBS" || d === "D1-FBS") return "D1-FBS";
  if (d.includes("FCS") || d === "D1FCS" || d === "D1-FCS") return "D1-FCS";
  if (d === "D2" || d === "DII" || d === "DIVISIONII") return "D2";
  if (d === "D3" || d === "DIII" || d === "DIVISIONIII") return "D3";
  if (d === "NAIA") return "NAIA";

  // Handle "D1 FBS" and "D1 FCS" formats (with original spaces)
  const lower = division.toLowerCase().trim();
  if (lower === "d1 fbs") return "D1-FBS";
  if (lower === "d1 fcs") return "D1-FCS";

  return division as Division;
}
