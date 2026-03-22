import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { canCreateCase } from "@/lib/stripe/feature-gates";
import { sanitizeCaseListSearch } from "@/lib/search/sanitize";
import { createClient } from "@/lib/supabase/server";
import type { CaseWithOrganisation } from "@/types/cases";

import { CasesClient } from "./CasesClient";

export const metadata = { title: "My Cases | TheyPromised" };

type SearchParams = Promise<{
  status?: string;
  search?: string;
  sort?: string;
  cursor?: string;
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
  const params = await searchParams;
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

  const activeStatus = (params.status as (typeof STATUS_TABS)[number]["value"]) ?? "all";
  const search = sanitizeCaseListSearch(params.search ?? "");
  const sort = (params.sort as (typeof SORT_OPTIONS)[number]["value"]) ?? "recent";

  let query = supabase
    .from("cases")
    .select(
      `
      id, title, status, priority, escalation_stage, interaction_count,
      last_interaction_date, amount_in_dispute, reference_number,
      first_contact_date, created_at, updated_at, category,
      organisation_id, custom_organisation_name,
      organisations (id, name, category)
    `
    )
    .eq("user_id", user.id);

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  // Only top-level columns — nested `organisations.name` in `.or()` breaks PostgREST on some queries.
  if (search.length > 0) {
    query = query.or(
      `title.ilike.%${search}%,custom_organisation_name.ilike.%${search}%`
    );
  }

  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "priority": {
      // priority ordering: urgent > high > medium > low
      query = query.order("created_at", { ascending: false });
      break;
    }
    case "interactions":
      query = query.order("interaction_count", { ascending: false });
      break;
    default:
      query = query.order("updated_at", { ascending: false });
  }

  query = query.limit(20);

  const { data: casesRaw } = await query;
  type CaseRow = import("@/types/cases").CaseWithOrganisation & {
    last_interaction_date: string | null;
    amount_in_dispute: number | null;
    reference_number: string | null;
    first_contact_date: string | null;
    interaction_count: number;
    escalation_stage: import("@/types/database").Case["escalation_stage"];
  };
  const cases = (casesRaw as CaseRow[] | null);

  // Count pending promises for each case
  const caseIds = (cases ?? []).map((c) => c.id);
  const { data: pendingPromises } = caseIds.length
    ? await supabase
        .from("interactions")
        .select("case_id")
        .in("case_id", caseIds)
        .not("promises_made", "is", null)
        .is("promise_fulfilled", null)
    : { data: [] };

  const promiseCounts = (pendingPromises ?? []).reduce<Record<string, number>>(
    (acc, p) => {
      acc[p.case_id] = (acc[p.case_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const enrichedCases = (cases ?? []).map((c) => ({
    ...c,
    pendingPromises: promiseCounts[c.id] ?? 0,
  }));

  const canCreate = canCreateCase(profile);

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

      <CasesClient
        cases={enrichedCases as unknown as (CaseWithOrganisation & { pendingPromises: number })[]}
        initialSearch={search}
        initialSort={sort}
        initialStatus={activeStatus}
        sortOptions={SORT_OPTIONS}
        statusTabs={STATUS_TABS}
      />

      {enrichedCases.length === 0 && activeStatus === "all" && !search && (
        <Card>
          <CardHeader>
            <p className="text-lg font-medium">No cases yet</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              When a company lets you down, start a case here. We&apos;ll help you track everything
              and guide you through the complaints process.
            </p>
            {canCreate && (
              <Link className={buttonVariants()} href="/cases/new">
                Create Your First Case
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
