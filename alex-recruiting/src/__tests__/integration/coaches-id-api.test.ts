import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";

/**
 * Integration tests for the coaches/[id] API route.
 *
 * The GET and PUT handlers check `isDbConfigured()` first. In the test
 * environment, the database is not configured, so the route returns
 * 503 ("Database not configured"). These tests verify that fallback
 * behavior and response shape.
 */

// ---------------------------------------------------------------------------
// GET /api/coaches/[id]
// ---------------------------------------------------------------------------
describe("GET /api/coaches/[id]", () => {
  it("returns 503 when the database is not configured", async () => {
    const { GET } = await import("@/app/api/coaches/[id]/route");
    const req = new NextRequest(
      "http://localhost:3000/api/coaches/wisconsin"
    );
    const response = await GET(req, { params: { id: "wisconsin" } });

    expect(response.status).toBe(503);
  });

  it("returns an error message in the response body when DB is not configured", async () => {
    const { GET } = await import("@/app/api/coaches/[id]/route");
    const req = new NextRequest(
      "http://localhost:3000/api/coaches/wisconsin"
    );
    const response = await GET(req, { params: { id: "wisconsin" } });
    const data = await response.json();

    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Database not configured");
  });

  it("returns 503 for any coach id when DB is unavailable", async () => {
    const { GET } = await import("@/app/api/coaches/[id]/route");
    const req = new NextRequest(
      "http://localhost:3000/api/coaches/iowa"
    );
    const response = await GET(req, { params: { id: "iowa" } });

    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.error).toBe("Database not configured");
  });

  it("returns JSON content type", async () => {
    const { GET } = await import("@/app/api/coaches/[id]/route");
    const req = new NextRequest(
      "http://localhost:3000/api/coaches/test-school"
    );
    const response = await GET(req, { params: { id: "test-school" } });

    expect(response.headers.get("content-type")).toContain("application/json");
  });
});

// ---------------------------------------------------------------------------
// PUT /api/coaches/[id]
// ---------------------------------------------------------------------------
describe("PUT /api/coaches/[id]", () => {
  it("returns 503 when the database is not configured", async () => {
    const { PUT } = await import("@/app/api/coaches/[id]/route");
    const req = new NextRequest(
      "http://localhost:3000/api/coaches/wisconsin",
      {
        method: "PUT",
        body: JSON.stringify({ name: "Updated Name" }),
      }
    );
    const response = await PUT(req, { params: { id: "wisconsin" } });

    expect(response.status).toBe(503);
  });

  it("returns an error message when DB is not configured on PUT", async () => {
    const { PUT } = await import("@/app/api/coaches/[id]/route");
    const req = new NextRequest(
      "http://localhost:3000/api/coaches/some-coach-id",
      {
        method: "PUT",
        body: JSON.stringify({
          dmOpen: true,
          followStatus: "following",
        }),
      }
    );
    const response = await PUT(req, { params: { id: "some-coach-id" } });
    const data = await response.json();

    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Database not configured");
  });
});
