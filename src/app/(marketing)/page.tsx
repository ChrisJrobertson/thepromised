import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main>
      <section className="bg-gradient-to-b from-primary/10 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            They Promised. You Proved It.
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-slate-700">
            The UK&apos;s complaint tracking tool that builds your case file automatically.
            Log every call, email, and broken promise, then export a professional file for
            the ombudsman.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-md bg-primary px-5 py-3 text-white" href="/register">
              Start Tracking Free
            </Link>
            <Link className="rounded-md border px-5 py-3" href="/how-it-works">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3">
        {[
          "You called. They promised to fix it. They didn’t.",
          "You have spoken to five people and nobody owns the issue.",
          "The ombudsman wants dates, times, and names you can’t remember.",
        ].map((problem) => (
          <Card key={problem}>
            <CardHeader>
              <CardTitle className="text-lg">Sound familiar?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{problem}</CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
