"use client";

import { useEffect } from "react";

import { initPostHog } from "@/lib/analytics/posthog";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      initPostHog();
    }
  }, []);

  return <>{children}</>;
}
