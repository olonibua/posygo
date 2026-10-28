"use client";

import { hasPermission, type LotView, type MovementView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Chip, StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { HubSignals } from "@/features/custody/hub-signals";
import { ReportProblemForm } from "@/features/custody/report-problem-form";
import { ExportButton } from "@/features/notifications/export-button";
import { useCountryScope } from "@/features/seller-countries/selected-country";
import { CONDITION_DISPLAY, MOVEMENT_LABELS } from "@/features/stock/display";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate } from "@/lib/format";

import { LotHistory } from "./lot-history";

export const LOTS_KEY = ["vendor", "inventory", "lots"] as const;

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

const MOVEMENT_COLUMNS: readonly Column<MovementView>[] = [
  { key: "when", header: "When", render: (row) => <span className="text-ink-soft">{formatDate(row.createdAt, "en-GB")}</span> },
  { key: "what", header: "What happened", render: (row) => MOVEMENT_LABELS[row.type] },
  { key: "product", header: "Product", render: (row) => <span className="font-mono text-small">{row.productCode}</span> },
  { key: "lot", header: "Lot", render: (row) => <span className="font-mono text-meta text-ink-faint">{row.lotCode}</span> },
  { key: "change", header: "Change", align: "right", render: (row) => <span className="tabular-nums">{row.deltaAvailable === 0 ? "—" : signed(row.deltaAvailable)}</span> },
];

export function InventoryPage() {
  const user = useCurrentUser();
  const canReport = hasPermission(user.role, "vendor.orders.manage");
  const [open, setOpen] = useState<LotView | null>(null);
  const [reporting, setReporting] = useState<LotView | null>(null);
  const { code, ready, path } = useCountryScope();
  const lots = useQuery({ queryKey: [...LOTS_KEY, code], queryFn: () => apiRequest<LotView[]>(path("/v1/vendor/inventory/lots")), enabled: ready });
  const movements = useQuery({ queryKey: ["vendor", "inventory", "movements", code], queryFn: () => apiRequest<MovementView[]>(path("/v1/vendor/inventory/movements")), enabled: ready });
  const all = lots.data ?? [];
  const total = (condition: LotView["condition"]) => all.filter((lot) => lot.condition === condition).reduce((sum, lot) => sum + lot.quantityAvailable, 0);
  const unplaced = all.filter((lot) => lot.locationCode === null).length;

  const columns: Column<LotView>[] = [
    {
      key: "product",
      header: "Product",
      render: (row) => (
        <span>
          <span className="block font-medium">{row.productName}</span>
          <span className="font-mono text-meta text-ink-faint">{row.code}</span>
        </span>
      ),
    },
    { key: "condition", header: "Condition", render: (row) => <StatusPill tone={CONDITION_DISPLAY[row.condition].tone}>{CONDITION_DISPLAY[row.condition].label}</StatusPill> },
    { key: "available", header: "Available", align: "right", render: (row) => <span className="tabular-nums">{row.quantityAvailable}</span> },
    { key: "reserved", header: "Reserved", align: "right", render: (row) => <span className="tabular-nums">{row.quantityReserved}</span> },
    {
      key: "location",
      header: "Shelf",
      render: (row) => (row.locationCode ? <span className="font-mono text-small">{row.locationCode}</span> : <span className="text-ink-soft">Being put away</span>),
    },
    { key: "received", header: "Arrived", render: (row) => <span className="text-ink-soft">{formatDate(row.receivedAt, "en-GB")}</span> },
    {
      key: "history",
      header: "",
      align: "right",
      render: (row) => (
        <span className="inline-flex gap-1">
          <Button variant="ghost" onClick={() => setOpen(row)} aria-expanded={open?.id === row.id}>
            History
          </Button>
          {canReport ? (
            <Button variant="ghost" onClick={() => setReporting(row)} aria-expanded={reporting?.id === row.id}>
              Report
            </Button>
          ) : null}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Inventory"
        title="What's at your hubs"
        lead="Every unit is counted on arrival and tracked each time it moves. Open a lot's history to see its full chain of custody."
        action={
          <span className="flex flex-wrap items-center gap-2.5">
            <Chip tone="lime">Insured stock</Chip>
            <ExportButton kind="inventory" label="Download CSV" />
          </span>
        }
      />
      <StatTileGrid>
        <StatTile tone="lime" label="Ready to sell" value={total("SELLABLE")} note="Sellable units" dots={["orange"]} />
        <StatTile tone="pink" label="Damaged" value={total("DAMAGED")} note="Set aside on arrival" dots={["yellow"]} />
        <StatTile tone="sky" label="Lots" value={all.length} note="Batches with stock" dots={["pink", "lime"]} />
        <StatTile tone="yellow" label="Being put away" value={unplaced} note="Not on a shelf yet" dots={["teal"]} />
      </StatTileGrid>
      {open ? <LotHistory key={open.id} lotId={open.id} lotCode={open.code} onClose={() => setOpen(null)} /> : null}
      {reporting ? (
        <ReportProblemForm
          key={reporting.id}
          subject={{ lotId: reporting.id }}
          title={`${reporting.productName} · ${reporting.code}`}
          maxQuantity={reporting.quantityAvailable + reporting.quantityReserved}
          onClose={() => setReporting(null)}
        />
      ) : null}
      <DataTable
        caption="Stock by lot"
        columns={columns}
        rows={all}
        rowKey={(row) => row.id}
        empty={lots.isLoading ? "Loading stock…" : <EmptyState title="No stock yet" body="Stock appears here once the hub has counted your first shipment." />}
      />
      <HubSignals countryCode={user.countryCode} />
      <section aria-labelledby="movements-heading" className="flex flex-col gap-3">
        <h2 id="movements-heading" className="text-h3">
          Recent movements
        </h2>
        <DataTable caption="Recent stock movements" columns={MOVEMENT_COLUMNS} rows={movements.data ?? []} rowKey={(row) => row.id} empty="No movements yet." />
      </section>
    </div>
  );
}
