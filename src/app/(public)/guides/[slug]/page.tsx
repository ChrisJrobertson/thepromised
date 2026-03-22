import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegacyOrgGuideView } from "@/components/guides/LegacyOrgGuideView";
import { GuidePage } from "@/components/seo/GuidePage";
import { getOrgGuide, ORG_GUIDES } from "@/lib/guides/organisations";
import { getAppUrl } from "@/lib/utils/app-url";
import { createAnonReadClient } from "@/lib/supabase/server";
import type { Json, SeoGuidePage } from "@/types/database";

export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

function parseFaqItems(json: Json): { question: string; answer: string }[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (x): x is { question: string; answer: string } =>
      typeof x === "object" &&
      x !== null &&
      "question" in x &&
      "answer" in x &&
      typeof (x as { question: string }).question === "string" &&
      typeof (x as { answer: string }).answer === "string",
  );
}

export async function generateStaticParams() {
  const supabase = createAnonReadClient();
  const { data } = await supabase
    .from("seo_guide_pages")
    .select("slug")
    .eq("status", "published");

  const seoSlugs = (data ?? []).map((r) => r.slug);
  const legacySlugs = ORG_GUIDES.map((g) => g.slug);
  const merged = [...new Set([...seoSlugs, ...legacySlugs])];
  return merged.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = getAppUrl();
  const supabase = createAnonReadClient();
  const { data: seo } = await supabase
    .from("seo_guide_pages")
    .select("page_title, meta_description, slug")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (seo) {
    return {
      title: seo.page_title,
      description: seo.meta_description,
      alternates: { canonical: `${baseUrl}/guides/${seo.slug}` },
      openGraph: {
        title: seo.page_title,
        description: seo.meta_description,
        url: `${baseUrl}/guides/${seo.slug}`,
        siteName: "TheyPromised",
        type: "article",
      },
    };
  }

  const guide = getOrgGuide(slug);
  if (!guide) return {};

  return {
    title: `How to Complain About ${guide.name} — Step-by-Step Guide | TheyPromised`,
    description: `Complete guide to making a complaint against ${guide.name}. Step-by-step escalation path, ombudsman details, time limits, and tips. Track your complaint free with TheyPromised.`,
    alternates: { canonical: `${baseUrl}/guides/${guide.slug}` },
    openGraph: {
      title: `How to Complain About ${guide.name}`,
      description: `Step-by-step complaint guide for ${guide.name} customers.`,
    },
  };
}

export default async function GuideSlugPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createAnonReadClient();
  const { data: seoRow } = await supabase
    .from("seo_guide_pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const seoPage = seoRow as SeoGuidePage | null;
  if (seoPage) {
    const relatedOrgSlugs = seoPage.related_org_slugs ?? [];
    const { data: relatedOrgs } =
      relatedOrgSlugs.length > 0
        ? await supabase
            .from("seo_organisation_pages")
            .select("slug, page_title, sector")
            .in("slug", relatedOrgSlugs)
            .eq("status", "published")
        : { data: [] as { slug: string; page_title: string; sector: string }[] };

    const relatedGuideSlugs = seoPage.related_guide_slugs ?? [];
    const { data: relatedGuides } =
      relatedGuideSlugs.length > 0
        ? await supabase
            .from("seo_guide_pages")
            .select("slug, page_title, category")
            .in("slug", relatedGuideSlugs)
            .eq("status", "published")
        : { data: [] as { slug: string; page_title: string; category: string }[] };

    const faqs = parseFaqItems(seoPage.faq_items);
    const baseUrl = getAppUrl();

    const faqJsonLd =
      faqs.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }
        : null;

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Guides",
          item: `${baseUrl}/guides`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: seoPage.page_title,
          item: `${baseUrl}/guides/${seoPage.slug}`,
        },
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        {faqJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        ) : null}
        <GuidePage
          page={seoPage}
          relatedGuides={relatedGuides ?? []}
          relatedOrgs={relatedOrgs ?? []}
        />
      </>
    );
  }

  const guide = getOrgGuide(slug);
  if (!guide) notFound();

  return <LegacyOrgGuideView guide={guide} />;
}
