import { createClient } from "@/lib/supabase/server";

import { PricingClient } from "./PricingClient";

export const metadata = {
  title: "Pricing — Plans for Consumers and Business | TheyPromised",
  description:
    "Track complaints free or upgrade for letter drafting, case insights, exports, and guided escalation. One-off packs from £29. Business complaint intelligence from £500/month.",
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I cancel at any time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — cancel any time from your billing settings. You keep access until the end of your paid period. No lock-ins.",
      },
    },
    {
      "@type": "Question",
      name: "What counts as a 'case'?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each complaint you're tracking is a case — for example, a billing dispute with British Gas is one case, and a PIP appeal with DWP is another. On the free plan, you can have 1 active case at a time.",
      },
    },
    {
      "@type": "Question",
      name: "Are usage limits shared between features?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No — case insights and letter drafts have separate limits. Your allowances reset on your billing date each month.",
      },
    },
    {
      "@type": "Question",
      name: "Will my data be deleted if I downgrade?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. All your case data, interactions, and evidence are preserved when you downgrade. You'll just lose access to paid features for future use.",
      },
    },
    {
      "@type": "Question",
      name: "Is the PDF export accepted by ombudsmen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our full case file PDF is designed to present your complaint chronologically in a professional format. However, ombudsman requirements vary — always check what your specific ombudsman accepts.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer discounts for vulnerable customers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. If you're experiencing financial hardship, please contact us at support@theypromised.app and we'll find a way to help.",
      },
    },
  ],
};

export default async function PricingPage() {
  // Check if user is logged in to determine button behaviour
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
        type="application/ld+json"
      />
      <PricingClient isLoggedIn={!!user} />
    </>
  );
}
