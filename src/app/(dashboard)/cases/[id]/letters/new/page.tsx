import { redirect, notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AI_LIMITS } from "@/lib/ai/constants";
import { LETTER_TEMPLATES } from "@/lib/ai/letter-templates";
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
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileData) redirect("/login");
  const profile = profileData as Profile;

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
  const aiLettersUsed = profile.ai_letters_used;
  const aiLettersLimit = AI_LIMITS[tier as keyof typeof AI_LIMITS]?.letters ?? 0;

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
        aiLettersLimit={aiLettersLimit}
        aiLettersUsed={aiLettersUsed}
        caseId={id}
        preselectedType={preselectedType}
        templates={LETTER_TEMPLATES}
        tier={tier}
      />
    </div>
  );
}
