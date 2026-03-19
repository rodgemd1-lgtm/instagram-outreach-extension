import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

import {
  getActiveNavItem,
  getNavSectionLabel,
  navSections,
  primaryTabs,
} from "@/lib/app-navigation";

const APP_DIR = path.resolve(__dirname, "../../app");

function resolvePagePath(href: string): string {
  return href === "/"
    ? path.join(APP_DIR, "page.tsx")
    : path.join(APP_DIR, href.slice(1), "page.tsx");
}

describe("app navigation", () => {
  const allItems = [...primaryTabs, ...navSections.flatMap((section) => section.items)];
  const uniqueRoutes = [...new Set(allItems.map((item) => item.href))];

  it("keeps every primary tab represented in the broader navigation map", () => {
    for (const tab of primaryTabs) {
      expect(uniqueRoutes).toContain(tab.href);
    }
  });

  it("points every in-app navigation item at a page file", () => {
    const missingPages = uniqueRoutes
      .filter((href) => href.startsWith("/"))
      .filter((href) => !fs.existsSync(resolvePagePath(href)));

    expect(missingPages).toEqual([]);
  });

  it("resolves the active item for nested routes", () => {
    expect(getActiveNavItem("/coaches/detail")?.label).toBe("Coaches");
    expect(getActiveNavItem("/outreach/sequences")?.label).toBe("Outreach");
    expect(getActiveNavItem("/camps/upcoming")?.label).toBe("Camps");
  });

  it("returns the expected section label for nested routes", () => {
    expect(getNavSectionLabel("/coaches/pipeline")).toBe("Coaches");
    expect(getNavSectionLabel("/outreach/sequences")).toBe("Outreach");
    expect(getNavSectionLabel("/unknown-route")).toBe("Command");
  });
});
