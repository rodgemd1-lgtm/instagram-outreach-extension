import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";

/**
 * Integration tests for the media upload API route.
 *
 * The POST /api/media/upload endpoint requires Supabase to be configured
 * for storage uploads. In the test environment, Supabase is not configured,
 * so the endpoint returns 503. These tests verify the error handling paths.
 */

// ---------------------------------------------------------------------------
// POST /api/media/upload
// ---------------------------------------------------------------------------
describe("POST /api/media/upload", () => {
  it("returns 503 when Supabase is not configured", async () => {
    const { POST } = await import("@/app/api/media/upload/route");

    // Create a FormData-style request with a dummy file
    const formData = new FormData();
    formData.append(
      "file",
      new Blob(["test file content"], { type: "text/plain" }),
      "test.txt"
    );

    const req = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(req);
    expect(response.status).toBe(503);
  });

  it("returns an error message when Supabase is not configured", async () => {
    const { POST } = await import("@/app/api/media/upload/route");

    const formData = new FormData();
    formData.append(
      "file",
      new Blob(["test content"], { type: "image/png" }),
      "photo.png"
    );

    const req = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Supabase is not configured");
  });

  it("returns JSON content type on error", async () => {
    const { POST } = await import("@/app/api/media/upload/route");

    const formData = new FormData();
    formData.append(
      "file",
      new Blob(["data"], { type: "video/mp4" }),
      "clip.mp4"
    );

    const req = new NextRequest("http://localhost:3000/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(req);
    expect(response.headers.get("content-type")).toContain("application/json");
  });
});
