import { createElement } from "react";
import { render } from "@react-email/components";
import { format } from "date-fns";

import { getResendClient, EMAIL_FROM, EMAIL_REPLY_TO, APP_URL } from "./client";
import { WelcomeEmail } from "./templates/WelcomeEmail";
import { ReminderDigestEmail } from "./templates/ReminderDigestEmail";
import { EscalationAlertEmail } from "./templates/EscalationAlertEmail";
import { PromiseBrokenEmail } from "./templates/PromiseBrokenEmail";
import { SubscriptionConfirmEmail } from "./templates/SubscriptionConfirmEmail";
import { PackPurchaseConfirmEmail, type PackType } from "./templates/PackPurchaseConfirmEmail";
import { LetterSentConfirmEmail } from "./templates/LetterSentConfirmEmail";
import { LetterDeliveredEmail } from "./templates/LetterDeliveredEmail";
import { LetterBouncedEmail } from "./templates/LetterBouncedEmail";
import { CaseResolvedEmail, type CaseOutcomeBucket } from "./templates/CaseResolvedEmail";
import { SubscriptionCancelledEmail } from "./templates/SubscriptionCancelledEmail";
import { AccountDeletedEmail } from "./templates/AccountDeletedEmail";

type ReminderItem = {
  title: string;
  description: string | null;
  dueDate: string;
  caseTitle: string;
  caseUrl: string;
  isOverdue: boolean;
};

const LETTER_TYPE_NAMES: Record<string, string> = {
  initial_complaint: "Initial Complaint",
  escalation: "Escalation Letter",
  ombudsman_referral: "Ombudsman Referral",
  follow_up: "Follow-up Letter",
  adr_referral: "ADR Referral",
  letter_before_action: "Letter Before Action",
  sar: "Subject Access Request",
  section_75: "Section 75 Claim Letter",
};

export function formatLetterTypeName(type: string): string {
  return (
    LETTER_TYPE_NAMES[type] ??
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

async function send(to: string, subject: string, html: string) {
  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      replyTo: EMAIL_REPLY_TO,
      subject,
      html,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("[Email send error]", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// ── Existing send functions ────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name: string) {
  const html = await render(
    createElement(WelcomeEmail, { name, appUrl: APP_URL })
  );
  return send(email, "Welcome to TheyPromised", html);
}

export async function sendReminderDigest(
  email: string,
  name: string,
  reminders: ReminderItem[]
) {
  if (reminders.length === 0) return { success: true };

  const overdueCount = reminders.filter((r) => r.isOverdue).length;
  const subject =
    overdueCount > 0
      ? `⚠️ ${overdueCount} overdue reminder${overdueCount !== 1 ? "s" : ""} — TheyPromised`
      : `${reminders.length} reminder${reminders.length !== 1 ? "s" : ""} today — TheyPromised`;

  const html = await render(
    createElement(ReminderDigestEmail, { name, reminders, appUrl: APP_URL })
  );
  return send(email, subject, html);
}

export async function sendEscalationAlert(
  email: string,
  name: string,
  caseName: string,
  orgName: string,
  weeksOpen: number,
  ombudsmanName: string,
  ombudsmanUrl: string,
  caseId: string
) {
  const caseUrl = `${APP_URL}/cases/${caseId}`;
  const subject =
    weeksOpen >= 8
      ? `🏛️ Escalate now — your ${orgName} complaint is ${weeksOpen} weeks old`
      : `⏰ ${weeksOpen} weeks in — escalation window approaching for ${orgName}`;

  const html = await render(
    createElement(EscalationAlertEmail, {
      name,
      caseName,
      orgName,
      weeksOpen,
      ombudsmanName,
      ombudsmanUrl,
      caseUrl,
      appUrl: APP_URL,
    })
  );
  return send(email, subject, html);
}

export async function sendPromiseBroken(
  email: string,
  name: string,
  caseName: string,
  orgName: string,
  promiseText: string,
  deadline: string,
  caseId: string
) {
  const caseUrl = `${APP_URL}/cases/${caseId}`;
  const subject = `❌ ${orgName} missed their deadline — TheyPromised`;

  const html = await render(
    createElement(PromiseBrokenEmail, {
      name,
      caseName,
      orgName,
      promiseText,
      deadline,
      caseUrl,
      appUrl: APP_URL,
    })
  );
  return send(email, subject, html);
}

export async function sendSubscriptionConfirm(
  email: string,
  name: string,
  tier: "basic" | "pro"
) {
  const html = await render(
    createElement(SubscriptionConfirmEmail, { name, tier, appUrl: APP_URL })
  );
  return send(
    email,
    `Your TheyPromised ${tier === "pro" ? "Pro" : "Basic"} subscription is active`,
    html
  );
}

// ── New send functions ─────────────────────────────────────────────────────────

export async function sendPackPurchaseConfirm(
  email: string,
  name: string,
  packType: PackType,
  expiryDate: string,
  amountPence: number,
  caseId?: string
) {
  const amountFormatted = `£${(amountPence / 100).toFixed(2)}`;
  const html = await render(
    createElement(PackPurchaseConfirmEmail, {
      name,
      packType,
      expiryDate,
      amountFormatted,
      caseId,
      appUrl: APP_URL,
    })
  );
  const packNames: Record<string, string> = {
    starter: "Starter Pack",
    escalation: "Escalation Pack",
    "full-case": "Full Case Pack",
    full_case: "Full Case Pack",
  };
  const packName = packNames[packType] ?? "Complaint Pack";
  return send(email, `Your ${packName} is confirmed — Pro features active for 7 days`, html);
}

export async function sendLetterSentConfirm(
  email: string,
  name: string,
  letterType: string,
  orgName: string,
  recipientEmail: string,
  caseId: string,
  letterId: string
) {
  const letterTypeName = formatLetterTypeName(letterType);
  const html = await render(
    createElement(LetterSentConfirmEmail, {
      name,
      letterTypeName,
      orgName,
      recipientEmail,
      caseId,
      letterId,
      appUrl: APP_URL,
    })
  );
  return send(
    email,
    `Your ${letterTypeName} to ${orgName} has been sent`,
    html
  );
}

export async function sendLetterDelivered(
  email: string,
  name: string,
  letterType: string,
  orgName: string,
  recipientEmail: string,
  deliveredAt: string,
  caseId: string
) {
  const letterTypeName = formatLetterTypeName(letterType);
  const deliveredDate = format(new Date(deliveredAt), "d MMMM yyyy");
  const html = await render(
    createElement(LetterDeliveredEmail, {
      name,
      letterTypeName,
      orgName,
      recipientEmail,
      deliveredDate,
      caseId,
      appUrl: APP_URL,
    })
  );
  return send(email, `✓ Your letter to ${orgName} was delivered`, html);
}

export async function sendLetterBounced(
  email: string,
  name: string,
  letterType: string,
  orgName: string,
  recipientEmail: string,
  caseId: string,
  letterId: string,
  orgSlug?: string
) {
  const letterTypeName = formatLetterTypeName(letterType);
  const html = await render(
    createElement(LetterBouncedEmail, {
      name,
      letterTypeName,
      orgName,
      recipientEmail,
      caseId,
      letterId,
      orgSlug,
      appUrl: APP_URL,
    })
  );
  return send(
    email,
    `⚠️ Your letter to ${orgName} couldn't be delivered`,
    html
  );
}

export async function sendCaseResolved(
  email: string,
  name: string,
  orgName: string,
  caseId: string,
  outcomeBucket: CaseOutcomeBucket,
  compensationAmount?: number
) {
  const html = await render(
    createElement(CaseResolvedEmail, {
      name,
      orgName,
      caseId,
      outcomeBucket,
      compensationAmount,
      appUrl: APP_URL,
    })
  );
  return send(email, `Case resolved — well done, ${name}`, html);
}

export async function sendSubscriptionCancelled(
  email: string,
  name: string,
  tierName: string
) {
  const html = await render(
    createElement(SubscriptionCancelledEmail, { name, tierName, appUrl: APP_URL })
  );
  return send(email, `Your ${tierName} plan has been cancelled`, html);
}

export async function sendAccountDeleted(email: string, name: string) {
  const html = await render(
    createElement(AccountDeletedEmail, { name })
  );
  return send(email, "Your TheyPromised account has been deleted", html);
}
