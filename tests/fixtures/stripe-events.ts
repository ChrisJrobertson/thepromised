export const stripeEventFixtures = {
  checkoutCompleted: {
    id: "evt_checkout_completed",
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_123",
        object: "checkout.session",
        subscription: "sub_test_123",
        customer: "cus_test_123",
        metadata: {
          supabase_user_id: "user-test-123",
        },
      },
    },
  },
  subscriptionUpdated: {
    id: "evt_subscription_updated",
    object: "event",
    type: "customer.subscription.updated",
    data: {
      object: {
        id: "sub_test_123",
        object: "subscription",
        status: "active",
      },
    },
  },
  subscriptionDeleted: {
    id: "evt_subscription_deleted",
    object: "event",
    type: "customer.subscription.deleted",
    data: {
      object: {
        id: "sub_test_123",
        object: "subscription",
      },
    },
  },
  invoicePaymentFailed: {
    id: "evt_invoice_failed",
    object: "event",
    type: "invoice.payment_failed",
    data: {
      object: {
        id: "in_test_failed",
        object: "invoice",
        customer: "cus_test_123",
      },
    },
  },
  invoicePaid: {
    id: "evt_invoice_paid",
    object: "event",
    type: "invoice.paid",
    data: {
      object: {
        id: "in_test_paid",
        object: "invoice",
        customer: "cus_test_123",
      },
    },
  },
} as const;
