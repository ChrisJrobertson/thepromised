"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { COMPLAINT_PACKS } from "@/lib/packs/config";
import { PLAN_PRICES, getPriceId, type BillingPeriod } from "@/lib/stripe/config";

type PricingClientProps = {
  isLoggedIn: boolean;
};

const FREE_FEATURES = [
  "1 active case",
  "3 AI suggestions per month",
  "1 AI-drafted letter per month",
  "All interaction channels",
  "Escalation guides (read-only)",
  "Evidence upload",
  "Basic timeline view",
];

const FREE_NOT_INCLUDED = [
  "PDF export",
  "Email reminders",
  "More than 1 active case",
  "Voice memos",
];

const BASIC_FEATURES = [
  "Unlimited cases",
  "Full interaction logging",
  "Timeline & letters PDF export",
  "Email reminders & alerts",
  "Escalation progress tracking",
  "10 AI case analyses / month",
  "5 AI-drafted letters / month",
];

const PRO_FEATURES = [
  "Everything in Basic",
  "Full case file PDF (ombudsman-ready)",
  "50 AI case analyses / month",
  "30 AI-drafted letters / month",
  "Voice memo recording",
  "Email forwarding parser",
  "AI auto-summary on all interactions",
  "Priority email support",
];

const COMPARISON_ROWS: Array<{
  feature: string;
  free: string | boolean;
  basic: string | boolean;
  pro: string | boolean;
}> = [
  { feature: "Active cases", free: "1", basic: "Unlimited", pro: "Unlimited" },
  { feature: "Interaction logging", free: true, basic: true, pro: true },
  { feature: "Evidence uploads", free: true, basic: true, pro: true },
  { feature: "Escalation guides", free: "View only", basic: "Full access", pro: "Full access" },
  { feature: "Email reminders", free: false, basic: true, pro: true },
  { feature: "Send letters via email", free: false, basic: true, pro: true },
  { feature: "Delivery tracking", free: false, basic: true, pro: true },
  { feature: "Timeline PDF export", free: false, basic: true, pro: true },
  { feature: "Full case file PDF", free: false, basic: false, pro: true },
  { feature: "AI suggestions/month", free: "3", basic: "10", pro: "50" },
  { feature: "AI letters/month", free: "1", basic: "5", pro: "30" },
  { feature: "Response timer", free: false, basic: true, pro: true },
  { feature: "Shareable case links", free: false, basic: true, pro: true },
  { feature: "Priority support", free: false, basic: false, pro: true },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Can I cancel at any time?",
    a: "Yes — cancel any time from your billing settings. You keep access until the end of your paid period. No lock-ins.",
  },
  {
    q: "What counts as a 'case'?",
    a: "Each complaint you're tracking is a case — for example, a billing dispute with British Gas is one case, and a PIP appeal with DWP is another. On the free plan, you can have 1 active case at a time.",
  },
  {
    q: "Are AI credits shared between features?",
    a: "No — AI case analyses and AI letter drafts have separate limits. Credits reset at the start of each calendar month for all plans, including the free tier.",
  },
  {
    q: "Will my data be deleted if I downgrade?",
    a: "No. All your case data, interactions, and evidence are preserved when you downgrade. You'll just lose access to paid features for future use.",
  },
  {
    q: "Is the PDF export accepted by ombudsmen?",
    a: "Our full case file PDF is designed to present your complaint chronologically in a professional format. However, ombudsman requirements vary — always check what your specific ombudsman accepts.",
  },
  {
    q: "Do you offer discounts for vulnerable customers?",
    a: "Yes. If you're experiencing financial hardship, please contact us at support@theypromised.app and we'll find a way to help.",
  },
];

function FeatureCheck({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-4 w-4 text-green-500" />
    ) : (
      <X className="mx-auto h-4 w-4 text-muted-foreground/50" />
    );
  }
  return <span className="text-sm text-center block">{value}</span>;
}

export function PricingClient({ isLoggedIn }: PricingClientProps) {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  async function handleCheckout(tier: "basic" | "pro") {
    if (!isLoggedIn) {
      router.push("/register");
      return;
    }

    const priceId = getPriceId(tier, billingPeriod);
    if (!priceId) {
      toast.error("Pricing not configured. Please contact support.");
      return;
    }

    setLoadingPlan(tier);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Failed to start checkout. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  const basic = PLAN_PRICES.basic;
  const pro = PLAN_PRICES.pro;

  return (
    <main className="mx-auto max-w-6xl space-y-16 px-4 py-12 md:py-20">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          For Consumers — Track Your Complaint
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          Start free, then upgrade for AI letters, exports, and guided escalation when
          your case needs more firepower.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3">
          <button
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              billingPeriod === "monthly"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setBillingPeriod("monthly")}
            type="button"
          >
            Monthly
          </button>
          <button
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              billingPeriod === "annual"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setBillingPeriod("annual")}
            type="button"
          >
            Annual
          </button>
          {billingPeriod === "annual" && (
            <Badge className="border-green-200 bg-green-50 text-green-700" variant="outline">
              Save 33%
            </Badge>
          )}
        </div>
      </section>

      {/* Pricing cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Free */}
        <div className="rounded-xl border bg-card p-6 space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Free
            </p>
            <p className="mt-1 text-4xl font-bold">£0</p>
            <p className="text-sm text-muted-foreground">Forever free</p>
          </div>

          <ul className="space-y-2.5">
            {FREE_FEATURES.map((f) => (
              <li className="flex items-center gap-2 text-sm" key={f}>
                <Check className="h-4 w-4 shrink-0 text-green-500" />
                {f}
              </li>
            ))}
            {FREE_NOT_INCLUDED.map((f) => (
              <li className="flex items-center gap-2 text-sm text-muted-foreground" key={f}>
                <X className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            className="block w-full rounded-lg border px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-muted"
            href={isLoggedIn ? "/dashboard" : "/register"}
          >
            Start Free
          </Link>
        </div>

        {/* Basic — Most Popular */}
        <div className="relative rounded-xl border-2 border-primary bg-card p-6 space-y-6 shadow-lg">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary text-white px-3 py-0.5 text-xs font-semibold">
              Most Popular
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Basic
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-bold">
                £{billingPeriod === "monthly" ? basic.monthly : basic.annualMonthlyEquivalent}
              </span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            {billingPeriod === "annual" ? (
              <p className="text-sm text-muted-foreground">
                £{basic.annual}/year · save 33%
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Or £{basic.annual}/yr (save {basic.annualSavingPercent}%)
              </p>
            )}
          </div>

          <ul className="space-y-2.5">
            {BASIC_FEATURES.map((f) => (
              <li className="flex items-center gap-2 text-sm" key={f}>
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>

          <button
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            disabled={loadingPlan !== null}
            onClick={() => handleCheckout("basic")}
            type="button"
          >
            {loadingPlan === "basic"
              ? "Redirecting..."
              : "Choose Basic"}
          </button>
        </div>

        {/* Pro */}
        <div className="rounded-xl border bg-card p-6 space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              Pro <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-bold">
                £{billingPeriod === "monthly" ? pro.monthly : pro.annualMonthlyEquivalent}
              </span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            {billingPeriod === "annual" ? (
              <p className="text-sm text-muted-foreground">
                £{pro.annual}/year · save 33%
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Or £{pro.annual}/yr (save {pro.annualSavingPercent}%)
              </p>
            )}
          </div>

          <ul className="space-y-2.5">
            {PRO_FEATURES.map((f) => (
              <li className="flex items-center gap-2 text-sm" key={f}>
                <Zap className="h-4 w-4 shrink-0 text-amber-500" />
                {f}
              </li>
            ))}
          </ul>

          <button
            className="w-full rounded-lg border-2 border-primary px-4 py-2.5 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
            disabled={loadingPlan !== null}
            onClick={() => handleCheckout("pro")}
            type="button"
          >
            {loadingPlan === "pro"
              ? "Redirecting..."
              : "Choose Pro"}
          </button>
        </div>
      </div>

      {/* Annual pricing summary */}
      <div className="rounded-xl border bg-muted/30 px-6 py-5 text-center text-sm text-muted-foreground">
        <p>
          Annual pricing: Basic £39.99/yr (save 33%), Pro £79.99/yr (save 33%)
        </p>
      </div>

      {/* Feature comparison table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Full feature comparison</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="py-3 pl-4 pr-2 text-left font-medium">Feature</th>
                <th className="px-4 py-3 text-center font-medium">Free</th>
                <th className="px-4 py-3 text-center font-medium text-primary">Basic</th>
                <th className="px-4 py-3 text-center font-medium">Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  className={`border-b ${i % 2 !== 0 ? "bg-muted/20" : ""}`}
                  key={row.feature}
                >
                  <td className="py-2.5 pl-4 pr-2 font-medium text-foreground">
                    {row.feature}
                  </td>
                  <td className="px-4 py-2.5">
                    <FeatureCheck value={row.free} />
                  </td>
                  <td className="bg-primary/5 px-4 py-2.5">
                    <FeatureCheck value={row.basic} />
                  </td>
                  <td className="px-4 py-2.5">
                    <FeatureCheck value={row.pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint packs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Need More Help? Complaint Packs</h2>
        <p className="text-muted-foreground">
          One-off payment. No subscription needed. Works with or without a plan.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {COMPLAINT_PACKS.map((pack) => (
            <article
              className={`rounded-xl border bg-white p-5 ${pack.popular ? "border-primary ring-1 ring-primary/30" : ""}`}
              key={pack.id}
            >
              {pack.popular ? (
                <Badge className="mb-2 bg-primary text-white">Most Popular</Badge>
              ) : null}
              <p className="text-lg font-semibold">{pack.name}</p>
              <p className="mt-1 text-2xl font-bold">{pack.priceDisplay}</p>
              <p className="mt-2 text-sm text-muted-foreground">{pack.description}</p>
              <Link
                className="mt-4 inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                href="/packs"
              >
                View Pack
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* B2B summary */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">For Business — Complaint Intelligence</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-4 text-sm">
            <p className="font-semibold">Insight</p>
            <p className="text-muted-foreground">£500/month</p>
          </div>
          <div className="rounded-lg border bg-white p-4 text-sm">
            <p className="font-semibold">Professional</p>
            <p className="text-muted-foreground">£1,000/month</p>
          </div>
          <div className="rounded-lg border bg-white p-4 text-sm">
            <p className="font-semibold">Enterprise</p>
            <p className="text-muted-foreground">Custom</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          See what your customers are really saying.
          {" "}
          <Link className="font-medium text-primary underline" href="/business">
            Learn More →
          </Link>
        </p>
      </section>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <div className="divide-y rounded-xl border">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                className="flex w-full items-start justify-between px-5 py-4 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                type="button"
              >
                <span className="font-medium">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
              {openFaq === i && (
                <p className="px-5 pb-4 text-sm text-muted-foreground">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 py-12 text-center space-y-4">
        <h2 className="text-2xl font-bold">Not sure what you need?</h2>
        <p className="text-muted-foreground">
          Start free. Track your complaint. Upgrade when it matters.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
            href={isLoggedIn ? "/cases/new" : "/register"}
          >
            {isLoggedIn ? "Start Your Case — Free" : "Start Your Case — Free"}
          </Link>
          <Link
            className="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-muted"
            href="/how-it-works"
          >
            How it works
          </Link>
        </div>
      </div>
    </main>
  );
}
