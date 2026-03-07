import { db, isDbConfigured } from "@/lib/db";
import { conversationHistory } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// ---------------------------------------------------------------------------
// In-memory fallback when Postgres is not configured
// ---------------------------------------------------------------------------
const memoryHistory: Record<string, { role: string; content: string; createdAt: Date }[]> = {};

function getMemoryBucket(memberId: string) {
  if (!memoryHistory[memberId]) {
    memoryHistory[memberId] = [];
  }
  return memoryHistory[memberId];
}

// ---------------------------------------------------------------------------
// saveMessage — persists a single user or assistant message
// ---------------------------------------------------------------------------
export async function saveMessage(
  memberId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  if (isDbConfigured()) {
    try {
      await db.insert(conversationHistory).values({
        memberId,
        role,
        content,
      });
      return;
    } catch {
      // Fall through to in-memory store on DB error
    }
  }

  const bucket = getMemoryBucket(memberId);
  bucket.push({ role, content, createdAt: new Date() });
}

// ---------------------------------------------------------------------------
// getHistory — returns the last N messages for a persona, oldest first
// ---------------------------------------------------------------------------
export async function getHistory(
  memberId: string,
  limit: number = 20
): Promise<{ role: string; content: string }[]> {
  if (isDbConfigured()) {
    try {
      const rows = await db
        .select({
          role: conversationHistory.role,
          content: conversationHistory.content,
        })
        .from(conversationHistory)
        .where(eq(conversationHistory.memberId, memberId))
        .orderBy(desc(conversationHistory.createdAt))
        .limit(limit);

      // Reverse so oldest messages come first (chronological order)
      return rows.reverse();
    } catch {
      // Fall through to in-memory store on DB error
    }
  }

  const bucket = getMemoryBucket(memberId);
  return bucket.slice(-limit).map(({ role, content }) => ({ role, content }));
}

// ---------------------------------------------------------------------------
// clearHistory — removes all conversation history for a persona
// ---------------------------------------------------------------------------
export async function clearHistory(memberId: string): Promise<void> {
  if (isDbConfigured()) {
    try {
      await db
        .delete(conversationHistory)
        .where(eq(conversationHistory.memberId, memberId));
      return;
    } catch {
      // Fall through to in-memory store on DB error
    }
  }

  memoryHistory[memberId] = [];
}
