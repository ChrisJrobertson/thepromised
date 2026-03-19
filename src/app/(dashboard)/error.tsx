"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("[DashboardError]", error.message, error.digest, error.stack?.slice(0, 500));
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-xl font-bold text-zinc-900">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-center text-zinc-600">
        We hit an unexpected error loading this page. Your data is safe — this
        is a display issue only.
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
        Back to dashboard
      </a>
    </div>
  );
}
