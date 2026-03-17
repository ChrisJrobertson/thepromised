"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function SubscriptionSuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("subscribed") === "true") {
      toast.success("Subscription activated! Welcome to the full TheyPromised experience.", {
        duration: 6000,
        description: "All Pro features are now unlocked.",
      });
      // Remove the query param without triggering a full navigation.
      const url = new URL(window.location.href);
      url.searchParams.delete("subscribed");
      url.searchParams.delete("session_id");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}
