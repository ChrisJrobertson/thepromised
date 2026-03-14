import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Include at least one uppercase letter.")
    .regex(/[0-9]/, "Include at least one number."),
  acceptTerms: z.literal(true, {
    error: "You must agree to the terms and privacy policy.",
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
});
