import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";

/**
 * Integration tests for the posts API routes.
 *
 * These tests import route handlers directly (no HTTP server needed)
 * and exercise the in-memory fallback paths that work without a
 * Supabase connection. The post store uses a JSON file on disk.
 */

// ---------------------------------------------------------------------------
// GET /api/posts — list posts
// ---------------------------------------------------------------------------
describe("GET /api/posts", () => {
  it("returns a valid response with posts array and total", async () => {
    const { GET } = await import("@/app/api/posts/route");
    const req = new NextRequest("http://localhost:3000/api/posts");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("posts");
    expect(data).toHaveProperty("total");
    expect(Array.isArray(data.posts)).toBe(true);
    expect(typeof data.total).toBe("number");
  });

  it("total matches the length of the posts array", async () => {
    const { GET } = await import("@/app/api/posts/route");
    const req = new NextRequest("http://localhost:3000/api/posts");
    const response = await GET(req);
    const data = await response.json();

    expect(data.total).toBe(data.posts.length);
  });

  it("accepts status query parameter without error", async () => {
    const { GET } = await import("@/app/api/posts/route");
    const req = new NextRequest(
      "http://localhost:3000/api/posts?status=draft"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("posts");
    expect(Array.isArray(data.posts)).toBe(true);
  });

  it("accepts pillar query parameter without error", async () => {
    const { GET } = await import("@/app/api/posts/route");
    const req = new NextRequest(
      "http://localhost:3000/api/posts?pillar=performance"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("posts");
  });

  it("accepts both status and pillar query parameters", async () => {
    const { GET } = await import("@/app/api/posts/route");
    const req = new NextRequest(
      "http://localhost:3000/api/posts?status=draft&pillar=character"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("posts");
    expect(data).toHaveProperty("total");
  });
});

// ---------------------------------------------------------------------------
// POST /api/posts — create a new post
// ---------------------------------------------------------------------------
describe("POST /api/posts", () => {
  it("creates a post and returns 201 with post object", async () => {
    const { POST } = await import("@/app/api/posts/route");
    const req = new NextRequest("http://localhost:3000/api/posts", {
      method: "POST",
      body: JSON.stringify({
        content: "Test post for integration testing",
        pillar: "performance",
        hashtags: ["#TestHash"],
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("post");
    expect(data.post).toHaveProperty("id");
    expect(data.post).toHaveProperty("content");
    expect(data.post).toHaveProperty("pillar");
    expect(data.post).toHaveProperty("createdAt");
    expect(data.post).toHaveProperty("updatedAt");
  });

  it("created post has the correct content and pillar", async () => {
    const { POST } = await import("@/app/api/posts/route");
    const req = new NextRequest("http://localhost:3000/api/posts", {
      method: "POST",
      body: JSON.stringify({
        content: "Grinding in the weight room today",
        pillar: "work_ethic",
        hashtags: ["#Grind", "#OL"],
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data.post.content).toBe("Grinding in the weight room today");
    expect(data.post.pillar).toBe("work_ethic");
    expect(data.post.hashtags).toEqual(["#Grind", "#OL"]);
  });

  it("created post defaults to draft status", async () => {
    const { POST } = await import("@/app/api/posts/route");
    const req = new NextRequest("http://localhost:3000/api/posts", {
      method: "POST",
      body: JSON.stringify({
        content: "Another test post",
        pillar: "character",
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data.post.status).toBe("draft");
  });

  it("rejects post without required pillar field", async () => {
    const { POST } = await import("@/app/api/posts/route");
    const req = new NextRequest("http://localhost:3000/api/posts", {
      method: "POST",
      body: JSON.stringify({
        content: "Post without explicit pillar",
      }),
    });
    const response = await POST(req);

    // Zod validation now requires pillar — posts without it are rejected
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it("created post has zero engagement metrics initially", async () => {
    const { POST } = await import("@/app/api/posts/route");
    const req = new NextRequest("http://localhost:3000/api/posts", {
      method: "POST",
      body: JSON.stringify({
        content: "Post to check engagement defaults",
        pillar: "performance",
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data.post.impressions).toBe(0);
    expect(data.post.engagements).toBe(0);
    expect(data.post.engagementRate).toBe(0);
  });

  it("created post has a unique id", async () => {
    const { POST } = await import("@/app/api/posts/route");

    const req1 = new NextRequest("http://localhost:3000/api/posts", {
      method: "POST",
      body: JSON.stringify({ content: "First post", pillar: "performance" }),
    });
    const req2 = new NextRequest("http://localhost:3000/api/posts", {
      method: "POST",
      body: JSON.stringify({ content: "Second post", pillar: "character" }),
    });

    const res1 = await POST(req1);
    const data1 = await res1.json();
    const res2 = await POST(req2);
    const data2 = await res2.json();

    expect(data1.post.id).not.toBe(data2.post.id);
  });
});
