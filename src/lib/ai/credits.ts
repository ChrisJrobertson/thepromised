import { addMonths } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Profile, SupabaseDatabase } from "@/types/database";

/**
 * Lazily resets monthly AI credit counters if the reset window has passed.
 *
 * Free users have no Stripe subscription so the invoice.paid webhook never fires
 * for them. This ensures their credits still renew monthly by checking the reset
 * date on each API call and resetting inline when due.
 *
 * Returns the current (possibly just-reset) per-feature usage counts.
 */
export async function ensureCreditsResetIfDue(
  profile: Profile,
  userId: string,
  supabase: SupabaseClient<SupabaseDatabase>,
): Promise<{ ai_suggestions_used: number; ai_letters_used: number }> {
  const now = new Date();
  const resetAt = profile.ai_credits_reset_at ? new Date(profile.ai_credits_reset_at) : null;

  if (!resetAt || resetAt < now) {
    await supabase
      .from("profiles")
      .update({
        ai_suggestions_used: 0,
        ai_letters_used: 0,
        ai_credits_used: 0,
        ai_credits_reset_at: addMonths(now, 1).toISOString(),
      })
      .eq("id", userId);

    return { ai_suggestions_used: 0, ai_letters_used: 0 };
  }

  return {
    ai_suggestions_used: profile.ai_suggestions_used,
    ai_letters_used: profile.ai_letters_used,
  };
}
