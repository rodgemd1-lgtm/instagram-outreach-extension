import { describe, it, expect } from "vitest";

describe("Wave 0 Seed Logic", () => {
  it("should only select Tier 3 coaches with X handles who haven't been DM'd", () => {
    const coaches = [
      { id: "1", name: "A", priorityTier: "Tier 3", xHandle: "@coachA", dmStatus: "not_sent" },
      { id: "2", name: "B", priorityTier: "Tier 3", xHandle: null, dmStatus: "not_sent" },
      { id: "3", name: "C", priorityTier: "Tier 1", xHandle: "@coachC", dmStatus: "not_sent" },
      { id: "4", name: "D", priorityTier: "Tier 3", xHandle: "@coachD", dmStatus: "sent" },
    ];

    const eligible = coaches.filter(
      (c) => c.priorityTier === "Tier 3" && c.xHandle !== null && c.dmStatus === "not_sent"
    );

    expect(eligible).toHaveLength(1);
    expect(eligible[0].name).toBe("A");
  });

  it("should also include WIAC (Tier 1 D3) coaches with handles", () => {
    const coaches = [
      { id: "1", name: "A", priorityTier: "Tier 1", conference: "WIAC", xHandle: "@coachA", dmStatus: "not_sent" },
      { id: "2", name: "B", priorityTier: "Tier 1", conference: "Big Ten", xHandle: "@coachB", dmStatus: "not_sent" },
      { id: "3", name: "C", priorityTier: "Tier 1", conference: "WIAC", xHandle: null, dmStatus: "not_sent" },
    ];

    const eligible = coaches.filter(
      (c) =>
        c.xHandle !== null &&
        c.dmStatus === "not_sent" &&
        (c.priorityTier === "Tier 3" || c.conference === "WIAC")
    );

    expect(eligible).toHaveLength(1);
    expect(eligible[0].name).toBe("A");
  });
});
