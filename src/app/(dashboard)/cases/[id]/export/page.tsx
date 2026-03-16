import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { canExportPDF } from "@/lib/stripe/feature-gates";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import type { Profile } from "@/types/database";

import { ExportClient } from "./ExportClient";

export const metadata = { title: "Export Case" };

export default async function ExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    .select("id, title, interaction_count, status, custom_organisation_name, organisation_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!caseData) notFound();

  let orgName = caseData.custom_organisation_name ?? caseData.title;
  if (caseData.organisation_id) {
    const { data: org } = await supabase
      .from("organisations")
      .select("name")
      .eq("id", caseData.organisation_id)
      .maybeSingle();
    if (org) orgName = (org as { name: string }).name;
  }

  // Load export history
  const { data: exportHistory } = await supabase
    .from("exports")
    .select("*")
    .eq("case_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const canTimeline = canExportPDF(profile, "timeline_only");
  const canFull = canExportPDF(profile, "full_case");

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      <div>
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href={`/cases/${id}`}
        >
          ← Back to case
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Export Case File</h1>
        <p className="text-sm text-muted-foreground">
          {orgName} · {caseData.interaction_count} interactions
        </p>
      </div>

      {!canTimeline && (
        <UpgradePrompt
          description="PDF export is available on Basic and Pro plans. Export your case as a professional document to send to ombudsmen, courts, or for your own records."
          requiredTier="basic"
          title="PDF export requires Basic or Pro"
        />
      )}

      {canTimeline && (
        <ExportClient
          caseId={id}
          caseTitle={caseData.title}
          canFull={canFull}
          canTimeline={canTimeline}
          exportHistory={(exportHistory ?? []) as Array<{
            id: string;
            file_name: string;
            export_type: string;
            created_at: string | null;
          }>}
        />
      )}
    </div>
  );
}
