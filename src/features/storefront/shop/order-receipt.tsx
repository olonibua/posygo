"use client";

import type { StorefrontOrderView } from "@/shared";
import type { ReactNode } from "react";

import { StatusPill } from "@/components/ui/chip";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { formatDate, formatMoney, localeFor } from "@/lib/format";

import { DELIVERY_LABEL, ORDER_STATUS_DISPLAY } from "../storefront-display";

export function OrderReceipt({ order, children }: { order: StorefrontOrderView; children?: ReactNode }) {
  const locale = localeFor(order.destinationCountryCode);
  const money = (amount: number) => formatMoney(amount, order.currency, locale);
  const row = (label: string, value: string, strong = false) => (
    <div className={strong ? "flex justify-between border-t border-line pt-2 font-semibold" : "flex justify-between py-1 text-ink-soft"}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
  return (
    <Paper className="motion-rise flex flex-col gap-4 px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stamp>{order.storeName}</Stamp>
        <StatusPill tone={ORDER_STATUS_DISPLAY[order.status].tone}>{ORDER_STATUS_DISPLAY[order.status].label}</StatusPill>
      </div>
      <ul className="flex flex-col divide-y divide-line">
        {order.lines.map((line) => (
          <li key={line.productId} className="flex justify-between gap-3 py-2">
            <span>
              {line.quantity} × {line.productName}
            </span>
            <span className="tabular-nums">{money(line.unitPriceMinor * line.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="flex flex-col text-small">
        {order.discountMinor > 0 ? row("Discount", `−${money(order.discountMinor)}`) : null}
        {row(`${DELIVERY_LABEL[order.deliverySpeed]} delivery`, money(order.deliveryMinor))}
        {order.taxMinor > 0 ? row(order.taxIncluded ? "Tax included" : "Tax", money(order.taxMinor)) : null}
        {row("Total", money(order.totalMinor), true)}
        {order.refundedMinor > 0 ? row("Refunded to your card", money(order.refundedMinor)) : null}
      </dl>
      <p className="text-meta font-normal text-ink-faint">
        Order {order.reference} · placed {formatDate(order.createdAt, locale)}
        {order.buyerName ? ` · going to ${order.buyerName}, ${order.recipientCity}` : ""}
      </p>
      {children}
    </Paper>
  );
}
