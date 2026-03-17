/**
 * Run the schools_v2 migration via direct PostgreSQL connection.
 * Usage: node scripts/run-migration.cjs
 */
const { Client } = require("pg");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("Missing SUPABASE_DB_PASSWORD in .env.local");
  process.exit(1);
}

const connectionString = `postgresql://postgres.efaghirebctkrtqfhskx:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    console.log("Connecting to Supabase PostgreSQL...");
    await client.connect();
    console.log("Connected!");

    const sql = fs.readFileSync("supabase/migrations/20260316_schools_table.sql", "utf8");
    console.log("Running migration...");
    await client.query(sql);
    console.log("Migration complete!");

    // Verify
    const { rows } = await client.query("SELECT count(*) FROM schools_v2");
    console.log("schools_v2 row count:", rows[0].count);

    // Check new coaches columns
    const { rows: cols } = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'coaches' AND column_name IN ('dl_need_score', 'position_type', 'school_slug') ORDER BY column_name"
    );
    console.log("New coaches columns:", cols.map((r) => r.column_name).join(", "));
  } catch (err) {
    console.error("Migration error:", err.message);
    if (err.message.includes("already exists")) {
      console.log("(Table may already exist — this is OK)");
    }
  } finally {
    await client.end();
  }
}

run();
