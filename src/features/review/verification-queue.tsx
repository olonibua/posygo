"use client";

import { VERIFICATION_STATUSES, type VerificationStatus } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { EmptyState, FilterTabs, OpenLink } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { countryName, VERIFICATION_STATUS_DISPLAY } from "@/features/onboarding/display";
import { apiRequest } from "@/lib/api/client";
import { formatDate } from "@/lib/format";

export interface QueueEntry {
  vendorId: string;
  businessName: string;
  countryCode: string;
  status: VerificationStatus;
  submittedAt: string | null;
}

const FILTERS: readonly VerificationStatus[] = ["SUBMITTED", "RESUBMISSION_REQUIRED", "APPROVED", "REJECTED"];

export function VerificationQueue() {
  const [status, setStatus] = useState<VerificationStatus>("SUBMITTED");
  const queue = useQuery({ queryKey: ["admin", "verifications", status], queryFn: () => apiRequest<QueueEntry[]>(`/v1/admin/verifications?status=${status}`) });
  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Compliance" title="Business verifications" lead="Oldest first. Opening a document or an ID number is written to the audit log." />
      <FilterTabs
        label="Filter by status"
        value={status}
        onChange={setStatus}
        options={FILTERS.filter((value) => VERIFICATION_STATUSES.includes(value)).map((value) => ({ value, label: VERIFICATION_STATUS_DISPLAY[value].label }))}
      />
      <DataTable
        caption="Verification queue"
        columns={COLUMNS}
        rows={queue.data ?? []}
        rowKey={(row) => row.vendorId}
        loading={queue.isLoading}
        empty={<EmptyState title="Nothing waiting" body="New submissions appear here as soon as vendors send them." />}
      />
    </div>
  );
}

const COLUMNS: readonly Column<QueueEntry>[] = [
  { key: "business", header: "Business", render: (row) => row.businessName },
  { key: "country", header: "Market", render: (row) => countryName(row.countryCode) },
  { key: "status", header: "Status", render: (row) => <StatusPill tone={VERIFICATION_STATUS_DISPLAY[row.status].tone}>{VERIFICATION_STATUS_DISPLAY[row.status].label}</StatusPill> },
  { key: "submitted", header: "Submitted", render: (row) => <span className="text-ink-soft">{row.submittedAt ? formatDate(row.submittedAt, "en-GB") : "—"}</span> },
  { key: "open", header: "Action", align: "right", render: (row) => <OpenLink href={`/admin/verifications/${row.vendorId}`} /> },
];
