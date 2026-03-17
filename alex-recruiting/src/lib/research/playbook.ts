import type { CoachPersona, ABVariantSpec } from "./personas";

/**
 * The 6 key questions the Coach Decision Playbook answers.
 * These drive all downstream site content and layout decisions.
 */
export const PLAYBOOK_QUESTIONS: string[] = [
  "What are the top 5 things a coach evaluates in the first 15 seconds?",
  "What makes a coach stop scrolling and actually watch film?",
  "What social proof actually matters to coaches?",
  "What framing creates urgency without feeling desperate?",
  "What are the 'no-brainer' triggers that make a coach think 'I can't afford to miss this kid'?",
  "What kills coach interest instantly?",
];

/**
 * 4 coach personas representing distinct evaluation styles.
 * Each persona drives different content, layout, and A/B testing decisions.
 */
export const COACH_PERSONAS: CoachPersona[] = [
  {
    id: "skeptic",
    name: "The Skeptic",
    description:
      "Needs hard data, doesn't trust marketing. Wants measurables, verified stats.",
    evaluationPriority: ["measurables", "verified-stats", "film-quality"],
    decisionSpeed: "slow",
  },
  {
    id: "data-nerd",
    name: "The Data Nerd",
    description:
      "Loves analytics. Wants advanced metrics, comparison data, projections.",
    evaluationPriority: ["analytics", "comparisons", "projections"],
    decisionSpeed: "medium",
  },
  {
    id: "gut-feel",
    name: "The Gut-Feel Coach",
    description:
      "Goes by film and narrative. Wants to see the athlete's character and work ethic.",
    evaluationPriority: ["film", "narrative", "character"],
    decisionSpeed: "fast",
  },
  {
    id: "time-pressed",
    name: "The Time-Pressed Coordinator",
    description:
      "Has 200 profiles to review. Needs to evaluate in 30 seconds.",
    evaluationPriority: ["quick-stats", "position-fit", "school-tier"],
    decisionSpeed: "instant",
  },
];

/**
 * A/B test variant specifications for the 4 key site sections.
 * Each spec defines the two variants and the hypothesis being tested.
 */
export const AB_VARIANT_SPECS: ABVariantSpec[] = [
  {
    section: "hero",
    experimentName: "hero-copy",
    variantA: "stats-forward",
    variantB: "narrative-forward",
    hypothesis:
      "Data-driven coaches respond to stats; gut-feel coaches respond to narrative",
  },
  {
    section: "social-proof",
    experimentName: "social-proof-type",
    variantA: "school-ticker",
    variantB: "coach-endorsements",
    hypothesis:
      "Coach endorsements carry more weight than school interest counts",
  },
  {
    section: "film",
    experimentName: "film-presentation",
    variantA: "embedded-autoplay",
    variantB: "thumbnail-click",
    hypothesis:
      "Autoplay captures attention; click-to-play signals intent",
  },
  {
    section: "contact",
    experimentName: "cta-framing",
    variantA: "loss-frame",
    variantB: "gain-frame",
    hypothesis:
      "Loss framing creates more urgency for coach action",
  },
];

/**
 * Builds the full prompt for Coach Decision Playbook generation.
 * This prompt is designed to be sent to Susan's agents (freya, flow,
 * recruiting-strategy-studio) for research synthesis.
 */
export function buildPlaybookPrompt(): string {
  const personaDescriptions = COACH_PERSONAS.map(
    (p) =>
      `- ${p.name} (${p.id}): ${p.description} | Priorities: ${p.evaluationPriority.join(", ")} | Decision speed: ${p.decisionSpeed}`
  ).join("\n");

  const questionsBlock = PLAYBOOK_QUESTIONS.map(
    (q, i) => `${i + 1}. ${q}`
  ).join("\n");

  const variantsBlock = AB_VARIANT_SPECS.map(
    (v) =>
      `- ${v.section} (${v.experimentName}): ${v.variantA} vs ${v.variantB} — Hypothesis: ${v.hypothesis}`
  ).join("\n");

  return `You are analyzing research on college football recruiting to produce a Coach Decision Playbook.

## Context

This playbook will drive all content, layout, and A/B testing decisions for a recruit's profile site. The goal is to understand exactly how college coaches evaluate recruits so we can optimize every pixel of the site for coach conversion.

## Coach Personas

The following 4 coach personas represent distinct evaluation styles. Your recommendations should account for how each persona type would respond differently:

${personaDescriptions}

## Key Questions

Answer each of these 6 questions with specific, actionable recommendations. Where applicable, tailor recommendations per coach persona:

${questionsBlock}

## A/B Testing Context

The following experiments are planned. Factor these into your recommendations where relevant:

${variantsBlock}

## Output Requirements

For each question:
1. Provide specific, actionable recommendations (not generic advice)
2. Where applicable, break down how each coach persona would respond differently
3. Reference specific research findings that support your recommendations
4. Identify any conflicts between persona preferences and recommend how to resolve them
5. Suggest which A/B variants would best serve each persona type`;
}
