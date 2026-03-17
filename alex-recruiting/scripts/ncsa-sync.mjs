import nextEnv from "@next/env";
import { syncNcsaDashboard } from "../src/lib/scraping/ncsa-browser-sync.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const output = await syncNcsaDashboard();
console.log(JSON.stringify(output, null, 2));
