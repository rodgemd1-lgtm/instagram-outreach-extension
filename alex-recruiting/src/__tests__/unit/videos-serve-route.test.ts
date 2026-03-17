import { describe, expect, it } from "vitest";

import { parseByteRange } from "@/app/api/videos/serve/range";

describe("parseByteRange", () => {
  it("returns null when no range is provided", () => {
    expect(parseByteRange(null, 1000)).toBeNull();
  });

  it("parses valid byte ranges", () => {
    expect(parseByteRange("bytes=0-99", 1000)).toEqual({
      start: 0,
      end: 99,
      chunkSize: 100,
    });

    expect(parseByteRange("bytes=900-", 1000)).toEqual({
      start: 900,
      end: 999,
      chunkSize: 100,
    });
  });

  it("returns unsatisfiable for invalid ranges", () => {
    expect(parseByteRange("bytes=1000-1200", 1000)).toBe("unsatisfiable");
    expect(parseByteRange("bytes=50-10", 1000)).toBe("unsatisfiable");
    expect(parseByteRange("bytes=abc-def", 1000)).toBeNull();
  });
});
