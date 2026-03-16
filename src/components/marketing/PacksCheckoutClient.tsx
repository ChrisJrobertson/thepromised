"use client";

import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import type { PackDefinition } from "@/lib/packs/config";

type CaseOption = {
  id: string;
  title: string;
};

type PacksCheckoutClientProps = {
  packs: PackDefinition[];
  cases: CaseOption[];
  isLoggedIn: boolean;
  recommendedPackId?: string;
  preselectedCaseId?: string;
};

export function PacksCheckoutClient({
  packs,
  cases,
  isLoggedIn,
  recommendedPackId = "",
  preselectedCaseId = "",
}: PacksCheckoutClientProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(preselectedCaseId);
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);

  async function handleBuy(packId: string) {
    setLoadingPackId(packId);
    try {
      const response = await fetch("/api/packs/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId,
          caseId: selectedCaseId || undefined,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Could not start checkout. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoadingPackId(null);
    }
  }

  return (
    <div className="space-y-8">
      {isLoggedIn && cases.length > 0 ? (
        <div className="mx-auto max-w-xl rounded-lg border bg-slate-50 p-4">
          <label className="mb-2 block text-sm font-medium" htmlFor="pack-case">
            Apply this pack to one of your existing cases (optional)
          </label>
          <select
            className="w-full rounded-md border bg-white px-3 py-2 text-sm"
            id="pack-case"
            onChange={(e) => setSelectedCaseId(e.target.value)}
            value={selectedCaseId}
          >
            <option value="">No linked case (buy now, choose later)</option>
            {cases.map((caseItem) => (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.title}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {packs.map((pack) => (
          <article
            className={`relative rounded-xl border bg-white p-6 shadow-sm ${
              pack.popular ? "border-primary ring-2 ring-primary/20" : ""
            }`}
            key={pack.id}
          >
            {recommendedPackId && recommendedPackId === pack.id ? (
              <span className="absolute -top-3 right-3 rounded-full bg-teal-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Recommended
              </span>
            ) : null}
            {pack.popular ? (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                Most Popular
              </span>
            ) : null}

            <div className="space-y-2">
              <h2 className="text-xl font-bold">{pack.name}</h2>
              <p className="text-4xl font-extrabold text-primary">{pack.priceDisplay}</p>
              <p className="text-sm text-slate-600">{pack.description}</p>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold">Includes:</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {pack.includes.map((item) => (
                  <li className="flex items-start gap-2" key={item}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-4 text-sm italic text-slate-600">Best for: {pack.bestFor}</p>

            {isLoggedIn ? (
              <button
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                disabled={Boolean(loadingPackId)}
                onClick={() => handleBuy(pack.id)}
                type="button"
              >
                {loadingPackId === pack.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  "Buy Now"
                )}
              </button>
            ) : (
              <Link
                className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                href="/register"
              >
                Buy Now
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
