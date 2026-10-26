"use client";

import type { LedgerEntryView } from "@/shared";

import { type Column, DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/navigation-controls";
import { cn } from "@/lib/cn";
import { formatDateTime, formatMoney } from "@/lib/format";

import { LEDGER_TYPE_LABELS } from "./finance-display";

export function LedgerTable({ entries, currency, locale, loading }: { entries: readonly LedgerEntryView[]; currency: string; locale: string; loading?: boolean }) {
  const columns: Column<LedgerEntryView>[] = [
    { key: "when", header: "When", render: (entry) => <span className="whitespace-nowrap text-ink-soft">{formatDateTime(entry.createdAt, locale)}</span> },
    {
      key: "what",
      header: "What",
      render: (entry) => (
        <span>
          <span className="block font-medium">{LEDGER_TYPE_LABELS[entry.type]}</span>
          <span className="text-meta text-ink-faint">{entry.description}</span>
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (entry) => (
        <span className={cn("tabular-nums font-medium", entry.amountMinor > 0 ? "text-success" : "text-ink")}>
          {entry.amountMinor > 0 ? "+" : "−"}
          {formatMoney(Math.abs(entry.amountMinor), currency, locale)}
        </span>
      ),
    },
    { key: "balance", header: "Balance", align: "right", render: (entry) => <span className="tabular-nums">{formatMoney(entry.balanceAfterMinor, currency, locale)}</span> },
  ];
  return (
    <DataTable
      caption="Wallet activity"
      columns={columns}
      rows={entries}
      rowKey={(entry) => entry.id}
      loading={loading}
      empty={<EmptyState title="Nothing yet" body="Top-ups and charges appear here the moment they happen." />}
    />
  );
}
