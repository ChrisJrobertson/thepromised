"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect, useState } from "react";

function hasAnalyticsConsent(): boolean {
  if (typeof document === "undefined") return false;
  const cookie = document.cookie.split("; ").find((c) => c.startsWith("tp_consent="));
  return cookie?.split("=")[1] === "accepted";
}

/** Mounts Vercel Analytics / Speed Insights only after cookie consent (ICO-friendly). */
export function ConsentGatedVercelAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(hasAnalyticsConsent());
    function onConsentChanged() {
      setAllowed(hasAnalyticsConsent());
    }
    window.addEventListener("tp-consent-changed", onConsentChanged);
    return () => window.removeEventListener("tp-consent-changed", onConsentChanged);
  }, []);

  if (!allowed) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
