import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

let initialised = false;

/**
 * Probe whether the PostHog endpoint is reachable (not blocked by ad/tracking blockers).
 * If the request fails (e.g. net::ERR_BLOCKED_BY_CLIENT), we skip init to avoid
 * posthog-js retrying and spamming the console.
 */
async function isPostHogReachable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${POSTHOG_HOST}/i/v0/e/`, {
      method: "POST",
      body: "{}",
      mode: "cors",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok || res.status === 400; // 400 = invalid payload but endpoint reached
  } catch {
    return false;
  }
}

export function initPostHog() {
  if (typeof window === "undefined" || initialised || !POSTHOG_KEY) {
    return;
  }

  const consentCookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith("tp_consent="));
  if (consentCookie?.split("=")[1] !== "accepted") {
    return;
  }

  void isPostHogReachable().then((ok) => {
    if (!ok) return; // Ad/tracking blocker or unreachable — skip init to avoid console spam
    posthog.init(POSTHOG_KEY!, {
      api_host: POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage",
    });
    initialised = true;
  });
}

export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !POSTHOG_KEY || !initialised) return;
  posthog.capture(event, properties);
}

export function identifyUser(userId: string, email: string, tier?: string) {
  if (typeof window === "undefined" || !POSTHOG_KEY || !initialised) return;
  posthog.identify(userId, { email, tier });
}

export function resetUser() {
  if (typeof window === "undefined" || !POSTHOG_KEY || !initialised) return;
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
