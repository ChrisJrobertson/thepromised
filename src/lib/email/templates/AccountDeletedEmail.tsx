import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type AccountDeletedEmailProps = {
  name: string;
};

export function AccountDeletedEmail({ name }: AccountDeletedEmailProps) {
  return (
    <Html lang="en-GB">
      <Head />
      <Preview>Your TheyPromised account has been permanently deleted</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>TheyPromised</Heading>
            <Text style={tagline}>Account deleted</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Account deleted</Heading>

            <Text style={text}>
              Hi {name}, your TheyPromised account and all associated data have been
              permanently deleted.
            </Text>

            <Section style={deletedBox}>
              <Text style={deletedHeading}>The following has been removed:</Text>
              <Text style={deletedItem}>✗ Cases, interactions, and evidence files</Text>
              <Text style={deletedItem}>✗ Letters and complaint history</Text>
              <Text style={deletedItem}>✗ Profile and account information</Text>
              <Text style={deletedItem}>✗ Any active subscription (no further charges will be made)</Text>
            </Section>

            <Text style={text}>
              This action cannot be undone. If you&apos;d like to use TheyPromised again
              in the future, you&apos;re welcome to create a new account.
            </Text>

            <Text style={text}>
              If you have any questions about your data or believe this was in error,
              please contact us at{" "}
              <Link href="mailto:support@theypromised.app" style={link}>
                support@theypromised.app
              </Link>
              .
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              TheyPromised — SynqForge LTD · Company No. 16808271
            </Text>
            <Text style={footerText}>
              3rd Floor, 86-90 Paul Street, London, EC2A 4NE
            </Text>
            <Text style={footerText}>
              <Link href="mailto:support@theypromised.app" style={linkFooter}>
                support@theypromised.app
              </Link>
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

const deletedBox = {
  backgroundColor: "#fef2f2",
  borderLeft: "3px solid #ef4444",
  borderRadius: "4px",
  marginBottom: "20px",
  padding: "12px 16px",
};

const deletedHeading = {
  color: "#991b1b",
  fontSize: "13px",
  fontWeight: "700" as const,
  margin: "0 0 8px 0",
};

const deletedItem = {
  color: "#7f1d1d",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 4px 0",
};

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
const linkFooter = { color: "#9ca3af", textDecoration: "none" };

export default AccountDeletedEmail;
