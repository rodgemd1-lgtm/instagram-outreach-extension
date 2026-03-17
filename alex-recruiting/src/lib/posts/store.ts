import fs from "fs";
import path from "path";
import type { Post } from "@/lib/types";

const STORE_PATH = path.join(process.cwd(), ".posts-store.json");

function readStore(): Post[] {
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf8")) as Post[];
  } catch {
    return [];
  }
}

function writeStore(posts: Post[]): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(posts, null, 2));
}

function generateId(): string {
  return `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getAllPosts(): Post[] {
  return readStore().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getPostById(id: string): Post | undefined {
  return readStore().find((post) => post.id === id);
}

export function insertPost(data: Omit<Post, "id" | "createdAt" | "updatedAt">): Post {
  const store = readStore();
  const now = new Date().toISOString();
  const post: Post = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  store.push(post);
  writeStore(store);
  return post;
}

export function updatePost(id: string, updates: Partial<Post>): Post | null {
  const store = readStore();
  const index = store.findIndex((post) => post.id === id);
  if (index === -1) return null;

  store[index] = {
    ...store[index],
    ...updates,
    id: store[index].id,
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
  return store[index];
}
