"use client";

import { hasPermission, type LotView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, FormAlert, Select } from "@/components/ui/form-controls";
import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { errorMessage } from "@/features/receiving/api-errors";
import { CONDITION_DISPLAY } from "@/features/stock/display";
import { useCurrentUser } from "@/lib/auth/use-current-user";

import { CustodyHistory } from "./custody-history";
import { PlaceLotControl } from "./place-lot-control";
import { useWarehouseLots } from "./use-lots";
import { useLocations, useWarehouses } from "./use-warehouses";

type View = "unplaced" | "all";

export function StockPage() {
  const user = useCurrentUser();
  const canPlace = hasPermission(user.role, "inventory.place");
  const warehouses = useWarehouses();
  const [chosen, setChosen] = useState<string | null>(null);
  const warehouseId = chosen ?? (warehouses.data?.length === 1 ? warehouses.data[0]!.id : null);
  const [view, setView] = useState<View>("unplaced");
  const [history, setHistory] = useState<LotView | null>(null);
  const { lots, place } = useWarehouseLots(warehouseId, view === "unplaced");
  const locations = useLocations(warehouseId);

  const columns: Column<LotView>[] = [
    { key: "vendor", header: "Vendor", render: (row) => row.businessName },
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
    { key: "available", header: "Available", align: "right", render: (row) => row.quantityAvailable },
    { key: "reserved", header: "Reserved", align: "right", render: (row) => row.quantityReserved },
    { key: "location", header: "Location", render: (row) => (row.locationCode ? <span className="font-mono">{row.locationCode}</span> : <span className="text-ink-faint">Not put away</span>) },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (row) => (
        <span className="inline-flex items-center gap-2">
          {canPlace ? <PlaceLotControl lot={row} locations={locations.data ?? []} busy={place.isPending} onPlace={(locationId) => place.mutate({ lotId: row.id, locationId })} /> : null}
          <Button variant="ghost" onClick={() => setHistory(row)}>
            History
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Warehouse" title="Stock" lead="Put newly received lots on a shelf and move them when you need to. Every step is recorded." />
      {warehouses.data && warehouses.data.length > 1 ? (
        <div className="max-w-[360px]">
          <Field label="Warehouse">
            {({ id }) => (
              <Select id={id} value={warehouseId ?? ""} onChange={(event) => setChosen(event.target.value || null)}>
                <option value="">Choose a warehouse</option>
                {warehouses.data.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} · {warehouse.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      ) : null}
      <FilterTabs
        label="Which stock"
        value={view}
        onChange={setView}
        options={[
          { value: "unplaced", label: "Waiting to be put away" },
          { value: "all", label: "All stock" },
        ]}
      />
      <FormAlert message={errorMessage(place.error)} />
      {history ? <CustodyHistory lotId={history.id} lotCode={history.code} onClose={() => setHistory(null)} /> : null}
      <DataTable
        caption="Stock lots"
        columns={columns}
        rows={lots.data ?? []}
        rowKey={(row) => row.id}
        loading={lots.isLoading}
        empty={!warehouseId ? "Choose a warehouse to see its stock." : <EmptyState title="All put away" body="Lots appear here as soon as a shipment is counted." />}
      />
    </div>
  );
}
