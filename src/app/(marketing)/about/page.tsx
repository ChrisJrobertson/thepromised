import { ArrowRight, Shield, Users, Zap } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About TheyPromised",
  description:
    "Built for people who've had enough of being ignored. TheyPromised is a UK consumer complaint tracking platform by SynqForge.",
};

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-white py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Built for people who&apos;ve had enough of being ignored.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            TheyPromised started from a simple observation: UK consumers are losing
            winnable disputes every day, not because their case is weak — but because
            they can&apos;t prove it.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl space-y-6 px-4 text-slate-700 leading-relaxed">
          <p>
            Every year, UK consumers win billions of pounds in complaints through
            ombudsmen and courts. But for every person who wins, there are ten who gave
            up — because they couldn&apos;t remember the dates, the names, the promises,
            or the reference numbers.
          </p>
          <p>
            TheyPromised is the tool we wish existed. It sits alongside you throughout
            the complaint process — logging every interaction, tracking every promise,
            guiding you through the correct escalation path, and generating the kind
            of professional case file that ombudsmen and judges actually want to see.
          </p>
          <p>
            We&apos;re not a legal service. We&apos;re not solicitors. We&apos;re a
            technology platform that gives ordinary people the same systematic approach
            to complaints that large organisations have had for years.
          </p>
          <p className="font-medium text-foreground">
            They promised to fix it. We help you prove they didn&apos;t.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="border-t bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">Our principles</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Your data is yours",
                body: "You own every piece of data you enter. Export it any time. We never sell it, share it, or use it to train AI models.",
              },
              {
                icon: Users,
                title: "Accessible to all",
                body: "The core of TheyPromised is free. Consumer rights are not a luxury — everyone should have access to the tools to exercise them.",
              },
              {
                icon: Zap,
                title: "Accurate guidance",
                body: "We only show escalation guidance we can verify. When procedures change, we update. We never speculate.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div className="rounded-xl border bg-white p-5" key={title}>
                <Icon className="mb-3 h-6 w-6 text-primary" />
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SynqForge */}
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            About SynqForge
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            TheyPromised is a product of SynqForge Ltd, a UK software company building
            tools that give people more control over their digital and financial lives.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Questions? Contact us at{" "}
            <a
              className="text-primary underline"
              href="mailto:hello@theypromised.app"
            >
              hello@theypromised.app
            </a>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary/5 py-12">
        <div className="mx-auto max-w-xl px-4 text-center">
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:opacity-90"
            href="/register"
          >
            Start your complaint
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
