import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockInsert = vi.fn();
const mockFrom = vi.fn(() => ({ insert: mockInsert }));
const mockCreateAdminClient = vi.fn(() => ({ from: mockFrom }));
const mockIsSupabaseConfigured = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mockCreateAdminClient,
  isSupabaseConfigured: mockIsSupabaseConfigured,
}));

const originalResendApiKey = process.env.RESEND_API_KEY;

describe("POST /api/recruit/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    delete process.env.RESEND_API_KEY;
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    if (originalResendApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalResendApiKey;
    }

    vi.restoreAllMocks();
  });

  it("rejects missing coaching title", async () => {
    mockIsSupabaseConfigured.mockReturnValue(true);

    const { POST } = await import("@/app/api/recruit/contact/route");
    const response = await POST(
      new Request("http://localhost/api/recruit/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Coach",
          school: "Test U",
          email: "test@example.com",
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Name, title, school, and email are required.",
    });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("returns 503 when Supabase storage is unavailable", async () => {
    mockIsSupabaseConfigured.mockReturnValue(false);

    const { POST } = await import("@/app/api/recruit/contact/route");
    const response = await POST(
      new Request("http://localhost/api/recruit/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Coach",
          title: "Head Coach",
          school: "Test U",
          email: "test@example.com",
        }),
      })
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Recruit contact storage is unavailable.",
    });
  });

  it("persists coaching_position alongside coach_title", async () => {
    mockIsSupabaseConfigured.mockReturnValue(true);
    mockInsert.mockResolvedValue({ error: null });

    const { POST } = await import("@/app/api/recruit/contact/route");
    const response = await POST(
      new Request("http://localhost/api/recruit/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: " Test Coach ",
          title: " Head Coach ",
          school: " Test U ",
          email: " test@example.com ",
          message: " Interested in Jacob. ",
        }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(mockFrom).toHaveBeenCalledWith("coach_inquiries");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        coach_name: "Test Coach",
        coach_title: "Head Coach",
        coaching_position: "Head Coach",
        school: "Test U",
        email: "test@example.com",
        message: "Interested in Jacob.",
        phone: null,
        ncaa_compliant: false,
        status: "pending",
      })
    );
    expect(mockInsert.mock.calls[0]?.[0]?.created_at).toEqual(expect.any(String));
  });

  it("returns 500 when the Supabase insert fails", async () => {
    mockIsSupabaseConfigured.mockReturnValue(true);
    mockInsert.mockResolvedValue({
      error: {
        message: "null value in column coaching_position violates not-null constraint",
      },
    });

    const { POST } = await import("@/app/api/recruit/contact/route");
    const response = await POST(
      new Request("http://localhost/api/recruit/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Coach",
          title: "Head Coach",
          school: "Test U",
          email: "test@example.com",
        }),
      })
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to save inquiry. Please email us directly.",
    });
    expect(console.log).not.toHaveBeenCalled();
  });
});
