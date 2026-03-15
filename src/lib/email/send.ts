import { createElement } from "react";
import { render } from "@react-email/components";

import { getResendClient, EMAIL_FROM, APP_URL } from "./client";
import { WelcomeEmail } from "./templates/WelcomeEmail";
import { ReminderDigestEmail } from "./templates/ReminderDigestEmail";
import { EscalationAlertEmail } from "./templates/EscalationAlertEmail";
import { PromiseBrokenEmail } from "./templates/PromiseBrokenEmail";
import { SubscriptionConfirmEmail } from "./templates/SubscriptionConfirmEmail";

type ReminderItem = {
  title: string;
  description: string | null;
  dueDate: string;
  caseTitle: string;
  caseUrl: string;
  isOverdue: boolean;
};

async function send(to: string, subject: string, html: string) {
  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("[Email send error]", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

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
  return send(email, `Your TheyPromised ${tier === "pro" ? "Pro" : "Basic"} subscription is active`, html);
}
