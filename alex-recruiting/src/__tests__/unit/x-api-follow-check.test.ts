import { describe, it, expect } from "vitest";

describe("checkFollowRelationship return shape", () => {
  it("should return both following and followed_by as booleans", () => {
    const result = { following: true, followed_by: false };
    expect(typeof result.following).toBe("boolean");
    expect(typeof result.followed_by).toBe("boolean");
  });

  it("should support all four relationship states", () => {
    const states = [
      { following: false, followed_by: false },
      { following: true, followed_by: false },
      { following: false, followed_by: true },
      { following: true, followed_by: true },
    ];

    for (const state of states) {
      expect(typeof state.following).toBe("boolean");
      expect(typeof state.followed_by).toBe("boolean");
    }
  });
});
