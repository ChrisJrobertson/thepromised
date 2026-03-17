import {
  ArrowRight,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  MessageSquare,
  Phone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Track Your Complaint Step by Step",
  description:
    "TheyPromised makes it simple to log every interaction, follow UK escalation procedures, and export a professional case file for the ombudsman.",
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

function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="h-48 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 flex flex-col justify-between md:h-64">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Searching for</p>
            <p className="font-semibold text-slate-800">British Gas</p>
          </div>
        </div>
        <div className="space-y-2">
          {["British Gas", "British Gas Business", "British Gas Services"].map((name, i) => (
            <div
              key={name}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${i === 0 ? "border-primary/40 bg-primary/10 font-medium text-primary" : "border-slate-200 bg-white text-slate-600"}`}
            >
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {name}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-secondary/20 px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-secondary" />
          <span className="text-xs font-medium text-slate-700">Energy · Ombudsman: Energy Ombudsman</span>
        </div>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="h-48 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 p-6 flex flex-col gap-3 md:h-64">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Recent Interactions</p>
        {[
          { icon: Phone, label: "Phone call · 23 mins", note: "Promised a refund by Friday", time: "Mon 10 Mar" },
          { icon: MessageSquare, label: "Webchat", note: "No resolution given", time: "Wed 12 Mar" },
          { icon: FileText, label: "Email sent", note: "Formal complaint submitted", time: "Fri 14 Mar" },
        ].map(({ icon: Icon, label, note, time }) => (
          <div key={label} className="flex items-start gap-3 rounded-lg bg-white/80 border border-teal-100 px-3 py-2">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100">
              <Icon className="h-3 w-3 text-teal-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-700">{label}</p>
              <p className="truncate text-xs text-slate-500">{note}</p>
            </div>
            <span className="shrink-0 text-xs text-slate-400">{time}</span>
          </div>
        ))}
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="h-48 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6 flex flex-col justify-between md:h-64">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <p className="text-xs font-semibold text-amber-700">AI Letter — Initial Complaint</p>
        </div>
        <div className="flex-1 rounded-lg bg-white/90 border border-amber-100 p-3 mt-3 font-mono text-xs text-slate-600 leading-relaxed overflow-hidden">
          <p className="font-semibold">Re: Formal Complaint — Billing Error</p>
          <p className="mt-2">Dear British Gas Complaints Team,</p>
          <p className="mt-1">I write to formally complain about an overcharge on my account (Ref: BG-12345) totalling £312.00, first raised on 10 March 2025 without resolution...</p>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-amber-700" />
          <p className="text-xs text-amber-700">Pre-filled with your case history · CRA 2015 referenced</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-48 rounded-xl bg-gradient-to-br from-slate-800 to-primary border border-slate-700 p-6 flex flex-col justify-between md:h-64">
      <div className="flex items-center gap-2">
        <Download className="h-4 w-4 text-white/80" />
        <p className="text-xs font-semibold text-white/80">Case File Export — British Gas</p>
      </div>
      <div className="space-y-2 flex-1 mt-3">
        {[
          { label: "Cover page & case summary", done: true },
          { label: "Full interaction timeline (14 entries)", done: true },
          { label: "Promises tracker — 2 broken", done: true },
          { label: "Letters sent (3 letters)", done: true },
          { label: "Evidence index (7 files)", done: true },
        ].map(({ label, done }) => (
          <div key={label} className="flex items-center gap-2">
            <Calendar className={`h-3 w-3 shrink-0 ${done ? "text-teal-400" : "text-white/30"}`} />
            <span className="text-xs text-white/80">{label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-teal-500/20 border border-teal-400/30 px-3 py-1.5">
        <p className="text-xs text-teal-300">PDF ready · Accepted by Energy Ombudsman</p>
      </div>
    </div>
  );
}

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

                {/* Visual card for this step */}
                <div className="flex-1">
                  <StepVisual index={i} />
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
