"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { initPostHog } from "@/lib/analytics/posthog";

type Consent = "accepted" | "rejected" | null;

function getConsent(): Consent {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie.split("; ").find((c) => c.startsWith("tp_consent="));
  const value = cookie?.split("=")[1];
  if (value === "accepted" || value === "rejected") return value;
  return null;
}

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    setConsent(getConsent());
  }, []);

  function setChoice(choice: Exclude<Consent, null>) {
    document.cookie = `tp_consent=${choice}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setConsent(choice);
    if (choice === "accepted") {
      initPostHog();
    }
  }

  if (consent) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-lg bg-slate-900 p-4 text-sm text-white shadow-lg md:bottom-4 md:left-auto md:right-4 md:max-w-lg">
      <p className="mb-3">
        We use cookies to improve your experience and understand how TheyPromised is used.
        You can change your preference at any time in{" "}
        <Link className="underline" href="/privacy">
          Privacy Settings
        </Link>
        .
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="rounded bg-teal-500 px-3 py-1.5 text-xs font-medium text-white"
          onClick={() => setChoice("accepted")}
          type="button"
        >
          Accept All
        </button>
        <button
          className="rounded border border-slate-500 px-3 py-1.5 text-xs font-medium text-white"
          onClick={() => setChoice("rejected")}
          type="button"
        >
          Reject Non-Essential
        </button>
        <Link className="text-xs text-slate-400 underline" href="/privacy">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}

/** Renders a button that clears cookie consent, forcing the banner to reappear. */
export function CookieConsentWithdrawButton() {
  function withdraw() {
    document.cookie = "tp_consent=; Path=/; Max-Age=0; SameSite=Lax";
    // Reload so PostHog / banner state resets cleanly.
    window.location.reload();
  }

  return (
    <button
      className="text-sm text-primary underline"
      onClick={withdraw}
      type="button"
    >
      Manage cookie preferences
    </button>
  );
}
