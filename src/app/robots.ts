import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/utils/app-url";

const baseUrl = getAppUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/pricing",
          "/how-it-works",
          "/escalation-guides",
          "/about",
          "/privacy",
          "/terms",
          "/register",
          "/login",
          "/companies",
          "/guides",
          "/guides/",
          "/complaints",
          "/complaints/",
          "/templates",
          "/templates/",
          "/calculator",
          "/packs",
          "/business",
        ],
        disallow: [
          "/dashboard",
          "/cases",
          "/settings",
          "/api",
          "/reminders",
          "/letters",
          "/callback",
          "/admin",
          "/journeys",
          "/packs/success",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
