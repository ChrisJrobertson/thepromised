import { describe, expect, it } from "vitest";

import {
  caseDetailsSchema,
  firstInteractionSchema,
  interactionSchema,
  ORGANISATION_CATEGORIES,
  CASE_PRIORITIES,
  INTERACTION_CHANNELS,
  INTERACTION_OUTCOMES,
} from "@/lib/validation/cases";

describe("caseDetailsSchema", () => {
  const validData = {
    title: "Billing dispute",
    description: "They have been overcharging me for the past 6 months",
    reference_number: "REF123456",
    amount_in_dispute: "240.00",
    desired_outcome: "Full refund of overcharged amounts",
    priority: "high" as const,
    first_contact_date: "2026-01-15",
  };

  it("validates a correct case", () => {
    const result = caseDetailsSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects a title that is too short", () => {
    const result = caseDetailsSchema.safeParse({ ...validData, title: "AB" });
    expect(result.success).toBe(false);
  });

  it("rejects a description that is too short", () => {
    const result = caseDetailsSchema.safeParse({ ...validData, description: "Short" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid priority", () => {
    const result = caseDetailsSchema.safeParse({
      ...validData,
      priority: "extreme" as unknown,
    });
    expect(result.success).toBe(false);
  });

  it("allows optional fields to be empty", () => {
    const result = caseDetailsSchema.safeParse({
      ...validData,
      reference_number: undefined,
      amount_in_dispute: undefined,
      desired_outcome: undefined,
    });
    expect(result.success).toBe(true);
  });
});

describe("interactionSchema", () => {
  const validInteraction = {
    case_id: "550e8400-e29b-41d4-a716-446655440000",
    interaction_date: "2026-03-14T10:00",
    channel: "phone" as const,
    direction: "outbound" as const,
    summary:
      "Called billing department, spoke to Sarah who promised a refund within 5 working days.",
    has_promise: false,
  };

  it("validates a correct interaction", () => {
    const result = interactionSchema.safeParse(validInteraction);
    expect(result.success).toBe(true);
  });

  it("rejects a summary that is too short", () => {
    const result = interactionSchema.safeParse({
      ...validInteraction,
      summary: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid channel", () => {
    const result = interactionSchema.safeParse({
      ...validInteraction,
      channel: "telegram" as unknown,
    });
    expect(result.success).toBe(false);
  });

  it("requires a case_id", () => {
    const result = interactionSchema.safeParse({
      ...validInteraction,
      case_id: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("ORGANISATION_CATEGORIES", () => {
  it("contains expected categories", () => {
    expect(ORGANISATION_CATEGORIES).toContain("energy");
    expect(ORGANISATION_CATEGORIES).toContain("financial_services");
    expect(ORGANISATION_CATEGORIES).toContain("nhs");
    expect(ORGANISATION_CATEGORIES).toContain("employment");
  });

  it("has 15 categories", () => {
    expect(ORGANISATION_CATEGORIES.length).toBe(15);
  });
});

describe("CASE_PRIORITIES", () => {
  it("has the expected priority values", () => {
    expect(CASE_PRIORITIES).toEqual(["low", "medium", "high", "urgent"]);
  });
});

describe("INTERACTION_CHANNELS", () => {
  it("contains expected channels", () => {
    expect(INTERACTION_CHANNELS).toContain("phone");
    expect(INTERACTION_CHANNELS).toContain("email");
    expect(INTERACTION_CHANNELS).toContain("letter");
    expect(INTERACTION_CHANNELS).toContain("webchat");
  });
});

describe("INTERACTION_OUTCOMES", () => {
  it("contains expected outcomes", () => {
    expect(INTERACTION_OUTCOMES).toContain("resolved");
    expect(INTERACTION_OUTCOMES).toContain("escalated");
    expect(INTERACTION_OUTCOMES).toContain("no_resolution");
  });
});
