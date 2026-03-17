import Link from "next/link";
import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found — TheyPromised",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-white px-4 text-center">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          But your consumer rights do.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          The page you were looking for has moved, or never existed. Let&apos;s get you back
          on track.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/cases/new"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Start a Case
          </Link>
          <Link
            href="/escalation-guides"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Escalation Guides
          </Link>
        </div>
      </div>
    </div>
  );
}
