import { beforeEach, describe, expect, it, vi } from "vitest";

import { claudeDraftLetterResponse } from "../../../tests/fixtures/claude-responses";

const mockAnthropicCreate = vi.fn();
const mockTrackServerEvent = vi.fn();
const letterInsertCalls: Array<Record<string, unknown>> = [];

let mockProfile = {
  id: "user-test-123",
  full_name: "Alex Thompson",
  address_line_1: null,
  address_line_2: null,
  city: null,
  postcode: null,
  subscription_tier: "pro",
  ai_credits_used: 0,
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
                    title: "Incorrect billing complaint",
                    user_id: "user-test-123",
                    organisation_id: "org-test-123",
                    custom_organisation_name: null,
                    category: "energy",
                    description: "Incorrect meter readings",
                    reference_number: "CASE-999",
                    first_contact_date: "2026-01-02",
                    desired_outcome: "Refund",
                    amount_in_dispute: 347.82,
                  },
                }),
              }),
            }),
          };
        }
        if (table === "organisations") {
          return {
            eq: (_field: string, _value: unknown) => ({
              maybeSingle: async () => ({
                data: {
                  name: "British Gas",
                  complaint_email: "complaints@britishgas.co.uk",
                  complaint_phone: "0333 202 9802",
                },
              }),
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
        return {
          eq: () => ({
            maybeSingle: async () => ({ data: null }),
          }),
        };
      },
      insert: (values: Record<string, unknown>) => {
        if (table === "letters") {
          letterInsertCalls.push(values);
        }
        return {
          select: (_columns: string) => ({
            single: async () => ({ data: { id: "letter-test-123" }, error: null }),
          }),
        };
      },
      update: (_values: Record<string, unknown>) => ({
        eq: async (_field: string, _value: unknown) => ({ error: null }),
      }),
    }),
  })),
}));

import { POST } from "@/app/api/ai/draft-letter/route";

describe("AI draft-letter route", () => {
  beforeEach(() => {
    mockTrackServerEvent.mockReset();
    mockAnthropicCreate.mockReset();
    letterInsertCalls.length = 0;
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: claudeDraftLetterResponse }],
    });
    mockProfile = {
      id: "user-test-123",
      full_name: "Alex Thompson",
      address_line_1: null,
      address_line_2: null,
      city: null,
      postcode: null,
      subscription_tier: "pro",
      ai_credits_used: 0,
    };
  });

  it("generates a draft letter and returns text", async () => {
    const response = await POST(
      new Request("http://localhost/api/ai/draft-letter", {
        method: "POST",
        body: JSON.stringify({
          caseId: "550e8400-e29b-41d4-a716-446655440000",
          letterType: "escalation",
        }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.body).toContain("formally escalate");
    expect(body.letterId).toBe("letter-test-123");
  });

  it("saves the generated letter to letters table", async () => {
    await POST(
      new Request("http://localhost/api/ai/draft-letter", {
        method: "POST",
        body: JSON.stringify({
          caseId: "550e8400-e29b-41d4-a716-446655440000",
          letterType: "initial_complaint",
        }),
      })
    );

    expect(letterInsertCalls.length).toBe(1);
    expect(letterInsertCalls[0]).toMatchObject({
      case_id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: "user-test-123",
      status: "draft",
      ai_generated: true,
    });
  });

  it("returns 403 when rate limit is reached", async () => {
    mockProfile = {
      ...mockProfile,
      subscription_tier: "basic",
      ai_credits_used: 15,
    };

    const response = await POST(
      new Request("http://localhost/api/ai/draft-letter", {
        method: "POST",
        body: JSON.stringify({
          caseId: "550e8400-e29b-41d4-a716-446655440000",
          letterType: "follow_up",
        }),
      })
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("credits_exhausted");
  });
});
