"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

import { CookieConsent } from "@/components/CookieConsent";
import { PostHogProvider } from "@/components/PostHogProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delay={100}>
          <PostHogProvider>
            {children}
            <Toaster richColors position="top-right" />
            <Analytics />
            <SpeedInsights />
            <CookieConsent />
          </PostHogProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
