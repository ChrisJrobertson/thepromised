import { describe, expect, it } from "vitest";

import { ESCALATION_RULES_SEED } from "@/lib/seed/escalation-rules";

describe("ESCALATION_RULES_SEED", () => {
  it("contains rules for all major categories", () => {
    const categories = new Set(ESCALATION_RULES_SEED.map((r) => r.category));
    expect(categories.has("energy")).toBe(true);
    expect(categories.has("financial_services")).toBe(true);
    expect(categories.has("broadband_phone")).toBe(true);
    expect(categories.has("nhs")).toBe(true);
    expect(categories.has("housing")).toBe(true);
    expect(categories.has("employment")).toBe(true);
    expect(categories.has("government_hmrc")).toBe(true);
    expect(categories.has("government_dwp")).toBe(true);
    expect(categories.has("government_council")).toBe(true);
  });

  it("all rules have required fields", () => {
    for (const rule of ESCALATION_RULES_SEED) {
      expect(rule.category).toBeTruthy();
      expect(rule.stage).toBeTruthy();
      expect(typeof rule.stage_order).toBe("number");
      expect(rule.stage_order).toBeGreaterThan(0);
      expect(rule.title).toBeTruthy();
      expect(rule.description).toBeTruthy();
      expect(rule.action_required).toBeTruthy();
    }
  });

  it("energy category has ombudsman stage with correct URL", () => {
    const energyOmbudsman = ESCALATION_RULES_SEED.find(
      (r) => r.category === "energy" && r.stage === "ombudsman"
    );
    expect(energyOmbudsman).toBeDefined();
    expect(energyOmbudsman?.regulatory_url).toContain("ombudsman-services.org");
  });

  it("employment category has ACAS rule", () => {
    const acasRule = ESCALATION_RULES_SEED.find(
      (r) => r.category === "employment" && r.regulatory_body?.includes("ACAS")
    );
    expect(acasRule).toBeDefined();
  });

  it("financial_services stage 3 has FOS URL", () => {
    const fosRule = ESCALATION_RULES_SEED.find(
      (r) => r.category === "financial_services" && r.stage === "ombudsman"
    );
    expect(fosRule?.regulatory_url).toContain("financial-ombudsman.org.uk");
  });

  it("rules are ordered by stage_order within each category", () => {
    const energyRules = ESCALATION_RULES_SEED
      .filter((r) => r.category === "energy")
      .sort((a, b) => a.stage_order - b.stage_order);

    for (let i = 0; i < energyRules.length - 1; i++) {
      expect(energyRules[i]!.stage_order).toBeLessThan(energyRules[i + 1]!.stage_order);
    }
  });

  it("has more than 40 rules total", () => {
    expect(ESCALATION_RULES_SEED.length).toBeGreaterThan(40);
  });
});
