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

type SubscriptionConfirmEmailProps = {
  name: string;
  tier: "basic" | "pro";
  appUrl?: string;
};

const TIER_FEATURES: Record<"basic" | "pro", string[]> = {
  basic: [
    "Unlimited cases",
    "Timeline & letters PDF export",
    "Email reminders and alerts",
    "10 AI case analyses per month",
    "5 AI-drafted letters per month",
  ],
  pro: [
    "Full case file PDF (ombudsman-ready)",
    "50 AI case analyses per month",
    "30 AI-drafted letters per month",
    "Voice memo recording",
    "Email forwarding parser",
    "AI auto-summaries on all interactions",
  ],
};

export function SubscriptionConfirmEmail({
  name,
  tier,
  appUrl = "https://www.theypromised.app",
}: SubscriptionConfirmEmailProps) {
  const tierLabel = tier === "pro" ? "Pro" : "Basic";
  const features = TIER_FEATURES[tier];

  return (
    <Html lang="en-GB">
      <Head />
      <Preview>Your TheyPromised {tierLabel} subscription is now active</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>TheyPromised</Heading>
            <Text style={tagline}>{tierLabel} Plan</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Subscription confirmed ✓</Heading>

            <Text style={text}>
              Hi {name}, your <strong>TheyPromised {tierLabel}</strong> subscription
              is now active. Thank you for upgrading — here&apos;s what you now have access to:
            </Text>

            <Section style={featureBox}>
              {features.map((feature, i) => (
                <Text key={i} style={featureItem}>
                  ✓ {feature}
                </Text>
              ))}
            </Section>

            <Text style={text}>
              Manage your subscription, download invoices, or change your plan at any time
              from your billing settings.
            </Text>

            <Button href={`${appUrl}/cases/new`} style={button}>
              Start a case →
            </Button>

            <Hr style={hr} />

            <Text style={smallText}>
              Need help getting started?{" "}
              <Link href={`${appUrl}/how-it-works`} style={link}>
                Read our guide →
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
              <Link href={`${appUrl}/settings/billing`} style={link}>
                Manage subscription
              </Link>{" "}
              ·{" "}
              <Link href={`${appUrl}/settings/notifications`} style={link}>
                Email preferences
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

const featureBox = {
  backgroundColor: "#f0fdf4",
  borderRadius: "6px",
  marginBottom: "20px",
  padding: "16px",
};

const featureItem = {
  color: "#166534",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 4px 0",
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

export default SubscriptionConfirmEmail;
