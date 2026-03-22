import Link from "next/link";

import { createAnonReadClient } from "@/lib/supabase/server";
import { seoSectorLabel, type SeoSectorSlug } from "@/lib/seo/sector";

export async function SectorComplaintsIndex({ sector }: { sector: SeoSectorSlug }) {
  const supabase = createAnonReadClient();
  const { data: pages } = await supabase
    .from("seo_organisation_pages")
    .select("slug, page_title, meta_description")
    .eq("sector", sector)
    .eq("status", "published")
    .order("page_title", { ascending: true });

  const label = seoSectorLabel(sector);

  return (
    <main className="bg-white">
      <section className="border-b border-slate-200 bg-gradient-to-b from-[#1a2744] to-[#1a2744]/95 py-14 text-white md:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link className="hover:text-white" href="/">
                  Home
                </Link>
              </li>
              <li aria-hidden> / </li>
              <li className="text-white/90">
                {label} complaints
              </li>
            </ol>
          </nav>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-3xl font-bold tracking-tight md:text-4xl">
            {label} complaints
          </h1>
          <p className="mt-4 text-lg text-white/85">
            Organisation-specific guides: your rights, escalation routes, and how to start a formal
            complaint.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-4 px-4">
          {!pages || pages.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
              We&apos;re adding organisation guides for this sector.{" "}
              <Link className="font-medium text-[#D85A30] underline" href="/register">
                Start a case
              </Link>{" "}
              in the meantime — we&apos;ll help you draft your complaint.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {pages.map((p) => (
                <li key={p.slug}>
                  <Link
                    className="block px-5 py-4 transition hover:bg-slate-50"
                    href={`/complaints/${p.slug}`}
                  >
                    <span className="font-semibold text-[#1a2744]">{p.page_title}</span>
                    <p className="mt-1 text-sm text-slate-600">{p.meta_description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
