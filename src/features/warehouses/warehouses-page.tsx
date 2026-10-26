"use client";

import { hasPermission, type WarehouseView } from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { FormAlert } from "@/components/ui/form-controls";
import { EmptyState, OpenLink } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { countryName } from "@/features/onboarding/display";
import { errorMessage } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";

import { NewWarehouseForm } from "./new-warehouse-form";
import { useWarehouses, WAREHOUSES_KEY } from "./use-warehouses";

export function WarehousesPage() {
  const user = useCurrentUser();
  const canManage = hasPermission(user.role, "warehouses.manage");
  const queryClient = useQueryClient();
  const warehouses = useWarehouses();
  const toggle = useMutation({
    mutationFn: (warehouse: WarehouseView) => apiRequest(`/v1/warehouse/warehouses/${warehouse.id}/active`, { method: "POST", body: { active: !warehouse.active } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: WAREHOUSES_KEY }),
  });

  const columns: Column<WarehouseView>[] = [
    { key: "code", header: "Code", render: (row) => <span className="font-mono">{row.code}</span> },
    { key: "name", header: "Name", render: (row) => row.name },
    { key: "country", header: "Country", render: (row) => countryName(row.countryCode) },
    { key: "city", header: "City", render: (row) => <span className="text-ink-soft">{row.city}</span> },
    { key: "status", header: "Status", render: (row) => <StatusPill tone={row.active ? "lime" : "pink"}>{row.active ? "Open" : "Closed"}</StatusPill> },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (row) => (
        <span className="inline-flex items-center gap-3">
          {canManage ? (
            <Button variant="ghost" onClick={() => toggle.mutate(row)}>
              {row.active ? "Close" : "Reopen"}
            </Button>
          ) : null}
          <OpenLink href={`/admin/warehouses/${row.id}`}>Locations</OpenLink>
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Network" title="Warehouses" lead="Each market's warehouse and the shelf locations stock is put away into." />
      <FormAlert message={errorMessage(toggle.error)} />
      <DataTable
        caption="Warehouses"
        columns={columns}
        rows={warehouses.data ?? []}
        rowKey={(row) => row.id}
        loading={warehouses.isLoading}
        empty={<EmptyState title="No warehouses yet" body="Warehouses you can work in will show up here." />}
      />
      {canManage ? <NewWarehouseForm /> : null}
    </div>
  );
}
