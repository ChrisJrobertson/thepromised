"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type UpgradeSuccessToastProps = {
  type: "subscription" | "pack";
};

/**
 * Renders nothing visible — fires a Sonner toast once on mount to confirm
 * that a Stripe checkout completed successfully.
 * Render this conditionally in server components based on ?upgraded=true or
 * ?pack_activated=true search params.
 */
export function UpgradeSuccessToast({ type }: UpgradeSuccessToastProps) {
  useEffect(() => {
    if (type === "subscription") {
      toast.success("Welcome to Basic! Your AI credits have been refreshed.", {
        duration: 5000,
      });
    } else {
      toast.success("Pack activated! You have Pro access for 7 days.", {
        duration: 5000,
      });
    }
  }, [type]);

  return null;
}
