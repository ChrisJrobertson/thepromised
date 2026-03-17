"use client";

import { useEffect } from "react";

import { initPostHog } from "@/lib/analytics/posthog";

function hasAnalyticsConsent(): boolean {
  if (typeof document === "undefined") return false;
  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith("tp_consent="));
  return cookie?.split("=")[1] === "accepted";
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && hasAnalyticsConsent()) {
      initPostHog();
    }
  }, []);

  return <>{children}</>;
}
