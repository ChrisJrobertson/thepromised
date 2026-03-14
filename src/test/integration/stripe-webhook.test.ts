import { beforeEach, describe, expect, it, vi } from "vitest";

import { stripeEventFixtures } from "../../../tests/fixtures/stripe-events";

const mockConstructEventAsync = vi.fn();
const mockRetrieveSubscription = vi.fn();
const mockTrackServerEvent = vi.fn();
const updateCalls: Array<{
  table: string;
  values: Record<string, unknown>;
  field: string;
  value: unknown;
}> = [];

let stripeSignature = "sig_test_valid";

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: (headerName: string) =>
      headerName === "stripe-signature" ? stripeSignature : null,
  })),
}));

vi.mock("@/lib/stripe/client", () => ({
  getStripeClient: () => ({
    webhooks: {
      constructEventAsync: mockConstructEventAsync,
    },
    subscriptions: {
      retrieve: mockRetrieveSubscription,
    },
  }),
}));

vi.mock("@/lib/stripe/webhooks", () => ({
  getTierFromSubscription: vi.fn(() => "pro"),
}));

vi.mock("@/lib/analytics/posthog-server", () => ({
  trackServerEvent: mockTrackServerEvent,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => ({
      update: (values: Record<string, unknown>) => ({
        eq: async (field: string, value: unknown) => {
          updateCalls.push({ table, values, field, value });
          return { error: null };
        },
      }),
      select: (columns: string) => ({
        eq: (_field: string, _value: unknown) => ({
          maybeSingle: async () => {
            if (columns.includes("email")) {
              return {
                data: {
                  email: "test@theypromised.app",
                  full_name: "Alex Thompson",
                },
              };
            }
            if (columns.includes("ai_credits_reset_at")) {
              return {
                data: {
                  ai_credits_reset_at: null,
                },
              };
            }
            return { data: null };
          },
        }),
      }),
    }),
  })),
}));

import { POST } from "@/app/api/webhooks/stripe/route";

describe("Stripe webhook route", () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    stripeSignature = "sig_test_valid";
    updateCalls.length = 0;
    mockTrackServerEvent.mockReset();
    mockConstructEventAsync.mockReset();
    mockRetrieveSubscription.mockReset();
    mockRetrieveSubscription.mockResolvedValue({
      id: "sub_test_123",
      status: "active",
    });
  });

  it("handles checkout.session.completed", async () => {
    mockConstructEventAsync.mockResolvedValueOnce(
      stripeEventFixtures.checkoutCompleted
    );

    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
    );

    expect(response.status).toBe(200);
    expect(updateCalls.some((call) => call.table === "profiles")).toBe(true);
    expect(mockTrackServerEvent).toHaveBeenCalledWith(
      "user-test-123",
      "subscription_started",
      { tier: "pro" }
    );
  });

  it("handles customer.subscription.updated", async () => {
    mockConstructEventAsync.mockResolvedValueOnce(
      stripeEventFixtures.subscriptionUpdated
    );

    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
    );

    expect(response.status).toBe(200);
    expect(
      updateCalls.some(
        (call) =>
          call.table === "profiles" &&
          call.values.subscription_status === "active"
      )
    ).toBe(true);
  });

  it("handles customer.subscription.deleted", async () => {
    mockConstructEventAsync.mockResolvedValueOnce(
      stripeEventFixtures.subscriptionDeleted
    );

    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
    );

    expect(response.status).toBe(200);
    expect(
      updateCalls.some(
        (call) =>
          call.table === "profiles" &&
          call.values.subscription_tier === "free"
      )
    ).toBe(true);
  });

  it("handles invoice.payment_failed", async () => {
    mockConstructEventAsync.mockResolvedValueOnce(
      stripeEventFixtures.invoicePaymentFailed
    );

    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
    );

    expect(response.status).toBe(200);
    expect(
      updateCalls.some(
        (call) =>
          call.table === "profiles" &&
          call.values.subscription_status === "past_due"
      )
    ).toBe(true);
  });

  it("handles invoice.paid", async () => {
    mockConstructEventAsync.mockResolvedValueOnce(stripeEventFixtures.invoicePaid);

    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
    );

    expect(response.status).toBe(200);
    expect(
      updateCalls.some(
        (call) =>
          call.table === "profiles" &&
          call.values.subscription_status === "active"
      )
    ).toBe(true);
  });

  it("returns 400 when signature verification fails", async () => {
    mockConstructEventAsync.mockRejectedValueOnce(new Error("Invalid signature"));

    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
    );

    expect(response.status).toBe(400);
  });
});
