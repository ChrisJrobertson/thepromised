import { beforeEach, describe, expect, it, vi } from "vitest";

import { claudeSuggestionResponse } from "../../../tests/fixtures/claude-responses";

const mockAnthropicCreate = vi.fn();
const mockTrackServerEvent = vi.fn();

let mockProfile = {
  id: "user-test-123",
  subscription_tier: "pro",
  ai_credits_used: 2,
};

vi.mock("@/lib/analytics/posthog-server", () => ({
  trackServerEvent: mockTrackServerEvent,
}));

vi.mock("@/lib/ai/client", () => ({
  CLAUDE_MODEL: "claude-test",
  AI_LIMITS: {
    free: { suggestions: 0, letters: 0, summaries: 0 },
    basic: { suggestions: 10, letters: 5, summaries: 100 },
    pro: { suggestions: 50, letters: 30, summaries: 500 },
  },
  anthropic: {
    messages: {
      create: mockAnthropicCreate,
    },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "user-test-123",
            email: "test@theypromised.app",
          },
        },
      }),
    },
    from: (table: string) => ({
      select: (_columns: string) => {
        if (table === "profiles") {
          return {
            eq: (_field: string, _value: unknown) => ({
              maybeSingle: async () => ({ data: mockProfile }),
            }),
          };
        }
        if (table === "cases") {
          return {
            eq: (_field: string, _value: unknown) => ({
              eq: (_field2: string, _value2: unknown) => ({
                maybeSingle: async () => ({
                  data: {
                    id: "case-test-123",
                    user_id: "user-test-123",
                    organisation_id: "org-test-123",
                    custom_organisation_name: null,
                    title: "Billing dispute",
                    description: "Incorrect energy billing",
                    status: "open",
                    escalation_stage: "initial",
                    priority: "high",
                    first_contact_date: "2026-01-01",
                    desired_outcome: "Refund",
                    amount_in_dispute: 347.82,
                    reference_number: "REF-12345",
                    category: "energy",
                  },
                }),
              }),
            }),
          };
        }
        if (table === "organisations") {
          return {
            eq: (_field: string, _value: unknown) => ({
              maybeSingle: async () => ({ data: { name: "British Gas" } }),
            }),
          };
        }
        if (table === "interactions") {
          return {
            eq: (_field: string, _value: unknown) => ({
              order: async () => ({ data: [] }),
            }),
          };
        }
        if (table === "escalation_rules") {
          return {
            eq: (_field: string, _value: unknown) => ({
              order: async () => ({ data: [] }),
            }),
          };
        }
        return {
          eq: () => ({
            maybeSingle: async () => ({ data: null }),
          }),
        };
      },
      update: (_values: Record<string, unknown>) => ({
        eq: async (_field: string, _value: unknown) => ({ error: null }),
      }),
    }),
  })),
}));

import { POST } from "@/app/api/ai/suggest/route";

describe("AI suggest route", () => {
  beforeEach(() => {
    mockTrackServerEvent.mockReset();
    mockAnthropicCreate.mockReset();
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: claudeSuggestionResponse }],
    });
    mockProfile = {
      id: "user-test-123",
      subscription_tier: "pro",
      ai_credits_used: 2,
    };
  });

  it("returns valid suggestion JSON payload", async () => {
    const response = await POST(
      new Request("http://localhost/api/ai/suggest", {
        method: "POST",
        body: JSON.stringify({ caseId: "550e8400-e29b-41d4-a716-446655440000" }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.suggestion).toMatchObject({
      assessment: expect.any(String),
      nextStep: expect.any(String),
      deadlines: expect.any(Array),
      evidenceNeeded: expect.any(Array),
      strengthRating: expect.stringMatching(/weak|moderate|strong/),
      strengthExplanation: expect.any(String),
      letterRecommended: expect.any(Boolean),
    });
  });

  it("returns 403 for free tier", async () => {
    mockProfile = {
      ...mockProfile,
      subscription_tier: "free",
      ai_credits_used: 0,
    };

    const response = await POST(
      new Request("http://localhost/api/ai/suggest", {
        method: "POST",
        body: JSON.stringify({ caseId: "550e8400-e29b-41d4-a716-446655440000" }),
      })
    );

    expect(response.status).toBe(403);
  });

  it("returns 403 when AI credits are exhausted", async () => {
    mockProfile = {
      ...mockProfile,
      subscription_tier: "basic",
      ai_credits_used: 10,
    };

    const response = await POST(
      new Request("http://localhost/api/ai/suggest", {
        method: "POST",
        body: JSON.stringify({ caseId: "550e8400-e29b-41d4-a716-446655440000" }),
      })
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("credits_exhausted");
  });
});
