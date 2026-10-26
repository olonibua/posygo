"use client";

import { type BoxCounts, type InboundDetailView, type InboundLineView, type InboundMessageView, type InboundPhotoView, STORAGE_TIERS } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { FormAlert, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

import { INBOUND_STATUS_DISPLAY, SHIPPING_MODE_LABELS, STORAGE_TIER_LABELS } from "./display";

export function InboundStatusPill({ status }: { status: InboundDetailView["status"] }) {
  const display = INBOUND_STATUS_DISPLAY[status];
  return <StatusPill tone={display.tone}>{display.label}</StatusPill>;
}

export function describeBoxes(counts: BoxCounts | null): string {
  if (!counts) {
    return "—";
  }
  const parts = STORAGE_TIERS.filter((tier) => (counts[tier] ?? 0) > 0).map((tier) => `${counts[tier]} ${STORAGE_TIER_LABELS[tier].label.toLowerCase()}`);
  return parts.length > 0 ? parts.join(", ") : "—";
}

export function InboundFacts({ inbound }: { inbound: InboundDetailView }) {
  const rows: Array<[string, string]> = [
    ["Hub", inbound.warehouseName],
    ["Shipping", SHIPPING_MODE_LABELS[inbound.shippingMode].label],
    ["Expected", formatDate(inbound.expectedArrivalDate, "en-GB")],
    ["Carrier", inbound.carrier ?? "—"],
    ["Tracking", inbound.trackingNumber ?? "—"],
    ["Boxes declared", describeBoxes(inbound.declaredBoxCounts)],
    ["Boxes counted", describeBoxes(inbound.receivedBoxCounts)],
  ];
  return (
    <Paper className="px-6 py-4">
      <Stamp>Shipment</Stamp>
      <dl className="mt-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-6 border-t border-line py-2.5 text-small first:border-t-0">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="text-right">{value}</dd>
          </div>
        ))}
      </dl>
      {inbound.notes ? <p className="mt-3 border-t border-line pt-3 text-small text-ink-soft">{inbound.notes}</p> : null}
    </Paper>
  );
}

function Count({ value, tone }: { value: number; tone?: "danger" | "success" }) {
  return <span className={cn("tabular-nums", value > 0 && tone === "danger" && "font-semibold text-danger", tone === "success" && "text-success")}>{value}</span>;
}

export function InboundLinesTable({ inbound }: { inbound: InboundDetailView }) {
  const counted = inbound.receivedAt !== null;
  const columns: Column<InboundLineView>[] = [
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
    { key: "declared", header: "Declared", align: "right", render: (line) => <Count value={line.declaredQuantity} /> },
    ...(counted
      ? ([
          { key: "accepted", header: "Accepted", align: "right", render: (line) => <Count value={line.acceptedQuantity} tone="success" /> },
          { key: "damaged", header: "Damaged", align: "right", render: (line) => <Count value={line.damagedQuantity} tone="danger" /> },
          { key: "missing", header: "Missing", align: "right", render: (line) => <Count value={line.missingQuantity} tone="danger" /> },
          { key: "extra", header: "Extra", align: "right", render: (line) => <Count value={line.extraQuantity} /> },
        ] satisfies Column<InboundLineView>[])
      : []),
  ];
  return <DataTable caption="Products in this shipment" columns={columns} rows={inbound.lines} rowKey={(line) => line.id} />;
}

export function PhotoList({ photos, lines, onOpen }: { photos: readonly InboundPhotoView[]; lines: readonly InboundLineView[]; onOpen: (fileId: string) => void }) {
  if (photos.length === 0) {
    return null;
  }
  const lineName = new Map(lines.map((line) => [line.id, line.productCode]));
  return (
    <Paper className="px-6 py-5">
      <Stamp>Receiving photos</Stamp>
      <ul className="mt-3 flex flex-col gap-2">
        {photos.map((photo, index) => (
          <li key={photo.fileId} className="flex items-center justify-between gap-3 text-small">
            <span>{photo.lineId ? `Damage · ${lineName.get(photo.lineId) ?? "product"}` : `Shipment photo ${index + 1}`}</span>
            <Button variant="ghost" onClick={() => onOpen(photo.fileId)}>
              Open ↗
            </Button>
          </li>
        ))}
      </ul>
    </Paper>
  );
}

export function MessageThread({
  messages,
  viewer,
  onSend,
  sending,
  error,
}: {
  messages: readonly InboundMessageView[];
  viewer: "vendor" | "platform";
  onSend?: (body: string) => Promise<unknown>;
  sending?: boolean;
  error?: string | null;
}) {
  const [body, setBody] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!onSend || body.trim().length === 0) {
      return;
    }
    await onSend(body.trim());
    setBody("");
  }
  return (
    <Paper className="flex flex-col gap-4 px-6 py-5">
      <Stamp>Messages</Stamp>
      {messages.length === 0 ? <p className="text-small text-ink-soft">No messages yet.</p> : null}
      <ol className="flex flex-col gap-3">
        {messages.map((message) => {
          const mine = (viewer === "platform") === message.fromPlatform;
          return (
            <li key={message.id} className={cn("max-w-[85%] rounded-card px-4 py-3 text-small", mine ? "self-end bg-yellow text-cocoa" : "self-start bg-paper-sunk")}>
              <p className="mb-1 text-meta text-ink-soft">
                {message.fromPlatform ? "Warehouse team" : (message.authorEmail ?? "Vendor")} · {formatDate(message.createdAt, "en-GB")}
              </p>
              <p className="whitespace-pre-wrap">{message.body}</p>
            </li>
          );
        })}
      </ol>
      {onSend ? (
        <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-3">
          <FormAlert message={error ?? null} />
          <label className="sr-only" htmlFor="message-body">
            Message
          </label>
          <Textarea id="message-body" value={body} maxLength={2000} onChange={(event) => setBody(event.target.value)} placeholder="Write a message" className="min-h-[90px]" />
          <div className="flex justify-end">
            <Button type="submit" loading={sending} disabled={body.trim().length === 0}>
              Send
            </Button>
          </div>
        </form>
      ) : null}
    </Paper>
  );
}
