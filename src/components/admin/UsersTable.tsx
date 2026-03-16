"use client";

import { useMemo, useState } from "react";

type UserRow = {
  id: string;
  email: string;
  subscription_tier: string;
  created_at: string | null;
  cases_count: number;
  interactions_count: number;
  letters_count: number;
};

type SortKey =
  | "email"
  | "subscription_tier"
  | "cases_count"
  | "interactions_count"
  | "letters_count"
  | "created_at";

export function UsersTable({ rows }: { rows: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    return rows
      .filter((row) => row.email.toLowerCase().includes(search.toLowerCase()))
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
  }, [rows, search, sortKey, sortOrder]);

  function onSort(next: SortKey) {
    if (next === sortKey) {
      setSortOrder((v) => (v === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(next);
    setSortOrder("desc");
  }

  return (
    <div className="space-y-3">
      <input
        className="w-full max-w-sm rounded-md border px-3 py-2 text-sm"
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by email"
        value={search}
      />
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
            <tr>
              <th className="cursor-pointer px-3 py-2" onClick={() => onSort("email")}>User</th>
              <th className="cursor-pointer px-3 py-2" onClick={() => onSort("subscription_tier")}>Tier</th>
              <th className="cursor-pointer px-3 py-2" onClick={() => onSort("cases_count")}>Cases</th>
              <th className="cursor-pointer px-3 py-2" onClick={() => onSort("interactions_count")}>Interactions</th>
              <th className="cursor-pointer px-3 py-2" onClick={() => onSort("letters_count")}>Letters Sent</th>
              <th className="cursor-pointer px-3 py-2" onClick={() => onSort("created_at")}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr className="border-t" key={row.id}>
                <td className="px-3 py-2">{row.email}</td>
                <td className="px-3 py-2 capitalize">{row.subscription_tier}</td>
                <td className="px-3 py-2">{row.cases_count}</td>
                <td className="px-3 py-2">{row.interactions_count}</td>
                <td className="px-3 py-2">{row.letters_count}</td>
                <td className="px-3 py-2">{row.created_at ? new Date(row.created_at).toLocaleDateString("en-GB") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
