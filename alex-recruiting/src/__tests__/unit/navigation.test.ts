/**
 * Unit tests for Six-Pack navigation — verify all 6 primary pages are registered
 */

import { describe, it, expect } from "vitest";
import { navSections, primaryTabs, getActiveNavItem, getNavSectionLabel } from "@/lib/app-navigation";

describe("Six-Pack Navigation", () => {
  const allNavItems = navSections.flatMap((s) => s.items);
  const allItems = [...primaryTabs, ...allNavItems];

  it("primaryTabs has 6 items matching the Six-Pack", () => {
    expect(primaryTabs).toHaveLength(6);
    const hrefs = primaryTabs.map((t) => t.href);
    expect(hrefs).toContain("/dashboard");
    expect(hrefs).toContain("/coaches");
    expect(hrefs).toContain("/outreach");
    expect(hrefs).toContain("/content");
    expect(hrefs).toContain("/camps");
    expect(hrefs).toContain("/agency");
  });

  it("navSections has 6 sections", () => {
    expect(navSections).toHaveLength(6);
    const ids = navSections.map((s) => s.id);
    expect(ids).toEqual(["command", "coaches", "outreach", "content", "media", "agency"]);
  });

  it("has no duplicate hrefs in nav items", () => {
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

  it("getActiveNavItem returns correct item for Six-Pack paths", () => {
    expect(getActiveNavItem("/dashboard")?.label).toBe("Command");
    expect(getActiveNavItem("/coaches")?.label).toBe("Coaches");
    expect(getActiveNavItem("/outreach")?.label).toBe("Outreach");
    expect(getActiveNavItem("/content")?.label).toBe("Content");
    expect(getActiveNavItem("/camps")?.label).toBe("Camps");
    expect(getActiveNavItem("/agency")?.label).toBe("Agency");
  });

  it("getNavSectionLabel returns correct section for paths", () => {
    expect(getNavSectionLabel("/coaches/pipeline")).toBe("Coaches");
    expect(getNavSectionLabel("/outreach/sequences")).toBe("Outreach");
    expect(getNavSectionLabel("/unknown-route")).toBe("Command");
  });

  it("getActiveNavItem falls back to Command for unknown routes", () => {
    expect(getActiveNavItem("/totally-unknown")?.label).toBe("Command");
  });
});
