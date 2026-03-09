import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPost = vi.fn();
const mockGet = vi.fn();
const mockReadFile = vi.fn();
const mockFetch = vi.fn();

vi.mock("axios", () => ({
  default: {
    post: mockPost,
    get: mockGet,
  },
}));

vi.mock("fs/promises", () => ({
  default: {
    readFile: mockReadFile,
  },
}));

describe("X write APIs", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mockFetch);
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

  it("reports whether X write credentials are configured", async () => {
    const { isXWriteConfigured } = await import("@/lib/integrations/x-api");
    expect(isXWriteConfigured()).toBe(true);

    delete process.env.X_API_ACCESS_TOKEN_SECRET;
    expect(isXWriteConfigured()).toBe(false);
  });

  it("uses OAuth 1.0a to update the live X profile", async () => {
    mockPost.mockResolvedValue({
      data: {
        name: "Jacob Rodgers",
        description: "OL/DL recruit",
      },
    });

    const { updateProfile } = await import("@/lib/integrations/x-api");
    const result = await updateProfile({
      name: "Jacob Rodgers",
      description: "OL/DL recruit",
      location: "Pewaukee, WI",
      url: "https://alex-recruiting.vercel.app",
    });

    expect(result).toEqual({
      name: "Jacob Rodgers",
      description: "OL/DL recruit",
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost.mock.calls[0][0]).toBe(
      "https://api.twitter.com/1.1/account/update_profile.json"
    );
    expect(mockPost.mock.calls[0][1]).toContain("name=Jacob%20Rodgers");
    expect(mockPost.mock.calls[0][1]).toContain("description=OL%2FDL%20recruit");
    expect(mockPost.mock.calls[0][2].headers.Authorization).toMatch(/^OAuth /);
  });

  it("retries profile updates without the display name when X blocks name edits", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: {
          data: {
            errors: [
              {
                code: 120,
                message:
                  "Account update failed: Your profile is under review. No new changes are allowed to name and profile photo during the review period.",
              },
            ],
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          description: "OL/DL recruit",
          location: "Pewaukee, WI",
        },
      });

    const { updateProfileWithFeedback } = await import("@/lib/integrations/x-api");
    const result = await updateProfileWithFeedback({
      name: "Jacob Rodgers",
      description: "OL/DL recruit",
      location: "Pewaukee, WI",
    });

    expect(result).toEqual({
      profile: {
        description: "OL/DL recruit",
        location: "Pewaukee, WI",
      },
      skippedFields: ["name"],
    });
    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost.mock.calls[1][1]).not.toContain("name=Jacob%20Rodgers");
    expect(mockPost.mock.calls[1][1]).toContain("description=OL%2FDL%20recruit");
  });

  it("uses OAuth 1.0a to update the live X banner", async () => {
    mockPost.mockResolvedValue({
      status: 200,
      data: "",
    });

    const { updateProfileBanner } = await import("@/lib/integrations/x-api");
    const result = await updateProfileBanner("banner-base64-data");

    expect(result).toBe(true);
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost.mock.calls[0][0]).toBe(
      "https://api.twitter.com/1.1/account/update_profile_banner.json"
    );
    expect(mockPost.mock.calls[0][1]).toContain("banner=banner-base64-data");
    expect(mockPost.mock.calls[0][2].headers.Authorization).toMatch(/^OAuth /);
  });

  it("uses simple upload for image media", async () => {
    mockReadFile.mockResolvedValueOnce(Buffer.from("image-bytes"));
    mockPost
      .mockResolvedValueOnce({
        data: {
          media_id_string: "media-image-1",
          media_key: "3_media-image-1",
        },
      })
      .mockResolvedValueOnce({ data: {} });

    const { uploadMediaFromFile } = await import("@/lib/integrations/x-api");
    const result = await uploadMediaFromFile("/tmp/jacob-photo.jpg", {
      altText: "Jacob Rodgers training photo",
    });

    expect(result).toEqual({
      mediaId: "media-image-1",
      mediaKey: "3_media-image-1",
      mediaType: "image/jpeg",
      mediaCategory: "tweet_image",
      sourcePath: "/tmp/jacob-photo.jpg",
    });
    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost.mock.calls[0][0]).toBe("https://upload.twitter.com/1.1/media/upload.json");
    expect(mockPost.mock.calls[0][1]).toContain("media_category=tweet_image");
    expect(mockPost.mock.calls[1][0]).toBe("https://upload.twitter.com/1.1/media/metadata/create.json");
  });

  it("uses chunked upload for video media and polls status", async () => {
    mockReadFile.mockResolvedValueOnce(Buffer.alloc(1_500_000, 7));
    mockPost
      .mockResolvedValueOnce({
        data: {
          media_id_string: "media-video-1",
          media_key: "7_media-video-1",
        },
      })
      .mockResolvedValueOnce({
        data: {
          processing_info: {
            state: "pending",
            check_after_secs: 0,
          },
        },
      });
    mockFetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true });
    mockGet.mockResolvedValueOnce({
      data: {
        processing_info: {
          state: "succeeded",
        },
      },
    });

    const { uploadMediaFromFile } = await import("@/lib/integrations/x-api");
    const result = await uploadMediaFromFile("/tmp/jacob-clip.mp4");

    expect(result).toEqual({
      mediaId: "media-video-1",
      mediaKey: "7_media-video-1",
      mediaType: "video/mp4",
      mediaCategory: "tweet_video",
      sourcePath: "/tmp/jacob-clip.mp4",
    });
    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost.mock.calls[0][1]).toContain("command=INIT");
    expect(mockPost.mock.calls[1][1]).toContain("command=FINALIZE");
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][0]).toBe("https://upload.twitter.com/1.1/media/upload.json");
    expect(mockFetch.mock.calls[0][1]).toMatchObject({
      method: "POST",
      headers: expect.objectContaining({
        Authorization: expect.stringMatching(/^OAuth /),
      }),
    });
    expect(mockFetch.mock.calls[0][1].body).toBeInstanceOf(FormData);
    expect(mockFetch.mock.calls[1][1].body).toBeInstanceOf(FormData);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet.mock.calls[0][0]).toBe("https://upload.twitter.com/1.1/media/upload.json");
  });
});
