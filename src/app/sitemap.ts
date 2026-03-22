import type { MetadataRoute } from "next";

import { getPublicScorecardIndex } from "@/lib/analytics/scorecards";
import { complaintTemplates } from "@/lib/data/complaint-templates";
import { ORG_GUIDES } from "@/lib/guides/organisations";
import { SEO_SECTOR_SLUGS } from "@/lib/seo/sector";
import { createAnonReadClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/utils/app-url";

const baseUrl = getAppUrl();
const ESCALATION_CATEGORIES = [
  "energy",
  "water",
  "broadband_phone",
  "financial_services",
  "insurance",
  "government_hmrc",
  "government_dwp",
  "government_council",
  "nhs",
  "housing",
  "retail",
  "transport",
  "education",
  "employment",
  "other",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAnonReadClient();

  const [{ data: seoOrgPages }, { data: seoGuidePages }] = await Promise.all([
    supabase.from("seo_organisation_pages").select("slug, updated_at").eq("status", "published"),
    supabase.from("seo_guide_pages").select("slug, updated_at").eq("status", "published"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/escalation-guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/companies`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/business`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/packs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/templates`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
  ];

  const escalationRoutes: MetadataRoute.Sitemap = ESCALATION_CATEGORIES.map((cat) => ({
    url: `${baseUrl}/escalation-guides/${cat}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const seoOrgRoutes: MetadataRoute.Sitemap = (seoOrgPages ?? []).map((page) => ({
    url: `${baseUrl}/complaints/${page.slug}`,
    lastModified: new Date(page.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const sectorIndexRoutes: MetadataRoute.Sitemap = [...SEO_SECTOR_SLUGS].map((sector) => ({
    url: `${baseUrl}/complaints/${sector}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.82,
  }));

  const seoGuideSlugs = new Set((seoGuidePages ?? []).map((g) => g.slug));
  const mergedGuideRoutes: MetadataRoute.Sitemap = [
    ...(seoGuidePages ?? []).map((page) => ({
      url: `${baseUrl}/guides/${page.slug}`,
      lastModified: new Date(page.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    ...ORG_GUIDES.filter((g) => !seoGuideSlugs.has(g.slug)).map((guide) => ({
      url: `${baseUrl}/guides/${guide.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
  ];

  const companyScorecards = await getPublicScorecardIndex(1);
  const companyRoutes: MetadataRoute.Sitemap = companyScorecards.map((card) => ({
    url: `${baseUrl}/companies/${card.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const templateRoutes: MetadataRoute.Sitemap = complaintTemplates.map((template) => ({
    url: `${baseUrl}/templates/${template.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...escalationRoutes,
    ...sectorIndexRoutes,
    ...seoOrgRoutes,
    ...mergedGuideRoutes,
    ...companyRoutes,
    ...templateRoutes,
  ];
}
