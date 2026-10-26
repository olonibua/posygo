import type { TransferView } from "@/shared";
import type { ReactNode } from "react";

import { StatusPill } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { formatDateTime, localeFor } from "@/lib/format";

import { TRANSFER_STATUS_DISPLAY } from "./custody-display";

export function TransferCard({ transfer, children }: { transfer: TransferView; children?: ReactNode }) {
  const display = TRANSFER_STATUS_DISPLAY[transfer.status];
  const locale = localeFor(transfer.countryCode);
  return (
    <Paper className="motion-lift flex flex-col gap-4 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stamp>{transfer.reference}</Stamp>
        <StatusPill tone={display.tone}>{display.label}</StatusPill>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-h3">
        <span>
          {transfer.fromWarehouse.name} <span className="font-mono text-meta text-ink-faint">{transfer.fromWarehouse.code}</span>
        </span>
        <span className={transfer.status === "DISPATCHED" ? "motion-wobble text-orange" : "text-ink-faint"}>
          <Icon name="transfer" className="h-6 w-6" />
        </span>
        <span>
          {transfer.toWarehouse.name} <span className="font-mono text-meta text-ink-faint">{transfer.toWarehouse.code}</span>
        </span>
      </div>
      <p className="text-small text-ink-soft">{transfer.reason}</p>
      <table className="w-full text-small">
        <thead>
          <tr className="text-left text-ink-faint">
            <th className="py-2 font-normal">Item</th>
            <th className="py-2 text-right font-normal">Sent</th>
            <th className="py-2 text-right font-normal">Arrived</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {transfer.lines.map((line) => (
            <tr key={line.id} className={line.quantityReceived !== null && line.quantitySent !== null && line.quantityReceived < line.quantitySent ? "bg-pink/40" : undefined}>
              <td className="py-2">
                {line.productName} <span className="font-mono text-meta text-ink-faint">{line.lotCode}</span>
                {line.vendorName ? <span className="block text-meta text-ink-faint">{line.vendorName}</span> : null}
              </td>
              <td className="py-2 text-right tabular-nums">{line.quantitySent ?? "Count it"}</td>
              <td className="py-2 text-right tabular-nums">{line.quantityReceived ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {transfer.dispatchedAt ? (
        <p className="text-meta text-ink-soft">
          Sent {formatDateTime(transfer.dispatchedAt, locale)} with {transfer.carrier} · tracking {transfer.trackingNumber} · seal {transfer.sealNumber}
          {transfer.receivedAt ? ` · arrived ${formatDateTime(transfer.receivedAt, locale)}` : ""}
        </p>
      ) : null}
      {children}
    </Paper>
  );
}
