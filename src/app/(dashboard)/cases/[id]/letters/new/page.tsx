import { redirect, notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { canUseAI } from "@/lib/stripe/feature-gates";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { LETTER_TEMPLATES } from "@/lib/ai/letter-templates";
import type { Profile } from "@/types/database";

import { LetterWizard } from "./LetterWizard";

export const metadata = { title: "Draft Letter" };

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

  const canUseLetter = canUseAI(profile, "letters");

  if (!canUseLetter) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-8">
        <h1 className="text-2xl font-semibold">Generate Letter</h1>
        <UpgradePrompt
          description="AI letter drafting requires a Basic or Pro plan. Upgrade to draft professional complaint letters instantly."
          requiredTier="basic"
          title="Letter drafting requires Basic or Pro"
        />
      </div>
    );
  }

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
        preselectedType={preselectedType}
        templates={LETTER_TEMPLATES}
      />
    </div>
  );
}
