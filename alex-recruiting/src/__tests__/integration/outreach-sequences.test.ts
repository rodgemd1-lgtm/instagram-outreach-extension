import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";

/**
 * Integration tests for the outreach sequences API routes.
 *
 * These tests exercise both the list (GET) and creation (POST) endpoints
 * for DM sequences. The database is not configured in the test env, so
 * the dm-sequences module falls back to its in-memory store.
 */

// ---------------------------------------------------------------------------
// GET /api/outreach/sequences — list sequences
// ---------------------------------------------------------------------------
describe("GET /api/outreach/sequences", () => {
  it("returns a valid response with sequences array and counts", async () => {
    const { GET } = await import("@/app/api/outreach/sequences/route");
    const req = new NextRequest(
      "http://localhost:3000/api/outreach/sequences"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("sequences");
    expect(data).toHaveProperty("total");
    expect(data).toHaveProperty("active");
    expect(data).toHaveProperty("paused");
    expect(data).toHaveProperty("completed");
    expect(data).toHaveProperty("responseReceived");

    expect(Array.isArray(data.sequences)).toBe(true);
    expect(typeof data.total).toBe("number");
    expect(typeof data.active).toBe("number");
    expect(typeof data.paused).toBe("number");
    expect(typeof data.completed).toBe("number");
    expect(typeof data.responseReceived).toBe("number");
  });

  it("total matches the length of the sequences array", async () => {
    const { GET } = await import("@/app/api/outreach/sequences/route");
    const req = new NextRequest(
      "http://localhost:3000/api/outreach/sequences"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(data.total).toBe(data.sequences.length);
  });

  it("accepts a status query parameter", async () => {
    const { GET } = await import("@/app/api/outreach/sequences/route");
    const req = new NextRequest(
      "http://localhost:3000/api/outreach/sequences?status=active"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("sequences");
    expect(Array.isArray(data.sequences)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// POST /api/outreach/sequences — create a new sequence
// ---------------------------------------------------------------------------
describe("POST /api/outreach/sequences", () => {
  it("returns 400 when required fields are missing", async () => {
    const { POST } = await import("@/app/api/outreach/sequences/route");
    const req = new NextRequest(
      "http://localhost:3000/api/outreach/sequences",
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    );
    const response = await POST(req);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty("error");
    expect(data.error).toContain("coachId");
  });

  it("returns 400 when coachName is missing", async () => {
    const { POST } = await import("@/app/api/outreach/sequences/route");
    const req = new NextRequest(
      "http://localhost:3000/api/outreach/sequences",
      {
        method: "POST",
        body: JSON.stringify({
          coachId: "coach-123",
          school: "Wisconsin",
        }),
      }
    );
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it("returns 400 when school is missing", async () => {
    const { POST } = await import("@/app/api/outreach/sequences/route");
    const req = new NextRequest(
      "http://localhost:3000/api/outreach/sequences",
      {
        method: "POST",
        body: JSON.stringify({
          coachId: "coach-123",
          coachName: "Coach Smith",
        }),
      }
    );
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid tier value", async () => {
    const { POST } = await import("@/app/api/outreach/sequences/route");
    const req = new NextRequest(
      "http://localhost:3000/api/outreach/sequences",
      {
        method: "POST",
        body: JSON.stringify({
          coachId: "coach-123",
          coachName: "Coach Smith",
          school: "Wisconsin",
          tier: "InvalidTier",
        }),
      }
    );
    const response = await POST(req);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("tier");
  });

  it("creates a sequence with valid inputs and returns 201", async () => {
    const { POST } = await import("@/app/api/outreach/sequences/route");
    const req = new NextRequest(
      "http://localhost:3000/api/outreach/sequences",
      {
        method: "POST",
        body: JSON.stringify({
          coachId: "coach-test-001",
          coachName: "Coach Johnson",
          school: "Iowa",
          tier: "Tier 1",
        }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("sequence");
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("nextSteps");
  });

  it("created sequence has the correct coach and school info", async () => {
    const { POST } = await import("@/app/api/outreach/sequences/route");
    const req = new NextRequest(
      "http://localhost:3000/api/outreach/sequences",
      {
        method: "POST",
        body: JSON.stringify({
          coachId: "coach-test-002",
          coachName: "Coach Williams",
          school: "Minnesota",
          tier: "Tier 2",
        }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(data.sequence.coachId).toBe("coach-test-002");
    expect(data.sequence.coachName).toBe("Coach Williams");
    expect(data.sequence.school).toBe("Minnesota");
  });

  it("created sequence starts at step 1 with active status", async () => {
    const { POST } = await import("@/app/api/outreach/sequences/route");
    const req = new NextRequest(
      "http://localhost:3000/api/outreach/sequences",
      {
        method: "POST",
        body: JSON.stringify({
          coachId: "coach-test-003",
          coachName: "Coach Davis",
          school: "Wisconsin",
          tier: "Tier 1",
        }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(data.sequence.currentStep).toBe(1);
    expect(data.sequence.totalSteps).toBe(4);
    expect(data.sequence.status).toBe("active");
    expect(data.sequence.responseDetected).toBe(false);
  });

  it("created sequence has a unique id", async () => {
    const { POST } = await import("@/app/api/outreach/sequences/route");

    const req1 = new NextRequest(
      "http://localhost:3000/api/outreach/sequences",
      {
        method: "POST",
        body: JSON.stringify({
          coachId: "coach-unique-1",
          coachName: "Coach A",
          school: "Iowa",
        }),
      }
    );
    const req2 = new NextRequest(
      "http://localhost:3000/api/outreach/sequences",
      {
        method: "POST",
        body: JSON.stringify({
          coachId: "coach-unique-2",
          coachName: "Coach B",
          school: "Nebraska",
        }),
      }
    );

    const res1 = await POST(req1);
    const data1 = await res1.json();
    const res2 = await POST(req2);
    const data2 = await res2.json();

    expect(data1.sequence.id).not.toBe(data2.sequence.id);
  });

  it("nextSteps outlines the 4-step DM cadence", async () => {
    const { POST } = await import("@/app/api/outreach/sequences/route");
    const req = new NextRequest(
      "http://localhost:3000/api/outreach/sequences",
      {
        method: "POST",
        body: JSON.stringify({
          coachId: "coach-test-steps",
          coachName: "Coach Taylor",
          school: "Michigan",
          tier: "Tier 1",
        }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(data.nextSteps).toHaveProperty("step1");
    expect(data.nextSteps).toHaveProperty("step2");
    expect(data.nextSteps).toHaveProperty("step3");
    expect(data.nextSteps).toHaveProperty("step4");
  });

  it("message includes the coach name and school", async () => {
    const { POST } = await import("@/app/api/outreach/sequences/route");
    const req = new NextRequest(
      "http://localhost:3000/api/outreach/sequences",
      {
        method: "POST",
        body: JSON.stringify({
          coachId: "coach-msg-check",
          coachName: "Coach Roberts",
          school: "Purdue",
          tier: "Tier 2",
        }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(data.message).toContain("Coach Roberts");
    expect(data.message).toContain("Purdue");
  });
});

// ---------------------------------------------------------------------------
// POST then GET — verify created sequence appears in list
// ---------------------------------------------------------------------------
describe("Outreach sequences round-trip", () => {
  it("a newly created sequence shows up in the GET listing", async () => {
    const { POST, GET } = await import(
      "@/app/api/outreach/sequences/route"
    );

    // Create a sequence
    const createReq = new NextRequest(
      "http://localhost:3000/api/outreach/sequences",
      {
        method: "POST",
        body: JSON.stringify({
          coachId: "coach-roundtrip",
          coachName: "Coach Roundtrip",
          school: "Ohio State",
          tier: "Tier 1",
        }),
      }
    );
    const createRes = await POST(createReq);
    const createData = await createRes.json();
    const createdId = createData.sequence.id;

    // List sequences
    const listReq = new NextRequest(
      "http://localhost:3000/api/outreach/sequences"
    );
    const listRes = await GET(listReq);
    const listData = await listRes.json();

    const found = listData.sequences.find(
      (s: { id: string }) => s.id === createdId
    );
    expect(found).toBeDefined();
    expect(found.coachName).toBe("Coach Roundtrip");
    expect(found.school).toBe("Ohio State");
  });
});
