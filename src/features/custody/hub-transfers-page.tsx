"use client";

import type { DispatchTransferInput, ReceiveTransferInput, TransferView } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRows } from "@/components/ui/skeleton";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { PhotoCollector } from "@/features/receiving/photo-collector";

import { TransferCard } from "./transfer-card";
import { type HubRoute, useCustodyMutation, useHubTransfers } from "./use-custody";

export function HubTransfersPage({ route }: { route: HubRoute }) {
  const transfers = useHubTransfers(route);
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Your hub"
        title="Transfers"
        lead="Stock moving between hubs. Seal the boxes and photograph them when they leave. When stock arrives, count every item before you enter the numbers."
      />
      {transfers.isLoading ? (
        <LoadingRows columns={3} />
      ) : (transfers.data ?? []).length === 0 ? (
        <EmptyState title="No transfers" body="When we ask you to send stock, or stock is on its way to you, it appears here." />
      ) : (
        <ul className="stagger grid gap-4 xl:grid-cols-2">
          {transfers.data!.map((transfer) => (
            <li key={transfer.id} className="motion-rise">
              <TransferCard transfer={transfer}>
                {transfer.actions.includes("DISPATCH") ? <DispatchForm route={route} transfer={transfer} /> : null}
                {transfer.actions.includes("RECEIVE") ? <ReceiveForm route={route} transfer={transfer} /> : null}
              </TransferCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DispatchForm({ route, transfer }: { route: HubRoute; transfer: TransferView }) {
  const [form, setForm] = useState({ carrier: "", trackingNumber: "", sealNumber: "" });
  const [photoFileIds, setPhotoFileIds] = useState<string[]>([]);
  const dispatch = useCustodyMutation<DispatchTransferInput, TransferView>(
    (input) => ({ path: `/v1/${route}/transfers/${transfer.id}/dispatch`, body: input }),
    "Sent. The receiving hub can now count it in.",
  );
  const set = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    dispatch.mutate({ ...form, photoFileIds });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3 border-t border-line pt-4">
      <FormAlert message={formError(dispatch.error)} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Carrier" error={fieldError(dispatch.error, "carrier")}>
          {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={form.carrier} onChange={(event) => set({ carrier: event.target.value })} />}
        </Field>
        <Field label="Tracking number" error={fieldError(dispatch.error, "trackingNumber")}>
          {({ id, invalid }) => <Input id={id} spellCheck={false} aria-invalid={invalid} value={form.trackingNumber} onChange={(event) => set({ trackingNumber: event.target.value })} />}
        </Field>
        <Field label="Seal number" error={fieldError(dispatch.error, "sealNumber")}>
          {({ id, invalid }) => <Input id={id} spellCheck={false} aria-invalid={invalid} value={form.sealNumber} onChange={(event) => set({ sealNumber: event.target.value })} />}
        </Field>
      </div>
      <PhotoCollector label="Photo of the sealed boxes" hint="Show the seal and the labels clearly." max={6} error={fieldError(dispatch.error, "photoFileIds")} onChange={setPhotoFileIds} />
      <div className="flex justify-end">
        <Button type="submit" variant="lime" loading={dispatch.isPending} disabled={photoFileIds.length === 0 || !form.sealNumber}>
          Mark as sent
        </Button>
      </div>
    </form>
  );
}

function ReceiveForm({ route, transfer }: { route: HubRoute; transfer: TransferView }) {
  const [counts, setCounts] = useState<Record<string, string>>({});
  const receive = useCustodyMutation<ReceiveTransferInput, TransferView>(
    (input) => ({ path: `/v1/${route}/transfers/${transfer.id}/receive`, body: input }),
    "Counted in. The stock is now at your hub.",
  );
  const complete = transfer.lines.every((line) => counts[line.id] !== undefined && counts[line.id] !== "");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    receive.mutate({ lines: transfer.lines.map((line) => ({ lineId: line.id, quantityReceived: Number(counts[line.id] ?? 0) })) });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3 border-t border-line pt-4">
      <FormAlert message={formError(receive.error) ?? fieldError(receive.error, "lines") ?? null} />
      <p className="text-small text-ink-soft">Check seal {transfer.sealNumber} is unbroken, then count each item. Anything missing is raised with the sending hub automatically.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {transfer.lines.map((line) => (
          <Field key={line.id} label={`${line.productName} · ${line.lotCode}`}>
            {({ id }) => (
              <Input id={id} inputMode="numeric" value={counts[line.id] ?? ""} onChange={(event) => setCounts((current) => ({ ...current, [line.id]: event.target.value.replace(/\D/g, "") }))} />
            )}
          </Field>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="lime" loading={receive.isPending} disabled={!complete}>
          Count it in
        </Button>
      </div>
    </form>
  );
}
