import Link from "next/link";

import { ComplaintCTA } from "@/components/seo/ComplaintCTA";
import { EscalationTimeline, type EscalationStep } from "@/components/seo/EscalationTimeline";
import { FAQSection, type FaqItem } from "@/components/seo/FAQSection";
import { RelatedLinks, type RelatedGuideLink, type RelatedOrgLink } from "@/components/seo/RelatedLinks";
import { RightsCard, type RightItem } from "@/components/seo/RightsCard";
import { organisationNameFromPageTitle } from "@/lib/seo/organisation-name";
import { seoSectorLabel } from "@/lib/seo/sector";
import type { SeoOrganisationPage } from "@/types/database";
import type { Json } from "@/types/database";

function asRightItems(json: Json): RightItem[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (x): x is RightItem =>
      typeof x === "object" &&
      x !== null &&
      "heading" in x &&
      "body" in x &&
      typeof (x as RightItem).heading === "string" &&
      typeof (x as RightItem).body === "string",
  );
}

function asEscalationSteps(json: Json): EscalationStep[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (x): x is EscalationStep =>
      typeof x === "object" &&
      x !== null &&
      "step_number" in x &&
      "title" in x &&
      "description" in x &&
      typeof (x as EscalationStep).step_number === "number" &&
      typeof (x as EscalationStep).title === "string" &&
      typeof (x as EscalationStep).description === "string",
  );
}

function asFaqItems(json: Json): FaqItem[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (x): x is FaqItem =>
      typeof x === "object" &&
      x !== null &&
      "question" in x &&
      "answer" in x &&
      typeof (x as FaqItem).question === "string" &&
      typeof (x as FaqItem).answer === "string",
  );
}

function asCommonIssues(
  json: Json,
): { issue: string; description: string }[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (x): x is { issue: string; description: string } =>
      typeof x === "object" &&
      x !== null &&
      "issue" in x &&
      "description" in x &&
      typeof (x as { issue: string }).issue === "string" &&
      typeof (x as { description: string }).description === "string",
  );
}

export function OrganisationPage({
  page,
  relatedOrgs,
  relatedGuides,
  sameSectorOrgs,
}: {
  page: SeoOrganisationPage;
  relatedOrgs: RelatedOrgLink[];
  relatedGuides: RelatedGuideLink[];
  sameSectorOrgs: RelatedOrgLink[];
}) {
  const yourRights = asRightItems(page.your_rights);
  const escalationSteps = asEscalationSteps(page.escalation_steps);
  const faqItems = asFaqItems(page.faq_items);
  const commonIssues = asCommonIssues(page.common_issues);
  const orgName = organisationNameFromPageTitle(page.page_title);
  const sectorLabel = seoSectorLabel(page.sector);

  const mergedOrgLinks: RelatedOrgLink[] = [];
  const seen = new Set<string>();
  for (const o of [...sameSectorOrgs, ...relatedOrgs]) {
    if (o.slug === page.slug || seen.has(o.slug)) continue;
    seen.add(o.slug);
    mergedOrgLinks.push(o);
  }

  return (
    <main className="bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-gradient-to-b from-[#1a2744] to-[#1a2744]/95 py-14 text-white md:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link className="hover:text-white" href="/">
                  Home
                </Link>
              </li>
              <li aria-hidden> / </li>
              <li>
                <Link className="hover:text-white" href={`/complaints/${page.sector}`}>
                  {sectorLabel} complaints
                </Link>
              </li>
              <li aria-hidden> / </li>
              <li className="text-white/90">{orgName}</li>
            </ol>
          </nav>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-3xl font-bold tracking-tight md:text-4xl">
            {page.hero_heading}
          </h1>
          <p className="mt-4 text-lg text-white/85">{page.hero_subheading}</p>
          <div className="mt-8">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#D85A30] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#c24f2a]"
              href={`/cases/new?seoOrg=${encodeURIComponent(page.slug)}`}
            >
              Start your free complaint
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/60">
            Content is for general information only — confirm deadlines with regulators and ombudsmen.
          </p>
        </div>
      </section>

      {yourRights.length > 0 ? (
        <section className="py-14 md:py-16" id="rights">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold text-[#1a2744]">
              Your rights
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Key protections that often apply in this sector. Always check the latest official guidance.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {yourRights.map((item, i) => (
                <RightsCard item={item} key={`${item.heading}-${i}`} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {escalationSteps.length > 0 ? (
        <section className="border-t border-slate-100 bg-slate-50/50 py-14 md:py-16" id="escalation">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold text-[#1a2744]">
              Escalation timeline
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Typical stages for UK consumer complaints in this sector.
            </p>
            <div className="mt-10">
              <EscalationTimeline steps={escalationSteps} />
            </div>
          </div>
        </section>
      ) : null}

      {commonIssues.length > 0 ? (
        <section className="py-14 md:py-16" id="issues">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold text-[#1a2744]">
              Common issues
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {commonIssues.map((c, i) => (
                <div
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  key={`${c.issue}-${i}`}
                >
                  <h3 className="font-semibold text-[#1a2744]">{c.issue}</h3>
                  <p className="mt-2 text-sm text-slate-600">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-slate-100 py-14 md:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <ComplaintCTA
            legislation={page.primary_legislation}
            orgSlug={page.slug}
            organisationName={orgName}
          />
        </div>
      </section>

      {faqItems.length > 0 ? (
        <section className="border-t border-slate-100 bg-slate-50/30 py-14 md:py-16" id="faq">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold text-[#1a2744]">
              Frequently asked questions
            </h2>
            <div className="mt-8">
              <FAQSection idPrefix={`org-${page.slug}`} items={faqItems} />
            </div>
          </div>
        </section>
      ) : null}

      <RelatedLinks
        guides={relatedGuides}
        orgs={mergedOrgLinks}
        sectorLabel={sectorLabel}
      />
    </main>
  );
}
