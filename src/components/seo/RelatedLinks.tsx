import Link from "next/link";

export type RelatedOrgLink = { slug: string; page_title: string; sector: string };
export type RelatedGuideLink = { slug: string; page_title: string; category: string };

export function RelatedLinks({
  orgs,
  guides,
  sectorLabel,
}: {
  orgs: RelatedOrgLink[];
  guides: RelatedGuideLink[];
  sectorLabel: string;
}) {
  if (orgs.length === 0 && guides.length === 0) return null;

  return (
    <section className="border-t border-slate-200 bg-slate-50/80 py-14">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-[#1a2744]">
          Related pages
        </h2>
        {orgs.length > 0 ? (
          <div className="mt-6">
            <p className="text-sm font-medium text-slate-700">
              Also having issues with other {sectorLabel} providers?
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {orgs.map((o) => (
                <li key={o.slug}>
                  <Link
                    className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-[#1a2744] transition hover:border-[#D85A30]/50 hover:text-[#D85A30]"
                    href={`/complaints/${o.slug}`}
                  >
                    {o.page_title.replace(/^How to Complain to\s+/i, "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {guides.length > 0 ? (
          <div className="mt-8">
            <p className="text-sm font-medium text-slate-700">Learn more</p>
            <ul className="mt-3 space-y-2">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link
                    className="text-sm font-medium text-[#D85A30] underline-offset-4 hover:underline"
                    href={`/guides/${g.slug}`}
                  >
                    {g.page_title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
