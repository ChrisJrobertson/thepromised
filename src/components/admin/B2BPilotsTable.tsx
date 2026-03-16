"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const B2B_STATUSES = [
  "enquiry",
  "contacted",
  "pilot_started",
  "active",
  "churned",
] as const;

type B2BStatus = (typeof B2B_STATUSES)[number];

export type B2BTableRow = {
  key: string;
  enquiryId: string | null;
  pilotId: string | null;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactRole: string | null;
  status: B2BStatus;
  monthlyFee: number | null;
  startedAt: string | null;
  createdAt: string | null;
};

type B2BPilotsTableProps = {
  initialRows: B2BTableRow[];
};

function formatPence(amount: number | null) {
  if (amount === null) return "—";
  return `£${(amount / 100).toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}/month`;
}

function getSlaLabel(row: B2BTableRow) {
  const createdAt = row.createdAt ? new Date(row.createdAt) : null;
  if (!createdAt || Number.isNaN(createdAt.getTime())) return "—";
  const hoursOpen = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

  if (row.status === "enquiry" && hoursOpen > 48) return "Contact overdue";
  if (row.status === "contacted" && hoursOpen > 24 * 7) return "Pilot follow-up due";
  if (row.status === "pilot_started" && hoursOpen > 24 * 30) return "Review pilot progress";
  return "On track";
}

export function B2BPilotsTable({ initialRows }: B2BPilotsTableProps) {
  const [rows, setRows] = useState(initialRows);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const aDate = a.startedAt ? new Date(a.startedAt).getTime() : 0;
        const bDate = b.startedAt ? new Date(b.startedAt).getTime() : 0;
        return bDate - aDate;
      }),
    [rows],
  );

  async function handleStatusChange(row: B2BTableRow, nextStatus: B2BStatus) {
    setSavingKey(row.key);
    try {
      const response = await fetch("/api/admin/b2b", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pilotId: row.pilotId ?? undefined,
          enquiryId: row.enquiryId ?? undefined,
          status: nextStatus,
          monthlyFee: row.monthlyFee ?? 50000,
          enquiry: row.pilotId
            ? undefined
            : {
                companyName: row.companyName,
                contactName: row.contactName,
                contactEmail: row.contactEmail,
                contactRole: row.contactRole,
              },
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        row?: {
          id: string;
          status: string;
          monthly_fee: number;
          started_at: string | null;
        };
      };

      if (!response.ok || !data.row) {
        toast.error(data.error ?? "Could not update B2B status");
        return;
      }

      setRows((prev) =>
        prev.map((item) =>
          item.key === row.key
            ? {
                ...item,
                pilotId: data.row?.id ?? item.pilotId,
                status: nextStatus,
                monthlyFee: data.row?.monthly_fee ?? item.monthlyFee,
                startedAt: data.row?.started_at ?? item.startedAt,
              }
            : item,
        ),
      );
      toast.success("B2B status updated");
    } catch {
      toast.error("Could not update B2B status");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
          <tr>
            <th className="px-3 py-2">Company</th>
            <th className="px-3 py-2">Contact</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Monthly Fee</th>
            <th className="px-3 py-2">Started</th>
            <th className="px-3 py-2">SLA</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr className="border-t" key={row.key}>
              <td className="px-3 py-2 font-medium">{row.companyName}</td>
              <td className="px-3 py-2">
                {row.contactName}
                {row.contactRole ? (
                  <span className="block text-xs text-slate-500">{row.contactRole}</span>
                ) : null}
              </td>
              <td className="px-3 py-2">{row.contactEmail}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-md border px-2 py-1 text-xs"
                    disabled={savingKey === row.key}
                    onChange={(e) =>
                      handleStatusChange(row, e.target.value as B2BStatus)
                    }
                    value={row.status}
                  >
                    {B2B_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  {savingKey === row.key ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
                  ) : null}
                </div>
              </td>
              <td className="px-3 py-2">{formatPence(row.monthlyFee)}</td>
              <td className="px-3 py-2">
                {row.startedAt
                  ? new Date(row.startedAt).toLocaleDateString("en-GB")
                  : "—"}
              </td>
              <td className="px-3 py-2 text-xs">
                <span
                  className={`rounded px-2 py-0.5 ${
                    getSlaLabel(row) === "On track"
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {getSlaLabel(row)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
