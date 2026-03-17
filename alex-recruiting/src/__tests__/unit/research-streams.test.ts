import { describe, it, expect } from "vitest";
import { getStreamByName, getAllStreams, getStreamUrls } from "@/lib/research/streams";

describe("research streams", () => {
  it("returns all 5 research streams", () => {
    const streams = getAllStreams();
    expect(streams).toHaveLength(5);
    expect(streams.map(s => s.name)).toContain("Coach Decision Psychology");
    expect(streams.map(s => s.name)).toContain("Reddit/Forum Coach Insights");
    expect(streams.map(s => s.name)).toContain("Film Effectiveness Research");
  });

  it("gets stream by name", () => {
    const stream = getStreamByName("Coach Decision Psychology");
    expect(stream).toBeDefined();
    expect(stream!.dataType).toBe("coach_psychology");
    expect(stream!.urls.length).toBeGreaterThan(0);
  });

  it("returns flat list of all URLs across streams", () => {
    const urls = getStreamUrls();
    expect(urls.length).toBeGreaterThan(10);
    expect(urls.every(u => u.url.startsWith("http"))).toBe(true);
  });
});
