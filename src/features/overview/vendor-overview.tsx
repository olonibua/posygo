"use client";

import { type DestinationView, hasPermission, type InboundSummaryView, type LotView, OPEN_INBOUND_STATUSES } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatMoney, greetingFor } from "@/lib/format";

import { useVendorWallet } from "@/features/finance/use-vendor-wallet";

import { NextStepCard } from "./next-step-card";

type DestinationFilter = "ALL" | "DOMESTIC" | "INTERNATIONAL";

export function VendorOverview() {
  const user = useCurrentUser();
  const countryCode = user.countryCode ?? "";
  const currency = user.currency ?? "USD";
  const locale = countryCode === "US" ? "en-US" : "en-GB";
  const countryName = countryCode ? (new Intl.DisplayNames([locale], { type: "region" }).of(countryCode) ?? countryCode) : "your market";
  const [filter, setFilter] = useState<DestinationFilter>("ALL");
  const canSendStock = user.vendorStatus === "ACTIVE" && hasPermission(user.role, "vendor.stock.manage");
  const stock = useStockSummary(hasPermission(user.role, "vendor.stock.read"));
  const wallet = useVendorWallet(hasPermission(user.role, "vendor.wallet.read"));

  const destinations = useQuery({ queryKey: ["destinations", countryCode], queryFn: () => apiRequest<DestinationView[]>(`/v1/countries/${countryCode}/destinations`), enabled: Boolean(countryCode) });

  const rows = useMemo(() => {
    const all = destinations.data ?? [];
    if (filter === "DOMESTIC") {
      return all.filter((destination) => destination.code === countryCode);
    }
    if (filter === "INTERNATIONAL") {
      return all.filter((destination) => destination.code !== countryCode);
    }
    return all;
  }, [destinations.data, filter, countryCode]);

  const total = destinations.data?.length ?? 0;
  const domestic = destinations.data?.filter((destination) => destination.code === countryCode).length ?? 0;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Overview"
        title={`${greetingFor(new Date())}, ${user.businessName ?? "there"}`}
        lead={`Your stock lives in ${countryName}. Everything here is billed in ${currency}, and you can ship to any destination enabled for your market.`}
        action={
          canSendStock ? (
            <ButtonLink href="/inbound/new" variant="yellow" size="lg">
              New inbound shipment →
            </ButtonLink>
          ) : (
            <Button variant="yellow" size="lg" disabled>
              New inbound shipment →
            </Button>
          )
        }
      />
      <StatTileGrid>
        <StatTile
          tone="sky"
          label="Awaiting receipt"
          value={stock.awaiting}
          note={stock.awaiting === 0 ? "No shipments on the way" : "Shipments on the way or at the dock"}
          dots={["yellow", "pink"]}
        />
        <StatTile tone="lime" label="Units in storage" value={stock.units.toLocaleString(locale)} note="Counted on arrival" dots={["orange"]} />
        <StatTile tone="yellow" label="Destinations open" value={total} note={`${domestic} domestic · ${total - domestic} international`} dots={["teal", "orange"]} />
        <StatTile tone="pink" label="Wallet balance" value={wallet.data ? formatMoney(wallet.data.balanceMinor, wallet.data.currency, locale) : "—"} note={`Held in ${currency}`} dots={["lime"]} />
      </StatTileGrid>

      <NextStepCard vendorActive={user.vendorStatus === "ACTIVE"} />

      <section aria-labelledby="destinations-heading" className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="destinations-heading" className="text-h3">
            Where you can ship
          </h2>
          <FilterTabs
            label="Filter destinations"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "ALL", label: "All", count: total },
              { value: "DOMESTIC", label: "Domestic", count: domestic },
              { value: "INTERNATIONAL", label: "International", count: total - domestic },
            ]}
          />
        </div>
        <DataTable
          caption="Destinations you can ship to"
          columns={DESTINATION_COLUMNS}
          rows={rows}
          rowKey={(row) => row.code}
          empty={destinations.isLoading ? "Loading destinations…" : <EmptyState title="No destinations yet" body="Your market has no shipping lanes enabled for this filter." />}
        />
      </section>
    </div>
  );
}

function useStockSummary(enabled: boolean) {
  const inbound = useQuery({ queryKey: ["vendor", "inbound", "list"], queryFn: () => apiRequest<InboundSummaryView[]>("/v1/vendor/inbound"), enabled });
  const lots = useQuery({ queryKey: ["vendor", "inventory", "lots"], queryFn: () => apiRequest<LotView[]>("/v1/vendor/inventory/lots"), enabled });
  return {
    awaiting: (inbound.data ?? []).filter((row) => OPEN_INBOUND_STATUSES.includes(row.status)).length,
    units: (lots.data ?? []).filter((lot) => lot.condition === "SELLABLE").reduce((sum, lot) => sum + lot.quantityAvailable, 0),
  };
}

const DESTINATION_COLUMNS: readonly Column<DestinationView>[] = [
  { key: "code", header: "Code", render: (row) => <span className="font-mono text-[15px] font-medium">{row.code}</span> },
  { key: "name", header: "Destination", render: (row) => row.name },
  { key: "customs", header: "Paperwork", render: (row) => (row.customsRequired ? <StatusPill tone="sky">Customs declaration</StatusPill> : <StatusPill tone="lime">Domestic</StatusPill>) },
  { key: "status", header: "Status", align: "right", render: () => <StatusPill tone="yellow">Enabled</StatusPill> },
];
