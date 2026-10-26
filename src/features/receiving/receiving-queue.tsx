"use client";

import { type InboundStatus, type InboundSummaryView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { type Column, DataTable } from "@/components/ui/data-table";
import { EmptyState, FilterTabs, OpenLink } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { INBOUND_STATUS_DISPLAY } from "@/features/stock/display";
import { InboundStatusPill } from "@/features/stock/inbound-parts";
import { apiRequest } from "@/lib/api/client";
import { formatDate } from "@/lib/format";

type QueueFilter = "DUE" | Exclude<InboundStatus, "DRAFT">;

const FILTERS: readonly QueueFilter[] = ["DUE", "SUBMITTED", "ARRIVED", "ON_HOLD", "RECEIVED", "DISCREPANCY", "REJECTED", "RETURN_REQUESTED", "CANCELLED"];

export function ReceivingQueue() {
  const [filter, setFilter] = useState<QueueFilter>("DUE");
  const queue = useQuery({
    queryKey: ["warehouse", "inbound", filter],
    queryFn: () => apiRequest<InboundSummaryView[]>(filter === "DUE" ? "/v1/warehouse/inbound" : `/v1/warehouse/inbound?status=${filter}`),
  });
  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Warehouse" title="Receiving" lead="Shipments on their way to you, soonest first. Count every box and photograph it on arrival." />
      <FilterTabs label="Filter shipments" value={filter} onChange={setFilter} options={FILTERS.map((value) => ({ value, label: value === "DUE" ? "Due" : INBOUND_STATUS_DISPLAY[value].label }))} />
      <DataTable
        caption="Inbound shipments"
        columns={COLUMNS}
        rows={queue.data ?? []}
        rowKey={(row) => row.id}
        loading={queue.isLoading}
        empty={<EmptyState title="Nothing here" body="Shipments appear as soon as vendors submit them." />}
      />
    </div>
  );
}

const COLUMNS: readonly Column<InboundSummaryView>[] = [
  { key: "reference", header: "Reference", render: (row) => <span className="font-mono">{row.reference}</span> },
  { key: "vendor", header: "Vendor", render: (row) => row.businessName },
  { key: "warehouse", header: "Warehouse", render: (row) => <span className="text-ink-soft">{row.warehouseName}</span> },
  { key: "expected", header: "Expected", render: (row) => formatDate(row.expectedArrivalDate, "en-GB") },
  { key: "units", header: "Units", align: "right", render: (row) => row.totalUnits },
  { key: "boxes", header: "Boxes", align: "right", render: (row) => row.totalBoxes },
  { key: "status", header: "Status", render: (row) => <InboundStatusPill status={row.status} /> },
  { key: "open", header: "Action", align: "right", render: (row) => <OpenLink href={`/admin/receiving/${row.id}`} /> },
];
