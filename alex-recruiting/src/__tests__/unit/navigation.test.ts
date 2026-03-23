/**
 * Unit tests for app navigation — verify all new pages are properly registered
 */

import { describe, it, expect } from "vitest";
import { navSections, primaryTabs, getActiveNavItem, getNavSectionLabel } from "@/lib/app-navigation";

describe("App Navigation", () => {
  const allNavItems = navSections.flatMap((s) => s.items);
  const allItems = [...primaryTabs, ...allNavItems];

  it("has core paths in nav sections", () => {
    const corePaths = [
      "/dashboard",
      "/coaches",
      "/outreach",
      "/content",
      "/camps",
      "/agency",
    ];
    const navHrefs = allNavItems.map((item) => item.href);
    for (const path of corePaths) {
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

  it("/content is in the Content section", () => {
    const content = navSections.find((s) => s.id === "content");
    expect(content).toBeTruthy();
    const hrefs = content!.items.map((i) => i.href);
    expect(hrefs).toContain("/content");
  });

  it("outreach is in the Outreach section", () => {
    const outreach = navSections.find((s) => s.id === "outreach");
    expect(outreach).toBeTruthy();
    const hrefs = outreach!.items.map((i) => i.href);
    expect(hrefs).toContain("/outreach");
  });

  it("camps is in the media section", () => {
    const media = navSections.find((s) => s.id === "media");
    expect(media).toBeTruthy();
    const hrefs = media!.items.map((i) => i.href);
    expect(hrefs).toContain("/camps");
  });

  it("agency is in the agency section", () => {
    const agency = navSections.find((s) => s.id === "agency");
    expect(agency).toBeTruthy();
    const hrefs = agency!.items.map((i) => i.href);
    expect(hrefs).toContain("/agency");
  });

  it("getActiveNavItem returns correct item for core paths", () => {
    expect(getActiveNavItem("/dashboard")?.label).toBe("Command");
    expect(getActiveNavItem("/outreach")?.label).toBe("Outreach");
    expect(getActiveNavItem("/coaches")?.label).toBe("Coaches");
    expect(getActiveNavItem("/content")?.label).toBe("Content");
  });

  it("getNavSectionLabel returns correct section for core paths", () => {
    expect(getNavSectionLabel("/content")).toBe("Content");
    expect(getNavSectionLabel("/outreach")).toBe("Outreach");
    expect(getNavSectionLabel("/camps")).toBe("Camps & Media");
  });

  it("primaryTabs has 6 items for mobile bottom nav", () => {
    expect(primaryTabs).toHaveLength(6);
  });

  it("navSections has 6 sections", () => {
    expect(navSections).toHaveLength(6);
    const ids = navSections.map((s) => s.id);
    expect(ids).toEqual(["command", "coaches", "outreach", "content", "media", "agency"]);
  });
});
