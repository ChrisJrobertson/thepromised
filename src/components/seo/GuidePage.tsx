import Link from "next/link";

import { ComplaintCTA } from "@/components/seo/ComplaintCTA";
import { EscalationTimeline, type EscalationStep } from "@/components/seo/EscalationTimeline";
import { FAQSection, type FaqItem } from "@/components/seo/FAQSection";
import { RelatedLinks, type RelatedGuideLink, type RelatedOrgLink } from "@/components/seo/RelatedLinks";
import { RightsCard, type RightItem } from "@/components/seo/RightsCard";
import { seoSectorLabel } from "@/lib/seo/sector";
import type { SeoGuidePage } from "@/types/database";
import type { Json } from "@/types/database";

function asContentSections(json: Json): RightItem[] {
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

function asStepByStep(json: Json): EscalationStep[] {
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

function asEligibility(json: Json | null): { criterion: string; description: string }[] {
  if (!json || !Array.isArray(json)) return [];
  return json.filter(
    (x): x is { criterion: string; description: string } =>
      typeof x === "object" &&
      x !== null &&
      "criterion" in x &&
      "description" in x &&
      typeof (x as { criterion: string }).criterion === "string" &&
      typeof (x as { description: string }).description === "string",
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

function asKeyDeadlines(
  json: Json | null,
): { description: string; days?: number | null; from_event?: string | null }[] {
  if (!json || !Array.isArray(json)) return [];
  return json.filter(
    (x): x is { description: string; days?: number | null; from_event?: string | null } =>
      typeof x === "object" &&
      x !== null &&
      "description" in x &&
      typeof (x as { description: string }).description === "string",
  );
}

export function GuidePage({
  page,
  relatedOrgs,
  relatedGuides,
}: {
  page: SeoGuidePage;
  relatedOrgs: RelatedOrgLink[];
  relatedGuides: RelatedGuideLink[];
}) {
  const sections = asContentSections(page.content_sections);
  const steps = asStepByStep(page.step_by_step);
  const eligibility = asEligibility(page.eligibility_criteria);
  const faqItems = asFaqItems(page.faq_items);
  const deadlines = asKeyDeadlines(page.key_deadlines);

  const sectorLabel = page.sector ? seoSectorLabel(page.sector) : "Consumer";

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
                <Link className="hover:text-white" href="/guides">
                  Guides
                </Link>
              </li>
              <li aria-hidden> / </li>
              <li className="text-white/90">{page.page_title}</li>
            </ol>
          </nav>
          <p className="text-xs font-medium uppercase tracking-wide text-[#D85A30]">
            {page.category.replace(/_/g, " ")}
            {page.sector ? ` · ${sectorLabel}` : ""}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-dm-sans)] text-3xl font-bold tracking-tight md:text-4xl">
            {page.hero_heading}
          </h1>
          <p className="mt-4 text-lg text-white/85">{page.hero_subheading}</p>
        </div>
      </section>

      <section className="py-10 md:py-12">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-base leading-relaxed text-slate-700">{page.introduction}</p>
        </div>
      </section>

      {sections.length > 0 ? (
        <section className="border-t border-slate-100 py-14 md:py-16" id="content">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold text-[#1a2744]">
              What you need to know
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {sections.map((item, i) => (
                <RightsCard item={item} key={`${item.heading}-${i}`} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {steps.length > 0 ? (
        <section className="border-t border-slate-100 bg-slate-50/50 py-14 md:py-16" id="steps">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold text-[#1a2744]">
              Step-by-step
            </h2>
            <div className="mt-10">
              <EscalationTimeline steps={steps} />
            </div>
          </div>
        </section>
      ) : null}

      {eligibility.length > 0 ? (
        <section className="py-14 md:py-16" id="eligibility">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold text-[#1a2744]">
              Eligibility
            </h2>
            <ul className="mt-6 space-y-4">
              {eligibility.map((e, i) => (
                <li className="rounded-xl border border-slate-200 bg-white p-5" key={`${e.criterion}-${i}`}>
                  <p className="font-semibold text-[#1a2744]">{e.criterion}</p>
                  <p className="mt-2 text-sm text-slate-600">{e.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {deadlines.length > 0 ? (
        <section className="border-t border-amber-100 bg-amber-50/60 py-12" id="deadlines">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-lg font-bold text-amber-950">Key deadlines</h2>
            <ul className="mt-4 space-y-3 text-sm text-amber-950/90">
              {deadlines.map((d, i) => (
                <li className="rounded-lg border border-amber-200/80 bg-white/80 p-4" key={`${d.description}-${i}`}>
                  <p className="font-medium">{d.description}</p>
                  {d.days != null ? (
                    <p className="mt-1 text-amber-900/80">
                      {d.days} days
                      {d.from_event ? ` · from ${d.from_event}` : ""}
                    </p>
                  ) : d.from_event ? (
                    <p className="mt-1 text-amber-900/80">From {d.from_event}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="border-t border-slate-100 py-14 md:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <ComplaintCTA legislation={page.primary_legislation} />
        </div>
      </section>

      {faqItems.length > 0 ? (
        <section className="border-t border-slate-100 bg-slate-50/30 py-14 md:py-16" id="faq">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold text-[#1a2744]">
              Frequently asked questions
            </h2>
            <div className="mt-8">
              <FAQSection idPrefix={`guide-${page.slug}`} items={faqItems} />
            </div>
          </div>
        </section>
      ) : null}

      <RelatedLinks
        guides={relatedGuides}
        orgs={relatedOrgs}
        sectorLabel={sectorLabel}
      />
    </main>
  );
}
