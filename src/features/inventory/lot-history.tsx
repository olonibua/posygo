"use client";

import type { CustodyEventType, CustodyEventView } from "@/shared";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { SkeletonLines } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/cn";

const EVENT_COPY: Record<CustodyEventType, { title: string; dot: string }> = {
  RECEIVED: { title: "Counted in at the hub", dot: "bg-lime" },
  PUT_AWAY: { title: "Put away on the shelf", dot: "bg-sky" },
  MOVED: { title: "Moved to a new shelf", dot: "bg-yellow" },
  PICKED: { title: "Picked for an order", dot: "bg-orange" },
  PACKED: { title: "Packed into a parcel", dot: "bg-teal" },
  HANDED_OFF: { title: "Handed to the carrier", dot: "bg-pink" },
  RELEASED: { title: "Back on the shelf after a cancelled order", dot: "bg-sky" },
  TRANSFERRED_OUT: { title: "Sealed and sent to another hub", dot: "bg-orange" },
  TRANSFERRED_IN: { title: "Counted in at the new hub", dot: "bg-lime" },
  WRITTEN_OFF: { title: "Written off after a claim", dot: "bg-pink" },
  RETURNED: { title: "Came back from a customer and went back on sale", dot: "bg-magenta" },
};

function describe(event: CustodyEventView): string {
  if (["RECEIVED", "PICKED", "PACKED", "HANDED_OFF", "TRANSFERRED_OUT", "TRANSFERRED_IN", "WRITTEN_OFF", "RETURNED"].includes(event.type)) {
    return `${event.quantity} units`;
  }
  return event.fromLocation ? `${event.fromLocation} → ${event.toLocation ?? "—"}` : `Shelf ${event.toLocation ?? "—"}`;
}

export function LotHistory({ lotId, lotCode, onClose }: { lotId: string; lotCode: string; onClose: () => void }) {
  const history = useQuery({ queryKey: ["vendor", "custody", lotId], queryFn: () => apiRequest<CustodyEventView[]>(`/v1/vendor/inventory/lots/${lotId}/custody`) });
  return (
    <Paper className="flex flex-col gap-4 px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Stamp>Chain of custody</Stamp>
          <p className="mt-1 font-mono text-small">{lotCode}</p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      {history.isLoading ? <SkeletonLines /> : null}
      <ol className="flex flex-col">
        {(history.data ?? []).map((event, index, all) => (
          <li
            key={event.id}
            className={cn(
              "relative flex gap-3.5 pb-5",
              index < all.length - 1 && "after:absolute after:bottom-0 after:left-[6px] after:top-5 after:border-l-2 after:border-dotted after:border-line-strong",
            )}
          >
            <span aria-hidden className={cn("mt-1 h-3.5 w-3.5 shrink-0 rounded-full", EVENT_COPY[event.type].dot)} />
            <div>
              <p className="text-small font-medium">{EVENT_COPY[event.type].title}</p>
              <p className="text-meta font-normal text-ink-faint">
                {describe(event)} · {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.createdAt))}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Paper>
  );
}
