"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { SupabaseDatabase } from "@/types/database";

const SUPABASE_ENV_ERROR =
  "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. " +
  "In Vercel: Project → Settings → Environment Variables → add both for Production/Preview → Redeploy.";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(SUPABASE_ENV_ERROR);
  }
  return createBrowserClient<SupabaseDatabase>(url, anonKey);
}
