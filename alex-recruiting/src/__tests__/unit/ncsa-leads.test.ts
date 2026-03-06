import { describe, it, expect, beforeEach } from "vitest";

describe("NCSA Lead Pipeline", () => {
  beforeEach(async () => {
    const { clearLeads } = await import("@/lib/rec/knowledge/ncsa-leads");
    clearLeads();
  });

  it("addLead creates a new lead with auto-generated id and timestamp", async () => {
    const { addLead, getAllLeads } = await import(
      "@/lib/rec/knowledge/ncsa-leads"
    );
    const lead = addLead({
      coachName: "Coach Smith",
      schoolName: "Iowa State",
      division: "D1 FBS",
      conference: "Big 12",
      source: "profile_view",
      sourceDetail: "Viewed Jacob profile on 2026-03-05",
      xHandle: null,
      outreachStatus: "new",
      assignedTo: "nina",
      notes: "",
    });
    expect(lead.id).toBeDefined();
    expect(lead.outreachStatus).toBe("new");
    expect(lead.assignedTo).toBe("nina");
    expect(lead.detectedAt).toBeDefined();
    const all = getAllLeads();
    expect(all).toHaveLength(1);
  });

  it("updateLeadStatus transitions correctly", async () => {
    const { addLead, updateLeadStatus } = await import(
      "@/lib/rec/knowledge/ncsa-leads"
    );
    const lead = addLead({
      coachName: "Coach Jones",
      schoolName: "Ball State",
      division: "D1 FBS",
      conference: "MAC",
      source: "camp_invite",
      sourceDetail: "Summer camp invite June 2026",
      xHandle: "@CoachJones",
      outreachStatus: "new",
      assignedTo: "nina",
      notes: "",
    });
    const updated = updateLeadStatus(lead.id, "researched");
    expect(updated?.outreachStatus).toBe("researched");
  });

  it("getLeadsByStatus filters correctly", async () => {
    const { addLead, getLeadsByStatus, updateLeadStatus } = await import(
      "@/lib/rec/knowledge/ncsa-leads"
    );
    const lead1 = addLead({
      coachName: "Coach A",
      schoolName: "School A",
      division: "D1",
      conference: "Big 10",
      source: "profile_view",
      sourceDetail: "Viewed",
      xHandle: null,
      outreachStatus: "new",
      assignedTo: "nina",
      notes: "",
    });
    addLead({
      coachName: "Coach B",
      schoolName: "School B",
      division: "D2",
      conference: "GLIAC",
      source: "camp_invite",
      sourceDetail: "Camp",
      xHandle: null,
      outreachStatus: "new",
      assignedTo: "nina",
      notes: "",
    });
    updateLeadStatus(lead1.id, "researched");
    expect(getLeadsByStatus("new")).toHaveLength(1);
    expect(getLeadsByStatus("researched")).toHaveLength(1);
  });
});
