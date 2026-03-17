import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

import {
  getActiveNavItem,
  getNavSectionLabel,
  navSections,
  primaryTabs,
} from "@/lib/app-navigation";

const APP_DIR = path.resolve(__dirname, "../../app");

function routeToPagePath(route: string): string {
  return route === "/"
    ? path.join(APP_DIR, "page.tsx")
    : path.join(APP_DIR, route.slice(1), "page.tsx");
}

describe("User Workflows — Navigation Paths", () => {
  const navItems = [...primaryTabs, ...navSections.flatMap((section) => section.items)];
  const uniqueRoutes = [...new Set(navItems.map((item) => item.href))];

  it("covers the primary tab routes inside the broader navigation model", () => {
    for (const tab of primaryTabs) {
      expect(uniqueRoutes).toContain(tab.href);
    }
  });

  for (const route of uniqueRoutes) {
    it(`route "${route}" has a matching page.tsx file`, () => {
      expect(fs.existsSync(routeToPagePath(route))).toBe(true);
    });
  }
});

describe("User Workflows — Page Exports", () => {
  it("home page exports a default component", async () => {
    const mod = await import("@/app/page");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("posts page exports a default component", async () => {
    const mod = await import("@/app/posts/page");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("coaches page exports a default component", async () => {
    const mod = await import("@/app/coaches/page");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("media lab page exports a default component", async () => {
    const mod = await import("@/app/media-lab/page");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("profile studio page exports a default component", async () => {
    const mod = await import("@/app/profile-studio/page");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("recruit site page exports a default component", async () => {
    const mod = await import("@/app/recruit/page");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});

describe("User Workflows — Navigation Behavior", () => {
  it("keeps the primary publishing tab active through nested publishing routes", () => {
    expect(getActiveNavItem("/posts/queued")?.label).toBe("Publish");
    expect(getNavSectionLabel("/posts/queued")).toBe("Publishing");
  });

  it("keeps the coach pipeline active through nested outreach routes", () => {
    expect(getActiveNavItem("/coaches/priority")?.label).toBe("Outreach");
    expect(getNavSectionLabel("/coaches/priority")).toBe("Outreach");
  });

  it("falls back to the Today route when no route matches", () => {
    expect(getActiveNavItem("/totally-unknown")?.label).toBe("Today");
    expect(getNavSectionLabel("/totally-unknown")).toBe("Command");
  });
});

describe("User Workflows — Layout", () => {
  it("root layout file exists", () => {
    const layoutPath = path.join(APP_DIR, "layout.tsx");
    expect(fs.existsSync(layoutPath)).toBe(true);
  });

  it("root layout file exports a default function", () => {
    const layoutPath = path.join(APP_DIR, "layout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");
    const hasDefault =
      content.includes("export default") ||
      /export\s+default\s+function/.test(content);

    expect(hasDefault).toBe(true);
  });
});
