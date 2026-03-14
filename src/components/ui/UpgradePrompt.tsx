import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
        <Button asChild size="sm">
          <Link href="/pricing">Upgrade to {requiredTier === "pro" ? "Pro" : "Basic"}</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
