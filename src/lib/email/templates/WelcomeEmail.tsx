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

type WelcomeEmailProps = {
  name: string;
  appUrl?: string;
};

export function WelcomeEmail({
  name,
  appUrl = "https://theypromised.app",
}: WelcomeEmailProps) {
  return (
    <Html lang="en-GB">
      <Head />
      <Preview>Welcome to TheyPromised — start tracking your complaint today</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>TheyPromised</Heading>
            <Text style={tagline}>Making organisations keep their word</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Welcome, {name} 👋</Heading>
            <Text style={text}>
              You&apos;ve joined TheyPromised — the UK&apos;s complaint tracking platform that
              helps you log every interaction, hold organisations to account, and
              escalate when they fail you.
            </Text>

            <Text style={text}>Here&apos;s what you can do straight away:</Text>

            <ul style={list}>
              <li style={listItem}>
                📋 <strong>Create a case</strong> — log your complaint against any organisation
              </li>
              <li style={listItem}>
                💬 <strong>Log interactions</strong> — every call, email, and letter
              </li>
              <li style={listItem}>
                📅 <strong>Track promises</strong> — automatic reminders for every deadline
              </li>
              <li style={listItem}>
                🏛️ <strong>Escalation guides</strong> — step-by-step UK complaints procedures
              </li>
            </ul>

            <Button href={`${appUrl}/cases/new`} style={button}>
              Start your first case →
            </Button>

            <Hr style={hr} />

            <Text style={smallText}>
              <strong>Tip:</strong> Add as much detail as possible from the start. A thorough
              record is your strongest asset in any dispute.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              <Link href={`${appUrl}/settings/notifications`} style={link}>
                Manage email preferences
              </Link>{" "}
              ·{" "}
              <Link href={`${appUrl}/privacy`} style={link}>
                Privacy Policy
              </Link>
            </Text>
            <Text style={footerText}>
              TheyPromised — a SynqForge product · London, UK
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
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
  padding: "24px 32px",
  textAlign: "center" as const,
};

const logo = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 4px 0",
};

const tagline = {
  color: "rgba(255,255,255,0.7)",
  fontSize: "13px",
  margin: "0",
};

const content = {
  padding: "32px",
};

const h1 = {
  color: "#1e3a5f",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 16px 0",
};

const text = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const list = {
  paddingLeft: "0",
  listStyle: "none" as const,
  margin: "0 0 24px 0",
};

const listItem = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.8",
  marginBottom: "8px",
};

const button = {
  backgroundColor: "#0d9488",
  borderRadius: "6px",
  color: "#ffffff",
  display: "block" as const,
  fontSize: "15px",
  fontWeight: "600",
  padding: "12px 24px",
  textAlign: "center" as const,
  textDecoration: "none",
  marginBottom: "24px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const smallText = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "1.6",
};

const footer = {
  backgroundColor: "#f8fafc",
  borderTop: "1px solid #e5e7eb",
  padding: "16px 32px",
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "0 0 4px 0",
  textAlign: "center" as const,
};

const link = {
  color: "#0d9488",
  textDecoration: "none",
};

export default WelcomeEmail;
