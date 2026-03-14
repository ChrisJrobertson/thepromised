import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type UpgradePromptProps = {
  title?: string;
  description: string;
  requiredTier: "basic" | "pro";
};

export function UpgradePrompt({
  title = "Upgrade required",
  description,
  requiredTier,
}: UpgradePromptProps) {
  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>{description}</p>
        <Link className="inline-flex rounded-md bg-primary px-3 py-2 text-sm text-white" href="/pricing">
          Upgrade to {requiredTier === "pro" ? "Pro" : "Basic"}
        </Link>
      </AlertDescription>
    </Alert>
  );
}
