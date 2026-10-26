"use client";

import type { CreateTransferInput, TransferStatus, TransferView, WarehouseView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Select, Textarea } from "@/components/ui/form-controls";
import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRows } from "@/components/ui/skeleton";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { errorMessage, fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";

import { TransferCard } from "./transfer-card";
import { useAdminTransfers, useCustodyMutation } from "./use-custody";

const FILTERS: ReadonlyArray<{ value: TransferStatus; label: string }> = [
  { value: "REQUESTED", label: "To send" },
  { value: "DISPATCHED", label: "On the way" },
  { value: "RECEIVED", label: "Arrived" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function AdminTransfersPage() {
  const [filter, setFilter] = useState<TransferStatus>("REQUESTED");
  const transfers = useAdminTransfers(filter);
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Operations"
        title="Transfers"
        lead="Move a hub's free stock to another hub or warehouse. The sender seals and photographs it, and the receiver counts it in without seeing our numbers."
      />
      <NewTransfer onCreated={() => setFilter("REQUESTED")} />
      <FilterTabs label="Filter transfers" options={FILTERS} value={filter} onChange={setFilter} />
      {transfers.isLoading ? (
        <LoadingRows columns={3} />
      ) : (transfers.data ?? []).length === 0 ? (
        <EmptyState title="Nothing here" body="Transfers you request appear here." />
      ) : (
        <ul className="stagger grid gap-4 xl:grid-cols-2">
          {transfers.data!.map((transfer) => (
            <li key={transfer.id} className="motion-rise">
              <TransferCard transfer={transfer}>{transfer.actions.includes("CANCEL") ? <CancelTransfer transfer={transfer} /> : null}</TransferCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NewTransfer({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ fromWarehouseId: "", toWarehouseId: "", reason: "" });
  const warehouses = useQuery({ queryKey: ["admin", "warehouses"], queryFn: () => apiRequest<WarehouseView[]>("/v1/warehouse/warehouses") });
  const create = useCustodyMutation<CreateTransferInput, TransferView>((input) => ({ path: "/v1/admin/transfers", body: input }), "Transfer requested. The sending hub has been emailed.");
  const set = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));
  const from = warehouses.data?.find((warehouse) => warehouse.id === form.fromWarehouseId);
  const destinations = (warehouses.data ?? []).filter((warehouse) => warehouse.active && warehouse.id !== form.fromWarehouseId && (!from || warehouse.countryCode === from.countryCode));

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    create.mutate(form, {
      onSuccess: () => {
        setForm({ fromWarehouseId: "", toWarehouseId: "", reason: "" });
        onCreated();
      },
    });
  }

  const label = (warehouse: WarehouseView) => `${warehouse.name} (${warehouse.code})${warehouse.partnerId ? " · partner hub" : ""}`;
  return (
    <Paper className="px-6 py-5">
      <Stamp>New transfer</Stamp>
      <form noValidate onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormAlert message={formError(create.error) ?? errorMessage(warehouses.error)} />
        </div>
        <Field label="From" error={fieldError(create.error, "fromWarehouseId")}>
          {({ id, invalid }) => (
            <Select id={id} aria-invalid={invalid} value={form.fromWarehouseId} onChange={(event) => set({ fromWarehouseId: event.target.value, toWarehouseId: "" })}>
              <option value="">Choose where the stock is</option>
              {(warehouses.data ?? []).map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {label(warehouse)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="To" error={fieldError(create.error, "toWarehouseId")}>
          {({ id, invalid }) => (
            <Select id={id} aria-invalid={invalid} disabled={!from} value={form.toWarehouseId} onChange={(event) => set({ toWarehouseId: event.target.value })}>
              <option value="">Choose the destination</option>
              {destinations.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {label(warehouse)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <div className="md:col-span-2">
          <Field label="Why" hint="The sending hub sees this." error={fieldError(create.error, "reason")}>
            {({ id, describedBy, invalid }) => (
              <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[72px]" value={form.reason} onChange={(event) => set({ reason: event.target.value })} />
            )}
          </Field>
        </div>
        <p className="text-small text-ink-soft md:col-span-1">Every unit that isn&apos;t held for an order moves. The destination must have room under its tier.</p>
        <div className="flex justify-end md:col-span-1">
          <Button type="submit" variant="lime" loading={create.isPending} disabled={!form.fromWarehouseId || !form.toWarehouseId}>
            Request transfer
          </Button>
        </div>
      </form>
    </Paper>
  );
}

function CancelTransfer({ transfer }: { transfer: TransferView }) {
  const cancel = useCustodyMutation<void, TransferView>(() => ({ path: `/v1/admin/transfers/${transfer.id}/cancel` }), "Transfer cancelled");
  return (
    <div className="flex items-center justify-end gap-3 border-t border-line pt-3">
      <FormAlert message={formError(cancel.error)} />
      <Button variant="ghost" loading={cancel.isPending} onClick={() => cancel.mutate(undefined)}>
        Cancel transfer
      </Button>
    </div>
  );
}
