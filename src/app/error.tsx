"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-zinc-900">Something went wrong</h1>
      <p className="mt-2 text-center text-zinc-600">
        An unexpected error occurred. We&apos;ve been notified and are looking into it.
      </p>
      <button
        className="mt-6 rounded-lg bg-[#1a2744] px-6 py-2 text-sm font-medium text-white hover:bg-[#1a2744]/90"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
      <a
        className="mt-3 text-sm text-zinc-500 hover:text-zinc-700"
        href="/dashboard"
      >
        Return to dashboard
      </a>
    </div>
  );
}
