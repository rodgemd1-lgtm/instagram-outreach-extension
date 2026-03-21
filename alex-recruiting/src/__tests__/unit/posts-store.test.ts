/**
 * posts/store unit tests
 *
 * The store module uses process.cwd() to locate .posts-store.json. We point
 * cwd to a temp directory so tests run in complete isolation — no real file
 * is read or written outside the temp dir.
 */
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

// We need to control the CWD so the store reads/writes inside a temp dir.
let tempDir: string;
let originalCwd: () => string;

/** Helper to build a valid Post object with overrides */
function makePost(overrides: Record<string, unknown> = {}) {
  return {
    id: "test-id",
    createdAt: "2025-06-01T00:00:00Z",
    updatedAt: "2025-06-01T00:00:00Z",
    status: "draft" as const,
    pillar: "performance" as const,
    content: "",
    hashtags: [],
    mediaUrl: null,
    scheduledFor: "",
    bestTime: "",
    xPostId: null,
    impressions: 0,
    engagements: 0,
    engagementRate: 0,
    ...overrides,
  };
}

/** Helper to build insert data (no id/createdAt/updatedAt) */
function makeInsertData(overrides: Record<string, unknown> = {}) {
  return {
    status: "draft" as const,
    pillar: "performance" as const,
    content: "",
    hashtags: [],
    mediaUrl: null,
    scheduledFor: "",
    bestTime: "",
    xPostId: null,
    impressions: 0,
    engagements: 0,
    engagementRate: 0,
    ...overrides,
  };
}

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "posts-store-test-"));
  originalCwd = process.cwd;
  vi.spyOn(process, "cwd").mockReturnValue(tempDir);
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

async function getStore() {
  return import("@/lib/posts/store");
}

// ─── getAllPosts ──────────────────────────────────────────────────────────────

describe("getAllPosts", () => {
  test("returns empty array when store file does not exist", async () => {
    const { getAllPosts } = await getStore();
    expect(getAllPosts()).toEqual([]);
  });

  test("returns posts sorted newest first", async () => {
    const storePath = path.join(tempDir, ".posts-store.json");
    const posts = [
      makePost({ id: "old", createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" }),
      makePost({ id: "new", createdAt: "2025-06-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z" }),
    ];
    fs.writeFileSync(storePath, JSON.stringify(posts));
    const { getAllPosts } = await getStore();
    const result = getAllPosts();
    expect(result[0].id).toBe("new");
    expect(result[1].id).toBe("old");
  });

  test("returns all posts", async () => {
    const storePath = path.join(tempDir, ".posts-store.json");
    const posts = Array.from({ length: 5 }, (_, i) =>
      makePost({
        id: `post-${i}`,
        createdAt: `2025-0${i + 1}-01T00:00:00Z`,
        updatedAt: `2025-0${i + 1}-01T00:00:00Z`,
      })
    );
    fs.writeFileSync(storePath, JSON.stringify(posts));
    const { getAllPosts } = await getStore();
    expect(getAllPosts()).toHaveLength(5);
  });
});

// ─── getPostById ──────────────────────────────────────────────────────────────

describe("getPostById", () => {
  test("returns undefined for unknown id", async () => {
    const { getPostById } = await getStore();
    expect(getPostById("does-not-exist")).toBeUndefined();
  });

  test("returns matching post when found", async () => {
    const storePath = path.join(tempDir, ".posts-store.json");
    const posts = [
      makePost({
        id: "abc-123",
        content: "Hook text",
        pillar: "performance" as const,
      }),
    ];
    fs.writeFileSync(storePath, JSON.stringify(posts));
    const { getPostById } = await getStore();
    const result = getPostById("abc-123");
    expect(result?.id).toBe("abc-123");
    expect(result?.content).toBe("Hook text");
  });
});

// ─── insertPost ───────────────────────────────────────────────────────────────

describe("insertPost", () => {
  test("assigns a generated id with post- prefix", async () => {
    const { insertPost } = await getStore();
    const post = insertPost(makeInsertData({ content: "My hook" }));
    expect(post.id).toBeTruthy();
    expect(post.id.startsWith("post-")).toBe(true);
  });

  test("auto-fills createdAt and updatedAt as ISO strings", async () => {
    const { insertPost } = await getStore();
    const post = insertPost(makeInsertData());
    expect(new Date(post.createdAt).getTime()).not.toBeNaN();
    expect(new Date(post.updatedAt).getTime()).not.toBeNaN();
  });

  test("preserves all provided fields", async () => {
    const { insertPost } = await getStore();
    const post = insertPost(makeInsertData({
      status: "approved" as const,
      pillar: "work_ethic" as const,
      content: "The hook",
      hashtags: ["OL", "Film"],
    }));
    expect(post.status).toBe("approved");
    expect(post.pillar).toBe("work_ethic");
    expect(post.content).toBe("The hook");
    expect(post.hashtags).toEqual(["OL", "Film"]);
  });

  test("persists post to store file", async () => {
    const storePath = path.join(tempDir, ".posts-store.json");
    const { insertPost, getAllPosts } = await getStore();
    insertPost(makeInsertData());
    expect(fs.existsSync(storePath)).toBe(true);
    const stored = JSON.parse(fs.readFileSync(storePath, "utf8")) as object[];
    expect(stored).toHaveLength(1);
  });

  test("sequential inserts accumulate in store", async () => {
    const { insertPost, getAllPosts } = await getStore();
    insertPost(makeInsertData({ content: "H1" }));
    insertPost(makeInsertData({ pillar: "work_ethic" as const, content: "H2" }));
    expect(getAllPosts()).toHaveLength(2);
  });
});

// ─── updatePost ───────────────────────────────────────────────────────────────

describe("updatePost", () => {
  test("returns null when post is not found", async () => {
    const { updatePost } = await getStore();
    expect(updatePost("not-found", { status: "posted" })).toBeNull();
  });

  test("updates status and returns updated post", async () => {
    const { insertPost, updatePost } = await getStore();
    const post = insertPost(makeInsertData({ content: "Old hook" }));
    const updated = updatePost(post.id, { status: "posted" });
    expect(updated?.status).toBe("posted");
    expect(updated?.content).toBe("Old hook"); // unchanged fields preserved
  });

  test("id is preserved after update", async () => {
    const { insertPost, updatePost } = await getStore();
    const post = insertPost(makeInsertData());
    const updated = updatePost(post.id, { status: "approved" });
    expect(updated?.id).toBe(post.id);
  });

  test("updatedAt is refreshed after update", async () => {
    const { insertPost, updatePost } = await getStore();
    const post = insertPost(makeInsertData());
    const originalUpdated = post.updatedAt;

    // Ensure at least 1ms passes
    await new Promise((r) => setTimeout(r, 2));

    const updated = updatePost(post.id, { status: "approved" });
    expect(updated?.updatedAt).not.toBe(originalUpdated);
  });
});
