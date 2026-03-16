"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CompanyRow = {
  organisation_id: string | null;
  organisation_name: string | null;
  category: string | null;
  total_cases: number | null;
  avg_resolution_days: number | null;
  total_promises: number | null;
  promises_kept: number | null;
  avg_helpfulness_score: number | null;
  escalation_rate_pct: number | null;
  total_amount_disputed: number | null;
};

type SortKey =
  | "organisation_name"
  | "category"
  | "total_cases"
  | "avg_resolution_days"
  | "promise_kept_pct"
  | "avg_helpfulness_score"
  | "escalation_rate_pct"
  | "total_amount_disputed";

export function CompaniesTable({ rows, initialCategory = "all" }: { rows: CompanyRow[]; initialCategory?: string }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sortKey, setSortKey] = useState<SortKey>("total_cases");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const categories = useMemo(
    () => ["all", ...new Set(rows.map((r) => r.category ?? "other"))],
    [rows]
  );

  const filtered = useMemo(() => {
    return rows
      .map((r) => {
        const totalPromises = Number(r.total_promises ?? 0);
        const kept = Number(r.promises_kept ?? 0);
        return {
          ...r,
          promise_kept_pct: totalPromises ? (kept / totalPromises) * 100 : 0,
        };
      })
      .filter((r) => {
        const matchesSearch = (r.organisation_name ?? "").toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "all" || (r.category ?? "other") === category;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "string" || typeof bv === "string") {
          const aa = (av ?? "").toString().toLowerCase();
          const bb = (bv ?? "").toString().toLowerCase();
          return sortOrder === "asc" ? aa.localeCompare(bb) : bb.localeCompare(aa);
        }
        const aa = Number(av ?? 0);
        const bb = Number(bv ?? 0);
        return sortOrder === "asc" ? aa - bb : bb - aa;
      });
  }, [rows, search, category, sortKey, sortOrder]);

  function onSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortOrder((v) => (v === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortOrder("desc");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          className="rounded-md border px-3 py-2 text-sm"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company"
          value={search}
        />
        <select
          className="rounded-md border px-3 py-2 text-sm"
          onChange={(e) => setCategory(e.target.value)}
          value={category}
        >
          {categories.map((value) => (
            <option key={value} value={value}>
              {value === "all" ? "All categories" : value.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
            <tr>
              <th className="cursor-pointer px-3 py-2" onClick={() => onSort("organisation_name")}>Company</th>
              <th className="cursor-pointer px-3 py-2" onClick={() => onSort("category")}>Category</th>
              <th className="cursor-pointer px-3 py-2" onClick={() => onSort("total_cases")}>Cases</th>
              <th className="cursor-pointer px-3 py-2" onClick={() => onSort("avg_resolution_days")}>Avg Resolution</th>
              <th className="cursor-pointer px-3 py-2" onClick={() => onSort("promise_kept_pct")}>Promise Kept %</th>
              <th className="cursor-pointer px-3 py-2" onClick={() => onSort("avg_helpfulness_score")}>Helpfulness</th>
              <th className="cursor-pointer px-3 py-2" onClick={() => onSort("escalation_rate_pct")}>Escalation Rate</th>
              <th className="cursor-pointer px-3 py-2" onClick={() => onSort("total_amount_disputed")}>Total Disputed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr className="border-t hover:bg-slate-50" key={row.organisation_id ?? row.organisation_name ?? Math.random()}>
                <td className="px-3 py-2 font-medium">
                  {row.organisation_id ? (
                    <Link className="hover:underline" href={`/admin/companies/${row.organisation_id}`}>
                      {row.organisation_name ?? "Unknown"}
                    </Link>
                  ) : (
                    row.organisation_name ?? "Unknown"
                  )}
                </td>
                <td className="px-3 py-2 capitalize">{(row.category ?? "other").replace(/_/g, " ")}</td>
                <td className="px-3 py-2">{Number(row.total_cases ?? 0)}</td>
                <td className="px-3 py-2">{Number(row.avg_resolution_days ?? 0).toFixed(1)} days</td>
                <td className="px-3 py-2">{row.promise_kept_pct.toFixed(1)}%</td>
                <td className="px-3 py-2">{Number(row.avg_helpfulness_score ?? 0).toFixed(2)}/4</td>
                <td className="px-3 py-2">{Number(row.escalation_rate_pct ?? 0).toFixed(1)}%</td>
                <td className="px-3 py-2">£{Number(row.total_amount_disputed ?? 0).toLocaleString("en-GB", { maximumFractionDigits: 0 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
