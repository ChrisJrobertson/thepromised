"use client";

import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import {
  AlertCircle,
  CreditCard,
  ExternalLink,
  Receipt,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";

type Invoice = {
  id: string;
  number: string | null;
  amount_paid: number;
  currency: string;
  status: string | null;
  created: number;
  hosted_invoice_url: string | null;
};

type BillingClientProps = {
  tier: "free" | "basic" | "pro";
  subscriptionStatus: string;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  invoices: Invoice[];
  nextBillingDate: string | null;
  hasStripeCustomer: boolean;
};

const TIER_LABELS = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
};

const TIER_COLOURS = {
  free: "border-muted bg-muted/50 text-muted-foreground",
  basic: "border-secondary/30 bg-secondary/10 text-secondary",
  pro: "border-amber-200 bg-amber-50 text-amber-700",
};

const STATUS_COLOURS: Record<string, string> = {
  active: "text-green-600",
  trialing: "text-blue-600",
  past_due: "text-red-600",
  cancelled: "text-muted-foreground",
  pack_temporary: "text-amber-700",
};

export function BillingClient({
  tier,
  subscriptionStatus,
  aiCreditsUsed,
  aiCreditsLimit,
  invoices,
  nextBillingDate,
  hasStripeCustomer,
}: BillingClientProps) {
  const router = useRouter();
  const [isPortalPending, startPortalTransition] = useTransition();
  const [isSyncPending, startSyncTransition] = useTransition();

  function handleManageSubscription() {
    startPortalTransition(async () => {
      try {
        const response = await fetch("/api/stripe/portal", { method: "POST" });
        const data = await response.json();

        if (!response.ok || !data.url) {
          if (data.action === "resubscribe") {
            toast.error(
              "Billing account needs reconnecting. Redirecting to pricing..."
            );
            window.setTimeout(() => router.push("/pricing"), 1500);
            return;
          }

          toast.error(data.error ?? "Failed to open billing portal.");
          return;
        }

        window.location.href = data.url;
      } catch {
        toast.error("Network error. Please try again.");
      }
    });
  }

  function handleSyncFromStripe() {
    startSyncTransition(async () => {
      try {
        const response = await fetch("/api/stripe/sync-profile", {
          method: "POST",
        });
        const data = (await response.json()) as {
          error?: string;
          tier?: string;
        };

        if (!response.ok) {
          toast.error(data.error ?? "Could not sync with Stripe.");
          return;
        }

        const label =
          data.tier === "pro"
            ? "Pro"
            : data.tier === "basic"
              ? "Basic"
              : "Free";
        toast.success(`Your plan is now ${label}.`);
        router.refresh();
      } catch {
        toast.error("Network error. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            Current Plan
            <Badge className={TIER_COLOURS[tier]} variant="outline">
              {TIER_LABELS[tier]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {tier !== "free" && (
              <div>
                <span className="text-muted-foreground">Status: </span>
                <span className={STATUS_COLOURS[subscriptionStatus] ?? ""}>
                  {subscriptionStatus.charAt(0).toUpperCase() +
                    subscriptionStatus.slice(1).replace(/_/g, " ")}
                </span>
              </div>
            )}
            {nextBillingDate && (
              <div>
                <span className="text-muted-foreground">Next billing: </span>
                <span className="font-medium">{nextBillingDate}</span>
              </div>
            )}
          </div>

          {subscriptionStatus === "past_due" && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Your last payment failed. Please update your payment method to
                avoid losing access.
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Link
              className={buttonVariants({ size: "sm", variant: "outline" })}
              href="/pricing"
            >
              {tier === "free" ? "Upgrade plan" : "Change plan"}
            </Link>

            {hasStripeCustomer && (
              <Button
                disabled={isPortalPending}
                onClick={handleManageSubscription}
                size="sm"
                type="button"
                variant="outline"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isPortalPending ? "Opening..." : "Manage subscription"}
              </Button>
            )}
          </div>

          {tier === "free" && hasStripeCustomer && (
            <p className="text-xs text-muted-foreground border-t pt-3">
              Paying in Stripe but still see Free here?{" "}
              <button
                className="font-medium text-primary underline-offset-2 hover:underline disabled:opacity-50"
                disabled={isSyncPending}
                onClick={handleSyncFromStripe}
                type="button"
              >
                {isSyncPending ? "Syncing…" : "Sync plan from Stripe"}
              </button>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Free tier upgrade prompt */}
      {tier === "free" && (
        <UpgradePrompt
          description="Upgrade to Basic for unlimited cases, PDF export, email reminders, and 10 case insights per month."
          requiredTier="basic"
          title="Unlock the full TheyPromised experience"
        />
      )}

      {/* AI credits usage */}
      {tier !== "free" && aiCreditsLimit > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-amber-500" />
              AI Credits this month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Used</span>
              <span className="font-medium">
                {aiCreditsUsed} / {aiCreditsLimit}
              </span>
            </div>
            <Progress
              className="h-2"
              value={(aiCreditsUsed / aiCreditsLimit) * 100}
            />
            <p className="text-xs text-muted-foreground">
              Credits include case insights and letter drafts. Reset on your
              monthly billing date.
            </p>
            {tier === "basic" && (
              <Link
                className="text-xs text-primary hover:underline"
                href="/pricing"
              >
                Upgrade to Pro for 50 analyses + 30 letters/month →
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invoice history */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4" />
              Invoice history
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {invoices.map((invoice) => (
                <div
                  className="flex items-center justify-between py-3"
                  key={invoice.id}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {invoice.number ?? invoice.id.slice(0, 12)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(invoice.created * 1000), "d MMM yyyy", {
                        locale: enGB,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      £{(invoice.amount_paid / 100).toFixed(2)}
                    </span>
                    <Badge
                      className={
                        invoice.status === "paid"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : ""
                      }
                      variant="outline"
                    >
                      {invoice.status}
                    </Badge>
                    {invoice.hosted_invoice_url && (
                      <a
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                        href={invoice.hosted_invoice_url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <ExternalLink className="h-3 w-3" />
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
