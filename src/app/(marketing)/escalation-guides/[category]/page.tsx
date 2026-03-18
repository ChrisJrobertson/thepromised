import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

const CATEGORY_TITLES: Record<string, string> = {
  energy: "Energy Supplier",
  water: "Water Company",
  broadband_phone: "Broadband & Phone Provider",
  financial_services: "Bank or Financial Services Provider",
  insurance: "Insurance Company",
  government_hmrc: "HMRC",
  government_dwp: "DWP (Benefits)",
  government_council: "Council",
  nhs: "NHS",
  housing: "Landlord or Housing Provider",
  retail: "Retailer or Service Provider",
  transport: "Transport Operator",
  education: "Education Provider",
  employment: "Employment Complaint",
  // New verticals
  landlord_tenant: "Landlord or Letting Agent",
  parking: "Parking Ticket Issuer",
  council_tax: "Council Tax Authority",
  motor_vehicle: "Car Dealer or Motor Finance Provider",
  nhs_healthcare: "NHS or Healthcare Provider",
  home_improvements: "Builder or Tradesperson",
  subscriptions: "Subscription Service Provider",
  other: "Organisation",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  energy: "UK energy supplier complaints — from billing disputes to smart meter problems",
  water: "Water company complaints — billing, service quality, drainage",
  broadband_phone: "Broadband, phone, and telecoms provider complaints",
  financial_services: "Bank, credit card, mortgage, and financial services complaints",
  insurance: "Home, car, travel, and life insurance complaints",
  government_hmrc: "HMRC complaints — tax disputes, penalties, and PAYE errors",
  government_dwp: "DWP complaints — Universal Credit, PIP, ESA appeals",
  government_council: "Council complaints — planning, housing, social care",
  nhs: "NHS complaints — GPs, hospitals, dentists, and mental health",
  housing: "Landlord, letting agent, and housing association complaints",
  retail: "Retailer and service provider complaints — Consumer Rights Act",
  transport: "Rail, airline, and transport provider complaints",
  education: "School, college, and university complaints",
  employment: "Employment disputes — unfair dismissal, discrimination, grievances",
  // New verticals
  landlord_tenant: "Landlord and tenant disputes — deposits, repairs, disrepair, and housing rights",
  parking: "Parking ticket appeals — private PCNs and council Penalty Charge Notices",
  council_tax: "Council tax disputes — banding challenges, liability, exemptions, and hardship",
  motor_vehicle: "Car purchase and motor finance complaints — Consumer Rights Act, faulty vehicles, Section 75",
  nhs_healthcare: "NHS and healthcare complaints — GPs, hospitals, clinical negligence, and the PHSO",
  home_improvements: "Builder and tradesperson complaints — substandard work, non-completion, and safety",
  subscriptions: "Subscription trap and cancellation complaints — Consumer Contracts Regulations and DMCC Act 2024",
  other: "General complaint escalation guide",
};

type Params = Promise<{ category: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { category } = await params;
  const title = CATEGORY_TITLES[category] ?? "Organisation";
  const description = CATEGORY_DESCRIPTIONS[category] ?? "";

  return {
    title: `How to Complain About Your ${title} — UK Guide 2026`,
    description: `${description}. Step-by-step escalation guide with ombudsman details, deadlines, and template letters.`,
  };
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_TITLES).map((category) => ({ category }));
}

export default async function EscalationGuideCategoryPage({
  params,
}: {
  params: Params;
}) {
  const { category } = await params;

  if (!CATEGORY_TITLES[category]) {
    notFound();
  }

  const supabase = await createClient();
  const { data: rules } = await supabase
    .from("escalation_rules")
    .select("*")
    .eq("category", category)
    .order("stage_order", { ascending: true });

  const title = CATEGORY_TITLES[category];
  const description = CATEGORY_DESCRIPTIONS[category] ?? "";

  return (
    <main>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-white py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <Link
            className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
            href="/escalation-guides"
          >
            ← All escalation guides
          </Link>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            How to Complain About Your {title}
          </h1>
          <p className="mt-3 text-muted-foreground">{description}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            UK Guide · Updated 2026 · Based on current ombudsman procedures
          </p>
        </div>
      </section>

      {/* Guide content */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          {!rules || rules.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed py-12 text-center text-muted-foreground">
              <p className="font-medium">Guide coming soon</p>
              <p className="mt-1 text-sm">
                This guide is being compiled. Check back shortly.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {(rules as Array<{
                id: string;
                stage: string;
                stage_order: number;
                title: string;
                description: string;
                action_required: string;
                wait_period_days: number | null;
                regulatory_body: string | null;
                regulatory_url: string | null;
                tips: string | null;
              }>).map((rule) => (
                <div
                  className="flex gap-4 rounded-xl border bg-white p-5 shadow-sm"
                  key={rule.id}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {rule.stage_order}
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-semibold">{rule.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {rule.description}
                    </p>
                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        What to do
                      </p>
                      <p className="text-sm">{rule.action_required}</p>
                    </div>
                    {rule.wait_period_days !== null && (
                      <p className="text-xs text-muted-foreground">
                        ⏱ Wait time: {rule.wait_period_days} days from complaint
                      </p>
                    )}
                    {rule.regulatory_body && (
                      <div className="flex items-center gap-2">
                        {rule.regulatory_url ? (
                          <a
                            className="flex items-center gap-1 text-sm text-secondary hover:underline"
                            href={rule.regulatory_url}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {rule.regulatory_body}
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {rule.regulatory_body}
                          </span>
                        )}
                      </div>
                    )}
                    {rule.tips && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                        💡 {rule.tips}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800">
            <strong>Important:</strong> This guide is for general information only. Procedures and
            time limits can change. Always verify current requirements with the relevant
            ombudsman or regulator. This is not legal advice.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold">
            Track your {title} complaint with TheyPromised
          </h2>
          <p className="mb-6 text-muted-foreground">
            Log every interaction, follow the guide above automatically, and export a
            professional case file when you&apos;re ready to escalate.
          </p>
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:opacity-90"
            href="/register"
          >
            Start your case for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            No credit card required · The escalation guide loads automatically for your case
          </p>
        </div>
      </section>
    </main>
  );
}
