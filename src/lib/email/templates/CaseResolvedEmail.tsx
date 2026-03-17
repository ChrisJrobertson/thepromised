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

export type CaseOutcomeBucket = "yes" | "partially" | "no";

type CaseResolvedEmailProps = {
  name: string;
  orgName: string;
  caseId: string;
  outcomeBucket: CaseOutcomeBucket;
  compensationAmount?: number;
  appUrl?: string;
};

const OUTCOME_MESSAGES: Record<CaseOutcomeBucket, { heading: string; body: string }> = {
  yes: {
    heading: "You got the outcome you wanted 🎉",
    body: "That's a real achievement — most people give up before reaching this point. Well done for seeing it through.",
  },
  partially: {
    heading: "You reached a partial resolution",
    body: "Sometimes that's the pragmatic choice, and it's still a win. You had a complaint, you pursued it, and you got something back.",
  },
  no: {
    heading: "Sorry the outcome wasn't what you hoped for",
    body: "If you believe the decision was unfair, you may still have options. Check the escalation guides for your next steps — ombudsmen and courts can review decisions that companies get wrong.",
  },
};

export function CaseResolvedEmail({
  name,
  orgName,
  caseId,
  outcomeBucket,
  compensationAmount,
  appUrl = "https://www.theypromised.app",
}: CaseResolvedEmailProps) {
  const outcome = OUTCOME_MESSAGES[outcomeBucket];
  const exportUrl = `${appUrl}/cases/${caseId}/export`;
  const escalationUrl = `${appUrl}/escalation-guides`;

  return (
    <Html lang="en-GB">
      <Head />
      <Preview>Case resolved — your complaint against {orgName} is closed</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>TheyPromised</Heading>
            <Text style={tagline}>Case closed</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Case resolved — well done, {name}</Heading>

            <Text style={text}>
              You&apos;ve resolved your case against <strong>{orgName}</strong>.
            </Text>

            <Section style={outcomeBox[outcomeBucket]}>
              <Text style={outcomeHeading}>{outcome.heading}</Text>
              <Text style={outcomeText}>{outcome.body}</Text>
            </Section>

            {outcomeBucket === "no" && (
              <Button href={escalationUrl} style={buttonSecondary}>
                View escalation guides →
              </Button>
            )}

            {compensationAmount !== undefined && compensationAmount > 0 && (
              <Section style={compensationBox}>
                <Text style={compensationText}>
                  💰 Compensation received:{" "}
                  <strong>£{compensationAmount.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</strong>
                </Text>
              </Section>
            )}

            <Text style={text}>
              Your case data is saved and you can export it at any time.
            </Text>

            <Button href={exportUrl} style={button}>
              Export your case →
            </Button>

            <Hr style={hr} />

            <Text style={smallText}>
              Your experience helps others. The complaint data you logged (with your identity
              removed) contributes to company scorecards that help other consumers make
              informed choices. Thank you for using TheyPromised.
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

const outcomeBox: Record<CaseOutcomeBucket, object> = {
  yes: {
    backgroundColor: "#f0fdf4",
    borderLeft: "3px solid #22c55e",
    borderRadius: "4px",
    marginBottom: "20px",
    padding: "14px 16px",
  },
  partially: {
    backgroundColor: "#fffbeb",
    borderLeft: "3px solid #f59e0b",
    borderRadius: "4px",
    marginBottom: "20px",
    padding: "14px 16px",
  },
  no: {
    backgroundColor: "#f8fafc",
    borderLeft: "3px solid #94a3b8",
    borderRadius: "4px",
    marginBottom: "20px",
    padding: "14px 16px",
  },
};

const outcomeHeading = {
  color: "#1e3a5f",
  fontSize: "15px",
  fontWeight: "700" as const,
  margin: "0 0 6px 0",
};

const outcomeText = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
};

const compensationBox = {
  backgroundColor: "#f0fdf4",
  borderRadius: "6px",
  marginBottom: "16px",
  padding: "12px 16px",
};

const compensationText = {
  color: "#166534",
  fontSize: "15px",
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

const buttonSecondary = {
  ...button,
  backgroundColor: "#1e3a5f",
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

export default CaseResolvedEmail;
