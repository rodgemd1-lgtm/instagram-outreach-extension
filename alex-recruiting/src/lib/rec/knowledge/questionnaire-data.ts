/**
 * Questionnaire Auto-Fill System
 *
 * Pre-filled data for standard college recruiting questionnaire fields.
 * When programs send questionnaires (FBS starting June 15, 2027 for Class of 2029),
 * Jacob needs to respond INSTANTLY. This module provides all standard fields
 * pre-filled and ready to submit.
 *
 * Sensitive fields (SSN, NCAA Eligibility Center ID) are marked as placeholders
 * requiring family input before submission.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuestionnaireField {
  category: string;
  fieldName: string;
  value: string;
  isPlaceholder: boolean; // true = requires manual entry / family confirmation
  notes?: string;
}

export interface QuestionnaireData {
  personal: QuestionnaireField[];
  academic: QuestionnaireField[];
  athletic: QuestionnaireField[];
  measurables: QuestionnaireField[];
  film: QuestionnaireField[];
  references: QuestionnaireField[];
  family: QuestionnaireField[];
  interests: QuestionnaireField[];
}

export interface FieldMapping {
  /** Common questionnaire field label -> our field key */
  [commonLabel: string]: string;
}

export interface QuestionnaireResponse {
  schoolName: string;
  generatedAt: string;
  data: QuestionnaireData;
  completionRate: number;
  placeholderFields: string[];
  readyToSubmit: boolean;
}

// ─── Pre-filled Data ──────────────────────────────────────────────────────────

const personalFields: QuestionnaireField[] = [
  { category: "personal", fieldName: "firstName", value: "Jacob", isPlaceholder: false },
  { category: "personal", fieldName: "lastName", value: "Rodgers", isPlaceholder: false },
  { category: "personal", fieldName: "preferredName", value: "Jacob", isPlaceholder: false },
  { category: "personal", fieldName: "dateOfBirth", value: "CONTACT FAMILY", isPlaceholder: true, notes: "Exact DOB — requires family confirmation" },
  { category: "personal", fieldName: "ssn", value: "CONTACT FAMILY", isPlaceholder: true, notes: "SSN — never stored digitally. Contact Mike or Susan Rodgers." },
  { category: "personal", fieldName: "address", value: "Pewaukee, WI", isPlaceholder: false },
  { category: "personal", fieldName: "city", value: "Pewaukee", isPlaceholder: false },
  { category: "personal", fieldName: "state", value: "Wisconsin", isPlaceholder: false },
  { category: "personal", fieldName: "zipCode", value: "53072", isPlaceholder: false },
  { category: "personal", fieldName: "phoneNumber", value: "CONTACT FAMILY", isPlaceholder: true, notes: "Jacob's cell — requires family confirmation" },
  { category: "personal", fieldName: "email", value: "CONTACT FAMILY", isPlaceholder: true, notes: "Recruiting email — requires family confirmation" },
  { category: "personal", fieldName: "citizenship", value: "United States", isPlaceholder: false },
];

const academicFields: QuestionnaireField[] = [
  { category: "academic", fieldName: "highSchool", value: "Pewaukee High School", isPlaceholder: false },
  { category: "academic", fieldName: "highSchoolCity", value: "Pewaukee", isPlaceholder: false },
  { category: "academic", fieldName: "highSchoolState", value: "Wisconsin", isPlaceholder: false },
  { category: "academic", fieldName: "highSchoolCeebCode", value: "CONTACT SCHOOL", isPlaceholder: true, notes: "CEEB/ACT code for Pewaukee HS" },
  { category: "academic", fieldName: "classYear", value: "2029", isPlaceholder: false },
  { category: "academic", fieldName: "expectedGraduation", value: "June 2029", isPlaceholder: false },
  { category: "academic", fieldName: "gpa", value: "3.25", isPlaceholder: false },
  { category: "academic", fieldName: "gpaScale", value: "4.0", isPlaceholder: false },
  { category: "academic", fieldName: "classRank", value: "CONTACT SCHOOL", isPlaceholder: true, notes: "Check with guidance counselor for current rank" },
  { category: "academic", fieldName: "classSize", value: "CONTACT SCHOOL", isPlaceholder: true, notes: "Pewaukee HS class size" },
  { category: "academic", fieldName: "satScore", value: "NOT YET TAKEN", isPlaceholder: true, notes: "Plan to take spring of junior year" },
  { category: "academic", fieldName: "actScore", value: "NOT YET TAKEN", isPlaceholder: true, notes: "Plan to take spring of junior year" },
  { category: "academic", fieldName: "ncaaEligibilityCenterId", value: "PENDING REGISTRATION", isPlaceholder: true, notes: "NCAA Eligibility Center ID — register at eligibilitycenter.org" },
  { category: "academic", fieldName: "coreCourses", value: "On track for 16 NCAA core courses", isPlaceholder: false },
  { category: "academic", fieldName: "plannedCourses", value: "College prep curriculum including honors courses in math and science", isPlaceholder: false },
  { category: "academic", fieldName: "intendedMajor", value: "Undecided — interested in Business, Kinesiology, or Engineering", isPlaceholder: false },
];

const athleticFields: QuestionnaireField[] = [
  { category: "athletic", fieldName: "primaryPosition", value: "Defensive Tackle / Offensive Guard", isPlaceholder: false },
  { category: "athletic", fieldName: "secondaryPosition", value: "OG / DT", isPlaceholder: false },
  { category: "athletic", fieldName: "height", value: "6'4\"", isPlaceholder: false },
  { category: "athletic", fieldName: "weight", value: "285", isPlaceholder: false },
  { category: "athletic", fieldName: "jerseyNumber", value: "79", isPlaceholder: false },
  { category: "athletic", fieldName: "dominantHand", value: "Right", isPlaceholder: false },
  { category: "athletic", fieldName: "varsityLetters", value: "Varsity since freshman year", isPlaceholder: false },
  { category: "athletic", fieldName: "varsitySeasons", value: "1 (as of freshman year, Class of 2029)", isPlaceholder: false },
  { category: "athletic", fieldName: "startingSince", value: "Freshman year (2025-26)", isPlaceholder: false },
  { category: "athletic", fieldName: "teamName", value: "Pewaukee Pirates", isPlaceholder: false },
  { category: "athletic", fieldName: "headCoach", value: "CONTACT FAMILY", isPlaceholder: true, notes: "Pewaukee HS head coach name" },
  { category: "athletic", fieldName: "otherSports", value: "Wrestling, Track & Field (throwing events)", isPlaceholder: false, notes: "Multi-sport athlete — shows athleticism" },
  { category: "athletic", fieldName: "honors", value: "Varsity starter as a freshman", isPlaceholder: false },
];

const measurablesFields: QuestionnaireField[] = [
  { category: "measurables", fieldName: "fortyYardDash", value: "PULL FROM MEASURABLES SYSTEM", isPlaceholder: true, notes: "Best verified 40-yard dash time" },
  { category: "measurables", fieldName: "proShuttle", value: "PULL FROM MEASURABLES SYSTEM", isPlaceholder: true, notes: "Best verified 5-10-5 shuttle time" },
  { category: "measurables", fieldName: "benchPress", value: "PULL FROM MEASURABLES SYSTEM", isPlaceholder: true, notes: "Bench press max (lbs)" },
  { category: "measurables", fieldName: "squat", value: "PULL FROM MEASURABLES SYSTEM", isPlaceholder: true, notes: "Back squat max (lbs)" },
  { category: "measurables", fieldName: "powerClean", value: "PULL FROM MEASURABLES SYSTEM", isPlaceholder: true, notes: "Power clean max (lbs)" },
  { category: "measurables", fieldName: "broadJump", value: "PULL FROM MEASURABLES SYSTEM", isPlaceholder: true, notes: "Best broad jump (inches)" },
  { category: "measurables", fieldName: "verticalJump", value: "PULL FROM MEASURABLES SYSTEM", isPlaceholder: true, notes: "Best vertical jump (inches)" },
  { category: "measurables", fieldName: "wingspan", value: "PULL FROM MEASURABLES SYSTEM", isPlaceholder: true, notes: "Wingspan measurement" },
  { category: "measurables", fieldName: "handSize", value: "PULL FROM MEASURABLES SYSTEM", isPlaceholder: true, notes: "Hand size measurement" },
];

const filmFields: QuestionnaireField[] = [
  { category: "film", fieldName: "hudlProfileUrl", value: "https://www.hudl.com/profile/jacob-rodgers", isPlaceholder: true, notes: "Update with actual Hudl profile URL" },
  { category: "film", fieldName: "highlightReelUrl", value: "HUDL HIGHLIGHT REEL", isPlaceholder: true, notes: "Link to primary highlight reel on Hudl" },
  { category: "film", fieldName: "fullGameFilm", value: "Available on Hudl", isPlaceholder: false },
  { category: "film", fieldName: "filmSeasons", value: "Freshman (2025-26)", isPlaceholder: false },
  { category: "film", fieldName: "totalPlaysCounted", value: "PULL FROM HUDL", isPlaceholder: true, notes: "Total plays tagged on Hudl" },
  { category: "film", fieldName: "xHandle", value: "@jacobrodgers79", isPlaceholder: true, notes: "Confirm X/Twitter recruiting handle" },
];

const referenceFields: QuestionnaireField[] = [
  { category: "references", fieldName: "headCoachName", value: "CONTACT FAMILY", isPlaceholder: true, notes: "Pewaukee HS head football coach" },
  { category: "references", fieldName: "headCoachPhone", value: "CONTACT FAMILY", isPlaceholder: true },
  { category: "references", fieldName: "headCoachEmail", value: "CONTACT FAMILY", isPlaceholder: true },
  { category: "references", fieldName: "positionCoachName", value: "CONTACT FAMILY", isPlaceholder: true, notes: "Pewaukee HS OL/DL coach" },
  { category: "references", fieldName: "positionCoachPhone", value: "CONTACT FAMILY", isPlaceholder: true },
  { category: "references", fieldName: "positionCoachEmail", value: "CONTACT FAMILY", isPlaceholder: true },
  { category: "references", fieldName: "guidanceCounselor", value: "CONTACT SCHOOL", isPlaceholder: true, notes: "Pewaukee HS guidance counselor" },
  { category: "references", fieldName: "guidanceCounselorPhone", value: "CONTACT SCHOOL", isPlaceholder: true },
  { category: "references", fieldName: "guidanceCounselorEmail", value: "CONTACT SCHOOL", isPlaceholder: true },
];

const familyFields: QuestionnaireField[] = [
  { category: "family", fieldName: "parentGuardian1Name", value: "CONTACT FAMILY", isPlaceholder: true, notes: "Parent/guardian #1 full name" },
  { category: "family", fieldName: "parentGuardian1Phone", value: "CONTACT FAMILY", isPlaceholder: true },
  { category: "family", fieldName: "parentGuardian1Email", value: "CONTACT FAMILY", isPlaceholder: true },
  { category: "family", fieldName: "parentGuardian1Relationship", value: "CONTACT FAMILY", isPlaceholder: true },
  { category: "family", fieldName: "parentGuardian2Name", value: "CONTACT FAMILY", isPlaceholder: true, notes: "Parent/guardian #2 full name" },
  { category: "family", fieldName: "parentGuardian2Phone", value: "CONTACT FAMILY", isPlaceholder: true },
  { category: "family", fieldName: "parentGuardian2Email", value: "CONTACT FAMILY", isPlaceholder: true },
  { category: "family", fieldName: "parentGuardian2Relationship", value: "CONTACT FAMILY", isPlaceholder: true },
];

const interestFields: QuestionnaireField[] = [
  { category: "interests", fieldName: "whatLookingFor", value: "Competitive program with strong OL development tradition, quality education, and a coaching staff that invests in player growth both on and off the field.", isPlaceholder: false },
  { category: "interests", fieldName: "programPriorities", value: "1) OL development track record and NFL pipeline, 2) Academic quality and support, 3) Team culture and coaching stability, 4) Strength & conditioning program, 5) Geographic proximity to family", isPlaceholder: false },
  { category: "interests", fieldName: "academicInterests", value: "Business, Kinesiology, or Engineering — values programs with strong academic support for student-athletes", isPlaceholder: false },
  { category: "interests", fieldName: "campAttendance", value: "Planning to attend regional camps and prospect days at target schools", isPlaceholder: false },
  { category: "interests", fieldName: "visitInterest", value: "Interested in both unofficial and official visits to programs that prioritize OL development", isPlaceholder: false },
  { category: "interests", fieldName: "recruitingTimeline", value: "Class of 2029 — currently a freshman building foundation. Focused on development and exposure through sophomore and junior years.", isPlaceholder: false },
  { category: "interests", fieldName: "otherSchoolsOfInterest", value: "STRATEGIC — do not share full list", isPlaceholder: true, notes: "Marcus recommends being strategic about which schools you share. Never reveal full target list." },
];

// ─── Field Mapping ────────────────────────────────────────────────────────────

/**
 * Maps common questionnaire field labels (as they appear on college forms)
 * to our internal field keys. This allows auto-matching when parsing
 * questionnaire PDFs or web forms.
 */
const fieldMapping: FieldMapping = {
  // Personal
  "first name": "firstName",
  "last name": "lastName",
  "preferred name": "preferredName",
  "date of birth": "dateOfBirth",
  "dob": "dateOfBirth",
  "birthday": "dateOfBirth",
  "social security": "ssn",
  "ssn": "ssn",
  "street address": "address",
  "city": "city",
  "state": "state",
  "zip": "zipCode",
  "zip code": "zipCode",
  "phone": "phoneNumber",
  "cell phone": "phoneNumber",
  "mobile": "phoneNumber",
  "email": "email",
  "email address": "email",

  // Academic
  "high school": "highSchool",
  "school name": "highSchool",
  "graduation year": "classYear",
  "grad year": "classYear",
  "class of": "classYear",
  "expected graduation": "expectedGraduation",
  "gpa": "gpa",
  "grade point average": "gpa",
  "cumulative gpa": "gpa",
  "class rank": "classRank",
  "class size": "classSize",
  "sat": "satScore",
  "sat score": "satScore",
  "act": "actScore",
  "act score": "actScore",
  "ncaa id": "ncaaEligibilityCenterId",
  "eligibility center": "ncaaEligibilityCenterId",
  "ncaa eligibility": "ncaaEligibilityCenterId",
  "core courses": "coreCourses",
  "intended major": "intendedMajor",
  "major": "intendedMajor",

  // Athletic
  "position": "primaryPosition",
  "primary position": "primaryPosition",
  "secondary position": "secondaryPosition",
  "height": "height",
  "weight": "weight",
  "jersey number": "jerseyNumber",
  "number": "jerseyNumber",
  "dominant hand": "dominantHand",
  "team": "teamName",
  "head coach": "headCoachName",

  // Measurables
  "40 yard dash": "fortyYardDash",
  "40 time": "fortyYardDash",
  "40-yard": "fortyYardDash",
  "shuttle": "proShuttle",
  "5-10-5": "proShuttle",
  "pro shuttle": "proShuttle",
  "bench press": "benchPress",
  "bench": "benchPress",
  "squat": "squat",
  "back squat": "squat",
  "power clean": "powerClean",
  "clean": "powerClean",
  "broad jump": "broadJump",
  "vertical": "verticalJump",
  "vertical jump": "verticalJump",

  // Film
  "hudl": "hudlProfileUrl",
  "hudl profile": "hudlProfileUrl",
  "highlight reel": "highlightReelUrl",
  "highlight film": "highlightReelUrl",
  "game film": "fullGameFilm",
  "twitter": "xHandle",
  "x handle": "xHandle",
  "social media": "xHandle",

  // Family
  "parent name": "parentGuardian1Name",
  "parent phone": "parentGuardian1Phone",
  "parent email": "parentGuardian1Email",
  "guardian name": "parentGuardian1Name",
  "mother name": "parentGuardian1Name",
  "father name": "parentGuardian2Name",
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get all pre-filled questionnaire data organized by category.
 */
export function getQuestionnaireData(): QuestionnaireData {
  return {
    personal: personalFields,
    academic: academicFields,
    athletic: athleticFields,
    measurables: measurablesFields,
    film: filmFields,
    references: referenceFields,
    family: familyFields,
    interests: interestFields,
  };
}

/**
 * Get the field mapping dictionary for auto-matching form labels
 * to our internal field keys.
 */
export function getFieldMapping(): FieldMapping {
  return { ...fieldMapping };
}

/**
 * Generate a complete questionnaire response tailored for a specific school.
 * Includes all fields, flags placeholders, and calculates completion rate.
 */
export function generateQuestionnaireResponse(schoolName: string): QuestionnaireResponse {
  const data = getQuestionnaireData();

  // Collect all fields across categories to calculate completion
  const allFields: QuestionnaireField[] = [
    ...data.personal,
    ...data.academic,
    ...data.athletic,
    ...data.measurables,
    ...data.film,
    ...data.references,
    ...data.family,
    ...data.interests,
  ];

  const totalFields = allFields.length;
  const placeholderFields = allFields
    .filter((f) => f.isPlaceholder)
    .map((f) => f.fieldName);
  const completedFields = totalFields - placeholderFields.length;
  const completionRate = Math.round((completedFields / totalFields) * 100);

  return {
    schoolName,
    generatedAt: new Date().toISOString(),
    data,
    completionRate,
    placeholderFields,
    readyToSubmit: placeholderFields.length === 0,
  };
}

/**
 * Look up the internal field key for a common questionnaire label.
 * Case-insensitive matching.
 */
export function resolveFieldLabel(label: string): string | null {
  const normalized = label.toLowerCase().trim();
  return fieldMapping[normalized] ?? null;
}

/**
 * Get a flat list of all fields for easy iteration.
 */
export function getAllFieldsFlat(): QuestionnaireField[] {
  const data = getQuestionnaireData();
  return [
    ...data.personal,
    ...data.academic,
    ...data.athletic,
    ...data.measurables,
    ...data.film,
    ...data.references,
    ...data.family,
    ...data.interests,
  ];
}

/**
 * Knowledge context injection for the REC team personas.
 */
export function getKnowledgeContext(): string {
  const data = getQuestionnaireData();
  const allFields = getAllFieldsFlat();
  const placeholders = allFields.filter((f) => f.isPlaceholder);
  const completed = allFields.filter((f) => !f.isPlaceholder);

  const lines: string[] = [];

  lines.push("=== QUESTIONNAIRE AUTO-FILL SYSTEM ===\n");
  lines.push(`Total fields pre-loaded: ${allFields.length}`);
  lines.push(`Fields ready: ${completed.length}`);
  lines.push(`Fields requiring family input: ${placeholders.length}`);
  lines.push(`Completion rate: ${Math.round((completed.length / allFields.length) * 100)}%\n`);

  lines.push("READY FIELDS BY CATEGORY:");
  const categories = ["personal", "academic", "athletic", "measurables", "film", "references", "family", "interests"] as const;
  for (const cat of categories) {
    const catFields = data[cat];
    const catReady = catFields.filter((f) => !f.isPlaceholder).length;
    lines.push(`  ${cat}: ${catReady}/${catFields.length} ready`);
  }

  lines.push("\nPLACEHOLDER FIELDS (require manual input before submission):");
  for (const field of placeholders) {
    lines.push(`  - ${field.fieldName}: ${field.notes ?? field.value}`);
  }

  lines.push("\nKEY DATES:");
  lines.push("  - June 15, 2027: FBS programs can send recruiting materials to Class of 2029");
  lines.push("  - Questionnaires must be returned SAME DAY for maximum impact");
  lines.push("  - Auto-fill system allows < 5 minute turnaround on standard questionnaires");

  return lines.join("\n");
}
