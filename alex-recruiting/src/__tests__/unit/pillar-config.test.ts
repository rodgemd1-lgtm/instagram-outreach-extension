import { describe, test, expect } from "vitest";
import {
  PILLAR_CONFIG,
  toCalendarPillar,
  toBackendPillar,
  toCalendarPillarExact,
  ALL_PILLARS,
  type CalendarPillar,
} from "@/lib/dashboard/pillar-config";

describe("PILLAR_CONFIG", () => {
  test("all five pillars are present in config", () => {
    const expected: CalendarPillar[] = ["film", "training", "academic", "camp", "lifestyle"];
    for (const pillar of expected) {
      expect(PILLAR_CONFIG).toHaveProperty(pillar);
    }
  });

  test("each pillar config has label, color, bgClass, textClass", () => {
    for (const [, config] of Object.entries(PILLAR_CONFIG)) {
      expect(config).toHaveProperty("label");
      expect(config).toHaveProperty("color");
      expect(config).toHaveProperty("bgClass");
      expect(config).toHaveProperty("textClass");
    }
  });

  test("each color is a valid hex string", () => {
    for (const [, config] of Object.entries(PILLAR_CONFIG)) {
      expect(config.color).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    }
  });

  test("bgClass and textClass are non-empty strings", () => {
    for (const [, config] of Object.entries(PILLAR_CONFIG)) {
      expect(config.bgClass.length).toBeGreaterThan(0);
      expect(config.textClass.length).toBeGreaterThan(0);
    }
  });
});

describe("ALL_PILLARS", () => {
  test("contains exactly 5 pillars", () => {
    expect(ALL_PILLARS).toHaveLength(5);
  });

  test("all pillar values are valid CalendarPillar strings", () => {
    const valid: CalendarPillar[] = ["film", "training", "academic", "camp", "lifestyle"];
    for (const p of ALL_PILLARS) {
      expect(valid).toContain(p);
    }
  });
});

describe("toCalendarPillar", () => {
  test("performance maps to film", () => {
    expect(toCalendarPillar("performance")).toBe("film");
  });

  test("work_ethic maps to training", () => {
    expect(toCalendarPillar("work_ethic")).toBe("training");
  });

  test("character maps to lifestyle", () => {
    expect(toCalendarPillar("character")).toBe("lifestyle");
  });

  test("calendar-native pillars pass through unchanged", () => {
    const nativePillars: CalendarPillar[] = ["film", "training", "academic", "camp", "lifestyle"];
    for (const p of nativePillars) {
      expect(toCalendarPillar(p)).toBe(p);
    }
  });

  test("unknown backend pillar passes through as-is", () => {
    expect(toCalendarPillar("unknown_pillar")).toBe("unknown_pillar");
  });
});

describe("toBackendPillar", () => {
  test("film maps to performance", () => {
    expect(toBackendPillar("film")).toBe("performance");
  });

  test("training maps to work_ethic", () => {
    expect(toBackendPillar("training")).toBe("work_ethic");
  });

  test("academic maps to character", () => {
    expect(toBackendPillar("academic")).toBe("character");
  });

  test("camp maps to performance", () => {
    expect(toBackendPillar("camp")).toBe("performance");
  });

  test("lifestyle maps to work_ethic", () => {
    expect(toBackendPillar("lifestyle")).toBe("work_ethic");
  });
});

describe("toCalendarPillarExact", () => {
  test("uses hint when hint is a valid CalendarPillar", () => {
    expect(toCalendarPillarExact("performance", "academic")).toBe("academic");
  });

  test("falls back to toCalendarPillar when hint is not valid", () => {
    expect(toCalendarPillarExact("performance", "not-a-pillar")).toBe("film");
  });

  test("works with no hint provided", () => {
    expect(toCalendarPillarExact("work_ethic")).toBe("training");
  });

  test("hint takes precedence over default mapping", () => {
    expect(toCalendarPillarExact("film", "camp")).toBe("camp");
  });
});
