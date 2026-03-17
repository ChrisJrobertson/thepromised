import { NextResponse } from "next/server";

import { AI_LIMITS } from "@/lib/ai/constants";
import { getMonthlyUsage } from "@/lib/ai/usage";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("subscription_tier, ai_suggestions_used, ai_letters_used")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileData) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const profile = profileData as Pick<
    Profile,
    "subscription_tier" | "ai_suggestions_used" | "ai_letters_used"
  >;
  const tier = profile.subscription_tier;
  const limits = AI_LIMITS[tier] ?? AI_LIMITS.free;

  if (tier === "free") {
    const monthly = await getMonthlyUsage(supabase, user.id);
    return NextResponse.json({
      suggestionsUsed: monthly.suggestions_used,
      suggestionsLimit: limits.suggestions,
      lettersUsed: monthly.letters_used,
      lettersLimit: limits.letters,
      tier: "free",
    });
  }

  return NextResponse.json({
    suggestionsUsed: profile.ai_suggestions_used,
    suggestionsLimit: limits.suggestions,
    lettersUsed: profile.ai_letters_used,
    lettersLimit: limits.letters,
    tier,
  });
}
