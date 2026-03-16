import { CalculatorClient } from "./CalculatorClient";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complaint Compensation Calculator",
  description:
    "Calculate how much compensation you could be owed. Covers flight delays, energy billing errors, bank charges, and more. Free to use.",
  openGraph: {
    title: "Complaint Compensation Calculator",
    description:
      "Calculate how much compensation you could be owed for flight delays, energy errors, and more.",
    url: "https://www.theypromised.app/calculator",
    siteName: "TheyPromised",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Complaint Compensation Calculator",
    description:
      "Calculate how much compensation you could be owed for flight delays, energy errors, and more.",
  },
};

export default function CalculatorPage() {
  return <CalculatorClient />;
}
