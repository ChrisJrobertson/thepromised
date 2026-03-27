import type { Metadata } from "next";

import { getAppUrl } from "@/lib/utils/app-url";

import HomePageClient from "./HomePageClient";

const APP_URL = getAppUrl();

export const metadata: Metadata = {
  title: "TheyPromised — Hold Companies to Account | UK Consumer Complaint Tracker",
  description:
    "Track complaints, log broken promises, and generate professional letters from your case. Free to start. Built for UK consumers.",
  openGraph: {
    title: "TheyPromised — Hold Companies to Account",
    description:
      "Track complaints, log broken promises, and generate professional letters from your case. Built for UK consumers.",
    url: APP_URL,
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "TheyPromised" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheyPromised — Hold Companies to Account",
    description:
      "Track complaints, log broken promises, and generate professional letters from your case. Built for UK consumers.",
    images: ["/api/og"],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
