"use client";

import { hasPermission, type OrderSummaryView } from "@/shared";
import { useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, Input } from "@/components/ui/form-controls";
import { EmptyState, FilterTabs, OpenLink } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { ExportButton } from "@/features/notifications/export-button";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate, localeFor } from "@/lib/format";

import { countryName, ORDER_GROUP_LABELS, ORDER_GROUPS, type OrderGroup } from "./order-display";
import { OrderStatusPill } from "./order-parts";
import { useVendorOrders } from "./use-vendor-orders";

export function OrdersListPage() {
  const user = useCurrentUser();
  const locale = localeFor(user.countryCode);
  const canManage = hasPermission(user.role, "vendor.orders.manage");
  const [group, setGroup] = useState<OrderGroup>("packing");
  const [search, setSearch] = useState("");
  const orders = useVendorOrders(search.trim().length >= 2 ? search.trim() : "");
  const all = orders.data ?? [];
  const inGroup = (target: OrderGroup) => all.filter((order) => (ORDER_GROUPS[target] as readonly string[]).includes(order.status));
  const funding = all.filter((order) => order.status === "AWAITING_WALLET_FUNDING").length;

  const columns: Column<OrderSummaryView>[] = [
    {
      key: "reference",
      header: "Order",
      render: (order) => (
        <span>
          <span className="block font-mono text-[15px] font-medium">{order.reference}</span>
          {order.externalReference ? <span className="text-meta text-ink-faint">{order.externalReference}</span> : null}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (order) => <OrderStatusPill status={order.status} /> },
    {
      key: "recipient",
      header: "Ship to",
      render: (order) => (
        <span>
          <span className="block">{order.recipientName}</span>
          <span className="text-meta text-ink-faint">
            {order.recipientCity}, {countryName(order.destinationCountryCode, locale)}
          </span>
        </span>
      ),
    },
    { key: "units", header: "Units", align: "right", render: (order) => <span className="tabular-nums">{order.totalUnits}</span> },
    { key: "placed", header: "Placed", render: (order) => <span className="text-ink-soft">{formatDate(order.createdAt, locale)}</span> },
    { key: "open", header: "", align: "right", render: (order) => <OpenLink href={`/orders/${order.id}`} /> },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Orders"
        title="Orders"
        lead="Every order ships from your stock at the hub. Choose any destination your market ships to; each one gets its own tracking."
        action={
          canManage ? (
            <span className="flex flex-wrap gap-2.5">
              <ExportButton kind="orders" label="Download CSV" />
              <ButtonLink href="/orders/import" variant="ghost">
                Import a spreadsheet
              </ButtonLink>
              <ButtonLink href="/orders/new" variant="yellow" size="lg">
                New order →
              </ButtonLink>
            </span>
          ) : null
        }
      />
      <StatTileGrid>
        <StatTile tone="yellow" label="To pack" value={inGroup("packing").length} note="Waiting at the hub" dots={["pink"]} />
        <StatTile tone="sky" label="Shipping" value={inGroup("shipping").length} note="Packed, label on the way" dots={["lime"]} />
        <StatTile tone="lime" label="On the way" value={inGroup("travelling").length} note="With the carrier" dots={["orange", "teal"]} />
        <StatTile tone={funding > 0 ? "orange" : "pink"} label="Need funds" value={funding} note="Top up to ship these" dots={["yellow"]} />
      </StatTileGrid>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <FilterTabs
          label="Filter orders"
          value={group}
          onChange={setGroup}
          options={(Object.keys(ORDER_GROUP_LABELS) as OrderGroup[]).map((value) => ({ value, label: ORDER_GROUP_LABELS[value], count: inGroup(value).length }))}
        />
        <div className="w-full md:w-[300px]">
          <Field label="Search">
            {({ id }) => <Input id={id} type="search" placeholder="Order, reference, tracking or name" value={search} maxLength={64} onChange={(event) => setSearch(event.target.value)} />}
          </Field>
        </div>
      </div>
      <DataTable
        caption="Orders"
        columns={columns}
        rows={inGroup(group)}
        rowKey={(order) => order.id}
        empty={orders.isLoading ? "Loading orders…" : <EmptyState title="Nothing here" body="Orders you place, import or send through the API appear here." />}
      />
    </div>
  );
}
