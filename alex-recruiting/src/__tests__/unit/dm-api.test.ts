import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/dms/route";
import { NextRequest } from "next/server";

// Mocking dependencies
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
  isSupabaseConfigured: () => false, // fallback to memory for test
}));

describe("DM API POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a drafted DM successfully", async () => {
    const payload = {
      coachId: "00000000-0000-0000-0000-000000000123",
      coachName: "Coach Smith",
      schoolName: "Test U",
      templateType: "intro",
      content: "Hey Coach, check out my film.",
      sendNow: false,
    };

    const req = new NextRequest("http://localhost:3000/api/dms", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.dm.status).toBe("drafted");
    expect(data.dm.coachName).toBe("Coach Smith");
    expect(data.dm.content).toBe("Hey Coach, check out my film.");
  });

  it("should set status to sent when sendNow is true in memory fallback", async () => {
    const payload = {
      coachId: "00000000-0000-0000-0000-000000000456",
      coachName: "Coach Johnson",
      schoolName: "Test State",
      templateType: "follow_up",
      content: "Just following up.",
      sendNow: true,
    };

    const req = new NextRequest("http://localhost:3000/api/dms", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.dm.status).toBe("sent"); // Memory fallback handles it this way
    expect(data.dm.sentAt).not.toBeNull();
  });
});
