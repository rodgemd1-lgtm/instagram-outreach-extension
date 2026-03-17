import { describe, it, expect } from "vitest";

/**
 * Integration tests for outreach API routes.
 *
 * These tests import route handlers directly and exercise the
 * no-database fallback paths. No HTTP server or real DB connection needed.
 */

// ---------------------------------------------------------------------------
// GET /api/outreach/plan
// ---------------------------------------------------------------------------
describe("GET /api/outreach/plan", () => {
  it("returns a valid structure with stages", async () => {
    const { GET } = await import("@/app/api/outreach/plan/route");
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty("stages");
    expect(data).toHaveProperty("stats");
    expect(data).toHaveProperty("ncaaNote");
    expect(data).toHaveProperty("generatedAt");
  });

  it("stages object contains all six pipeline stages", async () => {
    const { GET } = await import("@/app/api/outreach/plan/route");
    const response = await GET();
    const data = await response.json();

    const expectedStages = [
      "research",
      "follow",
      "engage",
      "dm",
      "response",
      "relationship",
    ];
    for (const stage of expectedStages) {
      expect(data.stages).toHaveProperty(stage);
      expect(Array.isArray(data.stages[stage])).toBe(true);
    }
  });

  it("stats object has expected fields", async () => {
    const { GET } = await import("@/app/api/outreach/plan/route");
    const response = await GET();
    const data = await response.json();

    expect(data.stats).toHaveProperty("total");
    expect(data.stats).toHaveProperty("dmsDrafted");
    expect(data.stats).toHaveProperty("dmsSent");
    expect(data.stats).toHaveProperty("responses");
    expect(data.stats).toHaveProperty("followRate");
    expect(typeof data.stats.total).toBe("number");
    expect(typeof data.stats.followRate).toBe("string");
  });

  it("ncaaNote references Class of 2029 timeline", async () => {
    const { GET } = await import("@/app/api/outreach/plan/route");
    const response = await GET();
    const data = await response.json();

    expect(typeof data.ncaaNote).toBe("string");
    expect(data.ncaaNote.length).toBeGreaterThan(0);
    // The NCAA note should reference class year or DM rules
    expect(data.ncaaNote).toMatch(/2029|DM|coach|athlete/i);
  });
});

// ---------------------------------------------------------------------------
// POST /api/outreach/plan
// ---------------------------------------------------------------------------
describe("POST /api/outreach/plan", () => {
  it("returns success with coach count", async () => {
    const { POST } = await import("@/app/api/outreach/plan/route");
    const response = await POST();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(typeof data.coaches).toBe("number");
  });

  it("generates a plan covering all 17 target schools", async () => {
    const { POST } = await import("@/app/api/outreach/plan/route");
    const response = await POST();
    const data = await response.json();

    expect(data.coaches).toBe(17);
  });

  it("includes a full outreach plan with stages", async () => {
    const { POST } = await import("@/app/api/outreach/plan/route");
    const response = await POST();
    const data = await response.json();

    expect(data).toHaveProperty("plan");
    expect(data.plan).toHaveProperty("stages");
    expect(data.plan).toHaveProperty("stats");
    expect(data.plan).toHaveProperty("ncaaNote");
    expect(data.plan).toHaveProperty("generatedAt");
  });
});

// ---------------------------------------------------------------------------
// POST /api/outreach/follow-plan
// ---------------------------------------------------------------------------
describe("POST /api/outreach/follow-plan", () => {
  it("returns success with a follow plan", async () => {
    const { POST } = await import("@/app/api/outreach/follow-plan/route");
    const response = await POST();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data).toHaveProperty("plan");
  });

  it("plan has weeklyBatches, engagementTasks, and strategy", async () => {
    const { POST } = await import("@/app/api/outreach/follow-plan/route");
    const response = await POST();
    const data = await response.json();

    expect(data.plan).toHaveProperty("weeklyBatches");
    expect(data.plan).toHaveProperty("engagementTasks");
    expect(data.plan).toHaveProperty("strategy");

    expect(Array.isArray(data.plan.weeklyBatches)).toBe(true);
    expect(Array.isArray(data.plan.engagementTasks)).toBe(true);
    expect(Array.isArray(data.plan.strategy)).toBe(true);
  });

  it("weeklyBatches entries have week, startDate, and targets", async () => {
    const { POST } = await import("@/app/api/outreach/follow-plan/route");
    const response = await POST();
    const data = await response.json();

    expect(data.plan.weeklyBatches.length).toBe(26);

    const firstWeek = data.plan.weeklyBatches[0];
    expect(firstWeek).toHaveProperty("week");
    expect(firstWeek).toHaveProperty("startDate");
    expect(firstWeek).toHaveProperty("targets");
    expect(typeof firstWeek.week).toBe("number");
    expect(typeof firstWeek.startDate).toBe("string");
    expect(Array.isArray(firstWeek.targets)).toBe(true);
  });

  it("engagementTasks have correct structure", async () => {
    const { POST } = await import("@/app/api/outreach/follow-plan/route");
    const response = await POST();
    const data = await response.json();

    for (const task of data.plan.engagementTasks) {
      expect(task).toHaveProperty("type");
      expect(task).toHaveProperty("target");
      expect(task).toHaveProperty("targetName");
      expect(task).toHaveProperty("frequency");
      expect(task).toHaveProperty("notes");
      expect(["like", "reply", "retweet"]).toContain(task.type);
    }
  });

  it("plan includes a summary with category counts", async () => {
    const { POST } = await import("@/app/api/outreach/follow-plan/route");
    const response = await POST();
    const data = await response.json();

    expect(data.plan).toHaveProperty("summary");
    expect(data.plan.summary).toHaveProperty("totalTargets");
    expect(data.plan.summary).toHaveProperty("scheduledTargets");
    expect(data.plan.summary).toHaveProperty("followsPerWeek");
    expect(data.plan.summary).toHaveProperty("weeksInPlan");
    expect(data.plan.summary).toHaveProperty("categoryCounts");

    expect(data.plan.summary.totalTargets).toBeGreaterThan(100);
    expect(data.plan.summary.weeksInPlan).toBe(26);
  });

  it("phase breakdown has 7 phases covering 26 weeks", async () => {
    const { POST } = await import("@/app/api/outreach/follow-plan/route");
    const response = await POST();
    const data = await response.json();

    expect(data.plan.summary.phaseBreakdown.length).toBe(7);

    for (const phase of data.plan.summary.phaseBreakdown) {
      expect(phase).toHaveProperty("weeks");
      expect(phase).toHaveProperty("focus");
      expect(phase).toHaveProperty("targetCount");
      expect(typeof phase.weeks).toBe("string");
      expect(typeof phase.focus).toBe("string");
    }
  });
});

// ---------------------------------------------------------------------------
// POST /api/outreach/dm-sequence
// ---------------------------------------------------------------------------
describe("POST /api/outreach/dm-sequence", () => {
  it("returns success with sequence count", async () => {
    const { POST } = await import("@/app/api/outreach/dm-sequence/route");
    const response = await POST();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(typeof data.sequences).toBe("number");
  });

  it("generates sequences for all 17 target schools", async () => {
    const { POST } = await import("@/app/api/outreach/dm-sequence/route");
    const response = await POST();
    const data = await response.json();

    expect(data.sequences).toBe(17);
  });

  it("returns messages array with required fields", async () => {
    const { POST } = await import("@/app/api/outreach/dm-sequence/route");
    const response = await POST();
    const data = await response.json();

    expect(Array.isArray(data.messages)).toBe(true);
    expect(data.messages.length).toBeGreaterThan(0);

    for (const msg of data.messages) {
      expect(msg).toHaveProperty("step");
      expect(msg).toHaveProperty("type");
      expect(msg).toHaveProperty("content");
      expect(typeof msg.step).toBe("number");
      expect(typeof msg.content).toBe("string");
      expect(msg.content.length).toBeGreaterThan(0);
    }
  });

  it("sequence details include coachName and schoolName", async () => {
    const { POST } = await import("@/app/api/outreach/dm-sequence/route");
    const response = await POST();
    const data = await response.json();

    expect(Array.isArray(data.sequenceDetails)).toBe(true);

    for (const seq of data.sequenceDetails) {
      expect(seq).toHaveProperty("coachName");
      expect(seq).toHaveProperty("schoolName");
      expect(typeof seq.coachName).toBe("string");
      expect(typeof seq.schoolName).toBe("string");
      expect(seq.coachName.length).toBeGreaterThan(0);
      expect(seq.schoolName.length).toBeGreaterThan(0);
    }
  });

  it("each sequence has multi-step DM messages", async () => {
    const { POST } = await import("@/app/api/outreach/dm-sequence/route");
    const response = await POST();
    const data = await response.json();

    for (const seq of data.sequenceDetails) {
      expect(Array.isArray(seq.steps)).toBe(true);
      expect(seq.steps.length).toBeGreaterThanOrEqual(1);

      for (const step of seq.steps) {
        expect(step).toHaveProperty("step");
        expect(step).toHaveProperty("type");
        expect(step).toHaveProperty("content");
        expect(step).toHaveProperty("sendAfterDays");
        expect(step).toHaveProperty("status");
        expect(["introduction", "value_add", "follow_up"]).toContain(step.type);
      }
    }
  });

  it("includes NCAA compliance information", async () => {
    const { POST } = await import("@/app/api/outreach/dm-sequence/route");
    const response = await POST();
    const data = await response.json();

    expect(data).toHaveProperty("ncaaCompliance");
    expect(data.ncaaCompliance).toHaveProperty("currentPhase");
    expect(data.ncaaCompliance).toHaveProperty("dmRules");
    expect(data.ncaaCompliance).toHaveProperty("keyDate");
    expect(data.ncaaCompliance).toHaveProperty("recommendation");
  });

  it("outreach plan respects NCAA Class of 2029 rules", async () => {
    const { POST } = await import("@/app/api/outreach/dm-sequence/route");
    const response = await POST();
    const data = await response.json();

    // Every sequence should have an NCAA note
    for (const seq of data.sequenceDetails) {
      expect(seq).toHaveProperty("ncaaNote");
      expect(typeof seq.ncaaNote).toBe("string");
      expect(seq.ncaaNote.length).toBeGreaterThan(0);
    }

    // The top-level compliance should reference the class year or relevant dates
    const complianceText = JSON.stringify(data.ncaaCompliance);
    expect(complianceText).toMatch(/2027|2029|sophomore|DM|coach/i);
  });
});
