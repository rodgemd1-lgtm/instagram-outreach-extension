#!/usr/bin/env node
/**
 * Run Supabase migration via the Management API or SQL endpoint.
 * Usage: node scripts/run-migration.mjs
 */

import { readFileSync } from "fs";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const key = serviceKey || anonKey;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or key in .env.local");
  process.exit(1);
}

const sql = readFileSync("supabase/migrations/20260316_schools_table.sql", "utf8");

// Split into individual statements and run each
const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

console.log(`Running ${statements.length} SQL statements...`);

let success = 0;
let errors = 0;

for (const stmt of statements) {
  try {
    const res = await fetch(`${url}/rest/v1/rpc/`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({}),
    });
    // RPC won't work for DDL — try the pg_dump approach via supabase-js
  } catch (e) {
    // Expected — we'll use the createClient approach
  }
}

// Use @supabase/supabase-js to run raw SQL via rpc
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

// Run each statement individually
for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  const preview = stmt.substring(0, 80).replace(/\n/g, " ");

  try {
    // Use Supabase's rpc to execute raw SQL (requires a helper function)
    const { error } = await supabase.rpc("exec_sql", { sql_text: stmt + ";" });

    if (error) {
      // If exec_sql doesn't exist, try direct table creation check
      console.log(`  [${i + 1}] SKIP (rpc not available): ${preview}...`);
      errors++;
    } else {
      console.log(`  [${i + 1}] OK: ${preview}...`);
      success++;
    }
  } catch (e) {
    console.log(`  [${i + 1}] ERROR: ${e.message} — ${preview}...`);
    errors++;
  }
}

console.log(`\nDone: ${success} succeeded, ${errors} need manual run.`);
console.log("\nIf statements failed, run the migration SQL directly in Supabase SQL Editor:");
console.log(`  ${url.replace(".supabase.co", ".supabase.co")}/project/default/sql`);
console.log("\nOr run: npx supabase link --project-ref efaghirebctkrtqfhskx && npx supabase db push");
