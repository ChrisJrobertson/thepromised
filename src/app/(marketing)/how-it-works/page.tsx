import {
  ArrowRight,
  Bell,
  ClipboardList,
  Download,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How TheyPromised Works",
  description:
    "Create a case, log every interaction, track promises, generate AI letters, and escalate to the ombudsman. Here's how TheyPromised helps you win your complaint.",
  openGraph: {
    title: "How TheyPromised Works",
    description:
      "Create a case, log interactions, track promises, and escalate. Here's how it works.",
    url: "https://www.theypromised.app/how-it-works",
    siteName: "TheyPromised",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "How TheyPromised Works",
    description:
      "Create a case, log interactions, track promises, and escalate. Here's how it works.",
  },
};

const STEPS = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Create a Case",
    description:
      "Start a case for each complaint — select the organisation, describe what happened, note your reference number, and set your desired outcome. It takes about 2 minutes.",
    detail: [
      "Search from our database of 50+ UK organisations",
      "Set the category (energy, banking, broadband, etc.) to load the right escalation guide",
      "Record the date you first made contact — this starts your 8-week escalation clock",
      "Log the amount in dispute and what resolution you're seeking",
    ],
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Log Every Interaction",
    description:
      "After every phone call, email, or chat — log it in 30 seconds. Record who you spoke to, what they said, what they promised, and when.",
    detail: [
      "8 channels: phone, email, letter, webchat, in-person, social media, app, other",
      "Record contact name, department, job title, and reference number",
      "Add promises with automatic deadline reminders",
      "Attach evidence: photos, documents, voice memos, PDFs",
    ],
  },
  {
    number: "03",
    icon: Bell,
    title: "Follow the Escalation Guide",
    description:
      "TheyPromised knows the complaints procedure for every regulated UK industry. It tells you exactly what to do next — and when.",
    detail: [
      "Step-by-step UK complaints procedures for Energy, Banking, Broadband, NHS, Housing, and more",
      "Automatic reminders at 6, 7, and 8 weeks (the key ombudsman window)",
      "Generates letters for every stage — initial complaint, follow-up, escalation, before-action",
      "Tracks which stages you've completed",
    ],
  },
  {
    number: "04",
    icon: Download,
    title: "Export Your Case File",
    description:
      "Generate a professional, chronological case file that ombudsmen and courts expect. Everything documented, nothing forgotten.",
    detail: [
      "Cover page: case details, organisation, reference, escalation stage",
      "Full timeline: every interaction with dates, channels, contacts, and outcomes",
      "Promises tracker: kept, broken, pending — all in one table",
      "Evidence index: list of all uploaded files with dates and descriptions",
    ],
  },
];

const HOWTO_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Track a Consumer Complaint with TheyPromised",
  description:
    "Step-by-step guide to logging and escalating a UK consumer complaint using TheyPromised.",
  step: [
    {
      "@type": "HowToStep",
      name: "Create a Case",
      text: "Start a case for each complaint — select the organisation, describe what happened, note your reference number, and set your desired outcome. It takes about 2 minutes.",
    },
    {
      "@type": "HowToStep",
      name: "Log Every Interaction",
      text: "After every phone call, email, or chat — log it in 30 seconds. Record who you spoke to, what they said, what they promised, and when.",
    },
    {
      "@type": "HowToStep",
      name: "Follow the Escalation Guide",
      text: "TheyPromised knows the complaints procedure for every regulated UK industry. It tells you exactly what to do next — and when.",
    },
    {
      "@type": "HowToStep",
      name: "Export Your Case File",
      text: "Generate a professional, chronological case file that ombudsmen and courts expect. Everything documented, nothing forgotten.",
    },
  ],
};

export default function HowItWorksPage() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO_SCHEMA) }}
        type="application/ld+json"
      />
    <main>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            How TheyPromised Works
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A practical, step-by-step system for turning a frustrating complaint into
            airtight evidence.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl space-y-20 px-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isEven = i % 2 === 0;
            return (
              <div
                className={`flex flex-col gap-8 md:flex-row ${isEven ? "" : "md:flex-row-reverse"}`}
                key={step.number}
              >
                {/* Step content */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-black text-primary/20">
                      {step.number}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold">{step.title}</h2>
                  <p className="leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.detail.map((item) => (
                      <li
                        className="flex items-start gap-2 text-sm text-slate-600"
                        key={item}
                      >
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mockup placeholder */}
                <div className="flex-1">
                  <div className="h-48 rounded-xl border-2 border-dashed bg-slate-50 flex items-center justify-center text-sm text-muted-foreground md:h-64">
                    Step {i + 1} screenshot
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI section */}
      <section className="border-t bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800">
            <Sparkles className="h-3.5 w-3.5" />
            Basic &amp; Pro plans
          </div>
          <h2 className="text-2xl font-bold">Plus AI-powered assistance</h2>
          <p className="mt-3 text-muted-foreground">
            Upgrade to unlock AI case analysis, letter drafting, and automated
            summaries. Claude analyses your entire case history and drafts
            professional letters pre-populated with your timeline data.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">Ready to start?</h2>
          <p className="mb-6 text-muted-foreground">
            It&apos;s free to get started. No credit card required.
          </p>
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:opacity-90"
            href="/register"
          >
            Start tracking your complaint
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
    </>
  );
}
