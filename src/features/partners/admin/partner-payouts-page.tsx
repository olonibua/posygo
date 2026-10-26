"use client";

import type { PartnerPayoutView } from "@/shared";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { FormAlert, Input } from "@/components/ui/form-controls";
import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { formError } from "@/features/receiving/api-errors";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDateTime, formatMoney } from "@/lib/format";

import { PAYOUT_STATUS_DISPLAY } from "../partner-display";
import { useAdminPartnerMutation, usePartnerPayouts } from "../use-partners";

type Filter = PartnerPayoutView["status"];

const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: "PENDING_APPROVAL", label: "Waiting" },
  { value: "PROCESSING", label: "Sending" },
  { value: "FAILED", label: "Failed" },
  { value: "PAID", label: "Paid" },
  { value: "REJECTED", label: "Rejected" },
];

export function PartnerPayoutsPage() {
  const user = useCurrentUser();
  const [filter, setFilter] = useState<Filter>("PENDING_APPROVAL");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const payouts = usePartnerPayouts(filter);
  const retry = useAdminPartnerMutation<string, PartnerPayoutView>((id) => ({ path: `/v1/admin/partner-payouts/${id}/retry` }), "Payout sent again");
  const decide = useAdminPartnerMutation<{ id: string; approve: boolean }, PartnerPayoutView>(
    (input) => ({ path: `/v1/admin/partner-payouts/${input.id}/decision`, body: { approve: input.approve, note: notes[input.id] ?? "" } }),
    (input) => (input.approve ? "Payout approved and sent" : "Payout rejected"),
  );

  const columns: Column<PartnerPayoutView>[] = [
    {
      key: "partner",
      header: "Partner",
      render: (row) => (
        <Link href={`/admin/partners/${row.partnerId}`} className="font-medium text-ink">
          {row.legalName}
        </Link>
      ),
    },
    { key: "amount", header: "Amount", align: "right", render: (row) => <span className="font-medium tabular-nums">{formatMoney(row.amountMinor, row.currency, "en-GB")}</span> },
    {
      key: "who",
      header: "Requested",
      render: (row) => (
        <span className="text-small">
          {row.requestedByEmail}
          <span className="block text-meta text-ink-faint">
            {formatDateTime(row.createdAt, "en-GB")} · {row.note}
          </span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span>
          <StatusPill tone={PAYOUT_STATUS_DISPLAY[row.status].tone}>{PAYOUT_STATUS_DISPLAY[row.status].label}</StatusPill>
          {row.decidedByEmail ? <span className="mt-1 block text-meta text-ink-faint">by {row.decidedByEmail}</span> : null}
          {row.failureReason ? <span className="mt-1 block text-meta text-danger">{row.failureReason}</span> : null}
        </span>
      ),
    },
    {
      key: "decide",
      header: "",
      align: "right",
      render: (row) =>
        row.status === "PROCESSING" ? (
          <Button variant="ghost" loading={retry.isPending && retry.variables === row.id} onClick={() => retry.mutate(row.id)}>
            Send again
          </Button>
        ) : row.status !== "PENDING_APPROVAL" ? null : row.requestedByEmail === user.email ? (
          <span className="text-meta text-ink-faint">Another person approves</span>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <Input
              aria-label={`Note for ${row.legalName}`}
              placeholder="Note"
              className="h-10 w-40"
              value={notes[row.id] ?? ""}
              onChange={(event) => setNotes((current) => ({ ...current, [row.id]: event.target.value }))}
            />
            <Button variant="ghost" disabled={decide.isPending} onClick={() => decide.mutate({ id: row.id, approve: false })}>
              Reject
            </Button>
            <Button variant="lime" loading={decide.isPending && decide.variables?.id === row.id} onClick={() => decide.mutate({ id: row.id, approve: true })}>
              Approve
            </Button>
          </div>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Network"
        title="Partner payouts"
        lead="Payouts are requested from a partner's page and approved here by someone else in finance. Approval sends the money through our payment provider, and is refused if the partner's bank details changed after the request."
      />
      <FilterTabs label="Filter payouts" options={FILTERS} value={filter} onChange={setFilter} />
      <FormAlert message={formError(decide.error) ?? formError(retry.error)} />
      <DataTable
        caption="Payouts"
        columns={columns}
        rows={payouts.data ?? []}
        rowKey={(row) => row.id}
        loading={payouts.isLoading}
        empty={<EmptyState title="Nothing here" body="Payout requests appear here for a second person to approve." />}
      />
    </div>
  );
}
