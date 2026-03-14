import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { FileText, PlusCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Letters — TheyPromised" };

const LETTER_STATUS_FILTERS = ["all", "draft", "sent", "acknowledged"] as const;
type LetterStatusFilter = (typeof LETTER_STATUS_FILTERS)[number];

const LETTER_TYPE_LABELS: Record<string, string> = {
  initial_complaint: "Initial Complaint",
  follow_up: "Follow-up",
  escalation: "Escalation",
  final_response_request: "Final Response Request",
  ombudsman_referral: "Ombudsman Referral",
  subject_access_request: "Subject Access Request",
  formal_notice: "Formal Notice",
  custom: "Custom",
};

const STATUS_COLOURS: Record<string, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-600",
  sent: "border-blue-200 bg-blue-50 text-blue-700",
  acknowledged: "border-green-200 bg-green-50 text-green-700",
};

export default async function LettersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const requestedStatus = params.status;
  const statusFilter: LetterStatusFilter = LETTER_STATUS_FILTERS.includes(
    requestedStatus as LetterStatusFilter
  )
    ? (requestedStatus as LetterStatusFilter)
    : "all";

  let query = supabase
    .from("letters")
    .select(
      `
      id, letter_type, recipient_name, subject, status, sent_date, created_at, updated_at, ai_generated,
      case_id,
      cases!inner(id, title, organisation_id, custom_organisation_name,
        organisations(name))
    `
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: letters } = await query;

  type LetterRow = {
    id: string;
    letter_type: string;
    recipient_name: string | null;
    subject: string;
    status: "draft" | "sent" | "acknowledged";
    sent_date: string | null;
    created_at: string | null;
    updated_at: string | null;
    ai_generated: boolean | null;
    case_id: string;
    cases: {
      id: string;
      title: string;
      organisation_id: string | null;
      custom_organisation_name: string | null;
      organisations: { name: string } | null;
    };
  };

  const typedLetters = (letters ?? []) as unknown as LetterRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Letters</h1>
          <p className="text-sm text-muted-foreground">
            {typedLetters.length} letter{typedLetters.length !== 1 ? "s" : ""}
            {statusFilter !== "all" ? ` · ${statusFilter}` : ""}
          </p>
        </div>
        <Link className={buttonVariants()} href="/cases">
          <PlusCircle className="mr-2 h-4 w-4" />
          Draft New Letter
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2">
        {LETTER_STATUS_FILTERS.map((s) => (
          <Link
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s
                ? "border-primary bg-primary/5 text-primary"
                : "border-muted text-muted-foreground hover:border-muted-foreground"
            }`}
            href={s === "all" ? "/letters" : `/letters?status=${s}`}
            key={s}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      {typedLetters.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              No letters yet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Open a case and use the AI letter drafter to generate a formal complaint, follow-up, or escalation letter.
            </p>
            <Link className={buttonVariants()} href="/cases">
              Go to Cases
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Case</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typedLetters.map((letter) => {
                const orgName =
                  letter.cases.organisations?.name ??
                  letter.cases.custom_organisation_name ??
                  letter.cases.title;
                const destination = `/cases/${letter.case_id}/letters`;
                const recipient = letter.recipient_name ?? orgName;

                return (
                  <TableRow
                    className="cursor-pointer"
                    key={letter.id}
                  >
                    <TableCell className="text-sm text-muted-foreground">
                      <Link className="block w-full" href={destination}>
                        {letter.updated_at
                          ? format(new Date(letter.updated_at), "dd/MM/yyyy", { locale: enGB })
                          : "—"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link className="block w-full" href={destination}>
                        <p className="text-sm font-medium">{orgName}</p>
                        <p className="text-xs text-muted-foreground">{letter.cases.title}</p>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      <Link className="block w-full" href={destination}>
                        {LETTER_TYPE_LABELS[letter.letter_type] ?? letter.letter_type}
                        {letter.ai_generated && (
                          <span className="ml-1 text-xs text-muted-foreground">· AI</span>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <Link className="block w-full" href={destination}>
                        <p className="truncate text-sm">{recipient}</p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link className="block w-full" href={destination}>
                        <Badge
                          className={STATUS_COLOURS[letter.status] ?? ""}
                          variant="outline"
                        >
                          {letter.status.charAt(0).toUpperCase() + letter.status.slice(1)}
                        </Badge>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
