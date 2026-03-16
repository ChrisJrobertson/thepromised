"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type RankingRow = {
  organisation_id: string | null;
  name: string | null;
  category: string | null;
  complaint_count: number | null;
  promise_broken_pct: number | null;
  helpfulness_score: number | null;
  escalation_rate_pct: number | null;
  total_disputed: number | null;
};

type SortKey =
  | "name"
  | "complaint_count"
  | "promise_broken_pct"
  | "helpfulness_score"
  | "escalation_rate_pct"
  | "total_disputed";

export function TopCompaniesTable({ rows }: { rows: RankingRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("complaint_count");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
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
    return copy;
  }, [rows, sortKey, sortOrder]);

  function onSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortOrder((v) => (v === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortOrder("desc");
  }

  function cellColourForPromise(value: number) {
    if (value < 20) return "text-green-700";
    if (value <= 50) return "text-amber-700";
    return "text-red-700";
  }

  function cellColourForHelpfulness(value: number) {
    if (value > 3) return "text-green-700";
    if (value >= 2) return "text-amber-700";
    return "text-red-700";
  }

  const topTen = sorted.slice(0, 10);

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="cursor-pointer px-3 py-2" onClick={() => onSort("name")}>Company</th>
            <th className="cursor-pointer px-3 py-2" onClick={() => onSort("complaint_count")}>Cases</th>
            <th className="cursor-pointer px-3 py-2" onClick={() => onSort("promise_broken_pct")}>Promises Broken</th>
            <th className="cursor-pointer px-3 py-2" onClick={() => onSort("helpfulness_score")}>Helpfulness</th>
            <th className="cursor-pointer px-3 py-2" onClick={() => onSort("escalation_rate_pct")}>Escalation Rate</th>
            <th className="cursor-pointer px-3 py-2" onClick={() => onSort("total_disputed")}>Disputed</th>
          </tr>
        </thead>
        <tbody>
          {topTen.map((row, idx) => {
            const broken = Number(row.promise_broken_pct ?? 0);
            const helpfulness = Number(row.helpfulness_score ?? 0);
            return (
              <tr className="border-t hover:bg-slate-50" key={`${row.organisation_id ?? row.name}-${idx}`}>
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2 font-medium">
                  {row.organisation_id ? (
                    <Link className="hover:underline" href={`/admin/companies/${row.organisation_id}`}>
                      {row.name ?? "Unknown"}
                    </Link>
                  ) : (
                    row.name ?? "Unknown"
                  )}
                </td>
                <td className="px-3 py-2">{row.complaint_count ?? 0}</td>
                <td className={`px-3 py-2 font-medium ${cellColourForPromise(broken)}`}>{broken.toFixed(1)}%</td>
                <td className={`px-3 py-2 font-medium ${cellColourForHelpfulness(helpfulness)}`}>{helpfulness.toFixed(2)}/4</td>
                <td className="px-3 py-2">{Number(row.escalation_rate_pct ?? 0).toFixed(1)}%</td>
                <td className="px-3 py-2">£{Number(row.total_disputed ?? 0).toLocaleString("en-GB", { maximumFractionDigits: 0 })}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
