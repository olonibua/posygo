"use client";

import { DELIVERY_PREFERENCE_LABELS, type OrderDetailView, type OrderEventView, type OrderStatus, type Recipient } from "@/shared";

import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { cn } from "@/lib/cn";
import { formatDateTime, formatMoney } from "@/lib/format";

import { countryName, formatSize, formatWeight, ORDER_STATUS_DISPLAY } from "./order-display";

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  const display = ORDER_STATUS_DISPLAY[status];
  return <StatusPill tone={display.tone}>{display.label}</StatusPill>;
}

function Facts({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <Paper className="px-6 py-4">
      <Stamp>{title}</Stamp>
      <dl className="mt-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-6 border-t border-line py-2.5 text-small first:border-t-0">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="text-right tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </Paper>
  );
}

export function RecipientCard({ recipient }: { recipient: Recipient }) {
  const address = [recipient.company, recipient.line1, recipient.line2, [recipient.city, recipient.region].filter(Boolean).join(", "), recipient.postalCode, countryName(recipient.countryCode)].filter(
    Boolean,
  );
  return (
    <Paper className="px-6 py-4">
      <Stamp>Deliver to</Stamp>
      <p className="mt-2 font-medium">{recipient.name}</p>
      <address className="text-small not-italic text-ink-soft">
        {address.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </address>
      {recipient.phone || recipient.email ? <p className="mt-2 text-meta text-ink-faint">{[recipient.phone, recipient.email].filter(Boolean).join(" · ")}</p> : null}
    </Paper>
  );
}

export function ChargesCard({ order, locale }: { order: OrderDetailView; locale: string }) {
  const { charges } = order;
  if (!charges) {
    return null;
  }
  const money = (minor: number) => formatMoney(minor, charges.currency, locale);
  const rows: Array<[string, string]> = [
    ["Fulfilment", money(charges.fulfilmentFeeMinor)],
    ["Shipping", charges.shippingChargeMinor === null ? "Charged when the label is bought" : money(charges.shippingChargeMinor)],
  ];
  if (charges.refundedMinor > 0) {
    rows.push(["Returned to wallet", `−${money(charges.refundedMinor)}`]);
  }
  return <Facts title="Charges" rows={rows} />;
}

export function ParcelCard({ order, locale }: { order: OrderDetailView; locale: string }) {
  const rows: Array<[string, string]> = [["Delivery", DELIVERY_PREFERENCE_LABELS[order.deliveryPreference].label]];
  if (order.pack) {
    rows.push(
      ["Package", order.pack.presetLabel ?? "Custom size"],
      ["Size", formatSize(order.pack.lengthMm, order.pack.widthMm, order.pack.heightMm)],
      ["Weight", formatWeight(order.pack.weightGrams)],
    );
  }
  if (order.label) {
    rows.push(["Carrier", `${order.label.carrier} ${order.label.service}`], ["Tracking", order.label.trackingNumber], ["Label bought", formatDateTime(order.label.purchasedAt, locale)]);
  }
  return <Facts title="Parcel" rows={rows} />;
}

export function OrderLines({ order, showScans }: { order: OrderDetailView; showScans: boolean }) {
  const columns: Column<OrderDetailView["lines"][number]>[] = [
    {
      key: "product",
      header: "Product",
      render: (line) => (
        <span>
          <span className="block font-medium">{line.productName}</span>
          <span className="font-mono text-meta text-ink-faint">{line.productCode}</span>
        </span>
      ),
    },
    ...(showScans
      ? [
          { key: "shelf", header: "Shelf", render: (line: OrderDetailView["lines"][number]) => <span className="font-mono text-small">{line.locations.join(", ") || "—"}</span> },
          {
            key: "scanned",
            header: "Scanned",
            align: "right" as const,
            render: (line: OrderDetailView["lines"][number]) => (
              <span className={cn("tabular-nums font-medium", line.scannedQuantity === line.quantity ? "text-success" : "text-ink")}>
                {line.scannedQuantity} / {line.quantity}
              </span>
            ),
          },
        ]
      : [{ key: "quantity", header: "Quantity", align: "right" as const, render: (line: OrderDetailView["lines"][number]) => <span className="tabular-nums">{line.quantity}</span> }]),
  ];
  return <DataTable caption="Products in this order" columns={columns} rows={order.lines} rowKey={(line) => line.id} />;
}

const SOURCE_DOT: Record<OrderEventView["source"], string> = { VENDOR: "bg-yellow", STAFF: "bg-sky", SYSTEM: "bg-line-strong", CARRIER: "bg-lime" };

export function OrderTimeline({ events, locale }: { events: OrderEventView[]; locale: string }) {
  return (
    <Paper className="px-6 py-5">
      <Stamp>Timeline</Stamp>
      <ol className="mt-3 flex flex-col">
        {[...events].reverse().map((event, index, all) => (
          <li
            key={event.id}
            className={cn(
              "relative flex gap-3.5 pb-4",
              index < all.length - 1 && "after:absolute after:bottom-0 after:left-[6px] after:top-5 after:border-l-2 after:border-dotted after:border-line-strong",
            )}
          >
            <i aria-hidden className={cn("mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full", SOURCE_DOT[event.source])} />
            <div>
              <p className="text-small">{event.description}</p>
              <p className="text-meta text-ink-faint">{formatDateTime(event.occurredAt, locale)}</p>
            </div>
          </li>
        ))}
      </ol>
    </Paper>
  );
}
