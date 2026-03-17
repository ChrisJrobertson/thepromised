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

type LetterBouncedEmailProps = {
  name: string;
  letterTypeName: string;
  orgName: string;
  recipientEmail: string;
  caseId: string;
  letterId: string;
  orgSlug?: string;
  appUrl?: string;
};

export function LetterBouncedEmail({
  name,
  letterTypeName,
  orgName,
  recipientEmail,
  caseId,
  letterId,
  orgSlug,
  appUrl = "https://www.theypromised.app",
}: LetterBouncedEmailProps) {
  const resendUrl = `${appUrl}/cases/${caseId}/letters/${letterId}`;
  const guidesUrl = orgSlug
    ? `${appUrl}/guides/${orgSlug}`
    : `${appUrl}/escalation-guides`;

  return (
    <Html lang="en-GB">
      <Head />
      <Preview>⚠️ Your letter to {orgName} couldn&apos;t be delivered — action needed</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>TheyPromised</Heading>
            <Text style={tagline}>Delivery failed</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Letter bounced ⚠️</Heading>

            <Text style={text}>
              Hi {name}, your <strong>{letterTypeName}</strong> to{" "}
              <strong>{orgName}</strong> bounced — the email address{" "}
              <strong>{recipientEmail}</strong> didn&apos;t accept the message.
            </Text>

            <Section style={reasonBox}>
              <Text style={reasonHeading}>This usually means:</Text>
              <Text style={reasonItem}>• The email address is wrong or out of date</Text>
              <Text style={reasonItem}>• The company&apos;s mailbox is full</Text>
              <Text style={reasonItem}>• Their server rejected the email</Text>
            </Section>

            <Text style={text}>
              <strong>What to do next:</strong>
            </Text>

            <ol style={stepList}>
              <li style={stepItem}>
                Check the company&apos;s website for a current complaints email address
              </li>
              <li style={stepItem}>
                Try an alternative address (e.g. complaints@, customerservice@)
              </li>
              <li style={stepItem}>
                Re-send the letter from your case page once you have the correct address
              </li>
            </ol>

            <Button href={resendUrl} style={button}>
              Re-send the letter →
            </Button>

            <Hr style={hr} />

            <Text style={smallText}>
              <Link href={guidesUrl} style={link}>
                Check the company&apos;s contact details →
              </Link>
              <br />
              Questions?{" "}
              <Link href="mailto:support@theypromised.app" style={link}>
                support@theypromised.app
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

const reasonBox = {
  backgroundColor: "#fef2f2",
  borderLeft: "3px solid #ef4444",
  borderRadius: "4px",
  marginBottom: "20px",
  padding: "12px 16px",
};

const reasonHeading = {
  color: "#991b1b",
  fontSize: "13px",
  fontWeight: "700" as const,
  margin: "0 0 8px 0",
};

const reasonItem = {
  color: "#7f1d1d",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 4px 0",
};

const stepList = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.8",
  margin: "0 0 20px 0",
  paddingLeft: "20px",
};

const stepItem = {
  marginBottom: "8px",
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

export default LetterBouncedEmail;
