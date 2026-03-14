import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Use Helvetica (built-in, no registration needed)
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 72,    // 2.5cm
    paddingBottom: 72,
    paddingLeft: 72,
    paddingRight: 72,
    lineHeight: 1.5,
    color: "#1a1a1a",
  },
  senderAddress: {
    textAlign: "right",
    marginBottom: 32,
    fontSize: 11,
  },
  senderName: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  dateBlock: {
    marginBottom: 24,
    fontSize: 11,
  },
  recipientAddress: {
    marginBottom: 32,
    fontSize: 11,
  },
  subjectLine: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 24,
    textDecoration: "underline",
  },
  bodyParagraph: {
    marginBottom: 12,
    textAlign: "justify",
    fontSize: 11,
  },
  footer: {
    position: "absolute",
    bottom: 36,
    left: 72,
    right: 72,
    fontSize: 8,
    color: "#888",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    paddingTop: 6,
  },
});

export type LetterPdfData = {
  subject: string;
  body: string;
  caseTitle: string;
  generatedAt: string;
};

export function LetterPdfDocument({ data }: { data: LetterPdfData }) {
  // Split body into paragraphs
  const paragraphs = data.body
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <Document
      title={data.subject}
      author="TheyPromised.app"
      subject={data.subject}
    >
      <Page size="A4" style={styles.page}>
        {/* Letter body paragraphs */}
        {paragraphs.map((para, index) => (
          <Text key={index} style={styles.bodyParagraph}>
            {para}
          </Text>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            {data.subject} · Prepared using TheyPromised.app · {data.generatedAt}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
