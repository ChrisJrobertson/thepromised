import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type ReminderItem = {
  title: string;
  description: string | null;
  dueDate: string;
  caseTitle: string;
  caseUrl: string;
  isOverdue: boolean;
};

type ReminderDigestEmailProps = {
  name: string;
  reminders: ReminderItem[];
  appUrl?: string;
};

export function ReminderDigestEmail({
  name,
  reminders,
  appUrl = "https://www.theypromised.app",
}: ReminderDigestEmailProps) {
  const overdueCount = reminders.filter((r) => r.isOverdue).length;

  return (
    <Html lang="en-GB">
      <Head />
      <Preview>
        {overdueCount > 0
          ? `⚠️ ${overdueCount} overdue reminders — action needed today`
          : `${reminders.length} reminder${reminders.length !== 1 ? "s" : ""} due today on TheyPromised`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>TheyPromised</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>
              {overdueCount > 0 ? "⚠️ Action needed" : "📅 Today's reminders"}
            </Heading>

            <Text style={text}>
              Hi {name}, here are your reminders for today
              {overdueCount > 0
                ? ` — including ${overdueCount} overdue item${overdueCount !== 1 ? "s" : ""}.`
                : "."}
            </Text>

            {reminders.map((reminder, i) => (
              <Section
                key={i}
                style={{
                  ...reminderCard,
                  borderLeft: reminder.isOverdue
                    ? "4px solid #ef4444"
                    : "4px solid #0d9488",
                }}
              >
                <Text style={reminderTitle}>
                  {reminder.isOverdue ? "⚠️ OVERDUE: " : ""}
                  {reminder.title}
                </Text>
                {reminder.description && (
                  <Text style={reminderDesc}>{reminder.description}</Text>
                )}
                <Text style={reminderMeta}>
                  <strong>Case:</strong> {reminder.caseTitle} ·{" "}
                  <strong>Due:</strong> {reminder.dueDate}
                </Text>
                <Link href={reminder.caseUrl} style={viewLink}>
                  View case →
                </Link>
              </Section>
            ))}

            <Hr style={hr} />

            <Button href={`${appUrl}/reminders`} style={button}>
              View all reminders
            </Button>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              <Link href={`${appUrl}/settings/notifications`} style={link}>
                Manage email preferences
              </Link>{" "}
              · TheyPromised — a SynqForge product
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f8fafc",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden" as const,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

const header = {
  backgroundColor: "#1e3a5f",
  padding: "20px 32px",
};

const logo = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
};

const content = {
  padding: "32px",
};

const h1 = {
  color: "#1e3a5f",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 12px 0",
};

const text = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 20px 0",
};

const reminderCard = {
  backgroundColor: "#f8fafc",
  borderRadius: "6px",
  marginBottom: "12px",
  padding: "14px 16px",
};

const reminderTitle = {
  color: "#1e3a5f",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 4px 0",
};

const reminderDesc = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "0 0 6px 0",
};

const reminderMeta = {
  color: "#374151",
  fontSize: "12px",
  margin: "0 0 8px 0",
};

const viewLink = {
  color: "#0d9488",
  fontSize: "13px",
  fontWeight: "600",
  textDecoration: "none",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const button = {
  backgroundColor: "#0d9488",
  borderRadius: "6px",
  color: "#ffffff",
  display: "block" as const,
  fontSize: "14px",
  fontWeight: "600",
  padding: "10px 20px",
  textAlign: "center" as const,
  textDecoration: "none",
};

const footer = {
  backgroundColor: "#f8fafc",
  borderTop: "1px solid #e5e7eb",
  padding: "14px 32px",
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "0",
  textAlign: "center" as const,
};

const link = {
  color: "#0d9488",
  textDecoration: "none",
};

export default ReminderDigestEmail;
