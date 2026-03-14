import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/lib/validation/auth";

describe("auth schemas", () => {
  it("accepts valid login payload", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "Password123",
    });

    expect(result.success).toBe(true);
  });

  it("requires terms for registration", () => {
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "user@example.com",
      password: "Password123",
      acceptTerms: false,
    });

    expect(result.success).toBe(false);
  });
});
