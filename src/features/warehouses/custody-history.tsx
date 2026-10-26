"use client";

import type { CustodyEventType } from "@/shared";

import { Button } from "@/components/ui/button";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { SkeletonLines } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

import { useCustody } from "./use-lots";

const EVENT_LABELS: Record<CustodyEventType, string> = {
  RECEIVED: "Received",
  PUT_AWAY: "Put away",
  MOVED: "Moved",
  PICKED: "Picked",
  PACKED: "Packed",
  HANDED_OFF: "Handed off",
  RELEASED: "Released",
  TRANSFERRED_OUT: "Sent out",
  TRANSFERRED_IN: "Arrived",
  WRITTEN_OFF: "Written off",
  RETURNED: "Returned",
};

export function CustodyHistory({ lotId, lotCode, onClose }: { lotId: string; lotCode: string; onClose: () => void }) {
  const custody = useCustody(lotId);
  return (
    <Paper className="px-6 py-5">
      <div className="flex items-center justify-between gap-3">
        <Stamp>History · {lotCode}</Stamp>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      {custody.isLoading ? <SkeletonLines /> : null}
      <ol className="mt-3">
        {(custody.data ?? []).map((event) => (
          <li key={event.id} className="grid gap-1 border-t border-line py-2.5 text-small first:border-t-0 sm:grid-cols-[110px_1fr_auto] sm:gap-4">
            <span className="font-medium">{EVENT_LABELS[event.type]}</span>
            <span className="text-ink-soft">
              {event.quantity} units{event.fromLocation ? ` from ${event.fromLocation}` : ""}
              {event.toLocation ? ` to ${event.toLocation}` : ""}
              {event.actorEmail ? ` · ${event.actorEmail}` : ""}
            </span>
            <span className="text-ink-faint">{formatDate(event.createdAt, "en-GB")}</span>
          </li>
        ))}
      </ol>
    </Paper>
  );
}
