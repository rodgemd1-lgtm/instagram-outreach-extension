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
      {
        id: "old", createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z", status: "Draft",
        pillar: "performance", hook: "", caption: "", mediaType: "text", tags: [],
      },
      {
        id: "new", createdAt: "2025-06-01T00:00:00Z",
        updatedAt: "2025-06-01T00:00:00Z", status: "Draft",
        pillar: "performance", hook: "", caption: "", mediaType: "text", tags: [],
      },
    ];
    fs.writeFileSync(storePath, JSON.stringify(posts));
    const { getAllPosts } = await getStore();
    const result = getAllPosts();
    expect(result[0].id).toBe("new");
    expect(result[1].id).toBe("old");
  });

  test("returns all posts", async () => {
    const storePath = path.join(tempDir, ".posts-store.json");
    const posts = Array.from({ length: 5 }, (_, i) => ({
      id: `post-${i}`,
      createdAt: `2025-0${i + 1}-01T00:00:00Z`,
      updatedAt: `2025-0${i + 1}-01T00:00:00Z`,
      status: "Draft", pillar: "performance",
      hook: "", caption: "", mediaType: "text", tags: [],
    }));
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
      {
        id: "abc-123", createdAt: "2025-06-01T00:00:00Z",
        updatedAt: "2025-06-01T00:00:00Z", status: "Draft",
        pillar: "performance", hook: "Hook text",
        caption: "Caption", mediaType: "video", tags: ["OL"],
      },
    ];
    fs.writeFileSync(storePath, JSON.stringify(posts));
    const { getPostById } = await getStore();
    const result = getPostById("abc-123");
    expect(result?.id).toBe("abc-123");
    expect(result?.hook).toBe("Hook text");
  });
});

// ─── insertPost ───────────────────────────────────────────────────────────────

describe("insertPost", () => {
  test("assigns a generated id with post- prefix", async () => {
    const { insertPost } = await getStore();
    const post = insertPost({
      status: "Draft", pillar: "performance",
      hook: "My hook", caption: "Caption", mediaType: "text", tags: [],
    });
    expect(post.id).toBeTruthy();
    expect(post.id.startsWith("post-")).toBe(true);
  });

  test("auto-fills createdAt and updatedAt as ISO strings", async () => {
    const { insertPost } = await getStore();
    const post = insertPost({
      status: "Draft", pillar: "performance",
      hook: "H", caption: "C", mediaType: "text", tags: [],
    });
    expect(new Date(post.createdAt).getTime()).not.toBeNaN();
    expect(new Date(post.updatedAt).getTime()).not.toBeNaN();
  });

  test("preserves all provided fields", async () => {
    const { insertPost } = await getStore();
    const post = insertPost({
      status: "Ready", pillar: "work_ethic",
      hook: "The hook", caption: "The cap",
      mediaType: "video", tags: ["OL", "Film"],
    });
    expect(post.status).toBe("Ready");
    expect(post.pillar).toBe("work_ethic");
    expect(post.hook).toBe("The hook");
    expect(post.caption).toBe("The cap");
    expect(post.mediaType).toBe("video");
    expect(post.tags).toEqual(["OL", "Film"]);
  });

  test("persists post to store file", async () => {
    const storePath = path.join(tempDir, ".posts-store.json");
    const { insertPost, getAllPosts } = await getStore();
    insertPost({
      status: "Draft", pillar: "performance",
      hook: "H", caption: "C", mediaType: "text", tags: [],
    });
    expect(fs.existsSync(storePath)).toBe(true);
    const stored = JSON.parse(fs.readFileSync(storePath, "utf8")) as object[];
    expect(stored).toHaveLength(1);
  });

  test("sequential inserts accumulate in store", async () => {
    const { insertPost, getAllPosts } = await getStore();
    insertPost({ status: "Draft", pillar: "performance", hook: "H1", caption: "C1", mediaType: "text", tags: [] });
    insertPost({ status: "Draft", pillar: "work_ethic", hook: "H2", caption: "C2", mediaType: "text", tags: [] });
    expect(getAllPosts()).toHaveLength(2);
  });
});

// ─── updatePost ───────────────────────────────────────────────────────────────

describe("updatePost", () => {
  test("returns null when post is not found", async () => {
    const { updatePost } = await getStore();
    expect(updatePost("not-found", { status: "Posted" })).toBeNull();
  });

  test("updates status and returns updated post", async () => {
    const { insertPost, updatePost } = await getStore();
    const post = insertPost({
      status: "Draft", pillar: "performance",
      hook: "Old hook", caption: "Old cap", mediaType: "text", tags: [],
    });
    const updated = updatePost(post.id, { status: "Posted" });
    expect(updated?.status).toBe("Posted");
    expect(updated?.hook).toBe("Old hook"); // unchanged fields preserved
  });

  test("id is preserved after update", async () => {
    const { insertPost, updatePost } = await getStore();
    const post = insertPost({
      status: "Draft", pillar: "performance",
      hook: "H", caption: "C", mediaType: "text", tags: [],
    });
    const updated = updatePost(post.id, { status: "Ready" });
    expect(updated?.id).toBe(post.id);
  });

  test("updatedAt is refreshed after update", async () => {
    const { insertPost, updatePost } = await getStore();
    const post = insertPost({
      status: "Draft", pillar: "performance",
      hook: "H", caption: "C", mediaType: "text", tags: [],
    });
    const originalUpdated = post.updatedAt;

    // Ensure at least 1ms passes
    await new Promise((r) => setTimeout(r, 2));

    const updated = updatePost(post.id, { status: "Ready" });
    expect(updated?.updatedAt).not.toBe(originalUpdated);
  });
});
