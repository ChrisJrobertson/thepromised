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

type EscalationAlertEmailProps = {
  name: string;
  caseName: string;
  orgName: string;
  weeksOpen: number;
  ombudsmanName: string;
  ombudsmanUrl: string;
  caseUrl: string;
  appUrl?: string;
};

export function EscalationAlertEmail({
  name,
  caseName,
  orgName,
  weeksOpen,
  ombudsmanName,
  ombudsmanUrl,
  caseUrl,
  appUrl = "https://theypromised.app",
}: EscalationAlertEmailProps) {
  const isEightWeeks = weeksOpen >= 8;

  return (
    <Html lang="en-GB">
      <Head />
      <Preview>
        {isEightWeeks
          ? `🏛️ You can now escalate your ${orgName} complaint to the ombudsman`
          : `⏰ Approaching 8-week escalation window for your ${orgName} complaint`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>TheyPromised</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>
              {isEightWeeks
                ? "🏛️ You can now escalate"
                : "⏰ Escalation window approaching"}
            </Heading>

            <Text style={text}>
              Hi {name},
            </Text>

            {isEightWeeks ? (
              <Text style={text}>
                Your complaint against <strong>{orgName}</strong> has been open for{" "}
                {weeksOpen} weeks. Under UK complaints procedures, you are now eligible
                to escalate your case to <strong>{ombudsmanName}</strong> — a free,
                independent service that can award compensation and require the organisation
                to put things right.
              </Text>
            ) : (
              <Text style={text}>
                Your complaint against <strong>{orgName}</strong> has been open for{" "}
                {weeksOpen} weeks. The 8-week escalation window — after which you can
                refer to the ombudsman — is approaching.
              </Text>
            )}

            <Section style={alertBox}>
              <Text style={alertTitle}>
                {isEightWeeks ? "Action available now" : "Prepare to escalate"}
              </Text>
              <Text style={alertText}>
                <strong>Case:</strong> {caseName}
                <br />
                <strong>Ombudsman:</strong> {ombudsmanName}
                <br />
                <strong>Weeks open:</strong> {weeksOpen}
              </Text>
            </Section>

            {isEightWeeks && (
              <Text style={text}>
                To escalate, you will need:
                <br />• A deadlock letter from {orgName} (or evidence of 8+ weeks with no
                resolution)
                <br />• Your complaint reference number
                <br />• Evidence of all interactions (your TheyPromised timeline)
              </Text>
            )}

            <Button href={caseUrl} style={button}>
              {isEightWeeks ? "View case & escalation guide" : "View case"}
            </Button>

            {isEightWeeks && (
              <>
                <Hr style={hr} />
                <Text style={smallText}>
                  To escalate:{" "}
                  <Link href={ombudsmanUrl} style={link}>
                    {ombudsmanName} →
                  </Link>
                </Text>
              </>
            )}
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

const alertBox = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  borderRadius: "4px",
  marginBottom: "20px",
  padding: "14px 16px",
};

const alertTitle = {
  color: "#92400e",
  fontSize: "13px",
  fontWeight: "700",
  margin: "0 0 6px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const alertText = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "1.6",
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

const smallText = {
  color: "#6b7280",
  fontSize: "13px",
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

const link = { color: "#0d9488", textDecoration: "none" };

export default EscalationAlertEmail;
