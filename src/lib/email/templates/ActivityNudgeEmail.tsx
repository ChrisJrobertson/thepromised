import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type ActivityNudgeEmailProps = {
  name: string;
  companyName: string;
  caseUrl: string;
  daysSinceLastUpdate: number;
  appUrl: string;
};

export function ActivityNudgeEmail({
  name,
  companyName,
  caseUrl,
  daysSinceLastUpdate,
  appUrl,
}: ActivityNudgeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Any updates on your case with {companyName}?</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "0 20px" }}>
          <Section style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "32px" }}>
            <Heading style={{ color: "#0f172a", fontSize: "20px", fontWeight: "700", marginBottom: "4px", marginTop: 0 }}>
              Any updates on your {companyName} case?
            </Heading>

            <Text style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Hi {name},
            </Text>

            <Text style={{ color: "#334155", fontSize: "14px", lineHeight: "1.6" }}>
              It&apos;s been {daysSinceLastUpdate} {daysSinceLastUpdate === 1 ? "day" : "days"} since you last updated your case with <strong>{companyName}</strong>.
            </Text>

            <Text style={{ color: "#334155", fontSize: "14px", lineHeight: "1.6" }}>
              If you&apos;ve spoken to them, received a reply, or have any new information, logging it now keeps your timeline complete and your case strong.
            </Text>

            <Section style={{ textAlign: "center", margin: "28px 0" }}>
              <Button
                href={caseUrl}
                style={{
                  backgroundColor: "#0d9488",
                  borderRadius: "8px",
                  color: "#ffffff",
                  display: "inline-block",
                  fontSize: "14px",
                  fontWeight: "600",
                  padding: "12px 24px",
                  textDecoration: "none",
                }}
              >
                Update My Case
              </Button>
            </Section>

            <Section style={{ backgroundColor: "#f8fafc", borderRadius: "8px", padding: "16px", borderLeft: "3px solid #0d9488" }}>
              <Text style={{ color: "#475569", fontSize: "13px", lineHeight: "1.5", margin: 0 }}>
                A complete timeline makes all the difference if you need to escalate. Every interaction you log is evidence in your favour.
              </Text>
            </Section>
          </Section>

          <Text style={{ color: "#94a3b8", fontSize: "12px", marginTop: "16px", textAlign: "center" }}>
            TheyPromised &middot;{" "}
            <a href={`${appUrl}/settings/notifications`} style={{ color: "#94a3b8" }}>
              Manage notification preferences
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
