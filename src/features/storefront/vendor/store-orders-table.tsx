"use client";

import type { StorefrontOrderView } from "@/shared";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/navigation-controls";
import { formatDate, formatMoney } from "@/lib/format";

import { ORDER_STATUS_DISPLAY, PAYOUT_STATUS_DISPLAY } from "../storefront-display";

interface StoreOrdersTableProps {
  orders: StorefrontOrderView[];
  loading: boolean;
  locale: string;
  audience: "VENDOR" | "STAFF";
  selectedId?: string | null;
  onOpen?: (orderId: string) => void;
}

export function StoreOrdersTable({ orders, loading, locale, audience, selectedId, onOpen }: StoreOrdersTableProps) {
  const money = (row: StorefrontOrderView, amount: number) => formatMoney(amount, row.currency, locale);
  const columns: Column<StorefrontOrderView>[] = [
    {
      key: "order",
      header: "Order",
      render: (row) => (
        <span>
          <span className="block font-mono text-small font-medium">{row.reference}</span>
          <span className="text-meta text-ink-faint">
            {audience === "STAFF" ? `${row.storeName} · ` : ""}
            {row.buyerName}, {row.recipientCity}
          </span>
        </span>
      ),
    },
    { key: "when", header: "Placed", render: (row) => <span className="text-ink-soft">{formatDate(row.createdAt, locale)}</span> },
    { key: "items", header: "Items", align: "right", render: (row) => <span className="tabular-nums">{row.lines.reduce((total, line) => total + line.quantity, 0)}</span> },
    {
      key: "money",
      header: audience === "VENDOR" ? "Your share" : "Total",
      align: "right",
      render: (row) => <span className="tabular-nums">{money(row, audience === "VENDOR" ? (row.vendorShareMinor ?? 0) : row.totalMinor)}</span>,
    },
    { key: "status", header: "Order", render: (row) => <StatusPill tone={ORDER_STATUS_DISPLAY[row.status].tone}>{ORDER_STATUS_DISPLAY[row.status].label}</StatusPill> },
    {
      key: "payout",
      header: "Payout",
      render: (row) => (row.payoutStatus ? <StatusPill tone={PAYOUT_STATUS_DISPLAY[row.payoutStatus].tone}>{PAYOUT_STATUS_DISPLAY[row.payoutStatus].label}</StatusPill> : null),
    },
  ];
  if (onOpen) {
    columns.push({
      key: "open",
      header: "",
      align: "right",
      render: (row) => (
        <Button variant={row.id === selectedId ? "yellow" : "ghost"} onClick={() => onOpen(row.id)}>
          Open
        </Button>
      ),
    });
  }
  return (
    <DataTable
      caption="Store orders"
      columns={columns}
      rows={orders}
      rowKey={(row) => row.id}
      loading={loading}
      empty={<EmptyState title="No store orders yet" body="When buyers pay on your store, their orders appear here and go straight to the warehouse." />}
    />
  );
}
