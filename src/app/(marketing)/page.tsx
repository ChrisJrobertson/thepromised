import type { Metadata } from "next";

import HomePageClient from "./HomePageClient";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app";

export const metadata: Metadata = {
  title: "TheyPromised | Hold Companies to Account",
  description:
    "Just launched — the UK tool that tracks promises, logs calls, and guides you to the ombudsman or court. For consumers who refuse to be ignored.",
  openGraph: {
    title: "TheyPromised | Hold Companies to Account",
    description:
      "Just launched — the UK tool that tracks promises, logs calls, and guides you to the ombudsman or court. For consumers who refuse to be ignored.",
    url: APP_URL,
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "TheyPromised" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheyPromised | Hold Companies to Account",
    description:
      "Just launched — the UK tool that tracks promises, logs calls, and guides you to the ombudsman or court. For consumers who refuse to be ignored.",
    images: ["/api/og"],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
