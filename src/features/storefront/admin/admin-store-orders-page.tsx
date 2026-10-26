"use client";

import { hasPermission, type StorefrontOrderStatus, type StorefrontOrderView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { toMajorText, toMinor } from "@/features/finance/money-input";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDateTime, formatMoney, localeFor } from "@/lib/format";

import { DELIVERY_LABEL, ORDER_STATUS_DISPLAY, PAYOUT_STATUS_DISPLAY } from "../storefront-display";
import { useAdminStoreOrder, useAdminStoreOrders, useRefundStoreOrder, useRetryPayout } from "../use-storefront";
import { StoreOrdersTable } from "../vendor/store-orders-table";

type Filter = StorefrontOrderStatus | "ALL";

const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "AWAITING_VENDOR_FUNDS", label: "Waiting on vendor" },
  { value: "FULFILLING", label: "Being packed" },
  { value: "SHIPPED", label: "On its way" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "REFUNDED", label: "Refunded" },
];

const REFUNDABLE: readonly StorefrontOrderStatus[] = ["PAID", "AWAITING_VENDOR_FUNDS", "FULFILLING", "SHIPPED", "DELIVERED"];

function RefundForm({ order, locale }: { order: StorefrontOrderView; locale: string }) {
  const left = order.totalMinor - order.refundedMinor;
  const [amount, setAmount] = useState(toMajorText(left, order.currency));
  const [note, setNote] = useState("");
  const refund = useRefundStoreOrder(order.id);
  const amountMinor = toMinor(amount, order.currency);
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4">
      <p className="text-small font-medium">Refund the buyer</p>
      <FormAlert message={formError(refund.error)} />
      <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
        <Field label="Amount" hint={`Up to ${formatMoney(left, order.currency, locale)}`} error={fieldError(refund.error, "amountMinor")}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} inputMode="decimal" aria-describedby={describedBy} aria-invalid={invalid} value={amount} onChange={(event) => setAmount(event.target.value)} />
          )}
        </Field>
        <Field label="Reason" hint="The buyer sees this in their refund email." error={fieldError(refund.error, "note")}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[72px]" maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} />
          )}
        </Field>
      </div>
      <div className="flex justify-end">
        <Button
          variant="yellow"
          loading={refund.isPending}
          disabled={!amountMinor || amountMinor > left || note.trim().length < 5}
          onClick={() => amountMinor && refund.mutate({ amountMinor, note: note.trim() })}
        >
          Refund {amountMinor ? formatMoney(amountMinor, order.currency, locale) : ""}
        </Button>
      </div>
    </div>
  );
}

function OrderReview({ order, canManage }: { order: StorefrontOrderView; canManage: boolean }) {
  const locale = localeFor(order.destinationCountryCode);
  const money = (amount: number | null) => formatMoney(amount ?? 0, order.currency, locale);
  const retry = useRetryPayout(order.id);
  const facts: Array<[string, string]> = [
    ["Store", order.storeName],
    ["Buyer", `${order.buyerName}${order.buyerEmail ? ` · ${order.buyerEmail}` : ""}`],
    ["Delivery", `${DELIVERY_LABEL[order.deliverySpeed]} to ${order.recipientCity}`],
    ["Paid", order.paidAt ? formatDateTime(order.paidAt, locale) : "Not yet"],
    ["Total", money(order.totalMinor)],
    ["Refunded", money(order.refundedMinor)],
    ["Vendor share", money(order.vendorShareMinor)],
    ["Platform share", money(order.platformShareMinor)],
    ["Payout due", order.payoutReleaseAt ? formatDateTime(order.payoutReleaseAt, locale) : "Not scheduled"],
    ["Warehouse order", order.fulfilmentReference ?? "Not created yet"],
  ];
  return (
    <Paper className="motion-rise flex flex-col gap-4 px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stamp>{order.reference}</Stamp>
        <span className="flex gap-2">
          <StatusPill tone={ORDER_STATUS_DISPLAY[order.status].tone}>{ORDER_STATUS_DISPLAY[order.status].label}</StatusPill>
          {order.payoutStatus ? <StatusPill tone={PAYOUT_STATUS_DISPLAY[order.payoutStatus].tone}>{PAYOUT_STATUS_DISPLAY[order.payoutStatus].label}</StatusPill> : null}
        </span>
      </div>
      <dl className="grid gap-x-6 gap-y-2 text-small sm:grid-cols-2">
        {facts.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 border-b border-line py-1.5">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="text-right tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      {canManage && order.payoutStatus === "FAILED" ? (
        <div className="flex items-center justify-between gap-3 rounded-card bg-pink/30 px-4 py-3">
          <span className="text-small">The transfer to the vendor&apos;s bank failed. Check their payout account, then try again.</span>
          <Button variant="ghost" loading={retry.isPending} onClick={() => retry.mutate(undefined)}>
            Retry payout
          </Button>
        </div>
      ) : null}
      {canManage && REFUNDABLE.includes(order.status) && order.refundedMinor < order.totalMinor ? <RefundForm key={order.refundedMinor} order={order} locale={locale} /> : null}
    </Paper>
  );
}

export function AdminStoreOrdersPage() {
  const user = useCurrentUser();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [selected, setSelected] = useState<string | null>(null);
  const orders = useAdminStoreOrders(filter === "ALL" ? undefined : filter);
  const chosen = useAdminStoreOrder(selected).data;
  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Money" title="Store orders" lead="Orders buyers paid for on vendor stores. We hold the vendor's share until the return window closes, then send it to their bank." />
      <FilterTabs label="Filter store orders" options={FILTERS} value={filter} onChange={setFilter} />
      <StoreOrdersTable orders={orders.data ?? []} loading={orders.isLoading} locale={localeFor(user.countryCode)} audience="STAFF" selectedId={selected} onOpen={setSelected} />
      {chosen ? <OrderReview key={chosen.id} order={chosen} canManage={hasPermission(user.role, "storefronts.manage")} /> : null}
    </div>
  );
}
