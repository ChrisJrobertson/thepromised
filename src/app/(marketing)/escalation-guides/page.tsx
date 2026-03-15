import {
  ArrowRight,
  Briefcase,
  Building,
  FileText,
  Heart,
  Home,
  Landmark,
  ShoppingBag,
  Train,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { ORG_GUIDES } from "@/lib/guides/organisations";

export const metadata: Metadata = {
  title: "UK Escalation Guides — Complaint Procedures for Every Industry",
  description:
    "Free step-by-step UK complaint escalation guides. Know exactly when and how to escalate to the ombudsman for energy, banking, broadband, housing, NHS, and more.",
};

const CATEGORIES = [
  {
    slug: "energy",
    icon: Zap,
    title: "Energy",
    description: "British Gas, EDF, OVO, Octopus and all UK energy suppliers",
    ombudsman: "Energy Ombudsman",
    timeframe: "8 weeks",
    colour: "bg-amber-50 text-amber-600",
  },
  {
    slug: "broadband_phone",
    icon: Wifi,
    title: "Broadband & Phone",
    description: "BT, Sky, Virgin Media, TalkTalk, Vodafone and all telecoms providers",
    ombudsman: "Communications Ombudsman / CISAS",
    timeframe: "8 weeks",
    colour: "bg-blue-50 text-blue-600",
  },
  {
    slug: "financial_services",
    icon: Landmark,
    title: "Financial Services",
    description: "Banks, credit cards, loans, mortgages, pensions",
    ombudsman: "Financial Ombudsman Service",
    timeframe: "8 weeks",
    colour: "bg-green-50 text-green-600",
  },
  {
    slug: "insurance",
    icon: FileText,
    title: "Insurance",
    description: "Home, car, travel, life insurance and all FCA-regulated policies",
    ombudsman: "Financial Ombudsman Service",
    timeframe: "8 weeks",
    colour: "bg-purple-50 text-purple-600",
  },
  {
    slug: "government_hmrc",
    icon: Building,
    title: "HMRC",
    description: "Tax disputes, self-assessment, PAYE, VAT, penalties",
    ombudsman: "Adjudicator's Office",
    timeframe: "Internal first",
    colour: "bg-slate-100 text-slate-600",
  },
  {
    slug: "government_dwp",
    icon: Users,
    title: "DWP (Benefits)",
    description: "Universal Credit, PIP, ESA, Jobseeker's Allowance",
    ombudsman: "First-tier Tribunal",
    timeframe: "1 month",
    colour: "bg-slate-100 text-slate-600",
  },
  {
    slug: "government_council",
    icon: Building,
    title: "Council",
    description: "Planning, housing allocation, social care, council tax",
    ombudsman: "Local Government Ombudsman",
    timeframe: "Internal first",
    colour: "bg-slate-100 text-slate-600",
  },
  {
    slug: "nhs",
    icon: Heart,
    title: "NHS",
    description: "GPs, hospitals, dentists, mental health services",
    ombudsman: "Parliamentary & Health Ombudsman",
    timeframe: "12 months",
    colour: "bg-red-50 text-red-600",
  },
  {
    slug: "housing",
    icon: Home,
    title: "Housing",
    description: "Landlords, letting agents, housing associations",
    ombudsman: "Housing Ombudsman / The Property Ombudsman",
    timeframe: "Varies",
    colour: "bg-orange-50 text-orange-600",
  },
  {
    slug: "retail",
    icon: ShoppingBag,
    title: "Retail & Services",
    description: "Online retailers, shops, service providers",
    ombudsman: "Small claims court / ADR",
    timeframe: "14 days letter before action",
    colour: "bg-pink-50 text-pink-600",
  },
  {
    slug: "transport",
    icon: Train,
    title: "Transport",
    description: "Rail, airlines, bus, DVLA",
    ombudsman: "Rail Ombudsman / CAA",
    timeframe: "Varies",
    colour: "bg-indigo-50 text-indigo-600",
  },
  {
    slug: "employment",
    icon: Briefcase,
    title: "Employment",
    description: "Unfair dismissal, discrimination, unpaid wages, grievances",
    ombudsman: "ACAS + Employment Tribunal",
    timeframe: "3 months minus 1 day",
    colour: "bg-teal-50 text-teal-600",
  },
] as const;

export default function EscalationGuidesPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            UK Escalation Guides
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Free step-by-step complaint escalation guides for every regulated UK industry.
            Know exactly when and how to escalate to the ombudsman.
          </p>
        </div>
      </section>

      {/* Category grid */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  className="group flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                  href={`/escalation-guides/${cat.slug}`}
                  key={cat.slug}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${cat.colour}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <h2 className="mt-3 font-semibold">{cat.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="mt-3 border-t pt-3 flex flex-col gap-1">
                    <p className="text-xs">
                      <span className="text-muted-foreground">Ombudsman: </span>
                      <span className="font-medium">{cat.ombudsman}</span>
                    </p>
                    <p className="text-xs">
                      <span className="text-muted-foreground">Escalate after: </span>
                      <span className="font-medium">{cat.timeframe}</span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company-specific guides */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-2 text-2xl font-bold">Guides for specific companies</h2>
          <p className="mb-8 text-muted-foreground">
            Detailed complaint guides with contact details, ombudsman info, and tips for specific organisations.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ORG_GUIDES.map((guide) => (
              <Link
                className="group flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                href={`/guides/${guide.slug}`}
                key={guide.slug}
              >
                <div>
                  <p className="text-sm font-medium">{guide.name}</p>
                  <p className="text-xs text-muted-foreground">{guide.category}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary/5 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold">
            Track your complaint with TheyPromised
          </h2>
          <p className="mb-6 text-muted-foreground">
            Log every interaction, get automatic deadline reminders, and export a
            professional case file. Free to start.
          </p>
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:opacity-90"
            href="/register"
          >
            Start your case for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
