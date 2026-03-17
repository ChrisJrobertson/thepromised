import type { Metadata } from "next";

import HomePageClient from "./HomePageClient";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app";

export const metadata: Metadata = {
  title: "TheyPromised — Hold Companies to Account | UK Consumer Complaint Tracker",
  description:
    "Track complaints, log broken promises, and generate AI-powered letters to hold companies accountable. Free to start. Built for UK consumers.",
  openGraph: {
    title: "TheyPromised — Hold Companies to Account",
    description:
      "Track complaints, log broken promises, and generate AI-powered letters. Built for UK consumers.",
    url: APP_URL,
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "TheyPromised" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheyPromised — Hold Companies to Account",
    description:
      "Track complaints, log broken promises, and generate AI-powered letters. Built for UK consumers.",
    images: ["/api/og"],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
