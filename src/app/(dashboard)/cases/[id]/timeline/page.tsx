import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CaseTimeline } from "@/components/cases/CaseTimeline";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { Evidence, Interaction } from "@/types/database";

import { PrintButton } from "./PrintButton";

export const metadata = { title: "Timeline — TheyPromised" };

export default async function TimelinePage({
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

  const { data: caseDataRaw } = await supabase
    .from("cases")
    .select(
      "id, title, custom_organisation_name, organisation_id, created_at, first_contact_date, escalation_stage, status, resolved_date"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!caseDataRaw) notFound();

  // Fetch org name if linked
  let orgDisplayName = caseDataRaw.custom_organisation_name ?? caseDataRaw.title;
  if (caseDataRaw.organisation_id) {
    const { data: orgRow } = await supabase
      .from("organisations")
      .select("name")
      .eq("id", caseDataRaw.organisation_id)
      .maybeSingle();
    if (orgRow) orgDisplayName = orgRow.name;
  }

  const { data: interactions } = await supabase
    .from("interactions")
    .select("*, evidence(*)")
    .eq("case_id", id)
    .eq("user_id", user.id)
    .order("interaction_date", { ascending: false });

  const orgName = orgDisplayName;
  const caseData = caseDataRaw;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <Link className={buttonVariants({ size: "sm", variant: "ghost" })} href={`/cases/${id}`}>
            ← Back to case
          </Link>
          <h1 className="mt-2 text-xl font-semibold">{orgName} — Timeline</h1>
          <p className="text-sm text-muted-foreground">{caseData.title}</p>
        </div>
        <div className="flex gap-2">
          <PrintButton />
          <Link className={buttonVariants({ size: "sm" })} href={`/cases/${id}/interactions/new`}>
            + Log Interaction
          </Link>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">{orgName}</h1>
        <p className="text-lg">{caseData.title} — Full Timeline</p>
        <p className="text-sm text-slate-500">
          Printed {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <CaseTimeline
        caseId={id}
        caseInfo={{
          created_at: caseData.created_at,
          first_contact_date: caseData.first_contact_date,
          escalation_stage: caseData.escalation_stage,
          status: caseData.status,
          resolved_date: caseData.resolved_date,
        }}
        interactions={
          (interactions ?? []) as (Interaction & { evidence: Evidence[] })[]
        }
      />
    </div>
  );
}
