import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import type { SupabaseDatabase } from "@/types/database";

const SUPABASE_ENV_ERROR =
  "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. " +
  "In Vercel: Project → Settings → Environment Variables → add both for Production/Preview → Redeploy.";

/**
 * Anon key only — no cookies. Safe for published/public rows under RLS.
 * Use when `cookies()` is unavailable (e.g. generateStaticParams, sitemap build).
 */
export function createAnonReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(SUPABASE_ENV_ERROR);
  }
  return createSupabaseJsClient<SupabaseDatabase>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(SUPABASE_ENV_ERROR);
  }

  const cookieStore = await cookies();

  return createServerClient<SupabaseDatabase>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // If called from a Server Component, cookie writes are ignored.
          }
        },
      },
    },
  );
}
