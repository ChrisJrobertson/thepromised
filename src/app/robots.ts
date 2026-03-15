import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/how-it-works", "/escalation-guides", "/about", "/privacy", "/terms"],
        disallow: ["/dashboard", "/cases", "/settings", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
