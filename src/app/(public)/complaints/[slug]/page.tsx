import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrganisationPage } from "@/components/seo/OrganisationPage";
import { getAppUrl } from "@/lib/utils/app-url";
import { organisationNameFromPageTitle } from "@/lib/seo/organisation-name";
import { seoSectorLabel } from "@/lib/seo/sector";
import { createAnonReadClient } from "@/lib/supabase/server";
import type { Json, SeoOrganisationPage } from "@/types/database";

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
    .from("seo_organisation_pages")
    .select("slug")
    .eq("status", "published");

  return (data ?? []).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAnonReadClient();
  const { data } = await supabase
    .from("seo_organisation_pages")
    .select("page_title, meta_description, slug")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) return {};

  const baseUrl = getAppUrl();
  return {
    title: data.page_title,
    description: data.meta_description,
    alternates: {
      canonical: `${baseUrl}/complaints/${data.slug}`,
    },
    openGraph: {
      title: data.page_title,
      description: data.meta_description,
      url: `${baseUrl}/complaints/${data.slug}`,
      siteName: "TheyPromised",
      type: "article",
    },
  };
}

export default async function ComplaintOrganisationPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createAnonReadClient();
  const { data: pageRow } = await supabase
    .from("seo_organisation_pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const page = pageRow as SeoOrganisationPage | null;
  if (!page) notFound();

  const relatedOrgSlugs = page.related_org_slugs ?? [];
  const { data: relatedOrgs } =
    relatedOrgSlugs.length > 0
      ? await supabase
          .from("seo_organisation_pages")
          .select("slug, page_title, sector")
          .in("slug", relatedOrgSlugs)
          .eq("status", "published")
      : { data: [] as { slug: string; page_title: string; sector: string }[] };

  const relatedGuideSlugs = page.related_guide_slugs ?? [];
  const { data: relatedGuides } =
    relatedGuideSlugs.length > 0
      ? await supabase
          .from("seo_guide_pages")
          .select("slug, page_title, category")
          .in("slug", relatedGuideSlugs)
          .eq("status", "published")
      : { data: [] as { slug: string; page_title: string; category: string }[] };

  const { data: sameSectorOrgs } = await supabase
    .from("seo_organisation_pages")
    .select("slug, page_title, sector")
    .eq("sector", page.sector)
    .eq("status", "published")
    .neq("slug", slug)
    .limit(8);

  const faqs = parseFaqItems(page.faq_items);
  const baseUrl = getAppUrl();
  const sectorLabel = seoSectorLabel(page.sector);
  const orgName = organisationNameFromPageTitle(page.page_title);

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
        name: `${sectorLabel} complaints`,
        item: `${baseUrl}/complaints/${page.sector}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: orgName,
        item: `${baseUrl}/complaints/${page.slug}`,
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
      <OrganisationPage
        page={page}
        relatedGuides={relatedGuides ?? []}
        relatedOrgs={relatedOrgs ?? []}
        sameSectorOrgs={sameSectorOrgs ?? []}
      />
    </>
  );
}
