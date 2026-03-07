// Email Templates — Complete email templates for coach outreach
// Parallel to DM templates but leveraging email's longer format
// Uses Jacob's verified profile data from jacob-profile.ts

import { jacobProfile } from "@/lib/data/jacob-profile";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EmailTemplateType =
  | "initial_introduction"
  | "film_update"
  | "camp_followup"
  | "academic_update"
  | "season_recap";

export interface EmailTemplate {
  id: string;
  type: EmailTemplateType;
  name: string;
  description: string;
  subject: string;
  body: string;
  signature: string;
  attachments: string[];
  mergeFields: string[];
}

// ---------------------------------------------------------------------------
// Merge field reference:
//   {coachName}    — Coach's last name (e.g., "Smith")
//   {schoolName}   — School name (e.g., "University of Wisconsin")
//   {position}     — Jacob's position (DT/OG)
//   {measurables}  — Height/weight string
//   {hudlLink}     — Hudl profile URL
//   {ncsaLink}     — NCSA profile URL
//   {gpa}          — Current GPA
//   {classYear}    — Graduation year
//   {highSchool}   — High school name
//   {campName}     — Camp name (for camp_followup)
//   {campDetail}   — Specific camp experience detail
//   {newFilmTitle} — Title of new highlight reel
//   {seasonRecord} — Team record for the season
//   {seasonStats}  — Key stats for the season
// ---------------------------------------------------------------------------

const STANDARD_SIGNATURE = `Jacob Rodgers
${jacobProfile.positionFull} | ${jacobProfile.height} ${jacobProfile.weight}
Class of ${jacobProfile.classYear} | ${jacobProfile.school}
${jacobProfile.xHandle}
${jacobProfile.hudlUrl ? `Hudl: ${jacobProfile.hudlUrl}` : ""}
${jacobProfile.ncsaProfileUrl ? `NCSA: ${jacobProfile.ncsaProfileUrl}` : ""}`.trim();

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  // ─── 1. INITIAL INTRODUCTION ─────────────────────────────────────────────
  {
    id: "email-init-001",
    type: "initial_introduction",
    name: "Initial Introduction",
    description:
      "Professional first-contact email. Includes measurables, Hudl link, NCSA profile, and specific interest in the program. Designed to make a strong first impression.",
    subject: "Class of 2029 OL — Jacob Rodgers, Pewaukee HS (WI) | Introduction",
    body: `Coach {coachName},

My name is Jacob Rodgers and I am a Class of ${jacobProfile.classYear} offensive and defensive lineman at ${jacobProfile.school} in ${jacobProfile.city}, ${jacobProfile.state}.

I am writing to introduce myself and express my genuine interest in {schoolName}'s football program. I have been following your program closely and I am impressed by the way you develop offensive linemen.

Here is a quick snapshot of my profile:

- Position: ${jacobProfile.positionFull}
- Measurables: ${jacobProfile.height}, ${jacobProfile.weight}
- GPA: ${jacobProfile.gpa}
- Freshman Stats (12-1, State Champions): 11 pancake blocks, 3 sacks, 1 fumble recovery
- Bench: ${jacobProfile.bench} lbs | Squat: ${jacobProfile.squat} lbs

I played both sides of the ball as a freshman starter on a team that went 12-1 and won a State Championship.

I would love to learn more about {schoolName}'s program, your evaluation process, and what you look for in offensive linemen.

My Hudl profile: {hudlLink}
My NCSA profile: {ncsaLink}

Thank you for your time, Coach {coachName}. I look forward to hearing from you.`,
    signature: STANDARD_SIGNATURE,
    attachments: ["hudl_profile_link", "ncsa_profile_link"],
    mergeFields: ["coachName", "schoolName", "hudlLink", "ncsaLink"],
  },

  // ─── 2. FILM UPDATE ──────────────────────────────────────────────────────
  {
    id: "email-film-001",
    type: "film_update",
    name: "Film Update",
    description:
      "Share a new highlight reel or game film update. References specific improvements and invites the coach to review updated footage.",
    subject: "Updated Film — Jacob Rodgers, Class of 2029 OL | {newFilmTitle}",
    body: `Coach {coachName},

I wanted to share my latest highlight reel with you. I have been putting in significant work this offseason and I believe my film reflects the improvements I have made.

New Film: {newFilmTitle}
Watch here: {hudlLink}

Key improvements you will see in this film:
- Improved hand placement and punch timing at the point of attack
- Better lateral movement and pass protection technique
- Stronger anchor against bull rush — bench is now ${jacobProfile.bench} lbs, squat at ${jacobProfile.squat} lbs

I am currently ${jacobProfile.height}, ${jacobProfile.weight} and continuing to develop both my technique and physical profile.

I remain very interested in {schoolName}'s program and would welcome any feedback you have on my film.

Thank you for your time.`,
    signature: STANDARD_SIGNATURE,
    attachments: ["hudl_profile_link", "highlight_reel"],
    mergeFields: ["coachName", "schoolName", "hudlLink", "newFilmTitle"],
  },

  // ─── 3. CAMP FOLLOW-UP ───────────────────────────────────────────────────
  {
    id: "email-camp-001",
    type: "camp_followup",
    name: "Camp Follow-Up",
    description:
      "Thank a coach for a camp experience. References something specific from the camp to show genuine engagement and recall.",
    subject: "Thank You — {campName} | Jacob Rodgers, Class of 2029 OL",
    body: `Coach {coachName},

Thank you for the opportunity to compete at {campName}. It was an outstanding experience and I learned a great deal.

{campDetail}

Competing against that level of talent reinforced my commitment to developing my game. I took away several coaching points that I am already incorporating into my training:

- The emphasis on pad level and leverage in one-on-one drills
- Footwork techniques for pulling and trap blocking
- The importance of finishing every rep through the whistle

I am more excited than ever about the possibility of playing at {schoolName}. I would love to stay in touch and continue to demonstrate my development.

My updated Hudl profile: {hudlLink}
My NCSA profile: {ncsaLink}

Thank you again for your time and coaching at {campName}.`,
    signature: STANDARD_SIGNATURE,
    attachments: ["hudl_profile_link", "ncsa_profile_link"],
    mergeFields: [
      "coachName",
      "schoolName",
      "hudlLink",
      "ncsaLink",
      "campName",
      "campDetail",
    ],
  },

  // ─── 4. ACADEMIC UPDATE ──────────────────────────────────────────────────
  {
    id: "email-acad-001",
    type: "academic_update",
    name: "Academic Update",
    description:
      "Share GPA updates, honor roll status, and test scores. Demonstrates the student-athlete balance coaches value.",
    subject: "Academic Update — Jacob Rodgers, Class of 2029 OL | {gpa} GPA",
    body: `Coach {coachName},

I wanted to share a quick academic update with you. I know that {schoolName} values student-athletes who perform in the classroom, and I want you to know that academics are a top priority for me.

Current Academic Profile:
- Cumulative GPA: {gpa}
- ${jacobProfile.school}, ${jacobProfile.city}, ${jacobProfile.state}
- Class of ${jacobProfile.classYear}

I am committed to maintaining strong grades and I am on track to meet all NCAA eligibility requirements well ahead of schedule.

On the field, I continue to develop as a two-way lineman. My current measurables are ${jacobProfile.height}, ${jacobProfile.weight} with strength numbers of ${jacobProfile.bench} bench and ${jacobProfile.squat} squat.

I remain very interested in {schoolName} and would welcome the opportunity to discuss how I might fit into your program both academically and athletically.

My Hudl profile: {hudlLink}
My NCSA profile: {ncsaLink}

Thank you for your time.`,
    signature: STANDARD_SIGNATURE,
    attachments: ["hudl_profile_link", "ncsa_profile_link", "unofficial_transcript"],
    mergeFields: ["coachName", "schoolName", "hudlLink", "ncsaLink", "gpa"],
  },

  // ─── 5. SEASON RECAP ─────────────────────────────────────────────────────
  {
    id: "email-recap-001",
    type: "season_recap",
    name: "Season Recap",
    description:
      "End-of-season summary with stats, team accomplishments, and link to updated highlight reel. Shows growth arc over the season.",
    subject:
      "Season Recap — Jacob Rodgers, Class of 2029 OL | {seasonRecord}",
    body: `Coach {coachName},

I wanted to reach out at the end of our season to share a recap with you.

Season Results: {seasonRecord}
{seasonStats}

This season was a tremendous learning experience. Playing both offensive guard and defensive tackle as a starter gave me the chance to develop my game on both sides of the ball.

Updated Measurables:
- ${jacobProfile.height}, ${jacobProfile.weight}
- Bench: ${jacobProfile.bench} lbs | Squat: ${jacobProfile.squat} lbs

Season Highlights (updated film): {hudlLink}

I am now focusing on my offseason training program with the goal of continuing to improve my technique, strength, and football IQ heading into next year.

I remain very interested in {schoolName} and would love to learn more about your program and how I might fit in. I am planning to attend camps this summer and would welcome the opportunity to compete at yours if you host one.

My NCSA profile: {ncsaLink}

Thank you for your time, Coach {coachName}. I look forward to staying in touch.`,
    signature: STANDARD_SIGNATURE,
    attachments: [
      "hudl_profile_link",
      "ncsa_profile_link",
      "season_stats_pdf",
      "highlight_reel",
    ],
    mergeFields: [
      "coachName",
      "schoolName",
      "hudlLink",
      "ncsaLink",
      "seasonRecord",
      "seasonStats",
    ],
  },
];

// ---------------------------------------------------------------------------
// Template helpers
// ---------------------------------------------------------------------------

/**
 * Get a template by type
 */
export function getTemplateByType(
  type: EmailTemplateType
): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find((t) => t.type === type);
}

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get all templates
 */
export function getAllTemplates(): EmailTemplate[] {
  return [...EMAIL_TEMPLATES];
}

/**
 * Fill merge fields in a template string
 */
export function fillMergeFields(
  text: string,
  vars: Record<string, string>
): string {
  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}

/**
 * Build a complete email from a template with merge fields filled in
 */
export function buildEmailFromTemplate(
  type: EmailTemplateType,
  vars: Record<string, string>
): { subject: string; body: string; signature: string } | null {
  const template = getTemplateByType(type);
  if (!template) return null;

  return {
    subject: fillMergeFields(template.subject, vars),
    body: fillMergeFields(template.body, vars),
    signature: template.signature,
  };
}
