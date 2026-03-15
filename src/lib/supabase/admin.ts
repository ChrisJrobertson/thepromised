import { createClient } from "@supabase/supabase-js";

import type { SupabaseDatabase } from "@/types/database";

// Service role client — bypasses RLS
// Only use in webhooks, cron jobs, and server-side admin operations.
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase service role credentials");
  }

  return createClient<SupabaseDatabase>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
