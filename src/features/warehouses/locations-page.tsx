"use client";

import { hasPermission, type LocationView } from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { countryName } from "@/features/onboarding/display";
import { errorMessage, fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";

import { locationsKey, useLocations, useWarehouses } from "./use-warehouses";

export function LocationsPage({ warehouseId }: { warehouseId: string }) {
  const user = useCurrentUser();
  const canManage = hasPermission(user.role, "warehouse.locations.manage");
  const queryClient = useQueryClient();
  const warehouse = useWarehouses().data?.find((entry) => entry.id === warehouseId);
  const locations = useLocations(warehouseId);
  const refresh = () => void queryClient.invalidateQueries({ queryKey: locationsKey(warehouseId) });
  const toggle = useMutation({
    mutationFn: (location: LocationView) => apiRequest(`/v1/warehouse/warehouses/${warehouseId}/locations/${location.id}/active`, { method: "POST", body: { active: !location.active } }),
    onSuccess: refresh,
  });

  const columns: Column<LocationView>[] = [
    { key: "code", header: "Code", render: (row) => <span className="font-mono">{row.code}</span> },
    { key: "label", header: "Label", render: (row) => row.label },
    { key: "lots", header: "Stock lots", align: "right", render: (row) => row.lotCount },
    { key: "status", header: "Status", render: (row) => <StatusPill tone={row.active ? "lime" : "pink"}>{row.active ? "Open" : "Closed"}</StatusPill> },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (row) =>
        canManage ? (
          <Button variant="ghost" onClick={() => toggle.mutate(row)}>
            {row.active ? "Close" : "Reopen"}
          </Button>
        ) : null,
    },
  ];

  if (locations.isError) {
    return <p className="text-ink-soft">This warehouse isn&apos;t available to you.</p>;
  }
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp={warehouse ? `${warehouse.code} · ${countryName(warehouse.countryCode)}` : "Warehouse"}
        title={warehouse?.name ?? "Locations"}
        lead="Shelves and bins where stock is put away. A location can only be closed once it's empty."
      />
      <FormAlert message={errorMessage(toggle.error)} />
      <DataTable
        caption="Locations"
        columns={columns}
        rows={locations.data ?? []}
        rowKey={(row) => row.id}
        loading={locations.isLoading}
        empty={<EmptyState title="No locations yet" body="Add the shelves and bins in this warehouse." />}
      />
      {canManage ? <NewLocationForm warehouseId={warehouseId} onCreated={refresh} /> : null}
    </div>
  );
}

function NewLocationForm({ warehouseId, onCreated }: { warehouseId: string; onCreated: () => void }) {
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const create = useMutation({
    mutationFn: () => apiRequest(`/v1/warehouse/warehouses/${warehouseId}/locations`, { method: "POST", body: { code, label } }),
    onSuccess: () => {
      setCode("");
      setLabel("");
      onCreated();
    },
  });
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    create.mutate();
  }
  return (
    <Paper className="px-6 py-6">
      <Stamp>Add a location</Stamp>
      <form noValidate onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-[200px_1fr_auto] md:items-start">
        <div className="md:col-span-3">
          <FormAlert message={formError(create.error)} />
        </div>
        <Field label="Code" hint="For example A-01." error={fieldError(create.error, "code")}>
          {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={code} maxLength={32} onChange={(event) => setCode(event.target.value)} />}
        </Field>
        <Field label="Label" error={fieldError(create.error, "label")}>
          {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={label} maxLength={80} placeholder="Aisle A, bay 1" onChange={(event) => setLabel(event.target.value)} />}
        </Field>
        <Button type="submit" variant="yellow" className="md:mt-7" loading={create.isPending}>
          Add location
        </Button>
      </form>
    </Paper>
  );
}
