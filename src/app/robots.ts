import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app";

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
          "/guides/",
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
