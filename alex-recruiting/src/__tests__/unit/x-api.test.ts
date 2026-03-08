import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPost = vi.fn();

vi.mock("axios", () => ({
  default: {
    post: mockPost,
  },
}));

describe("X write APIs", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.X_API_CONSUMER_KEY = "consumer-key";
    process.env.X_API_CONSUMER_SECRET = "consumer-secret";
    process.env.X_API_ACCESS_TOKEN = "access-token";
    process.env.X_API_ACCESS_TOKEN_SECRET = "access-token-secret";
    process.env.X_USER_ID = "source-user-1";
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

  it("uses OAuth 1.0a to follow a user", async () => {
    mockPost.mockResolvedValue({
      data: {
        data: {
          following: true,
        },
      },
      status: 200,
    });

    const { followUser } = await import("@/lib/integrations/x-api");
    const result = await followUser("target-user-1");

    expect(result).toBe(true);
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost.mock.calls[0][0]).toBe(
      "https://api.twitter.com/2/users/source-user-1/following"
    );
    expect(mockPost.mock.calls[0][1]).toEqual({ target_user_id: "target-user-1" });
    expect(mockPost.mock.calls[0][2].headers.Authorization).toMatch(/^OAuth /);
  });

  it("uses OAuth 1.0a to like a tweet", async () => {
    mockPost.mockResolvedValue({
      data: {
        data: {
          liked: true,
        },
      },
      status: 200,
    });

    const { likeTweet } = await import("@/lib/integrations/x-api");
    const result = await likeTweet("tweet-123");

    expect(result).toBe(true);
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost.mock.calls[0][0]).toBe(
      "https://api.twitter.com/2/users/source-user-1/likes"
    );
    expect(mockPost.mock.calls[0][1]).toEqual({ tweet_id: "tweet-123" });
    expect(mockPost.mock.calls[0][2].headers.Authorization).toMatch(/^OAuth /);
  });
});
