"use client";

import { hasPermission, type InboundSummaryView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { type Column, DataTable } from "@/components/ui/data-table";
import { EmptyState, FilterTabs, OpenLink } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { OPEN_STATUS_GROUPS } from "@/features/stock/display";
import { useCountryScope } from "@/features/seller-countries/selected-country";
import { InboundStatusPill } from "@/features/stock/inbound-parts";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate } from "@/lib/format";

import { INBOUND_KEY } from "./inbound-editor-page";

type Group = keyof typeof OPEN_STATUS_GROUPS;

const GROUP_LABELS: Record<Group, string> = { open: "On the way", drafts: "Drafts", done: "Finished" };

const COLUMNS: readonly Column<InboundSummaryView>[] = [
  { key: "reference", header: "Reference", render: (row) => <span className="font-mono text-[15px] font-medium">{row.reference}</span> },
  { key: "status", header: "Status", render: (row) => <InboundStatusPill status={row.status} /> },
  { key: "expected", header: "Expected", render: (row) => <span className="text-ink-soft">{formatDate(row.expectedArrivalDate, "en-GB")}</span> },
  { key: "units", header: "Units", align: "right", render: (row) => <span className="tabular-nums">{row.totalUnits}</span> },
  { key: "boxes", header: "Boxes", align: "right", render: (row) => <span className="tabular-nums">{row.totalBoxes}</span> },
  { key: "open", header: "", align: "right", render: (row) => <OpenLink href={`/inbound/${row.id}`} /> },
];

export function InboundListPage() {
  const user = useCurrentUser();
  const [group, setGroup] = useState<Group>("open");
  const { code, ready, path } = useCountryScope();
  const inbound = useQuery({ queryKey: [...INBOUND_KEY, "list", code], queryFn: () => apiRequest<InboundSummaryView[]>(path("/v1/vendor/inbound")), enabled: ready });
  const all = inbound.data ?? [];
  const inGroup = (target: Group) => all.filter((row) => (OPEN_STATUS_GROUPS[target] as readonly string[]).includes(row.status));

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Inbound"
        title="Shipments to your hubs"
        lead="Declare what you're sending, follow it to the dock, and see exactly what was counted on arrival."
        action={
          hasPermission(user.role, "vendor.stock.manage") ? (
            <ButtonLink href="/inbound/new" variant="yellow" size="lg">
              New shipment →
            </ButtonLink>
          ) : null
        }
      />
      <FilterTabs
        label="Filter shipments"
        value={group}
        onChange={setGroup}
        options={(Object.keys(GROUP_LABELS) as Group[]).map((value) => ({ value, label: GROUP_LABELS[value], count: inGroup(value).length }))}
      />
      <DataTable
        caption="Inbound shipments"
        columns={COLUMNS}
        rows={inGroup(group)}
        rowKey={(row) => row.id}
        empty={inbound.isLoading ? "Loading shipments…" : <EmptyState title="Nothing here" body="Shipments you declare will appear here as they move through the hub." />}
      />
    </div>
  );
}
