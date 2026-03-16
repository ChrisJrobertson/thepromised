import { CompaniesTable } from "@/components/admin/CompaniesTable";
import { getCompanyStats } from "@/lib/analytics/service";

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const companies = await getCompanyStats();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Companies</h1>
      <p className="text-sm text-slate-600">Full company analytics across tracked complaints.</p>
      <CompaniesTable
        initialCategory={sp.category ?? "all"}
        rows={(companies ?? []).map((row) => ({
          organisation_id: row.organisation_id,
          organisation_name: row.organisation_name,
          category: row.category,
          total_cases: row.total_cases,
          avg_resolution_days: row.avg_resolution_days,
          total_promises: row.total_promises,
          promises_kept: row.promises_kept,
          avg_helpfulness_score: row.avg_helpfulness_score,
          escalation_rate_pct: row.escalation_rate_pct,
          total_amount_disputed: row.total_amount_disputed,
        }))}
      />
    </div>
  );
}
