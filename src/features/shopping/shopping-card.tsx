"use client";

import type { ShoppingRequestView } from "@/shared";
import type { ReactNode } from "react";

import { StatusPill } from "@/components/ui/chip";
import { Paper } from "@/components/ui/surfaces";
import { formatDate, formatMoney } from "@/lib/format";

import { LINE_STATUS, SHOPPING_STATUS } from "./shopping-display";

function shopName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "link";
  }
}

function Totals({ request, locale }: { request: ShoppingRequestView; locale: string }) {
  if (request.totalMinor === 0) {
    return null;
  }
  const money = (minor: number) => formatMoney(minor, request.currency, locale);
  const rows: Array<[string, number]> = [
    ["Items", request.goodsMinor],
    ["Our fee", request.commissionMinor],
    ["Delivery", request.deliveryMinor],
  ];
  return (
    <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 border-t border-line pt-3 text-small">
      {rows.map(([label, minor]) => (
        <div key={label} className="contents">
          <dt className="text-ink-soft">{label}</dt>
          <dd className="text-right tabular-nums">{money(minor)}</dd>
        </div>
      ))}
      <dt className="font-semibold">Total</dt>
      <dd className="text-right font-semibold tabular-nums">{money(request.totalMinor)}</dd>
      {request.refundedMinor > 0 ? (
        <>
          <dt className="text-ink-soft">Refunded to card</dt>
          <dd className="text-right tabular-nums">−{money(request.refundedMinor)}</dd>
        </>
      ) : null}
    </dl>
  );
}

export function ShoppingCard({ request, locale, showHint = false, children }: { request: ShoppingRequestView; locale: string; showHint?: boolean; children?: ReactNode }) {
  const status = SHOPPING_STATUS[request.status];
  return (
    <Paper className="motion-rise flex flex-col gap-4 px-6 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span>
          <span className="block font-mono text-small font-semibold">{request.reference}</span>
          <span className="text-meta font-normal text-ink-faint">
            For {request.buyerName} · to {request.recipientCity} · sent {formatDate(request.createdAt, locale)}
            {request.warehouseName ? ` · ${request.warehouseName}` : ""}
          </span>
        </span>
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </div>
      {request.disputeOpen ? <p className="text-small font-medium text-ink">The buyer has disputed this payment with their card provider. Hold everything until it&apos;s settled.</p> : null}
      {showHint ? <p className="text-small text-ink-soft">{request.cancelReason && request.status === "CANCELLED" ? request.cancelReason : status.buyerHint}</p> : null}
      <ul className="flex flex-col divide-y divide-line text-small">
        {request.lines.map((line) => (
          <li key={line.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
            <span className="flex min-w-0 flex-col">
              <span className="font-medium">
                {line.quantity} × {line.description}
              </span>
              <span className="text-meta text-ink-faint">
                <a href={line.url} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">
                  {shopName(line.url)}
                </a>
                {" · "}
                {LINE_STATUS[line.status]}
                {line.staffNote ? ` · ${line.staffNote}` : ""}
              </span>
            </span>
            {line.unitPriceMinor !== null ? <span className="tabular-nums">{formatMoney(line.unitPriceMinor * line.quantity, request.currency, locale)}</span> : null}
          </li>
        ))}
      </ul>
      {request.shipTo ? (
        <p className="text-small text-ink-soft">
          Delivering to {request.shipTo.name},{" "}
          {[request.shipTo.line1, request.shipTo.line2, request.shipTo.city, request.shipTo.region, request.shipTo.postalCode, request.shipTo.countryCode].filter(Boolean).join(", ")}
        </p>
      ) : null}
      <Totals request={request} locale={locale} />
      {request.trackingNumber ? (
        <a href={`/track/${encodeURIComponent(request.trackingNumber)}`} className="text-small underline underline-offset-4">
          Track your parcel ({request.carrier} {request.trackingNumber})
        </a>
      ) : null}
      {children}
    </Paper>
  );
}
