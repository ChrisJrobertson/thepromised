import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Letter } from "@/types/database";

export const metadata = { title: "Letters — TheyPromised" };

const STATUS_COLOURS: Record<string, string> = {
  draft: "border-muted bg-muted/50 text-muted-foreground",
  sent: "border-blue-200 bg-blue-50 text-blue-700",
  acknowledged: "border-green-200 bg-green-50 text-green-700",
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

export default async function LettersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: caseData } = await supabase
    .from("cases")
    .select("id, title, custom_organisation_name, organisation_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!caseData) notFound();

  const { data: letters } = await supabase
    .from("letters")
    .select("*")
    .eq("case_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <Link
            className="text-sm text-muted-foreground hover:text-foreground"
            href={`/cases/${id}`}
          >
            ← Back to case
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">Letters</h1>
          <p className="text-sm text-muted-foreground">{caseData.title}</p>
        </div>
        <Link
          className={buttonVariants({ size: "sm" })}
          href={`/cases/${id}/letters/new`}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Letter
        </Link>
      </div>

      {letters && letters.length > 0 ? (
        <div className="space-y-3">
          {(letters as Letter[]).map((letter) => (
            <Link
              href={`/cases/${id}/letters/${letter.id}`}
              key={letter.id}
            >
              <Card className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <p className="font-medium text-sm">{letter.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {LETTER_TYPE_LABELS[letter.letter_type] ?? letter.letter_type}
                          {letter.ai_generated ? " · AI drafted" : ""}
                          {letter.recipient_name
                            ? ` · To: ${letter.recipient_name}`
                            : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {letter.created_at
                            ? format(new Date(letter.created_at), "d MMM yyyy", {
                                locale: enGB,
                              })
                            : ""}
                          {letter.sent_date
                            ? ` · Sent ${format(new Date(letter.sent_date), "d MMM yyyy", { locale: enGB })}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={STATUS_COLOURS[letter.status] ?? ""}
                      variant="outline"
                    >
                      {letter.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium">No letters yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a professional complaint letter in seconds with AI.
          </p>
          <Link
            className={`mt-4 ${buttonVariants({ size: "sm" })}`}
            href={`/cases/${id}/letters/new`}
          >
            Generate your first letter
          </Link>
        </div>
      )}
    </div>
  );
}
