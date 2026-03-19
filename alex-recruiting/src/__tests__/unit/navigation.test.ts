/**
 * Unit tests for app navigation — verify all new pages are properly registered
 */

import { describe, it, expect } from "vitest";
import { navSections, primaryTabs, getActiveNavItem, getNavSectionLabel } from "@/lib/app-navigation";

describe("App Navigation", () => {
  const allNavItems = navSections.flatMap((s) => s.items);
  const allItems = [...primaryTabs, ...allNavItems];

  it("has all 7 new pages in nav sections", () => {
    const newPaths = [
      "/content-queue",
      "/outreach",
      "/brand-kit",
      "/capture",
      "/x-growth",
      "/map",
      "/prompt-studio",
    ];
    const navHrefs = allNavItems.map((item) => item.href);
    for (const path of newPaths) {
      expect(navHrefs).toContain(path);
    }
  });

  it("has no duplicate hrefs", () => {
    const hrefs = allNavItems.map((item) => item.href);
    const uniqueHrefs = new Set(hrefs);
    expect(hrefs.length).toBe(uniqueHrefs.size);
  });

  it("every nav item has required fields", () => {
    for (const item of allItems) {
      expect(item.href).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.icon).toBeTruthy();
    }
  });

  it("every sidebar item has a blurb", () => {
    for (const item of allNavItems) {
      expect(item.blurb).toBeTruthy();
    }
  });

  it("content-queue is in the Publishing section", () => {
    const publishing = navSections.find((s) => s.id === "content");
    expect(publishing).toBeTruthy();
    const hrefs = publishing!.items.map((i) => i.href);
    expect(hrefs).toContain("/content-queue");
    expect(hrefs).toContain("/prompt-studio");
  });

  it("outreach is in the Outreach section", () => {
    const outreach = navSections.find((s) => s.id === "outreach");
    expect(outreach).toBeTruthy();
    const hrefs = outreach!.items.map((i) => i.href);
    expect(hrefs).toContain("/outreach");
  });

  it("brand-kit and capture are in the Media section", () => {
    const media = navSections.find((s) => s.id === "media");
    expect(media).toBeTruthy();
    const hrefs = media!.items.map((i) => i.href);
    expect(hrefs).toContain("/brand-kit");
    expect(hrefs).toContain("/capture");
  });

  it("x-growth and map are in the Research section", () => {
    const research = navSections.find((s) => s.id === "systems");
    expect(research).toBeTruthy();
    const hrefs = research!.items.map((i) => i.href);
    expect(hrefs).toContain("/x-growth");
    expect(hrefs).toContain("/map");
  });

  it("getActiveNavItem returns correct item for new paths", () => {
    expect(getActiveNavItem("/content-queue")?.label).toBe("Content Queue");
    expect(getActiveNavItem("/outreach")?.label).toBe("Outreach Program");
    expect(getActiveNavItem("/brand-kit")?.label).toBe("Brand Kit");
    expect(getActiveNavItem("/x-growth")?.label).toBe("X Growth");
    expect(getActiveNavItem("/map")?.label).toBe("School Map");
  });

  it("getNavSectionLabel returns correct section for new paths", () => {
    expect(getNavSectionLabel("/content-queue")).toBe("Publishing");
    expect(getNavSectionLabel("/outreach")).toBe("Outreach");
    expect(getNavSectionLabel("/brand-kit")).toBe("Media");
    expect(getNavSectionLabel("/x-growth")).toBe("Research");
  });

  it("primaryTabs has 6 items for mobile bottom nav", () => {
    expect(primaryTabs).toHaveLength(6);
  });

  it("navSections has 5 sections", () => {
    expect(navSections).toHaveLength(5);
    const ids = navSections.map((s) => s.id);
    expect(ids).toEqual(["command", "content", "outreach", "media", "systems"]);
  });
});
