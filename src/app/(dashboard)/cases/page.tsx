export const dynamic = "force-dynamic";
export const metadata = { title: "My Cases | TheyPromised" };

import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { createClient } from "@/lib/supabase/server";
import type { CaseWithOrganisation } from "@/types/cases";
import { CasesClient } from "./CasesClient";

type SearchParams = Promise<{
  status?: string;
  search?: string;
  sort?: string;
}>;

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "escalated", label: "Escalated" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
] as const;

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "priority", label: "Priority" },
  { value: "interactions", label: "Most Interactions" },
] as const;

export default async function CasesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("subscription_tier, cases_count, subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileData) redirect("/login");

  type ProfileSlim = { subscription_tier: string; cases_count: number | null; subscription_status: string };
  const profile = profileData as ProfileSlim;
  const canCreate = profile.subscription_tier !== "free" || (profile.cases_count ?? 0) < 1;

  // Resolve searchParams safely
  const params = await searchParams;
  const activeStatus = (params?.status ?? "all") as (typeof STATUS_TABS)[number]["value"];
  const search = params?.search ?? "";
  const sort = (params?.sort ?? "recent") as (typeof SORT_OPTIONS)[number]["value"];

  // Fetch cases
  let casesQuery = supabase
    .from("cases")
    .select(
      "id, title, status, priority, escalation_stage, interaction_count, last_interaction_date, amount_in_dispute, first_contact_date, category, organisation_id, custom_organisation_name, organisations(id, name, category)"
    )
    .eq("user_id", user.id);

  if (activeStatus !== "all") casesQuery = casesQuery.eq("status", activeStatus);

  if (sort === "oldest") casesQuery = casesQuery.order("created_at", { ascending: true });
  else if (sort === "interactions") casesQuery = casesQuery.order("interaction_count", { ascending: false });
  else casesQuery = casesQuery.order("updated_at", { ascending: false });

  casesQuery = casesQuery.limit(20);

  type CaseRow = {
    id: string;
    title: string;
    status: string;
    priority: string;
    escalation_stage: string | null;
    interaction_count: number | null;
    last_interaction_date: string | null;
    amount_in_dispute: number | null;
    first_contact_date: string | null;
    category: string | null;
    organisation_id: string | null;
    custom_organisation_name: string | null;
    organisations: { id: string; name: string; category: string | null } | null;
  };

  const { data: casesRaw, error: casesError } = await casesQuery;
  if (casesError) console.error("[CasesPage] cases query error:", casesError.message);

  const cases = (casesRaw as CaseRow[] | null) ?? [];

  // Count pending promises
  const caseIds = cases.map((c) => c.id);
  let promiseCounts: Record<string, number> = {};
  if (caseIds.length > 0) {
    const { data: promises } = await supabase
      .from("interactions")
      .select("case_id")
      .in("case_id", caseIds)
      .not("promises_made", "is", null)
      .is("promise_fulfilled", null);
    promiseCounts = (promises ?? []).reduce<Record<string, number>>((acc, p) => {
      acc[p.case_id] = (acc[p.case_id] ?? 0) + 1;
      return acc;
    }, {});
  }

  const enrichedCases = cases.map((c) => ({
    ...c,
    pendingPromises: promiseCounts[c.id] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Cases</h1>
          <p className="text-sm text-muted-foreground">
            {enrichedCases.length} case{enrichedCases.length !== 1 ? "s" : ""}
            {activeStatus !== "all" ? ` · ${activeStatus}` : ""}
          </p>
        </div>
        {canCreate ? (
          <Link className={buttonVariants()} href="/cases/new">+ New Case</Link>
        ) : null}
      </div>

      {!canCreate && (
        <UpgradePrompt
          description="You are on the free plan which allows 1 active case. Upgrade to manage unlimited cases."
          requiredTier="basic"
          title="Want to open more cases?"
        />
      )}

      <Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>}>
        <CasesClient
          cases={enrichedCases as unknown as (CaseWithOrganisation & { pendingPromises: number })[]}
          initialSearch={search}
          initialSort={sort}
          initialStatus={activeStatus}
          sortOptions={SORT_OPTIONS}
          statusTabs={STATUS_TABS}
        />
      </Suspense>

      {enrichedCases.length === 0 && activeStatus === "all" && !search && (
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="text-lg font-medium">No cases yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            When a company lets you down, start a case here.
          </p>
          {canCreate && (
            <Link className={`${buttonVariants()} mt-4 inline-block`} href="/cases/new">
              Create Your First Case
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
