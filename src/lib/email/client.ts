import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (resendClient) return resendClient;
  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

export const EMAIL_FROM = "TheyPromised <noreply@theypromised.app>";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://theypromised.app";
