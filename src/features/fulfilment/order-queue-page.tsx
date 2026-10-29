"use client";

import type { OrderStatus, OrderSummaryView } from "@/shared";
import { useState } from "react";

import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, Input } from "@/components/ui/form-controls";
import { EmptyState, FilterTabs, OpenLink } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { countryName } from "@/features/orders/order-display";
import { OrderStatusPill } from "@/features/orders/order-parts";
import { formatDateTime } from "@/lib/format";

import { type QueueFilter, useCancellationQueue, useOrderQueue } from "./use-fulfilment";

type View = QueueFilter | "CANCELLATIONS";

const VIEWS: Array<{ value: View; label: string }> = [
  { value: "PENDING_PACKING", label: "To pack" },
  { value: "AWAITING_SHIPPING_SELECTION", label: "Choose courier" },
  { value: "LABEL_PURCHASED", label: "Ready to hand over" },
  { value: "SENT", label: "Sent" },
  { value: "DONE", label: "Finished" },
  { value: "ON_HOLD", label: "On hold" },
  { value: "CANCELLATIONS", label: "Cancellation requests" },
  { value: "OPEN", label: "All open" },
];

const EMPTY: Partial<Record<View, { title: string; body: string }>> = {
  SENT: { title: "Nothing on the way", body: "Orders appear here once they're handed to the courier, until they're delivered." },
  DONE: { title: "Nothing finished yet", body: "Delivered, returned and cancelled orders appear here." },
};

const LOCALE = "en-GB";

export function OrderQueuePage() {
  const [view, setView] = useState<View>("PENDING_PACKING");
  const [search, setSearch] = useState("");
  const query = search.trim().length >= 2 ? search.trim() : "";
  const queue = useOrderQueue(view === "CANCELLATIONS" ? "OPEN" : view, query);
  const cancellations = useCancellationQueue();
  const open = useOrderQueue("OPEN", "");
  const sent = useOrderQueue("SENT", "");
  const rows = view === "CANCELLATIONS" ? (cancellations.data ?? []) : (queue.data ?? []);
  const count = (status: OrderStatus) => (open.data ?? []).filter((order) => order.status === status).length;

  const columns: Column<OrderSummaryView>[] = [
    { key: "reference", header: "Order", render: (order) => <span className="font-mono text-[15px] font-medium">{order.reference}</span> },
    { key: "vendor", header: "Vendor", render: (order) => order.businessName },
    { key: "status", header: "Status", render: (order) => <OrderStatusPill status={order.status} /> },
    {
      key: "recipient",
      header: "Ship to",
      render: (order) => (
        <span>
          <span className="block">{order.recipientName}</span>
          <span className="text-meta text-ink-faint">
            {order.recipientCity}, {countryName(order.countryCode)}
          </span>
        </span>
      ),
    },
    {
      key: "courier",
      header: "Courier",
      render: (order) =>
        order.trackingNumber ? (
          <span>
            <span className="block">{order.carrier}</span>
            <span className="font-mono text-meta text-ink-faint">{order.trackingNumber}</span>
          </span>
        ) : (
          <span className="text-ink-faint">—</span>
        ),
    },
    { key: "units", header: "Units", align: "right", render: (order) => <span className="tabular-nums">{order.totalUnits}</span> },
    { key: "placed", header: "Placed", render: (order) => <span className="text-ink-soft">{formatDateTime(order.createdAt, LOCALE)}</span> },
    { key: "open", header: "", align: "right", render: (order) => <OpenLink href={`/admin/orders/${order.id}`} /> },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Warehouse" title="Orders" lead="Open an order, check each item, pack it, choose the courier and hand it over. Sent orders stay under Sent until they're delivered." />
      <StatTileGrid>
        <StatTile tone="yellow" label="To pack" value={count("PENDING_PACKING")} note="Check and pack" dots={["pink"]} />
        <StatTile tone="sky" label="Choose courier" value={count("PACKING_COMPLETED") + count("AWAITING_SHIPPING_SELECTION")} note="Packed, needs a label" dots={["lime"]} />
        <StatTile tone="lime" label="Ready to hand over" value={count("LABEL_PURCHASED")} note="Label printed" dots={["orange"]} />
        <StatTile tone="pink" label="On the way" value={sent.data?.length ?? 0} note="With the courier" dots={["teal", "yellow"]} />
      </StatTileGrid>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <FilterTabs label="Which orders" value={view} onChange={setView} options={VIEWS} />
        <div className="w-full lg:w-[280px]">
          <Field label="Search">
            {({ id }) => <Input id={id} type="search" placeholder="Order, tracking, vendor or name" value={search} maxLength={64} onChange={(event) => setSearch(event.target.value)} />}
          </Field>
        </div>
      </div>
      <DataTable
        caption="Orders"
        columns={columns}
        rows={rows}
        rowKey={(order) => order.id}
        loading={queue.isLoading}
        empty={<EmptyState title={EMPTY[view]?.title ?? "Nothing waiting"} body={EMPTY[view]?.body ?? "New orders appear here as sellers place them."} />}
      />
    </div>
  );
}
