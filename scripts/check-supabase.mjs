#!/usr/bin/env node
/**
 * Verify Supabase connection, migrations (tables exist), and a user by email.
 * Run from project root with env loaded:
 *   node --env-file=.env.local scripts/check-supabase.mjs
 *   or: npx dotenv -e .env.local -- node scripts/check-supabase.mjs
 *
 * If you don't have Node 20+, create .env.local and run:
 *   export $(grep -v '^#' .env.local | xargs) && node scripts/check-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env.local");

function loadEnvLocal() {
  if (!existsSync(envPath)) {
    console.error(".env.local not found. Create it or run with: node --env-file=.env.local scripts/check-supabase.mjs");
    process.exit(1);
  }
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      process.env[key] = value.replace(/^["']|["']$/g, "").trim();
    }
  }
}

// Load .env.local if NEXT_PUBLIC_SUPABASE_URL not set (e.g. not using --env-file)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  loadEnvLocal();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const targetEmail = "chrisjrobertson@outlook.com";

if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const anonClient = createClient(url, anonKey);
const serviceClient = serviceKey
  ? createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

const EXPECTED_TABLES = [
  "profiles",
  "cases",
  "organisations",
  "interactions",
  "letters",
  "reminders",
  "evidence",
  "exports",
  "escalation_rules",
  "subscription_tiers",
  "monthly_ai_usage",
  "journey_templates",
  "user_journeys",
  "complaint_packs",
  "business_enquiries",
  "reminders",
];

async function main() {
  console.log("Supabase project:", url.replace(/https:\/\/|\.supabase\.co/g, ""));
  console.log("");

  // 1) Validate all tables exist (using anon key)
  console.log("1) Validating tables...");
  const missing = [];
  const ok = [];
  for (const table of [...new Set(EXPECTED_TABLES)]) {
    const { error } = await anonClient.from(table).select("*", { count: "exact", head: true });
    if (error) {
      missing.push(table + " (" + (error.code || error.message) + ")");
    } else {
      ok.push(table);
    }
  }
  if (missing.length) {
    console.log("   Missing/failed:", missing.join(", "));
  } else {
    console.log("   All", ok.length, "tables OK:", ok.join(", "));
  }
  console.log("");

  // 2) Auth user lookup (requires service role)
  console.log("2) Auth user:", targetEmail);
  if (!serviceClient) {
    console.log("   Skip (no SUPABASE_SERVICE_ROLE_KEY in .env.local)");
  } else {
    const { data: { users }, error: listError } = await serviceClient.auth.admin.listUsers({ perPage: 1000 });
    if (listError) {
      console.log("   Error:", listError.message);
      console.log("   Fix: copy the service_role key from Supabase Dashboard → Project Settings → API and set SUPABASE_SERVICE_ROLE_KEY in .env.local");
    } else {
      const user = users?.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
      if (user) {
        console.log("   Found:", user.id, "| created:", user.created_at);
        const { data: profile } = await serviceClient.from("profiles").select("id, full_name, subscription_tier, created_at").eq("id", user.id).single();
        if (profile) console.log("   Profile:", JSON.stringify(profile));
      } else {
        console.log("   No user with that email in auth.users.");
      }
    }
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
