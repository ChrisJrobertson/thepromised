import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export default function BillingPage() {
  return (
    <PagePlaceholder
      ctaHref="/pricing"
      ctaLabel="View plans"
      description="Stripe billing information and subscription management will appear here."
      title="Billing"
    />
  );
}
