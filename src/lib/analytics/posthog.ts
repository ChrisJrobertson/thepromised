import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.posthog.com";

let initialised = false;

export function initPostHog() {
  if (
    typeof window === "undefined" ||
    initialised ||
    !POSTHOG_KEY
  ) {
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // We handle this manually
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    opt_out_capturing_by_default: false,
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.opt_out_capturing();
      }
    },
  });

  initialised = true;
}

export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

export function identifyUser(userId: string, email: string, tier?: string) {
  if (typeof window === "undefined" || !POSTHOG_KEY) return;
  posthog.identify(userId, { email, tier });
}

export function resetUser() {
  if (typeof window === "undefined" || !POSTHOG_KEY) return;
  posthog.reset();
}

// Typed event helpers
export const analytics = {
  signUp: (method: "email" | "google") =>
    trackEvent("sign_up", { method }),

  caseCreated: (category: string, priority: string) =>
    trackEvent("case_created", { category, priority }),

  interactionLogged: (channel: string, hasPromise: boolean) =>
    trackEvent("interaction_logged", { channel, has_promise: hasPromise }),

  letterGenerated: (letterType: string) =>
    trackEvent("letter_generated", { letter_type: letterType }),

  pdfExported: (exportType: string) =>
    trackEvent("pdf_exported", { export_type: exportType }),

  subscriptionStarted: (tier: string, period: string) =>
    trackEvent("subscription_started", { tier, period }),

  aiAnalysisRequested: (tier: string) =>
    trackEvent("ai_analysis_requested", { tier }),
};
