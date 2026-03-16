"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { PublicScorecard } from "@/lib/analytics/scorecards";

export function CompanyScorecardIndex({ scorecards }: { scorecards: PublicScorecard[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => ["all", ...new Set(scorecards.map((s) => s.category))],
    [scorecards]
  );

  const filtered = useMemo(
    () =>
      scorecards.filter((s) => {
        const matchesSearch = s.company_name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "all" || s.category === category;
        return matchesSearch && matchesCategory;
      }),
    [scorecards, search, category]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          className="w-full max-w-md rounded-md border px-3 py-2 text-sm"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company name"
          value={search}
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((tab) => (
            <button
              className={`rounded-full border px-3 py-1 text-xs ${
                tab === category ? "border-primary bg-primary text-white" : "bg-white"
              }`}
              key={tab}
              onClick={() => setCategory(tab)}
              type="button"
            >
              {tab === "all" ? "All" : tab.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((card) => (
          <Link
            className="rounded-lg border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
            href={`/companies/${card.slug}`}
            key={card.organisation_id}
          >
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h2 className="font-semibold">{card.company_name}</h2>
                <p className="text-xs capitalize text-slate-500">{card.category.replace(/_/g, " ")}</p>
              </div>
              <span className="rounded bg-slate-900 px-2 py-1 text-sm font-bold text-white">{card.grade}</span>
            </div>
            <div className="space-y-1 text-sm">
              <p>{card.total_cases} complaints</p>
              <p>Promise kept: {card.promise_kept_pct.toFixed(1)}%</p>
              <p>Helpfulness: {card.helpfulness_score.toFixed(2)}/4</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
