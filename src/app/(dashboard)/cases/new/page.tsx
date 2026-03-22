import { redirect } from "next/navigation";

import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { resolveComplaintTemplateParam } from "@/lib/data/complaint-templates";
import { getOrgGuide } from "@/lib/guides/organisations";
import { organisationNameFromPageTitle } from "@/lib/seo/organisation-name";
import { canCreateCase } from "@/lib/stripe/feature-gates";
import { createClient } from "@/lib/supabase/server";

import { CaseWizard } from "./CaseWizard";

export const metadata = { title: "New Case | TheyPromised" };

export default async function NewCasePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; seoOrg?: string }>;
}) {
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

  const profile = profileData as import("@/types/database").Profile;
  const canCreate = canCreateCase(profile);
  const template = sp.template ? resolveComplaintTemplateParam(sp.template) : undefined;

  let seoPreferredNames: string[] = [];
  if (sp.seoOrg) {
    const { data: seoRow } = await supabase
      .from("seo_organisation_pages")
      .select("page_title")
      .eq("slug", sp.seoOrg)
      .eq("status", "published")
      .maybeSingle();
    if (seoRow?.page_title) {
      seoPreferredNames = [organisationNameFromPageTitle(seoRow.page_title)];
    } else {
      const legacy = getOrgGuide(sp.seoOrg);
      if (legacy) seoPreferredNames = [legacy.name];
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-semibold">What happened? Let&apos;s build your evidence.</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us which company let you down and we&apos;ll help you fight back.
        </p>
      </div>

      {canCreate ? (
        <CaseWizard
          initialTemplate={
            template
              ? {
                  id: template.id,
                  title: template.title,
                  category: template.category,
                  commonWith: template.commonWith,
                  suggestedTitle: template.suggestedTitle,
                  suggestedDescription: template.suggestedDescription,
                  suggestedDesiredOutcome: template.suggestedDesiredOutcome,
                  suggestedPriority: template.suggestedPriority,
                }
              : undefined
          }
          seoPreferredCompanyNames={seoPreferredNames}
        />
      ) : (
        <UpgradePrompt
          title="Case limit reached"
          description="You already have an active case on the free plan. Upgrade to Basic or Pro to manage multiple cases simultaneously."
          requiredTier="basic"
        />
      )}
    </div>
  );
}
