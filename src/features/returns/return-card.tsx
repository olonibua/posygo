"use client";

import type { VendorReturnView } from "@/shared";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { FormAlert } from "@/components/ui/form-controls";
import { Paper } from "@/components/ui/surfaces";
import { errorMessage } from "@/features/receiving/api-errors";
import { formatDate } from "@/lib/format";

import { RETURN_STATUS } from "./return-display";
import { type ReturnsSide, useReturnPhoto } from "./use-returns";

function Photos({ entry, side }: { entry: VendorReturnView; side: ReturnsSide }) {
  const photo = useReturnPhoto(side, entry.id);
  const open = (fileId: string) => photo.mutate(fileId, { onSuccess: (result) => window.open(result.url, "_blank", "noopener,noreferrer") });
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {entry.photoFileIds.map((fileId, index) => (
          <Button key={fileId} variant="ghost" loading={photo.isPending && photo.variables === fileId} onClick={() => open(fileId)}>
            Photo {index + 1}
          </Button>
        ))}
      </div>
      <FormAlert message={errorMessage(photo.error)} />
    </div>
  );
}

export function ReturnCard({ entry, side, locale, children }: { entry: VendorReturnView; side: ReturnsSide; locale: string; children?: ReactNode }) {
  const status = RETURN_STATUS[entry.status];
  const split = entry.status === "INSTRUCTED" || entry.status === "COMPLETED";
  const blind = side === "warehouse" && entry.status === "REQUESTED";
  return (
    <Paper className="motion-rise flex flex-col gap-4 px-6 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span>
          <span className="block font-mono text-small font-semibold">{entry.reference}</span>
          <span className="text-meta font-normal text-ink-faint">
            Order {entry.orderReference}
            {entry.vendorName ? ` · ${entry.vendorName}` : ""} · {entry.warehouseName} · opened {formatDate(entry.createdAt, locale)}
          </span>
        </span>
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </div>
      {side === "vendor" ? <p className="text-small text-ink-soft">{status.vendorHint}</p> : null}
      <table className="w-full text-small">
        <caption className="sr-only">Items on this return</caption>
        <thead>
          <tr className="text-left text-meta uppercase text-ink-faint">
            <th className="py-1.5 font-medium">Item</th>
            {blind ? null : <th className="py-1.5 text-right font-medium">Expected</th>}
            <th className="py-1.5 text-right font-medium">Arrived</th>
            {split ? <th className="py-1.5 text-right font-medium">Back on sale · disposed · donated</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {entry.lines.map((line) => (
            <tr key={line.id}>
              <td className="py-2">
                {line.productName} <span className="text-meta text-ink-faint">{line.productCode}</span>
              </td>
              {blind ? null : <td className="py-2 text-right tabular-nums">{line.requestedQuantity}</td>}
              <td className="py-2 text-right tabular-nums">{line.receivedQuantity ?? "—"}</td>
              {split ? <td className="py-2 text-right tabular-nums">{`${line.restockQuantity} · ${line.disposeQuantity} · ${line.donateQuantity}`}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-small">
        <span className="text-ink-soft">Reason: </span>
        {entry.reason}
      </p>
      {entry.carrier && entry.trackingNumber ? (
        <p className="text-small">
          <span className="text-ink-soft">Sent with </span>
          {entry.carrier}, tracking <span className="font-mono">{entry.trackingNumber}</span>
        </p>
      ) : null}
      {entry.receiveNotes ? (
        <p className="text-small">
          <span className="text-ink-soft">Warehouse notes: </span>
          {entry.receiveNotes}
        </p>
      ) : null}
      {entry.photoFileIds.length > 0 ? <Photos entry={entry} side={side} /> : null}
      {children}
    </Paper>
  );
}
