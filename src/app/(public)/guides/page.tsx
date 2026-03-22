import type { Metadata } from "next";
import Link from "next/link";

import { ORG_GUIDES } from "@/lib/guides/organisations";
import { getAppUrl } from "@/lib/utils/app-url";
import { createAnonReadClient } from "@/lib/supabase/server";

export const revalidate = 86400;

const baseUrl = getAppUrl();

export const metadata: Metadata = {
  title: "Consumer complaint guides",
  description:
    "UK ombudsman routes, legislation explainers, and step-by-step complaint processes — plus company-specific guides.",
  alternates: { canonical: `${baseUrl}/guides` },
};

export default async function GuidesIndexPage() {
  const supabase = createAnonReadClient();
  const { data: dbGuides } = await supabase
    .from("seo_guide_pages")
    .select("slug, page_title, meta_description, category, sector")
    .eq("status", "published")
    .order("page_title", { ascending: true });

  return (
    <main className="bg-white">
      <section className="border-b border-slate-200 bg-gradient-to-b from-[#1a2744] to-[#1a2744]/95 py-14 text-white md:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="font-[family-name:var(--font-dm-sans)] text-3xl font-bold tracking-tight md:text-4xl">
            Complaint guides
          </h1>
          <p className="mt-4 text-lg text-white/85">
            Legislation explainers, ombudsman routes, and company-specific how-to pages.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-12 px-4">
          <div>
            <h2 className="text-xl font-bold text-[#1a2744]">Topics &amp; processes</h2>
            <p className="mt-2 text-sm text-slate-600">
              In-depth guides sourced for UK consumers. Always confirm deadlines on official sites.
            </p>
            {!dbGuides || dbGuides.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">Guides loading…</p>
            ) : (
              <ul className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                {dbGuides.map((g) => (
                  <li key={g.slug}>
                    <Link
                      className="block px-5 py-4 transition hover:bg-slate-50"
                      href={`/guides/${g.slug}`}
                    >
                      <span className="font-semibold text-[#1a2744]">{g.page_title}</span>
                      <p className="mt-1 text-sm text-slate-600">{g.meta_description}</p>
                      <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                        {g.category}
                        {g.sector ? ` · ${g.sector}` : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#1a2744]">Company guides (legacy)</h2>
            <p className="mt-2 text-sm text-slate-600">
              Step-by-step pages with contact details and escalation tips.
            </p>
            <ul className="mt-6 columns-1 gap-4 sm:columns-2">
              {ORG_GUIDES.map((g) => (
                <li className="mb-2 break-inside-avoid" key={g.slug}>
                  <Link
                    className="text-sm font-medium text-[#D85A30] underline-offset-4 hover:underline"
                    href={`/guides/${g.slug}`}
                  >
                    {g.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
