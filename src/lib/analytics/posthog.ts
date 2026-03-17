import posthog from "posthog-js";

let isInitialised = false;

export function initPostHog(): void {
  if (isInitialised) return;
  if (typeof window === "undefined") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    // Route through our own domain — ad blockers won't see posthog.com
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    // GDPR: only create person profiles for identified (logged-in) users
    person_profiles: "identified_only",
    // Don't capture pageviews automatically — we handle this via the PostHogPageView component
    capture_pageview: false,
    capture_pageleave: true,
    // Respect Do Not Track browser setting
    respect_dnt: true,
    // Disable session recording unless explicitly enabled in PostHog dashboard
    disable_session_recording: true,
  });

  isInitialised = true;
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (!isInitialised) return;
  posthog.capture(eventName, properties);
}

export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
): void {
  if (!isInitialised) return;
  posthog.identify(userId, properties);
}

export function resetUser(): void {
  if (!isInitialised) return;
  posthog.reset();
}

// Typed event helpers (unchanged event names and properties)
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
