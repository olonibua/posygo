"use client";

import { type OrderStatus, type OrderSummaryView } from "@/shared";
import { useState } from "react";

import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, Input } from "@/components/ui/form-controls";
import { EmptyState, FilterTabs, OpenLink } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { countryName } from "@/features/orders/order-display";
import { OrderStatusPill } from "@/features/orders/order-parts";
import { formatDateTime } from "@/lib/format";

import { useCancellationQueue, useOrderQueue } from "./use-fulfilment";

type View = "OPEN" | "PENDING_PACKING" | "PACKING_COMPLETED" | "AWAITING_SHIPPING_SELECTION" | "LABEL_PURCHASED" | "ON_HOLD" | "EXCEPTION" | "CANCELLATIONS";

const VIEWS: Array<{ value: View; label: string }> = [
  { value: "OPEN", label: "All open" },
  { value: "PENDING_PACKING", label: "To pack" },
  { value: "PACKING_COMPLETED", label: "Packed" },
  { value: "AWAITING_SHIPPING_SELECTION", label: "Choose shipping" },
  { value: "LABEL_PURCHASED", label: "Ready to hand off" },
  { value: "ON_HOLD", label: "On hold" },
  { value: "EXCEPTION", label: "Carrier problems" },
  { value: "CANCELLATIONS", label: "Cancellation requests" },
];

const LOCALE = "en-GB";

export function OrderQueuePage() {
  const [view, setView] = useState<View>("PENDING_PACKING");
  const [search, setSearch] = useState("");
  const query = search.trim().length >= 2 ? search.trim() : "";
  const queue = useOrderQueue(view === "CANCELLATIONS" ? "OPEN" : (view as OrderStatus | "OPEN"), query);
  const cancellations = useCancellationQueue();
  const open = useOrderQueue("OPEN", "");
  const rows = view === "CANCELLATIONS" ? (cancellations.data ?? []) : (queue.data ?? []);
  const count = (status: OrderStatus) => (open.data ?? []).filter((order) => order.status === status).length;

  const columns: Column<OrderSummaryView>[] = [
    { key: "reference", header: "Order", render: (order) => <span className="font-mono text-[15px] font-medium">{order.reference}</span> },
    { key: "vendor", header: "Vendor", render: (order) => order.businessName },
    { key: "status", header: "Status", render: (order) => <OrderStatusPill status={order.status} /> },
    {
      key: "destination",
      header: "Ship to",
      render: (order) => (
        <span>
          <span className="block">{order.recipientName}</span>
          <span className="text-meta text-ink-faint">
            {order.recipientCity}, {countryName(order.destinationCountryCode)}
          </span>
        </span>
      ),
    },
    { key: "units", header: "Units", align: "right", render: (order) => <span className="tabular-nums">{order.totalUnits}</span> },
    { key: "placed", header: "Placed", render: (order) => <span className="text-ink-soft">{formatDateTime(order.createdAt, LOCALE)}</span> },
    { key: "open", header: "", align: "right", render: (order) => <OpenLink href={`/admin/orders/${order.id}`} /> },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Warehouse" title="Orders" lead="Pick, scan and pack each order, then buy its label and hand it to the carrier. Every unit must be scanned before a parcel can be recorded." />
      <StatTileGrid>
        <StatTile tone="yellow" label="To pack" value={count("PENDING_PACKING")} note="Waiting for a picker" dots={["pink"]} />
        <StatTile tone="sky" label="Choose shipping" value={count("PACKING_COMPLETED") + count("AWAITING_SHIPPING_SELECTION")} note="Packed, needs a label" dots={["lime"]} />
        <StatTile tone="lime" label="Ready to hand off" value={count("LABEL_PURCHASED")} note="Labels printed" dots={["orange"]} />
        <StatTile tone="pink" label="Cancellation requests" value={cancellations.data?.length ?? 0} note="Waiting for a decision" dots={["teal", "yellow"]} />
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
        empty={<EmptyState title="Nothing waiting" body="New orders appear here as vendors place them." />}
      />
    </div>
  );
}
