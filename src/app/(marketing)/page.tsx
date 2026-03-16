import type { Metadata } from "next";

import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "TheyPromised — Track Complaints. Build Evidence. Get Results.",
  description:
    "Free UK complaint tracking platform. Log every call, email, and broken promise. AI-drafted letters and step-by-step escalation guides help you hold companies to account.",
  openGraph: {
    title: "TheyPromised — Track Complaints. Build Evidence. Get Results.",
    description:
      "Free UK complaint tracking platform. Log every call, email, and broken promise. AI-drafted letters and step-by-step escalation guides help you hold companies to account.",
    url: "https://www.theypromised.app",
    siteName: "TheyPromised",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "TheyPromised — Track Complaints. Build Evidence. Get Results.",
    description:
      "Free UK complaint tracking tool with AI-drafted letters and escalation guides.",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
