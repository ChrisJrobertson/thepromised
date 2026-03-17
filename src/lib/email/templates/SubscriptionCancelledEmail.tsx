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

type SubscriptionCancelledEmailProps = {
  name: string;
  tierName: string;
  appUrl?: string;
};

export function SubscriptionCancelledEmail({
  name,
  tierName,
  appUrl = "https://www.theypromised.app",
}: SubscriptionCancelledEmailProps) {
  return (
    <Html lang="en-GB">
      <Head />
      <Preview>Your {tierName} subscription has been cancelled</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>TheyPromised</Heading>
            <Text style={tagline}>Subscription cancelled</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Subscription cancelled</Heading>

            <Text style={text}>
              Hi {name}, your <strong>{tierName}</strong> subscription has been cancelled.
              Your account has been moved to the free plan.
            </Text>

            <Section style={changesBox}>
              <Text style={changesHeading}>What changes on the free plan:</Text>
              <Text style={changeItem}>• Active cases beyond the first will be read-only</Text>
              <Text style={changeItem}>• AI analysis and letter drafting are no longer available</Text>
              <Text style={changeItem}>• Email reminders and PDF exports are paused</Text>
            </Section>

            <Section style={safeBox}>
              <Text style={safeText}>
                🔒 <strong>Your data is safe.</strong> All your cases, interactions, evidence,
                and letters remain intact. Nothing has been deleted.
              </Text>
            </Section>

            <Text style={text}>
              If you&apos;d like to continue using these features, you can re-subscribe any time.
            </Text>

            <Button href={`${appUrl}/pricing`} style={button}>
              View plans →
            </Button>

            <Hr style={hr} />

            <Text style={smallText}>
              If you cancelled because something wasn&apos;t working, we&apos;d genuinely like to know.
              Reply to this email and tell us — we read every message.
              <br />
              <Link href="mailto:support@theypromised.app" style={link}>
                support@theypromised.app
              </Link>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              TheyPromised — SynqForge LTD · Company No. 16808271
            </Text>
            <Text style={footerText}>
              3rd Floor, 86-90 Paul Street, London, EC2A 4NE
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

const changesBox = {
  backgroundColor: "#f8fafc",
  borderLeft: "3px solid #cbd5e1",
  borderRadius: "4px",
  marginBottom: "16px",
  padding: "12px 16px",
};

const changesHeading = {
  color: "#374151",
  fontSize: "13px",
  fontWeight: "700" as const,
  margin: "0 0 8px 0",
};

const changeItem = {
  color: "#4b5563",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 4px 0",
};

const safeBox = {
  backgroundColor: "#f0fdf4",
  borderRadius: "6px",
  marginBottom: "16px",
  padding: "12px 16px",
};

const safeText = {
  color: "#166534",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
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
  margin: "0 0 2px 0",
  textAlign: "center" as const,
};

const link = { color: "#0d9488", textDecoration: "none" };

export default SubscriptionCancelledEmail;
