import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const NAVY = "#1e3a5f";
const TEAL = "#0d9488";
const LIGHT_GREY = "#f8f9fa";
const MID_GREY = "#e9ecef";
const TEXT = "#1a1a1a";
const MUTED = "#6c757d";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 60,
    paddingBottom: 60,
    paddingLeft: 60,
    paddingRight: 60,
    color: TEXT,
    lineHeight: 1.4,
  },

  // Cover page
  coverPage: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 80,
    paddingBottom: 60,
    paddingLeft: 60,
    paddingRight: 60,
    color: TEXT,
    backgroundColor: "#ffffff",
  },
  coverAccent: {
    height: 8,
    backgroundColor: NAVY,
    marginBottom: 48,
  },
  coverLabel: {
    fontSize: 10,
    color: MUTED,
    letterSpacing: 2,
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    marginBottom: 6,
  },
  coverSubtitle: {
    fontSize: 14,
    color: TEXT,
    marginBottom: 48,
  },
  coverRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  coverLabel2: {
    fontSize: 9,
    color: MUTED,
    width: 130,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  coverValue: {
    fontSize: 10,
    flex: 1,
  },
  coverDivider: {
    height: 1,
    backgroundColor: MID_GREY,
    marginVertical: 24,
  },
  coverFooter: {
    position: "absolute",
    bottom: 40,
    left: 60,
    right: 60,
    fontSize: 8,
    color: MUTED,
    textAlign: "center",
  },

  // Contents page
  tocTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    marginBottom: 16,
  },
  tocIntro: {
    fontSize: 9,
    color: MUTED,
    marginBottom: 14,
    lineHeight: 1.5,
  },
  tocRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderBottomColor: MID_GREY,
    paddingVertical: 6,
  },
  tocLabel: {
    fontSize: 10,
    color: TEXT,
  },
  tocPageHint: {
    fontSize: 9,
    color: MUTED,
  },

  // Section headings
  sectionHeader: {
    backgroundColor: NAVY,
    padding: "10 12",
    marginBottom: 12,
    borderRadius: 3,
  },
  sectionHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  sectionNumber: {
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 2,
  },

  // Summary section
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: LIGHT_GREY,
    borderRadius: 4,
    padding: "8 12",
    width: "48%",
  },
  summaryCardLabel: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  summaryCardValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: TEXT,
  },
  descriptionBox: {
    backgroundColor: LIGHT_GREY,
    borderRadius: 4,
    padding: "10 12",
    marginBottom: 8,
  },
  descriptionLabel: {
    fontSize: 8,
    color: MUTED,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 10,
    lineHeight: 1.5,
  },

  // Timeline
  timelineEntry: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: MID_GREY,
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TEAL,
    marginRight: 8,
    marginTop: 2,
    flexShrink: 0,
  },
  timelineMeta: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  timelineChannel: {
    fontSize: 8,
    color: MUTED,
    marginTop: 1,
  },
  timelineBody: {
    paddingLeft: 16,
  },
  timelineSummary: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  promiseBadge: {
    backgroundColor: "#fef3c7",
    borderRadius: 3,
    padding: "3 6",
    marginTop: 4,
  },
  promiseBadgeBroken: {
    backgroundColor: "#fee2e2",
  },
  promiseBadgeKept: {
    backgroundColor: "#dcfce7",
  },
  promiseText: {
    fontSize: 8,
    color: "#92400e",
  },
  promiseTextBroken: {
    color: "#991b1b",
  },
  promiseTextKept: {
    color: "#166534",
  },
  outcomeBadge: {
    borderRadius: 3,
    padding: "2 6",
    marginTop: 3,
    backgroundColor: LIGHT_GREY,
    alignSelf: "flex-start",
  },
  outcomeBadgeText: {
    fontSize: 8,
    color: MUTED,
    fontFamily: "Helvetica-Bold",
  },

  // Promises table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: NAVY,
    padding: "5 8",
    borderRadius: "3 3 0 0",
  },
  tableHeaderCell: {
    fontSize: 8,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: MID_GREY,
    padding: "5 8",
  },
  tableRowAlt: {
    backgroundColor: LIGHT_GREY,
  },
  tableCell: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  colDate: { width: "14%" },
  colWho: { width: "18%" },
  colWhat: { width: "36%" },
  colDeadline: { width: "16%" },
  colStatus: { width: "16%" },

  // Evidence index
  evidenceRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: MID_GREY,
  },
  evidenceRowAlt: {
    backgroundColor: LIGHT_GREY,
  },
  evidenceFilename: { width: "35%", fontSize: 9 },
  evidenceType: { width: "15%", fontSize: 9 },
  evidenceDate: { width: "20%", fontSize: 9 },
  evidenceDesc: { width: "30%", fontSize: 9, color: MUTED },

  // Letters section
  letterItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: MID_GREY,
  },
  letterMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  letterTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  letterStatus: {
    fontSize: 8,
    color: MUTED,
    backgroundColor: LIGHT_GREY,
    padding: "2 6",
    borderRadius: 3,
  },
  letterBody: {
    fontSize: 9,
    lineHeight: 1.5,
    color: TEXT,
  },

  // Escalation
  escalationStage: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: TEAL,
  },
  escalationStagePast: {
    borderLeftColor: "#86efac",
  },
  escalationStageText: {
    flex: 1,
    paddingLeft: 8,
  },
  escalationStageName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  escalationStageDesc: {
    fontSize: 9,
    color: MUTED,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 60,
    right: 60,
    fontSize: 7,
    color: MUTED,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: MID_GREY,
    paddingTop: 4,
  },
  pageNum: {
    fontSize: 7,
    color: MUTED,
  },
});

export type CasePdfData = {
  caseTitle: string;
  orgName: string;
  caseReference: string | null;
  description: string | null;
  desiredOutcome: string | null;
  amountInDispute: number | null;
  status: string;
  escalationStage: string;
  firstContactDate: string | null;
  lastInteractionDate: string | null;
  totalInteractions: number;
  daysOpen: number;
  userName: string;
  generatedAt: string;
  interactions: Array<{
    id: string;
    date: string;
    channel: string;
    direction: string;
    contactName: string | null;
    contactDepartment: string | null;
    referenceNumber: string | null;
    durationMinutes: number | null;
    summary: string;
    promisesMade: string | null;
    promiseDeadline: string | null;
    promiseFulfilled: boolean | null;
    outcome: string | null;
    nextSteps: string | null;
  }>;
  promises: Array<{
    date: string;
    contactName: string | null;
    promisesMade: string;
    deadline: string | null;
    fulfilled: boolean | null;
  }>;
  evidence: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    description: string | null;
    evidenceType: string | null;
    createdAt: string | null;
  }>;
  letters: Array<{
    id: string;
    subject: string;
    letterType: string;
    status: string;
    sentDate: string | null;
    body: string;
    aiGenerated: boolean;
  }>;
  escalationStages: Array<{
    stageOrder: number;
    title: string;
    description: string;
    completed: boolean;
  }>;
  exportType: "full_case" | "timeline_only" | "letters_only";
};

const CHANNEL_LABELS: Record<string, string> = {
  phone: "Phone Call",
  email: "Email",
  letter: "Letter / Post",
  webchat: "Webchat / Live Chat",
  in_person: "In Person",
  social_media: "Social Media",
  app: "App / Portal",
  other: "Other",
};

const OUTCOME_LABELS: Record<string, string> = {
  resolved: "Resolved",
  escalated: "Escalated",
  promised_callback: "Promised Callback",
  promised_action: "Promised Action",
  no_resolution: "No Resolution",
  transferred: "Transferred",
  disconnected: "Disconnected",
  other: "Other",
};

const LETTER_TYPE_LABELS: Record<string, string> = {
  initial_complaint: "Initial Complaint",
  follow_up: "Follow-up",
  escalation: "Escalation",
  final_response_request: "Final Response Request",
  ombudsman_referral: "Ombudsman Referral",
  subject_access_request: "Subject Access Request",
  formal_notice: "Letter Before Action",
  custom: "Custom",
};

function Footer({ caseTitle, generatedAt }: { caseTitle: string; generatedAt: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>Case File: {caseTitle} · Generated by TheyPromised.app on {generatedAt}</Text>
      <Text
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        style={styles.pageNum}
      />
    </View>
  );
}

function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionNumber}>SECTION {number}</Text>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
}

export function CasePdfDocument({ data }: { data: CasePdfData }) {
  const {
    caseTitle,
    orgName,
    caseReference,
    description,
    desiredOutcome,
    amountInDispute,
    status,
    escalationStage,
    firstContactDate,
    lastInteractionDate,
    totalInteractions,
    daysOpen,
    userName,
    generatedAt,
    interactions,
    promises,
    evidence,
    letters,
    escalationStages,
    exportType,
  } = data;

  const showTimeline = exportType === "full_case" || exportType === "timeline_only";
  const showLetters = exportType === "full_case" || exportType === "letters_only";
  const showFullCase = exportType === "full_case";
  const contents = showFullCase
    ? [
        "Case Summary",
        "Chronological Timeline",
        "Promises & Commitments",
        "Escalation History",
        "Evidence Index",
        "Correspondence",
      ]
    : showTimeline
      ? ["Chronological Timeline"]
      : ["Correspondence"];

  return (
    <Document title={`Case File — ${caseTitle}`} author="TheyPromised.app">
      {/* ── COVER PAGE ── */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverAccent} />

        <Text style={styles.coverLabel}>CASE FILE</Text>
        <Text style={styles.coverTitle}>{orgName}</Text>
        <Text style={styles.coverSubtitle}>{caseTitle}</Text>

        <View style={styles.coverDivider} />

        {[
          ["PREPARED BY", userName],
          ["GENERATED ON", generatedAt],
          ["CASE STATUS", status.charAt(0).toUpperCase() + status.slice(1)],
          ["ESCALATION STAGE", escalationStage.replace(/_/g, " ").toUpperCase()],
          caseReference ? ["REFERENCE NUMBER", caseReference] : null,
          firstContactDate ? ["FIRST CONTACT", firstContactDate] : null,
          lastInteractionDate ? ["LAST INTERACTION", lastInteractionDate] : null,
          ["TOTAL INTERACTIONS", totalInteractions.toString()],
          ["DAYS OPEN", daysOpen.toString()],
          amountInDispute ? ["AMOUNT IN DISPUTE", `£${amountInDispute.toFixed(2)}`] : null,
        ]
          .filter(Boolean)
          .map((row, i) => (
            <View key={i} style={styles.coverRow}>
              <Text style={styles.coverLabel2}>{row![0]}</Text>
              <Text style={styles.coverValue}>{row![1]}</Text>
            </View>
          ))}

        <View style={styles.coverDivider} />

        <Text style={{ fontSize: 8, color: MUTED, lineHeight: 1.6 }}>
          This document is a chronological record of a consumer complaint. It has been prepared using
          TheyPromised.app and contains all logged interactions, correspondence, and evidence for this case.
          AI summaries are for guidance only. Always verify facts with original records.
        </Text>

        <Text style={styles.coverFooter}>
          Prepared using TheyPromised.app · {generatedAt}
        </Text>
      </Page>

      {/* ── CONTENTS PAGE ── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.tocTitle}>Contents</Text>
        <Text style={styles.tocIntro}>
          This overview lists the sections included in this export.
        </Text>
        {contents.map((section, index) => (
          <View key={section} style={styles.tocRow}>
            <Text style={styles.tocLabel}>
              {index + 1}. {section}
            </Text>
            <Text style={styles.tocPageHint}>Section</Text>
          </View>
        ))}
        <Footer caseTitle={caseTitle} generatedAt={generatedAt} />
      </Page>

      {/* ── SECTION 1: CASE SUMMARY ── */}
      {showFullCase && (
        <Page size="A4" style={styles.page}>
          <SectionHeader number={1} title="Case Summary" />

          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>STATUS</Text>
              <Text style={styles.summaryCardValue}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>INTERACTIONS</Text>
              <Text style={styles.summaryCardValue}>{totalInteractions}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>DAYS OPEN</Text>
              <Text style={styles.summaryCardValue}>{daysOpen}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>AMOUNT IN DISPUTE</Text>
              <Text style={styles.summaryCardValue}>
                {amountInDispute ? `£${amountInDispute.toFixed(2)}` : "Not specified"}
              </Text>
            </View>
          </View>

          {description && (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionLabel}>WHAT HAPPENED</Text>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>
          )}

          {desiredOutcome && (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionLabel}>DESIRED OUTCOME</Text>
              <Text style={styles.descriptionText}>{desiredOutcome}</Text>
            </View>
          )}

          <Footer caseTitle={caseTitle} generatedAt={generatedAt} />
        </Page>
      )}

      {/* ── SECTION 2: TIMELINE ── */}
      {showTimeline && interactions.length > 0 && (
        <Page size="A4" style={styles.page}>
          <SectionHeader number={showFullCase ? 2 : 1} title={`Chronological Timeline (${interactions.length} interactions)`} />

          {interactions.map((interaction) => (
            <View
              key={interaction.id}
              style={styles.timelineEntry}
              wrap={false}
            >
              <View style={styles.timelineHeader}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineMeta}>
                  <Text style={styles.timelineDate}>{interaction.date}</Text>
                  <Text style={styles.timelineChannel}>
                    {CHANNEL_LABELS[interaction.channel] ?? interaction.channel}
                    {" · "}
                    {interaction.direction === "outbound" ? "You contacted them" : "They contacted you"}
                    {interaction.contactName ? ` · ${interaction.contactName}` : ""}
                    {interaction.contactDepartment ? `, ${interaction.contactDepartment}` : ""}
                    {interaction.referenceNumber ? ` · Ref: ${interaction.referenceNumber}` : ""}
                    {interaction.durationMinutes ? ` · ${interaction.durationMinutes} min` : ""}
                  </Text>
                </View>
              </View>

              <View style={styles.timelineBody}>
                <Text style={styles.timelineSummary}>{interaction.summary}</Text>

                {interaction.promisesMade && (
                  <View
                    style={[
                      styles.promiseBadge,
                      interaction.promiseFulfilled === false
                        ? styles.promiseBadgeBroken
                        : interaction.promiseFulfilled === true
                          ? styles.promiseBadgeKept
                          : {},
                    ]}
                  >
                    <Text
                      style={[
                        styles.promiseText,
                        interaction.promiseFulfilled === false
                          ? styles.promiseTextBroken
                          : interaction.promiseFulfilled === true
                            ? styles.promiseTextKept
                            : {},
                      ]}
                    >
                      {interaction.promiseFulfilled === true
                        ? "PROMISE KEPT: "
                        : interaction.promiseFulfilled === false
                          ? "PROMISE BROKEN: "
                          : "PROMISE MADE: "}
                      {interaction.promisesMade}
                      {interaction.promiseDeadline
                        ? ` (by ${interaction.promiseDeadline})`
                        : ""}
                    </Text>
                  </View>
                )}

                {interaction.outcome && (
                  <View style={styles.outcomeBadge}>
                    <Text style={styles.outcomeBadgeText}>
                      {OUTCOME_LABELS[interaction.outcome] ?? interaction.outcome}
                    </Text>
                  </View>
                )}

                {interaction.nextSteps && (
                  <Text style={{ fontSize: 9, color: MUTED, marginTop: 4 }}>
                    Next steps: {interaction.nextSteps}
                  </Text>
                )}
              </View>
            </View>
          ))}

          <Footer caseTitle={caseTitle} generatedAt={generatedAt} />
        </Page>
      )}

      {/* ── SECTION 3: PROMISES ── */}
      {showFullCase && promises.length > 0 && (
        <Page size="A4" style={styles.page}>
          <SectionHeader number={3} title={`Promises & Commitments (${promises.length})`} />

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
            <Text style={[styles.tableHeaderCell, styles.colWho]}>Contact</Text>
            <Text style={[styles.tableHeaderCell, styles.colWhat]}>What Was Promised</Text>
            <Text style={[styles.tableHeaderCell, styles.colDeadline]}>Deadline</Text>
            <Text style={[styles.tableHeaderCell, styles.colStatus]}>Status</Text>
          </View>

          {promises.map((promise, pIdx) => (
            <View
              key={pIdx}
              style={[styles.tableRow, pIdx % 2 !== 0 ? styles.tableRowAlt : {}]}
              wrap={false}
            >
              <Text style={[styles.tableCell, styles.colDate]}>{promise.date}</Text>
              <Text style={[styles.tableCell, styles.colWho]}>
                {promise.contactName ?? "Unknown"}
              </Text>
              <Text style={[styles.tableCell, styles.colWhat]}>{promise.promisesMade}</Text>
              <Text style={[styles.tableCell, styles.colDeadline]}>
                {promise.deadline ?? "—"}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.colStatus,
                  {
                    color:
                      promise.fulfilled === true
                        ? "#166534"
                        : promise.fulfilled === false
                          ? "#991b1b"
                          : "#92400e",
                    fontFamily: "Helvetica-Bold",
                  },
                ]}
              >
                {promise.fulfilled === true
                  ? "Kept"
                  : promise.fulfilled === false
                    ? "BROKEN"
                    : "Pending"}
              </Text>
            </View>
          ))}

          <Footer caseTitle={caseTitle} generatedAt={generatedAt} />
        </Page>
      )}

      {/* ── SECTION 4: ESCALATION ── */}
      {showFullCase && escalationStages.length > 0 && (
        <Page size="A4" style={styles.page}>
          <SectionHeader number={4} title="Escalation History" />

          {escalationStages.map((stage) => (
            <View
              key={stage.stageOrder}
              style={[
                styles.escalationStage,
                stage.completed ? styles.escalationStagePast : {},
              ]}
              wrap={false}
            >
              <View style={styles.escalationStageText}>
                <Text style={styles.escalationStageName}>
                  Stage {stage.stageOrder}: {stage.title}
                  {stage.completed ? " ✓" : ""}
                </Text>
                <Text style={styles.escalationStageDesc}>{stage.description}</Text>
              </View>
            </View>
          ))}

          <Footer caseTitle={caseTitle} generatedAt={generatedAt} />
        </Page>
      )}

      {/* ── SECTION 5: EVIDENCE INDEX ── */}
      {showFullCase && evidence.length > 0 && (
        <Page size="A4" style={styles.page}>
          <SectionHeader number={5} title={`Evidence Index (${evidence.length} files)`} />

          <Text
            style={{ fontSize: 9, color: MUTED, marginBottom: 10 }}
          >
            Note: Original evidence files are stored securely and available upon request.
            This index lists all files logged in this case.
          </Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.evidenceFilename]}>Filename</Text>
            <Text style={[styles.tableHeaderCell, styles.evidenceType]}>Type</Text>
            <Text style={[styles.tableHeaderCell, styles.evidenceDate]}>Added</Text>
            <Text style={[styles.tableHeaderCell, styles.evidenceDesc]}>Description</Text>
          </View>

          {evidence.map((item, i) => (
            <View
              key={item.id}
              style={[
                styles.evidenceRow,
                i % 2 !== 0 ? styles.evidenceRowAlt : {},
              ]}
              wrap={false}
            >
              <Text style={styles.evidenceFilename}>{item.fileName}</Text>
              <Text style={styles.evidenceType}>
                {(item.evidenceType ?? item.fileType.split("/")[1] ?? "file").replace(/_/g, " ")}
              </Text>
              <Text style={styles.evidenceDate}>{item.createdAt ?? "—"}</Text>
              <Text style={styles.evidenceDesc}>{item.description ?? "—"}</Text>
            </View>
          ))}

          <Footer caseTitle={caseTitle} generatedAt={generatedAt} />
        </Page>
      )}

      {/* ── SECTION 6: CORRESPONDENCE ── */}
      {showLetters && letters.length > 0 && (
        <Page size="A4" style={styles.page}>
          <SectionHeader
            number={showFullCase ? 6 : showTimeline ? 2 : 1}
            title={`Correspondence (${letters.length} letters)`}
          />

          {letters.map((letter) => (
            <View key={letter.id} style={styles.letterItem} wrap={false}>
              <View style={styles.letterMeta}>
                <View>
                  <Text style={styles.letterTitle}>{letter.subject}</Text>
                  <Text style={{ fontSize: 8, color: MUTED }}>
                    {LETTER_TYPE_LABELS[letter.letterType] ?? letter.letterType}
                    {letter.aiGenerated ? " · AI drafted" : ""}
                    {letter.sentDate ? ` · Sent: ${letter.sentDate}` : ""}
                  </Text>
                </View>
                <Text style={styles.letterStatus}>
                  {letter.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.letterBody}>{letter.body}</Text>
            </View>
          ))}

          <Footer caseTitle={caseTitle} generatedAt={generatedAt} />
        </Page>
      )}
    </Document>
  );
}
