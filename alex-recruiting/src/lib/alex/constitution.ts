import { constitutionRules } from "../data/constitution";

// Client-side quick check for obvious constitution violations
const VIOLATION_PATTERNS = [
  // Politics
  /\b(democrat|republican|liberal|conservative|trump|biden|politics|vote|election)\b/i,
  // Criticism
  /\b(hate|stupid|terrible|worst|trash|garbage|sucks)\b/i,
  // Profanity (common patterns)
  /\b(damn|hell|ass|shit|fuck|crap|wtf|stfu|lmao)\b/i,
  // Complaints
  /\b(unfair|rigged|bench|playing time|should\s+have\s+started)\b/i,
  // Substances
  /\b(beer|drunk|wasted|high|vape|smoke|420)\b/i,
  // Sub-tweets
  /\b(some people|not naming names|you know who|they know)\b/i,
];

export interface ConstitutionCheck {
  compliant: boolean;
  violations: string[];
  warnings: string[];
}

export function quickConstitutionCheck(content: string): ConstitutionCheck {
  const violations: string[] = [];
  const warnings: string[] = [];

  for (const pattern of VIOLATION_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      violations.push(`Potential violation detected: "${match[0]}" — Review against posting constitution`);
    }
  }

  // Check for excessive caps (yelling)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.5 && content.length > 10) {
    warnings.push("Excessive caps lock — may appear aggressive or unprofessional");
  }

  // Check for too many exclamation marks
  if ((content.match(/!/g) || []).length > 3) {
    warnings.push("Multiple exclamation marks — consider a more measured tone");
  }

  // Check for missing hashtags
  if (!content.includes("#")) {
    warnings.push("No hashtags — consider adding 3-5 relevant recruiting hashtags");
  }

  return {
    compliant: violations.length === 0,
    violations,
    warnings,
  };
}

export function getConstitutionRules(): string[] {
  return [...constitutionRules];
}
