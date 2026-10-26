"use client";

import { hasPermission, type MysteryOrderView } from "@/shared";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { FormAlert, Input } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { formError } from "@/features/receiving/api-errors";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDateTime } from "@/lib/format";

import { MYSTERY_OUTCOME_DISPLAY } from "../partner-display";
import { useAdminPartnerMutation, useMysteryOrders } from "../use-partners";

export function MysteryOrdersPage() {
  const user = useCurrentUser();
  const orders = useMysteryOrders();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const assess = useAdminPartnerMutation<{ orderId: string; passed: boolean }, MysteryOrderView>(
    (input) => ({ path: `/v1/admin/mystery-orders/${input.orderId}/assessment`, body: { passed: input.passed, note: notes[input.orderId] ?? "" } }),
    (input) => (input.passed ? "Recorded as passed" : "Recorded as failed"),
  );
  const canAssess = hasPermission(user.role, "partners.review");

  const columns: Column<MysteryOrderView>[] = [
    {
      key: "partner",
      header: "Partner",
      render: (row) => (
        <Link href={`/admin/partners/${row.partnerId}`} className="font-medium text-ink">
          {row.legalName}
        </Link>
      ),
    },
    {
      key: "order",
      header: "Order",
      render: (row) => (
        <Link href={`/admin/orders/${row.orderId}`} className="font-mono text-small text-ink">
          {row.reference}
          <span className="block font-sans text-meta text-ink-faint">{row.handedOffAt ? `Sent ${formatDateTime(row.handedOffAt, "en-GB")}` : "Not sent yet"}</span>
        </Link>
      ),
    },
    {
      key: "outcome",
      header: "Result",
      render: (row) => (
        <span>
          <StatusPill tone={MYSTERY_OUTCOME_DISPLAY[row.outcome].tone}>{MYSTERY_OUTCOME_DISPLAY[row.outcome].label}</StatusPill>
          {row.outcomeNote ? <span className="mt-1 block text-meta text-ink-faint">{row.outcomeNote}</span> : null}
        </span>
      ),
    },
    {
      key: "assess",
      header: "",
      align: "right",
      render: (row) =>
        canAssess && row.outcome === "PENDING" && row.handedOffAt ? (
          <div className="flex items-center justify-end gap-2">
            <Input
              aria-label={`What arrived for ${row.reference}`}
              placeholder="What arrived"
              className="h-10 w-48"
              value={notes[row.orderId] ?? ""}
              onChange={(event) => setNotes((current) => ({ ...current, [row.orderId]: event.target.value }))}
            />
            <Button variant="ghost" disabled={assess.isPending} onClick={() => assess.mutate({ orderId: row.orderId, passed: false })}>
              Failed
            </Button>
            <Button variant="lime" loading={assess.isPending && assess.variables?.orderId === row.orderId} onClick={() => assess.mutate({ orderId: row.orderId, passed: true })}>
              Passed
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Network"
        title="Test orders"
        lead="Orders placed from each country's test vendor to an address we control. Partners can't tell them apart. Record what arrived to feed the partner's scorecard."
      />
      <FormAlert message={formError(assess.error)} />
      <DataTable
        caption="Test orders"
        columns={columns}
        rows={orders.data ?? []}
        rowKey={(row) => row.orderId}
        loading={orders.isLoading}
        empty={<EmptyState title="No test orders yet" body="Place one from an approved partner's page." />}
      />
    </div>
  );
}
