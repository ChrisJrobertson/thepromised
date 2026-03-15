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

type PromiseBrokenEmailProps = {
  name: string;
  caseName: string;
  orgName: string;
  promiseText: string;
  deadline: string;
  caseUrl: string;
  appUrl?: string;
};

export function PromiseBrokenEmail({
  name,
  caseName,
  orgName,
  promiseText,
  deadline,
  caseUrl,
  appUrl = "https://www.theypromised.app",
}: PromiseBrokenEmailProps) {
  return (
    <Html lang="en-GB">
      <Head />
      <Preview>❌ {orgName} missed their deadline for: {promiseText.slice(0, 60)}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>TheyPromised</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>❌ Promise deadline missed</Heading>

            <Text style={text}>Hi {name},</Text>

            <Text style={text}>
              <strong>{orgName}</strong> had a deadline of{" "}
              <strong>{deadline}</strong> for the following promise — and it appears
              they have not fulfilled it.
            </Text>

            <Section style={promiseBox}>
              <Text style={promiseLabel}>Promise made</Text>
              <Text style={promiseText_}>{promiseText}</Text>
              <Text style={promiseMeta}>
                Case: {caseName} · Deadline: {deadline}
              </Text>
            </Section>

            <Text style={text}>
              A broken promise strengthens your case. We recommend:
            </Text>

            <ul style={list}>
              <li style={listItem}>
                <strong>Log this failure</strong> as a new interaction in your case
              </li>
              <li style={listItem}>
                <strong>Mark the promise as broken</strong> in your timeline
              </li>
              <li style={listItem}>
                <strong>Consider escalating</strong> — broken promises are evidence of bad faith
              </li>
              <li style={listItem}>
                <strong>Generate a follow-up letter</strong> referencing the missed deadline
              </li>
            </ul>

            <Button href={caseUrl} style={button}>
              View case & take action
            </Button>

            <Hr style={hr} />

            <Text style={smallText}>
              You can mark this promise as kept or broken in your case timeline. This
              information will be included in any PDF export.
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

const header = { backgroundColor: "#1e3a5f", padding: "20px 32px" };
const logo = { color: "#ffffff", fontSize: "20px", fontWeight: "700", margin: "0" };
const content = { padding: "32px" };

const h1 = {
  color: "#1e3a5f",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 16px 0",
};

const text = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const promiseBox = {
  backgroundColor: "#fef2f2",
  borderLeft: "4px solid #ef4444",
  borderRadius: "4px",
  marginBottom: "20px",
  padding: "14px 16px",
};

const promiseLabel = {
  color: "#991b1b",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
};

const promiseText_ = {
  color: "#1e3a5f",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0 0 6px 0",
};

const promiseMeta = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "0",
};

const list = { paddingLeft: "0", listStyle: "none" as const, margin: "0 0 20px 0" };
const listItem = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "1.8",
  marginBottom: "6px",
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

const smallText = { color: "#6b7280", fontSize: "13px", lineHeight: "1.6" };

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

export default PromiseBrokenEmail;
