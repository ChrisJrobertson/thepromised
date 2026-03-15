import { ArrowRight, Clock, ExternalLink, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { ORG_GUIDES, getOrgGuide } from "@/lib/guides/organisations";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return ORG_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getOrgGuide(slug);
  if (!guide) return {};

  return {
    title: `How to Complain About ${guide.name} — Step-by-Step Guide | TheyPromised`,
    description: `Complete guide to making a complaint against ${guide.name}. Step-by-step escalation path, ombudsman details, time limits, and tips. Track your complaint free with TheyPromised.`,
    openGraph: {
      title: `How to Complain About ${guide.name}`,
      description: `Step-by-step complaint guide for ${guide.name} customers.`,
    },
  };
}

export default async function OrgGuidePage({ params }: { params: Params }) {
  const { slug } = await params;
  const guide = getOrgGuide(slug);

  if (!guide) notFound();

  const supabase = await createClient();
  const { data: rules } = await supabase
    .from("escalation_rules")
    .select("*")
    .eq("category", guide.categorySlug)
    .order("stage_order", { ascending: true });

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
          <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {guide.category}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            How to Complain About {guide.name}
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">{guide.intro}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            UK Guide · Updated {new Date().getFullYear()} · Based on current ombudsman procedures
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-3xl space-y-10 px-4">
          {/* Common complaints */}
          <div>
            <h2 className="mb-4 text-xl font-bold">Common {guide.name} complaints</h2>
            <ul className="space-y-2">
              {guide.commonComplaints.map((complaint) => (
                <li className="flex items-start gap-2 text-sm" key={complaint}>
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {complaint}
                </li>
              ))}
            </ul>
          </div>

          {/* Company contact details */}
          <div className="rounded-xl border bg-slate-50 p-5">
            <h2 className="mb-4 text-lg font-bold">How to contact {guide.name}</h2>
            <div className="space-y-3">
              {guide.complaintPhone && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <a
                      className="text-primary hover:underline"
                      href={`tel:${guide.complaintPhone.replace(/\s/g, "")}`}
                    >
                      {guide.complaintPhone}
                    </a>
                  </div>
                </div>
              )}
              {guide.complaintEmail && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
                    <Mail className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a
                      className="text-primary hover:underline"
                      href={`mailto:${guide.complaintEmail}`}
                    >
                      {guide.complaintEmail}
                    </a>
                  </div>
                </div>
              )}
              {guide.complaintAddress && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200">
                    <MapPin className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium">Postal address</p>
                    <p className="text-muted-foreground">{guide.complaintAddress}</p>
                  </div>
                </div>
              )}
              {guide.complaintUrl && (
                <a
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  href={guide.complaintUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Official complaints page
                </a>
              )}
            </div>
          </div>

          {/* Escalation path */}
          <div>
            <h2 className="mb-4 text-xl font-bold">Step-by-step escalation guide</h2>
            {!rules || rules.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed py-8 text-center text-muted-foreground">
                <p className="font-medium">Detailed steps loading...</p>
                <p className="mt-1 text-sm">
                  See the{" "}
                  <Link
                    className="text-primary underline"
                    href={`/escalation-guides/${guide.categorySlug}`}
                  >
                    {guide.category} escalation guide
                  </Link>{" "}
                  for the full process.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(
                  rules as Array<{
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
                  }>
                ).map((rule) => (
                  <div
                    className="flex gap-4 rounded-xl border bg-white p-5 shadow-sm"
                    key={rule.id}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {rule.stage_order}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">{rule.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {rule.description}
                      </p>
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          What to do
                        </p>
                        <p className="text-sm">{rule.action_required}</p>
                      </div>
                      {rule.wait_period_days !== null && (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          Wait time: {rule.wait_period_days} days
                        </p>
                      )}
                      {rule.regulatory_body && (
                        <div>
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
          </div>

          {/* Time limits */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-amber-800">
              <Clock className="h-5 w-5" />
              Time limits and deadlines
            </h2>
            <p className="text-sm text-amber-900">{guide.escalationDeadline}</p>
          </div>

          {/* Ombudsman details */}
          <div className="rounded-xl border bg-blue-50 p-5">
            <h2 className="mb-2 text-lg font-bold text-blue-900">
              Which ombudsman handles {guide.name} complaints?
            </h2>
            <p className="text-sm text-blue-800">
              If {guide.name} fails to resolve your complaint within the required timeframe, you can
              escalate to the{" "}
              <a
                className="font-semibold underline"
                href={guide.ombudsmanUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {guide.ombudsman}
              </a>{" "}
              — which is free, independent, and has the power to award compensation.
            </p>
          </div>

          {/* Tips */}
          <div>
            <h2 className="mb-4 text-xl font-bold">Tips for complaining to {guide.name}</h2>
            <ul className="space-y-3">
              {guide.tips.map((tip) => (
                <li className="flex items-start gap-3 rounded-lg border bg-white p-3 text-sm" key={tip}>
                  <span className="mt-0.5 shrink-0 text-base">💡</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800">
            <strong>Important:</strong> This guide is for general information only. Procedures and
            time limits can change. Always verify current requirements with the relevant ombudsman
            or regulator. This is not legal advice.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold">
            Track your {guide.name} complaint with TheyPromised
          </h2>
          <p className="mb-6 text-muted-foreground">
            Log every interaction, follow this guide automatically, and export a professional case
            file when you&apos;re ready to escalate. Start free — no credit card required.
          </p>
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:opacity-90"
            href="/register"
          >
            Start tracking your {guide.name} complaint — free
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
