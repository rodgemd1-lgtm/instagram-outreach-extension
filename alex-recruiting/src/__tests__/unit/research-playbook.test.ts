import { describe, it, expect } from "vitest";
import {
  PLAYBOOK_QUESTIONS,
  COACH_PERSONAS,
  AB_VARIANT_SPECS,
  buildPlaybookPrompt,
} from "@/lib/research/playbook";

describe("coach decision playbook", () => {
  it("defines all 6 playbook questions", () => {
    expect(PLAYBOOK_QUESTIONS).toHaveLength(6);
    expect(PLAYBOOK_QUESTIONS[0]).toContain("15 seconds");
  });

  it("defines 4 coach personas", () => {
    expect(COACH_PERSONAS).toHaveLength(4);
    expect(COACH_PERSONAS.map(p => p.id)).toContain("skeptic");
    expect(COACH_PERSONAS.map(p => p.id)).toContain("data-nerd");
    expect(COACH_PERSONAS.map(p => p.id)).toContain("gut-feel");
    expect(COACH_PERSONAS.map(p => p.id)).toContain("time-pressed");
  });

  it("defines A/B variant specs for 4 sections", () => {
    expect(AB_VARIANT_SPECS).toHaveLength(4);
    expect(AB_VARIANT_SPECS.every(v => v.variantA && v.variantB)).toBe(true);
  });

  it("builds a prompt that includes all playbook questions", () => {
    const prompt = buildPlaybookPrompt();
    for (const q of PLAYBOOK_QUESTIONS) {
      expect(prompt).toContain(q);
    }
  });
});
