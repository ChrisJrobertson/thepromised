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

type LetterDeliveredEmailProps = {
  name: string;
  letterTypeName: string;
  orgName: string;
  recipientEmail: string;
  deliveredDate: string;
  caseId: string;
  appUrl?: string;
};

export function LetterDeliveredEmail({
  name,
  letterTypeName,
  orgName,
  recipientEmail,
  deliveredDate,
  caseId,
  appUrl = "https://www.theypromised.app",
}: LetterDeliveredEmailProps) {
  const caseUrl = `${appUrl}/cases/${caseId}`;

  return (
    <Html lang="en-GB">
      <Head />
      <Preview>✓ Your letter to {orgName} was delivered</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>TheyPromised</Heading>
            <Text style={tagline}>Delivery confirmed</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Letter delivered ✓</Heading>

            <Text style={text}>
              Hi {name}, your <strong>{letterTypeName}</strong> was successfully delivered to{" "}
              <strong>{orgName}</strong> at {recipientEmail} on {deliveredDate}.
            </Text>

            <Section style={timelineBox}>
              <Text style={timelineHeading}>The clock is now ticking</Text>
              <Text style={timelineItem}>
                📅 <strong>14 days</strong> — Companies typically acknowledge receipt within 14 days
              </Text>
              <Text style={timelineItem}>
                ⏰ <strong>8 weeks</strong> — They must issue a final response within 8 weeks under
                UK complaint handling rules
              </Text>
              <Text style={timelineItem}>
                🏛️ <strong>After 8 weeks</strong> — You can escalate to the relevant ombudsman
              </Text>
            </Section>

            <Text style={text}>
              We&apos;ll remind you as the escalation window approaches.
            </Text>

            <Button href={caseUrl} style={button}>
              View your case →
            </Button>

            <Hr style={hr} />

            <Text style={smallText}>
              Keep logging every interaction — a thorough record is your strongest asset.{" "}
              <Link href={`${appUrl}/escalation-guides`} style={link}>
                View escalation guides →
              </Link>
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

const timelineBox = {
  backgroundColor: "#f0fdf4",
  borderRadius: "6px",
  marginBottom: "16px",
  padding: "16px",
};

const timelineHeading = {
  color: "#166534",
  fontSize: "13px",
  fontWeight: "700" as const,
  letterSpacing: "0.05em",
  margin: "0 0 10px 0",
  textTransform: "uppercase" as const,
};

const timelineItem = {
  color: "#166534",
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

export default LetterDeliveredEmail;
