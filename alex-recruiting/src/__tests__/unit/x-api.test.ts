import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPost = vi.fn();

vi.mock("axios", () => ({
  default: {
    post: mockPost,
  },
}));

describe("sendDM", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.X_API_CONSUMER_KEY = "consumer-key";
    process.env.X_API_CONSUMER_SECRET = "consumer-secret";
    process.env.X_API_ACCESS_TOKEN = "access-token";
    process.env.X_API_ACCESS_TOKEN_SECRET = "access-token-secret";
  });

  it("uses OAuth 1.0a to send a DM", async () => {
    mockPost.mockResolvedValue({
      data: {
        data: {
          id: "dm-123",
        },
      },
    });

    const { sendDM } = await import("@/lib/integrations/x-api");
    const result = await sendDM("recipient-1", "Hello coach");

    expect(result).toEqual({ id: "dm-123" });
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost.mock.calls[0][0]).toBe(
      "https://api.twitter.com/2/dm_conversations/with/recipient-1/messages"
    );
    expect(mockPost.mock.calls[0][2].headers.Authorization).toMatch(/^OAuth /);
  });

  it("returns null when OAuth 1.0a fails", async () => {
    mockPost.mockRejectedValueOnce(new Error("auth failed"));

    const { sendDM } = await import("@/lib/integrations/x-api");
    const result = await sendDM("recipient-2", "Fallback test");

    expect(result).toBeNull();
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
