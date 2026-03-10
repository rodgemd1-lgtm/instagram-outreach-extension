import fs from "node:fs";
import path from "node:path";

function loadLocalEnv() {
  for (const fileName of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) continue;

    const raw = fs.readFileSync(filePath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

loadLocalEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const requiredColumns = [
  "coach_name",
  "school",
  "coaching_position",
  "email",
  "ncaa_compliant",
  "status",
  "created_at",
  "coach_title",
];

const forbiddenColumns = ["school_name"];

async function main() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: "application/openapi+json",
    },
  });

  if (!res.ok) {
    throw new Error(`Supabase schema request failed with ${res.status}`);
  }

  const body = await res.json();
  const schema =
    body?.definitions?.coach_inquiries ??
    body?.components?.schemas?.coach_inquiries;

  if (!schema?.properties) {
    throw new Error("coach_inquiries schema was not returned by Supabase.");
  }

  const propertyNames = Object.keys(schema.properties);
  const missing = requiredColumns.filter((column) => !propertyNames.includes(column));
  const forbidden = forbiddenColumns.filter((column) =>
    propertyNames.includes(column)
  );

  if (missing.length > 0 || forbidden.length > 0) {
    if (missing.length > 0) {
      console.error(`Missing required columns: ${missing.join(", ")}`);
    }

    if (forbidden.length > 0) {
      console.error(`Unexpected legacy columns present: ${forbidden.join(", ")}`);
    }

    process.exit(1);
  }

  console.log("coach_inquiries schema matches the production contract.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
