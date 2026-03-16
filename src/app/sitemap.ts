import type { MetadataRoute } from "next";

import { getPublicScorecardIndex } from "@/lib/analytics/scorecards";
import { complaintTemplates } from "@/lib/data/complaint-templates";
import { ORG_GUIDES } from "@/lib/guides/organisations";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app";
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
  ];

  const escalationRoutes: MetadataRoute.Sitemap = ESCALATION_CATEGORIES.map((cat) => ({
    url: `${baseUrl}/escalation-guides/${cat}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const orgGuideRoutes: MetadataRoute.Sitemap = ORG_GUIDES.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const companyScorecards = await getPublicScorecardIndex(5);
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

  return [...staticRoutes, ...escalationRoutes, ...orgGuideRoutes, ...companyRoutes, ...templateRoutes];
}
