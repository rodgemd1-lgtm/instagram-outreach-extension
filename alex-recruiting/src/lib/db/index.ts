import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.JIB_DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool, { schema });
export type Database = typeof db;

// In-memory fallback store for development without a database
export const memoryStore = {
  coaches: [] as Record<string, unknown>[],
  schools: [] as Record<string, unknown>[],
  posts: [] as Record<string, unknown>[],
  dmMessages: [] as Record<string, unknown>[],
  engagementLog: [] as Record<string, unknown>[],
  profileAudits: [] as Record<string, unknown>[],
  competitorRecruits: [] as Record<string, unknown>[],
  analyticsSnapshots: [] as Record<string, unknown>[],
};

export function isDbConfigured(): boolean {
  return !!process.env.JIB_DATABASE_URL && process.env.JIB_DATABASE_URL !== "your_postgresql_connection_string_here";
}
