import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (resendClient) return resendClient;
  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const adminFromAddress = process.env.RESEND_ADMIN_FROM ?? "hello@theypromised.app";
export const EMAIL_FROM = `TheyPromised <${adminFromAddress}>`;
export const EMAIL_REPLY_TO = "support@theypromised.app";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app";
