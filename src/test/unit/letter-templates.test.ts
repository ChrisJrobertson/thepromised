import { describe, expect, it } from "vitest";

import { LETTER_TEMPLATES, getTemplate } from "@/lib/ai/letter-templates";

describe("LETTER_TEMPLATES", () => {
  it("has 8 templates", () => {
    expect(LETTER_TEMPLATES.length).toBe(8);
  });

  it("all templates have required fields", () => {
    for (const template of LETTER_TEMPLATES) {
      expect(template.type).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(template.whenToUse).toBeTruthy();
      expect(template.suggestedTone).toBeTruthy();
      expect(template.icon).toBeTruthy();
      expect(Array.isArray(template.requiredFields)).toBe(true);
      expect(Array.isArray(template.legalReferences)).toBe(true);
    }
  });

  it("includes initial_complaint template", () => {
    const template = LETTER_TEMPLATES.find((t) => t.type === "initial_complaint");
    expect(template).toBeDefined();
    expect(template?.legalReferences).toContain("Consumer Rights Act 2015");
  });

  it("includes subject_access_request with GDPR reference", () => {
    const template = LETTER_TEMPLATES.find((t) => t.type === "subject_access_request");
    expect(template).toBeDefined();
    expect(
      template?.legalReferences.some((ref) => ref.includes("GDPR"))
    ).toBe(true);
  });

  it("includes formal_notice (letter before action)", () => {
    const template = LETTER_TEMPLATES.find((t) => t.type === "formal_notice");
    expect(template).toBeDefined();
  });
});

describe("getTemplate", () => {
  it("returns a template by type", () => {
    const template = getTemplate("initial_complaint");
    expect(template).toBeDefined();
    expect(template?.type).toBe("initial_complaint");
  });

  it("returns undefined for unknown type", () => {
    const template = getTemplate("unknown_type" as Parameters<typeof getTemplate>[0]);
    expect(template).toBeUndefined();
  });
});
