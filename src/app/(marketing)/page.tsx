"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  ClipboardList,
  Compass,
  CreditCard,
  FileOutput,
  FileText,
  Home,
  Landmark,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  Star,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const CATEGORY_ICONS = [
  { icon: Zap, label: "Energy" },
  { icon: Landmark, label: "Banking" },
  { icon: Wifi, label: "Broadband" },
  { icon: FileText, label: "Government" },
  { icon: Home, label: "Housing" },
  { icon: Shield, label: "Insurance" },
];

const PROBLEMS = [
  {
    icon: Phone,
    title: "You called. They promised to fix it.",
    body: "They didn't. And now you've called six more times with six different people and nothing has changed.",
  },
  {
    icon: Users,
    title: "You've spoken to 5 people.",
    body: "Nobody knows what the last one said. There's no record, no owner, and nobody takes responsibility.",
  },
  {
    icon: FileText,
    title: "The ombudsman wants proof.",
    body: "Dates, times, names, reference numbers. Everything you can't remember because nobody told you to write it down.",
  },
];

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Log Everything",
    body: "Track every call, email, chat, and letter in 30 seconds. Record who said what, when, and what they promised — with automatic deadline reminders.",
    colour: "bg-blue-50 text-primary",
  },
  {
    icon: Compass,
    title: "Get Guided",
    body: "Our escalation engine knows every UK complaints procedure. It tells you exactly what to do next, who to contact, and when you can go to the ombudsman.",
    colour: "bg-teal-50 text-secondary",
  },
  {
    icon: FileOutput,
    title: "Export & Win",
    body: "Generate a professional case file that ombudsmen and courts actually want to see. Dates, times, names, promises — all in one clean document.",
    colour: "bg-amber-50 text-amber-600",
  },
];

const HOW_STEPS = [
  {
    number: "01",
    title: "Create a Case",
    body: "Select the organisation and describe what happened. Takes 2 minutes.",
  },
  {
    number: "02",
    title: "Log Every Interaction",
    body: "After every call, email, or chat — log it. Channel, who you spoke to, what was promised. 30 seconds.",
  },
  {
    number: "03",
    title: "Follow the Guide",
    body: "We tell you when to escalate, who to contact, and remind you of every deadline automatically.",
  },
  {
    number: "04",
    title: "Export Your Case File",
    body: "A clean, professional PDF ready for the ombudsman. Built from every interaction you've logged.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "After 4 months of getting nowhere with my energy supplier, I used the export to go to the ombudsman. They settled within 3 weeks.",
    name: "Sarah T.",
    type: "Energy billing dispute",
    stars: 5,
  },
  {
    quote:
      "I'd forgotten half the conversations. TheyPromised made me realise how strong my case actually was — dates, names, promises broken.",
    name: "Marcus L.",
    type: "Broadband provider complaint",
    stars: 5,
  },
  {
    quote:
      "The escalation guide was genuinely more useful than anything I found on Citizens Advice. Step-by-step, no jargon.",
    name: "Priya K.",
    type: "Landlord dispute",
    stars: 5,
  },
];

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#1e3a5f] via-[#1e3a5f]/90 to-white pb-20 pt-16 md:pb-32 md:pt-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            animate="visible"
            className="space-y-6"
            initial="hidden"
            variants={stagger}
          >
            <motion.p
              className="text-base font-semibold text-teal-300 md:text-lg"
              variants={fadeUp}
            >
              Track every call. Log every promise. Prove everything.
            </motion.p>
            <motion.h1
              className="text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl"
              variants={fadeUp}
            >
              They Promised.
              <br />
              You Proved It.
            </motion.h1>
            <motion.p
              className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl"
              variants={fadeUp}
            >
              When companies break their promises, you need more than anger — you need
              evidence. TheyPromised helps you build a professional, timestamped case
              file that ombudsmen and courts actually take seriously.
            </motion.p>
            <motion.div
              className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              variants={fadeUp}
            >
              <Link
                className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-teal-500 hover:shadow-xl"
                href="/register"
              >
                Start Your Case — Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="text-base font-medium text-white underline underline-offset-4 hover:text-blue-100"
                href="/how-it-works"
              >
                See how it works
              </Link>
            </motion.div>
            <motion.p
              className="text-sm text-slate-300"
              variants={fadeUp}
            >
              Join thousands of UK consumers who stopped being ignored.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50 py-6">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Bank-grade encryption
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              UK data storage
            </span>
            <span className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              GDPR compliant
            </span>
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              SynqForge LTD (Company 16808271)
            </span>
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              No credit card required
            </span>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ──────────────────────────────────────────────────── */}
      <section className="border-y bg-slate-50 py-6">
        <div className="mx-auto max-w-5xl px-4">
          <p className="mb-4 text-center text-sm font-semibold text-muted-foreground">
            Helping UK consumers hold organisations to account
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {CATEGORY_ICONS.map(({ icon: Icon, label }) => (
              <div
                className="flex items-center gap-2 text-sm font-medium text-slate-600"
                key={label}
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM SECTION ───────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            animate="visible"
            initial="hidden"
            variants={stagger}
            viewport={{ once: true }}
            whileInView="visible"
          >
            <motion.h2
              className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl"
              variants={fadeUp}
            >
              Sound familiar?
            </motion.h2>
            <div className="grid gap-6 md:grid-cols-3">
              {PROBLEMS.map(({ icon: Icon, title, body }) => (
                <motion.div
                  className="rounded-xl border bg-white p-6 shadow-sm"
                  key={title}
                  variants={fadeUp}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                    <Icon className="h-5 w-5 text-red-500" />
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SOLUTION SECTION ──────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            animate="visible"
            initial="hidden"
            variants={stagger}
            viewport={{ once: true }}
            whileInView="visible"
          >
            <motion.h2
              className="mb-4 text-center text-3xl font-bold tracking-tight md:text-4xl"
              variants={fadeUp}
            >
              TheyPromised turns your frustration
              <br className="hidden md:block" />
              <span className="text-primary"> into evidence.</span>
            </motion.h2>
            <motion.p
              className="mb-12 text-center text-muted-foreground"
              variants={fadeUp}
            >
              Everything you need to build an airtight case — in one place.
            </motion.p>
            <div className="grid gap-6 md:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, body, colour }) => (
                <motion.div
                  className="rounded-xl border bg-white p-6 shadow-sm"
                  key={title}
                  variants={fadeUp}
                >
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${colour}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4">
          <motion.div
            animate="visible"
            initial="hidden"
            variants={stagger}
            viewport={{ once: true }}
            whileInView="visible"
          >
            <motion.h2
              className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl"
              variants={fadeUp}
            >
              How it works
            </motion.h2>
            <div className="space-y-0">
              {HOW_STEPS.map((step, i) => (
                <motion.div
                  className="relative flex gap-6 pb-10"
                  key={step.number}
                  variants={fadeUp}
                >
                  {/* Vertical connector */}
                  {i < HOW_STEPS.length - 1 && (
                    <div className="absolute left-5 top-10 h-full w-0.5 bg-primary/15" />
                  )}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {step.number}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div className="mt-4 text-center" variants={fadeUp}>
              <Link
                className="text-sm font-medium text-primary underline underline-offset-4"
                href="/how-it-works"
              >
                Read the full walkthrough →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── AI SECTION ────────────────────────────────────────────────────────── */}
      <section className="bg-[#1e3a5f] py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            animate="visible"
            className="grid items-center gap-12 md:grid-cols-2"
            initial="hidden"
            variants={stagger}
            viewport={{ once: true }}
            whileInView="visible"
          >
            <motion.div variants={fadeUp}>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-teal-300">
                <Sparkles className="h-3.5 w-3.5" />
                AI-powered
              </div>
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                AI That Actually Helps
              </h2>
              <p className="mb-6 leading-relaxed text-blue-200">
                Our AI analyses your case and drafts professional complaint letters —
                pre-populated with your timeline data, formatted to what ombudsmen and
                solicitors expect.
              </p>
              <ul className="space-y-2 text-sm text-blue-100">
                {[
                  "Case strength analysis with next steps",
                  "Full-length letters in seconds",
                  "Evidence gap identification",
                  "Escalation timing recommendations",
                ].map((item) => (
                  <li className="flex items-center gap-2" key={item}>
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={fadeUp}>
              {/* Mock letter card */}
              <div className="rounded-xl bg-white p-5 shadow-2xl">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    AI-drafted letter
                  </span>
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                    Draft
                  </span>
                </div>
                <div className="mb-3 text-xs text-muted-foreground">
                  <p>RE: Formal Complaint — Account Ref. 87234</p>
                  <p className="mt-0.5">British Gas Complaints Department</p>
                </div>
                <div className="space-y-2 text-xs leading-relaxed text-slate-700">
                  <p className="h-2.5 w-full rounded bg-slate-100" />
                  <p className="h-2.5 w-5/6 rounded bg-slate-100" />
                  <p className="h-2.5 w-full rounded bg-slate-100" />
                  <p className="h-2.5 w-4/6 rounded bg-slate-100" />
                  <p className="mt-3 h-2.5 w-full rounded bg-slate-100" />
                  <p className="h-2.5 w-5/6 rounded bg-slate-100" />
                  <p className="h-2.5 w-full rounded bg-slate-100" />
                </div>
                <div className="mt-4 flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    Based on 7 interactions
                  </span>
                  <span className="text-xs font-medium text-teal-600">
                    Generated in 8 seconds
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            animate="visible"
            initial="hidden"
            variants={stagger}
            viewport={{ once: true }}
            whileInView="visible"
          >
            <motion.h2
              className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl"
              variants={fadeUp}
            >
              UK consumers winning their cases
            </motion.h2>
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <motion.div
                  className="rounded-xl border bg-white p-6 shadow-sm"
                  key={t.name}
                  variants={fadeUp}
                >
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        key={i}
                      />
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-slate-700">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.type}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ───────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold">Simple pricing</h2>
          <p className="mb-8 text-muted-foreground">
            Start free. Upgrade when your case needs it.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                name: "Free",
                price: "£0",
                features: ["1 case", "All channels", "Escalation guides"],
                href: "/register",
                cta: "Start Free",
                highlight: false,
              },
              {
                name: "Basic",
                price: "£4.99/mo",
                features: ["Unlimited cases", "PDF export", "Email reminders", "10 AI analyses/mo"],
                href: "/pricing",
                cta: "Get Basic",
                highlight: true,
              },
              {
                name: "Pro",
                price: "£9.99/mo",
                features: ["Full case file PDF", "50 AI analyses/mo", "Voice memos", "Priority support"],
                href: "/pricing",
                cta: "Go Pro",
                highlight: false,
              },
            ].map((plan) => (
              <div
                className={`rounded-xl border p-5 text-left ${plan.highlight ? "border-primary shadow-md bg-white" : "bg-white"}`}
                key={plan.name}
              >
                {plan.highlight && (
                  <p className="mb-2 text-xs font-semibold text-primary">Most popular</p>
                )}
                <p className="font-bold">{plan.name}</p>
                <p className="mt-1 text-2xl font-bold">{plan.price}</p>
                <ul className="mt-3 space-y-1.5">
                  {plan.features.map((f) => (
                    <li className="flex items-center gap-1.5 text-xs text-muted-foreground" key={f}>
                      <div className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  className={`mt-4 block rounded-lg py-2 text-center text-sm font-medium transition-colors ${plan.highlight ? "bg-primary text-white hover:opacity-90" : "border hover:bg-muted"}`}
                  href={plan.href}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <Link
            className="mt-4 block text-sm text-muted-foreground underline underline-offset-4"
            href="/pricing"
          >
            Full pricing and feature comparison →
          </Link>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <motion.div
            animate="visible"
            initial="hidden"
            variants={stagger}
            viewport={{ once: true }}
            whileInView="visible"
          >
            <motion.h2
              className="text-3xl font-extrabold tracking-tight md:text-5xl"
              variants={fadeUp}
            >
              Stop losing arguments.
              <br />
              <span className="text-primary">Start building evidence.</span>
            </motion.h2>
            <motion.p
              className="mt-4 text-muted-foreground"
              variants={fadeUp}
            >
              Start free. No credit card required.
            </motion.p>
            <motion.div className="mt-8" variants={fadeUp}>
              <Link
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
                href="/register"
              >
                Start Tracking Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
