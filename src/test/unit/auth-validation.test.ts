import { describe, expect, it } from "vitest";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validation/auth";

describe("auth validation schemas", () => {
  it("accepts a valid login payload", () => {
    const result = loginSchema.safeParse({
      email: "alex@theypromised.app",
      password: "Password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects weak registration passwords", () => {
    const result = registerSchema.safeParse({
      fullName: "Alex Thompson",
      email: "alex@theypromised.app",
      password: "password",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("requires terms acceptance for registration", () => {
    const result = registerSchema.safeParse({
      fullName: "Alex Thompson",
      email: "alex@theypromised.app",
      password: "Password123",
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it("validates forgot-password emails", () => {
    expect(forgotPasswordSchema.safeParse({ email: "bad-email" }).success).toBe(
      false
    );
    expect(
      forgotPasswordSchema.safeParse({ email: "alex@theypromised.app" }).success
    ).toBe(true);
  });
});
