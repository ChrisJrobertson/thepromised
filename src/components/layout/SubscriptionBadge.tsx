import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SubscriptionTier = "free" | "basic" | "pro";

const LABELS: Record<SubscriptionTier, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
};

export function SubscriptionBadge({ tier }: { tier: SubscriptionTier }) {
  return (
    <Badge
      className={cn(
        "border-white/20 bg-white/10 text-white",
        tier === "pro" && "border-amber-200/40 bg-amber-300/20 text-amber-100",
      )}
      variant="outline"
    >
      {LABELS[tier]}
    </Badge>
  );
}
