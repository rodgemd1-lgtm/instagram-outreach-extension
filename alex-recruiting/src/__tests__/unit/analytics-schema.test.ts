import { describe, it, expect } from "vitest";
import * as schema from "@/lib/db/schema";

describe("analytics schema", () => {
  it("exports pageVisits table", () => {
    expect(schema.pageVisits).toBeDefined();
  });

  it("exports sectionEngagement table", () => {
    expect(schema.sectionEngagement).toBeDefined();
  });

  it("exports filmViews table", () => {
    expect(schema.filmViews).toBeDefined();
  });

  it("exports panelCoaches table", () => {
    expect(schema.panelCoaches).toBeDefined();
  });

  it("exports panelSurveys table", () => {
    expect(schema.panelSurveys).toBeDefined();
  });

  it("exports abVariants table", () => {
    expect(schema.abVariants).toBeDefined();
  });

  it("exports abAssignments table", () => {
    expect(schema.abAssignments).toBeDefined();
  });
});
