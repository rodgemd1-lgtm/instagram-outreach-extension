import { describe, expect, it } from "vitest";

import { parseTargetLimit } from "@/app/api/growth/targets/route-utils";

describe("parseTargetLimit", () => {
  it("defaults invalid values to 25", () => {
    expect(parseTargetLimit(null)).toBe(25);
    expect(parseTargetLimit("")).toBe(25);
    expect(parseTargetLimit("not-a-number")).toBe(25);
  });

  it("clamps values into the supported range", () => {
    expect(parseTargetLimit("0")).toBe(1);
    expect(parseTargetLimit("10")).toBe(10);
    expect(parseTargetLimit("999")).toBe(50);
  });
});
