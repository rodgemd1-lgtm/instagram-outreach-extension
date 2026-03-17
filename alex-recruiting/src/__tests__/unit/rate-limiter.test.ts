import { describe, test, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  recordRequest,
  enforceRateLimit,
  resetAllBuckets,
  RateLimitError,
} from "@/lib/integrations/rate-limiter";

beforeEach(() => {
  resetAllBuckets();
});

describe("checkRateLimit", () => {
  test("allows first request on fresh bucket", () => {
    const result = checkRateLimit("search/recent");
    expect(result.allowed).toBe(true);
    expect(result.currentCount).toBe(0);
  });

  test("returns current count and limit in result", () => {
    const result = checkRateLimit("tweets");
    expect(typeof result.currentCount).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(result.limit).toBeGreaterThan(0);
  });

  test("retryAfter is undefined when allowed", () => {
    const result = checkRateLimit("tweets");
    expect(result.retryAfter).toBeUndefined();
  });

  test("unknown endpoint uses default limit", () => {
    const result = checkRateLimit("some/unknown/endpoint");
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(300);
  });

  test("users/:id/tweets endpoint has high limit", () => {
    const result = checkRateLimit("users/:id/tweets");
    expect(result.limit).toBe(900);
  });
});

describe("recordRequest", () => {
  test("recording requests increases the count", () => {
    const before = checkRateLimit("dm_conversations");
    recordRequest("dm_conversations");
    const after = checkRateLimit("dm_conversations");
    expect(after.currentCount).toBe(before.currentCount + 1);
  });

  test("recording multiple requests increments count each time", () => {
    recordRequest("tweets");
    recordRequest("tweets");
    recordRequest("tweets");
    const result = checkRateLimit("tweets");
    expect(result.currentCount).toBe(3);
  });

  test("accepts full URL path and resolves to correct endpoint", () => {
    expect(() =>
      recordRequest("https://api.x.com/2/tweets/search/recent")
    ).not.toThrow();
  });
});

describe("enforceRateLimit", () => {
  test("does not throw when under limit", () => {
    expect(() => enforceRateLimit("search/recent")).not.toThrow();
  });

  test("throws RateLimitError when limit is exhausted", () => {
    // Fill the dm_conversations bucket (200 max)
    const limit = 200;
    for (let i = 0; i < limit; i++) {
      recordRequest("dm_conversations");
    }
    expect(() => enforceRateLimit("dm_conversations")).toThrow(RateLimitError);
  });
});

describe("RateLimitError", () => {
  test("has correct name", () => {
    const err = new RateLimitError("tweets", 5000);
    expect(err.name).toBe("RateLimitError");
  });

  test("stores endpoint and retryAfter", () => {
    const err = new RateLimitError("search/recent", 10000);
    expect(err.endpoint).toBe("search/recent");
    expect(err.retryAfter).toBe(10000);
  });

  test("is an instance of Error", () => {
    const err = new RateLimitError("tweets", 0);
    expect(err).toBeInstanceOf(Error);
  });

  test("message includes endpoint name", () => {
    const err = new RateLimitError("tweets", 15000);
    expect(err.message).toContain("tweets");
  });

  test("message includes retry-after seconds", () => {
    const err = new RateLimitError("tweets", 30000);
    // 30000ms = 30s
    expect(err.message).toContain("30s");
  });
});

describe("resetAllBuckets", () => {
  test("clears request counts so subsequent checks start fresh", () => {
    recordRequest("tweets");
    recordRequest("tweets");
    resetAllBuckets();
    const result = checkRateLimit("tweets");
    expect(result.currentCount).toBe(0);
  });
});
