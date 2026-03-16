import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you were looking for doesn't exist.",
  robots: { index: false, follow: false },
};

/**
 * Rendered outside all layouts, so Tailwind classes are safe here
 * because globals.css is loaded by the root layout's <html> element
 * and Next.js still injects it. Confirmed working in Next.js App Router.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Minimal branded header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link className="text-lg font-bold text-primary" href="/">
            TheyPromised
          </Link>
          <Link
            className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
            href="/register"
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* 404 content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24">
        <div className="mx-auto w-full max-w-md text-center">
          {/* Large 404 */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
            <span className="text-4xl font-extrabold text-slate-400">404</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            This page doesn&apos;t exist
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            The link you followed may be broken, or the page may have been
            moved. Let&apos;s get you back on track.
          </p>

          {/* Primary CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              href="/"
            >
              ← Back to homepage
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              href="/escalation-guides"
            >
              Escalation Guides
            </Link>
          </div>

          {/* Secondary helpful links */}
          <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Looking for something?
            </p>
            <ul className="space-y-2">
              {[
                { href: "/register", label: "Start tracking a complaint — free" },
                { href: "/templates", label: "Browse 10 complaint templates" },
                { href: "/pricing", label: "See pricing plans" },
                { href: "/companies", label: "Company complaint scorecards" },
                { href: "/packs", label: "One-off complaint packs from £29" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary hover:underline"
                    href={item.href}
                  >
                    <span className="text-slate-300">→</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 text-xs text-slate-400">
            Followed a broken link?{" "}
            <a
              className="underline hover:text-slate-600"
              href="mailto:support@theypromised.app"
            >
              Let us know
            </a>
            .
          </p>
        </div>
      </main>

      <footer className="border-t bg-white py-4 text-center text-xs text-slate-400">
        © 2026 SynqForge LTD (Company No. 16808271)
      </footer>
    </div>
  );
}
