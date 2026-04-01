import Link from "next/link";

import { cn } from "@/lib/utils";

export type ComplaintCTAProps = {
  organisationName?: string;
  legislation?: string[] | null;
  orgSlug?: string;
  className?: string;
};

export function ComplaintCTA({
  organisationName,
  legislation,
  orgSlug,
  className,
}: ComplaintCTAProps) {
  const cite =
    legislation && legislation.length > 0
      ? legislation.slice(0, 3).join(", ")
      : "UK consumer protections";

  const href = orgSlug
    ? `/cases/new?seoOrg=${encodeURIComponent(orgSlug)}`
    : "/cases/new";

  return (
    <section
      className={cn(
        "rounded-2xl border border-[#1a2744]/15 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm md:p-10",
        className,
      )}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold tracking-tight text-[#1a2744] md:text-3xl">
          {organisationName
            ? `Get your ${organisationName} complaint letter in 60 seconds`
            : "Get your complaint letter in 60 seconds"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
          Citing {cite} with your specific case details — editable before you send anything.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex min-h-11 min-w-[200px] items-center justify-center rounded-lg bg-[#D85A30] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c24f2a]"
            href={href}
          >
            Start your free complaint
          </Link>
        </div>
        <ul className="mt-5 space-y-1 text-xs text-slate-500">
          <li>Free tier includes your first AI-drafted letter</li>
          <li>No credit card required</li>
        </ul>
        <p className="mt-4 text-xs text-slate-500">
          Suggestions are for guidance only. Always verify with official sources.
        </p>
      </div>
    </section>
  );
}
