import { beforeEach, describe, expect, it, vi } from "vitest";

const mockVerifyHandle = vi.fn();
const mockFollowUser = vi.fn();
const mockSearchTweets = vi.fn();
const mockLikeTweet = vi.fn();
const mockCreateAdminClient = vi.fn();
const mockIsSupabaseConfigured = vi.fn();

vi.mock("@/lib/integrations/x-api", () => ({
  verifyHandle: mockVerifyHandle,
  followUser: mockFollowUser,
  searchTweets: mockSearchTweets,
  likeTweet: mockLikeTweet,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mockCreateAdminClient,
  isSupabaseConfigured: mockIsSupabaseConfigured,
}));

function createFollowQuery(coaches: unknown[]) {
  const chain: Record<string, unknown> = {
    is: vi.fn(() => chain),
    not: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn().mockResolvedValue({ data: coaches, error: null }),
  };

  return chain;
}

describe("autoFollowCoaches", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockIsSupabaseConfigured.mockReturnValue(true);
  });

  it("verifies handles, follows users, and updates the database", async () => {
    const coaches = [
      { id: "coach-1", name: "Coach One", school: "Alabama", x_handle: "@coachone" },
      { id: "coach-2", name: "Coach Two", school: "Wisconsin", x_handle: "@coachtwo" },
    ];
    const followQuery = createFollowQuery(coaches);
    const updateEq = vi
      .fn()
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null });
    const update = vi.fn(() => ({ eq: updateEq }));
    const from = vi.fn(() => ({
      select: vi.fn(() => followQuery),
      update,
    }));

    mockCreateAdminClient.mockReturnValue({ from });
    mockVerifyHandle
      .mockResolvedValueOnce({ id: "x-user-1" })
      .mockResolvedValueOnce({ id: "x-user-2" });
    mockFollowUser.mockResolvedValue(true);

    const { autoFollowCoaches } = await import("@/lib/growth/auto-engage");
    const result = await autoFollowCoaches(2);

    expect(result.followed).toBe(2);
    expect(result.errors).toEqual([]);
    expect(result.details).toEqual([
      { coach: "Coach One", school: "Alabama", status: "followed" },
      { coach: "Coach Two", school: "Wisconsin", status: "followed" },
    ]);
    expect(mockVerifyHandle).toHaveBeenNthCalledWith(1, "@coachone");
    expect(mockVerifyHandle).toHaveBeenNthCalledWith(2, "@coachtwo");
    expect(mockFollowUser).toHaveBeenNthCalledWith(1, "x-user-1");
    expect(mockFollowUser).toHaveBeenNthCalledWith(2, "x-user-2");
    expect(update).toHaveBeenCalledTimes(2);
    expect(updateEq).toHaveBeenCalledTimes(2);
  });

  it("stops and returns partial results when X rate limits a follow run", async () => {
    const coaches = [
      { id: "coach-1", name: "Coach One", school: "Alabama", x_handle: "@coachone" },
      { id: "coach-2", name: "Coach Two", school: "Wisconsin", x_handle: "@coachtwo" },
    ];
    const followQuery = createFollowQuery(coaches);
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq: updateEq }));
    const from = vi.fn(() => ({
      select: vi.fn(() => followQuery),
      update,
    }));

    mockCreateAdminClient.mockReturnValue({ from });
    mockVerifyHandle
      .mockResolvedValueOnce({ id: "x-user-1" })
      .mockRejectedValueOnce({ response: { status: 429 } });
    mockFollowUser.mockResolvedValueOnce(true);

    const { autoFollowCoaches } = await import("@/lib/growth/auto-engage");
    const result = await autoFollowCoaches(2);

    expect(result.followed).toBe(1);
    expect(result.details).toEqual([
      { coach: "Coach One", school: "Alabama", status: "followed" },
      { coach: "Coach Two", school: "Wisconsin", status: "error" },
    ]);
    expect(result.errors).toContain(
      "X rate limit reached while processing Coach Two; stopped after 1 follows"
    );
    expect(mockFollowUser).toHaveBeenCalledTimes(1);
    expect(updateEq).toHaveBeenCalledTimes(1);
  });
});

describe("autoEngageCoachContent", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("likes matching tweets up to the requested limit", async () => {
    mockSearchTweets.mockResolvedValue([
      { id: "tweet-1" },
      { id: "tweet-2" },
      { id: "tweet-3" },
    ]);
    mockLikeTweet.mockResolvedValue(true);

    const { autoEngageCoachContent } = await import("@/lib/growth/auto-engage");
    const result = await autoEngageCoachContent(2);

    expect(result).toEqual({ liked: 2, errors: [] });
    expect(mockSearchTweets).toHaveBeenCalledTimes(1);
    expect(mockLikeTweet).toHaveBeenCalledTimes(2);
    expect(mockLikeTweet).toHaveBeenNthCalledWith(1, "tweet-1");
    expect(mockLikeTweet).toHaveBeenNthCalledWith(2, "tweet-2");
  });

  it("returns partial like results when X rate limits engagement", async () => {
    mockSearchTweets.mockResolvedValue([{ id: "tweet-1" }, { id: "tweet-2" }]);
    mockLikeTweet
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce({ response: { status: 429 } });

    const { autoEngageCoachContent } = await import("@/lib/growth/auto-engage");
    const result = await autoEngageCoachContent(5);

    expect(result.liked).toBe(1);
    expect(result.errors).toContain(
      "X rate limit reached after 1 likes; stopped before tweet tweet-2"
    );
    expect(mockLikeTweet).toHaveBeenCalledTimes(2);
  });
});
