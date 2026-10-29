import type { OrderDetailView, OrderStatus } from "@/shared";

import { Button } from "@/components/ui/button";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { formatDateTime } from "@/lib/format";

const TRACKED: readonly OrderStatus[] = ["HANDED_OFF", "IN_TRANSIT", "EXCEPTION", "DELIVERED", "RETURNED"];

const HEADLINES: Partial<Record<OrderStatus, string>> = {
  HANDED_OFF: "Handed to the courier",
  IN_TRANSIT: "On its way",
  EXCEPTION: "The courier reported a problem",
  DELIVERED: "Delivered",
  RETURNED: "Sent back to the hub",
};

interface TrackingCardProps {
  order: OrderDetailView;
  locale: string;
  busy: boolean;
  onPractice: (status: "IN_TRANSIT" | "DELIVERED") => void;
}

export function TrackingCard({ order, locale, busy, onPractice }: TrackingCardProps) {
  if (!order.label || !TRACKED.includes(order.status)) {
    return null;
  }
  const latest = order.events.filter((event) => event.source === "CARRIER").at(-1);
  return (
    <Paper className="px-6 py-6">
      <Stamp>Tracking</Stamp>
      <p className="mt-2 text-h3">{HEADLINES[order.status]}</p>
      <p className="mt-1 text-small text-ink-soft">
        {order.label.carrier} · <span className="font-mono">{order.label.trackingNumber}</span>
      </p>
      {latest ? (
        <p className="mt-3 rounded-card bg-paper-sunk px-4 py-3 text-small">
          {latest.description}
          <span className="block text-meta text-ink-faint">{formatDateTime(latest.occurredAt, locale)}</span>
        </p>
      ) : (
        <p className="mt-3 text-small text-ink-soft">The courier&apos;s updates appear here as the parcel moves. The seller sees them too.</p>
      )}
      {order.label.trackingUrl ? (
        <a href={order.label.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-small font-medium underline">
          Track on the courier&apos;s site
        </a>
      ) : null}
      {order.practiceTracking ? (
        <div className="mt-4 rounded-card border-[1.5px] border-dashed border-line-strong px-4 py-4">
          <p className="text-small font-medium">Test label</p>
          <p className="mt-1 text-meta text-ink-soft">Test labels never move, so no courier updates arrive. Use these to see the next steps.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" loading={busy} disabled={order.status !== "HANDED_OFF"} onClick={() => onPractice("IN_TRANSIT")}>
              Mark on its way
            </Button>
            <Button variant="ghost" loading={busy} onClick={() => onPractice("DELIVERED")}>
              Mark delivered
            </Button>
          </div>
        </div>
      ) : null}
    </Paper>
  );
}
