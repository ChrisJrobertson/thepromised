import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Fail build if Supabase env vars are missing (so Vercel build logs show the fix)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "TheyPromised build: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. " +
      "In Vercel: Project → Settings → Environment Variables → add both for Production and Preview → Redeploy."
  );
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // PostHog proxy — browser sends to our domain so ad blockers don't block
      { source: "/ingest/static/:path*", destination: "https://eu-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*", destination: "https://eu.i.posthog.com/:path*" },
    ];
  },
  async redirects() {
    return [
      { source: "/sign-in", destination: "/login", permanent: true },
      { source: "/signin", destination: "/login", permanent: true },
      { source: "/sign-up", destination: "/register", permanent: true },
      { source: "/signup", destination: "/register", permanent: true },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "synqforge",
  project: "thepromised",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
