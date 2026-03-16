import Link from "next/link";

import { getCategoryStats } from "@/lib/analytics/service";

export default async function AdminCategoriesPage() {
  const categories = await getCategoryStats();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Categories</h1>
      <p className="text-sm text-slate-600">Category-level complaint performance across all tracked data.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(categories ?? []).map((row) => (
          <Link
            className="rounded-lg border bg-white p-4 shadow-sm transition hover:border-primary hover:shadow"
            href={`/admin/companies?category=${encodeURIComponent(row.category ?? "")}`}
            key={row.category ?? Math.random()}
          >
            <h2 className="text-lg font-semibold capitalize">{(row.category ?? "other").replace(/_/g, " ")}</h2>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>Total cases: {Number(row.total_cases ?? 0)}</p>
              <p>Companies: {Number(row.companies_count ?? 0)}</p>
              <p>Avg resolution: {Number(row.avg_resolution_days ?? 0).toFixed(1)} days</p>
              <p>Escalation rate: {Number(row.escalation_rate_pct ?? 0).toFixed(1)}%</p>
              <p>Total disputed: £{Number(row.total_disputed ?? 0).toLocaleString("en-GB", { maximumFractionDigits: 0 })}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
