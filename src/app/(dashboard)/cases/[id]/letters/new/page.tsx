import { addMonths } from "date-fns";
import { redirect, notFound } from "next/navigation";

import { AI_LIMITS, type AiTier } from "@/lib/ai/constants";
import { LETTER_TEMPLATES } from "@/lib/ai/letter-templates";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

import { LetterWizard } from "./LetterWizard";

export const metadata = { title: "New Letter — TheyPromised" };

export default async function NewLetterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; stage?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("subscription_tier, ai_letters_used, ai_credits_reset_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileData) redirect("/login");

  type ProfileCredits = Pick<Profile, "subscription_tier" | "ai_letters_used" | "ai_credits_reset_at">;
  const profile = profileData as ProfileCredits;

  const { data: caseData } = await supabase
    .from("cases")
    .select("id, title, reference_number, description, desired_outcome, amount_in_dispute, first_contact_date, category, organisation_id, custom_organisation_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!caseData) notFound();

  // Fetch org name
  let orgName = caseData.custom_organisation_name ?? caseData.title;
  if (caseData.organisation_id) {
    const { data: org } = await supabase
      .from("organisations")
      .select("name")
      .eq("id", caseData.organisation_id)
      .maybeSingle();
    if (org) orgName = org.name;
  }

  const tier = profile.subscription_tier;

  // Lazily reset credit counters if the monthly window has passed
  const resetAt = profile.ai_credits_reset_at ? new Date(profile.ai_credits_reset_at) : null;
  let lettersUsed = profile.ai_letters_used ?? 0;
  if (!resetAt || resetAt < new Date()) {
    lettersUsed = 0;
    await supabase.from("profiles").update({
      ai_suggestions_used: 0,
      ai_letters_used: 0,
      ai_credits_used: 0,
      ai_credits_reset_at: addMonths(new Date(), 1).toISOString(),
    }).eq("id", user.id);
  }

  const lettersLimit = AI_LIMITS[tier as AiTier].letters;

  const preselectedType = sp.type ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div>
        <a className="text-sm text-muted-foreground hover:text-foreground" href={`/cases/${id}`}>
          ← Back to case
        </a>
        <h1 className="mt-1 text-2xl font-semibold">Generate Letter</h1>
        <p className="text-sm text-muted-foreground">{orgName}</p>
      </div>

      <LetterWizard
        caseId={id}
        lettersLimit={lettersLimit}
        lettersUsed={lettersUsed}
        preselectedType={preselectedType}
        templates={LETTER_TEMPLATES}
        tier={tier as "free" | "basic" | "pro"}
      />
    </div>
  );
}
