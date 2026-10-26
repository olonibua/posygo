"use client";

import { ADJUSTMENT_STATUSES, type AdjustmentStatus, type AdjustmentView, hasPermission } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { NotebookNote } from "@/components/ui/surfaces";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDateTime, formatMoney } from "@/lib/format";

import { DecisionForm } from "./decision-form";
import { ADJUSTMENT_STATUS_DISPLAY } from "./finance-display";
import { FinanceTabs } from "./finance-tabs";
import { useAdjustments, useDecideAdjustment } from "./use-finance";

const LOCALE = "en-GB";

export function AdjustmentsPage() {
  const user = useCurrentUser();
  const canDecide = hasPermission(user.role, "finance.approve");
  const [status, setStatus] = useState<AdjustmentStatus>("PENDING_APPROVAL");
  const adjustments = useAdjustments(status);
  const decide = useDecideAdjustment();
  const [open, setOpen] = useState<AdjustmentView | null>(null);

  const columns: Column<AdjustmentView>[] = [
    { key: "when", header: "Asked", render: (row) => <span className="whitespace-nowrap text-ink-soft">{formatDateTime(row.createdAt, LOCALE)}</span> },
    { key: "vendor", header: "Vendor", render: (row) => <span className="font-medium">{row.businessName}</span> },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (row) => (
        <span className={row.direction === "CREDIT" ? "text-success" : undefined}>
          {row.direction === "CREDIT" ? "+" : "−"}
          {formatMoney(row.amountMinor, row.currency, LOCALE)}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (row) => (
        <span>
          <span className="block">{row.reason}</span>
          <span className="text-meta text-ink-faint">
            {row.requestedByEmail}
            {row.reference ? ` · ${row.reference}` : ""}
            {row.decidedByEmail ? ` · decided by ${row.decidedByEmail}` : ""}
          </span>
        </span>
      ),
    },
    { key: "status", header: "Status", render: (row) => <StatusPill tone={ADJUSTMENT_STATUS_DISPLAY[row.status].tone}>{ADJUSTMENT_STATUS_DISPLAY[row.status].label}</StatusPill> },
    {
      key: "action",
      header: "",
      align: "right",
      render: (row) =>
        canDecide && row.status === "PENDING_APPROVAL" && row.requestedByEmail !== user.email ? (
          <Button variant="ghost" onClick={() => setOpen(row)}>
            Review
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Finance" title="Adjustments" lead="Manual credits and charges. Anything above the market's limit needs a second person, and nobody approves their own." />
      <FinanceTabs current="adjustments" />
      <FilterTabs label="Filter by status" value={status} onChange={setStatus} options={ADJUSTMENT_STATUSES.map((value) => ({ value, label: ADJUSTMENT_STATUS_DISPLAY[value].label }))} />
      {open ? (
        <NotebookNote tone="yellow" tilt="none" className="max-w-[720px]">
          <p className="text-[20px] font-medium tracking-[-0.4px]">
            {open.direction === "CREDIT" ? "Credit" : "Charge"} {formatMoney(open.amountMinor, open.currency, LOCALE)} for {open.businessName}
          </p>
          <p className="mb-4 mt-1 text-small">{open.reason}</p>
          <DecisionForm minNote={5} busy={decide.isPending} error={decide.error} onDecide={(approve, note) => decide.mutate({ id: open.id, approve, note }, { onSuccess: () => setOpen(null) })} />
          <Button variant="ghost" className="mt-2" onClick={() => setOpen(null)}>
            Close
          </Button>
        </NotebookNote>
      ) : null}
      <DataTable
        caption="Adjustments"
        columns={columns}
        rows={adjustments.data ?? []}
        rowKey={(row) => row.id}
        loading={adjustments.isLoading}
        empty={<EmptyState title="Nothing here" body="Adjustments appear as soon as someone asks for one." />}
      />
    </div>
  );
}
