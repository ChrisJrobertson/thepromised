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

export type PackType = "starter" | "escalation" | "full-case" | "full_case";

type PackPurchaseConfirmEmailProps = {
  name: string;
  packType: PackType;
  expiryDate: string;
  amountFormatted: string;
  caseId?: string;
  appUrl?: string;
};

const PACK_FEATURES: Record<string, string[]> = {
  starter: [
    "7 days of Pro-tier access for your case",
    "Case insights and letter drafting",
    "PDF export of your full case file",
  ],
  escalation: [
    "Everything in the Starter Pack, plus:",
    "Drafted escalation letters",
    "Ombudsman referral letter",
    "Full escalation guidance",
  ],
  "full-case": [
    "Everything in the Escalation Pack, plus:",
    "Letter Before Action (pre-court)",
    "Subject Access Request letter",
    "Section 75 claim letter",
    "Complete case export with evidence index",
  ],
  "full_case": [
    "Everything in the Escalation Pack, plus:",
    "Letter Before Action (pre-court)",
    "Subject Access Request letter",
    "Section 75 claim letter",
    "Complete case export with evidence index",
  ],
};

const PACK_NAMES: Record<string, string> = {
  starter: "Starter Pack",
  escalation: "Escalation Pack",
  "full-case": "Full Case Pack",
  full_case: "Full Case Pack",
};

export function PackPurchaseConfirmEmail({
  name,
  packType,
  expiryDate,
  amountFormatted,
  caseId,
  appUrl = "https://www.theypromised.app",
}: PackPurchaseConfirmEmailProps) {
  const packName = PACK_NAMES[packType] ?? "Complaint Pack";
  const features = PACK_FEATURES[packType] ?? [];
  const caseUrl = caseId ? `${appUrl}/cases/${caseId}` : `${appUrl}/dashboard`;

  return (
    <Html lang="en-GB">
      <Head />
      <Preview>Your {packName} is confirmed — Pro features are now active</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>TheyPromised</Heading>
            <Text style={tagline}>{packName} · Confirmed</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Purchase confirmed ✓</Heading>

            <Text style={text}>
              Hi {name}, your <strong>{packName}</strong> purchase is confirmed.
              Pro-tier features are now active for your case — here&apos;s what&apos;s included:
            </Text>

            <Section style={featureBox}>
              {features.map((feature, i) => (
                <Text key={i} style={featureItem}>
                  ✓ {feature}
                </Text>
              ))}
            </Section>

            <Section style={warningBox}>
              <Text style={warningText}>
                ⏰ <strong>Important:</strong> Your Pro access expires on {expiryDate} (7 days).
                Make the most of it — draft your letters and export your case file before it expires.
              </Text>
            </Section>

            <Button href={caseUrl} style={button}>
              Go to your case →
            </Button>

            <Hr style={hr} />

            <Text style={smallText}>
              Payment: {amountFormatted} one-off · Your Stripe receipt has been sent separately.
              <br />
              Questions?{" "}
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

const featureBox = {
  backgroundColor: "#f0fdf4",
  borderRadius: "6px",
  marginBottom: "16px",
  padding: "16px",
};

const featureItem = {
  color: "#166534",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 4px 0",
};

const warningBox = {
  backgroundColor: "#fffbeb",
  borderLeft: "3px solid #f59e0b",
  borderRadius: "4px",
  marginBottom: "20px",
  padding: "12px 16px",
};

const warningText = {
  color: "#92400e",
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

export default PackPurchaseConfirmEmail;
