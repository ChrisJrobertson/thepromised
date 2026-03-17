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

type LetterSentConfirmEmailProps = {
  name: string;
  letterTypeName: string;
  orgName: string;
  recipientEmail: string;
  caseId: string;
  letterId: string;
  appUrl?: string;
};

export function LetterSentConfirmEmail({
  name,
  letterTypeName,
  orgName,
  recipientEmail,
  caseId,
  letterId,
  appUrl = "https://www.theypromised.app",
}: LetterSentConfirmEmailProps) {
  const letterUrl = `${appUrl}/cases/${caseId}/letters/${letterId}`;

  return (
    <Html lang="en-GB">
      <Head />
      <Preview>Your {letterTypeName} to {orgName} has been sent</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>TheyPromised</Heading>
            <Text style={tagline}>Letter sent</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Letter sent ✓</Heading>

            <Text style={text}>
              Hi {name}, your <strong>{letterTypeName}</strong> has been sent to{" "}
              <strong>{orgName}</strong> at {recipientEmail}.
            </Text>

            <Section style={infoBox}>
              <Text style={infoItem}>📬 We&apos;ll notify you when the email is delivered</Text>
              <Text style={infoItem}>👁️ We&apos;ll notify you if the company opens it</Text>
              <Text style={infoItem}>⚠️ If it bounces, we&apos;ll let you know so you can try another address</Text>
            </Section>

            <Text style={text}>
              The full letter text is saved in your case file.
            </Text>

            <Button href={letterUrl} style={button}>
              View the letter →
            </Button>

            <Hr style={hr} />

            <Text style={smallText}>
              <strong>Tip:</strong> If you don&apos;t hear back within 14 days, send a follow-up.
              Companies often respond faster to a second contact. Most must respond within 8 weeks
              under UK complaint handling rules.
            </Text>
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
  padding: "24px 32px",
  textAlign: "center" as const,
};

const logo = { color: "#ffffff", fontSize: "22px", fontWeight: "700", margin: "0 0 4px 0" };
const tagline = { color: "rgba(255,255,255,0.7)", fontSize: "13px", margin: "0" };
const content = { padding: "32px" };

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

const infoBox = {
  backgroundColor: "#f0f9ff",
  borderRadius: "6px",
  marginBottom: "16px",
  padding: "16px",
};

const infoItem = {
  color: "#0c4a6e",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 6px 0",
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
  marginBottom: "16px",
};

const hr = { borderColor: "#e5e7eb", margin: "20px 0" };
const smallText = { color: "#6b7280", fontSize: "13px", lineHeight: "1.8" };

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

const link = { color: "#0d9488", textDecoration: "none" };

export default LetterSentConfirmEmail;
