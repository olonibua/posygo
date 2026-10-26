"use client";

import type { VendorReturnView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { errorMessage, fieldError, formError } from "@/features/receiving/api-errors";
import { formatDate } from "@/lib/format";

import { useCancelReturn, useInstructReturn, useReturnTracking } from "./use-returns";

type Split = { restock: string; dispose: string; donate: string };

const count = (value: string) => Number(value) || 0;
const digits = (value: string) => value.replace(/\D/g, "").slice(0, 4);

function SendBack({ entry, canManage, locale }: { entry: VendorReturnView; canManage: boolean; locale: string }) {
  const [tracking, setTracking] = useState({ carrier: entry.carrier ?? "", trackingNumber: entry.trackingNumber ?? "" });
  const save = useReturnTracking(entry.id);
  const cancel = useCancelReturn(entry.id);
  const address = entry.returnAddress;
  return (
    <div className="flex flex-col gap-4 border-t border-line pt-4">
      {address ? (
        <address className="rounded-card bg-sky/30 px-4 py-3 text-small not-italic">
          <span className="block text-meta uppercase text-ink-faint">Send it to</span>
          <span className="block font-medium">{address.name}</span>
          {address.addressLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
          <span className="block">
            {address.city} {address.postalCode}
          </span>
          <span className="mt-1 block font-mono font-semibold">Write {entry.reference} on the parcel</span>
        </address>
      ) : null}
      {canManage ? (
        <>
          <FormAlert message={formError(save.error) ?? errorMessage(cancel.error)} />
          <div className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Field label="Carrier" error={fieldError(save.error, "carrier")}>
              {({ id }) => <Input id={id} maxLength={60} value={tracking.carrier} onChange={(event) => setTracking({ ...tracking, carrier: event.target.value })} />}
            </Field>
            <Field label="Tracking number" error={fieldError(save.error, "trackingNumber")}>
              {({ id }) => <Input id={id} maxLength={64} value={tracking.trackingNumber} onChange={(event) => setTracking({ ...tracking, trackingNumber: event.target.value })} />}
            </Field>
            <Button variant="lime" loading={save.isPending} onClick={() => save.mutate({ carrier: tracking.carrier.trim(), trackingNumber: tracking.trackingNumber.trim() })}>
              Save tracking
            </Button>
          </div>
          <p className="text-meta font-normal text-ink-faint">If nothing arrives by {formatDate(entry.receiveBy, locale)} we close the return and give the fee back.</p>
          <div className="flex justify-end">
            <Button variant="ghost" loading={cancel.isPending} onClick={() => cancel.mutate(undefined)}>
              Cancel return
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Instructions({ entry, locale }: { entry: VendorReturnView; locale: string }) {
  const arrived = entry.lines.filter((line) => (line.receivedQuantity ?? 0) > 0);
  const [splits, setSplits] = useState<Record<string, Split>>(() => Object.fromEntries(arrived.map((line) => [line.id, { restock: String(line.receivedQuantity), dispose: "0", donate: "0" }])));
  const instruct = useInstructReturn(entry.id);
  const set = (lineId: string, patch: Partial<Split>) => setSplits((current) => ({ ...current, [lineId]: { ...current[lineId]!, ...patch } }));
  const balanced = arrived.every((line) => {
    const split = splits[line.id]!;
    return count(split.restock) + count(split.dispose) + count(split.donate) === line.receivedQuantity;
  });
  return (
    <div className="flex flex-col gap-4 border-t border-line pt-4">
      <p className="text-small font-medium">
        What should we do with what arrived?{entry.instructBy ? ` If we don't hear from you by ${formatDate(entry.instructBy, locale)}, everything goes back on sale.` : ""}
      </p>
      <FormAlert message={formError(instruct.error)} />
      {arrived.map((line) => {
        const split = splits[line.id]!;
        return (
          <fieldset key={line.id} className="grid gap-3 sm:grid-cols-[1fr_repeat(3,110px)] sm:items-end">
            <legend className="sr-only">{line.productName}</legend>
            <span className="text-small">
              <span className="block font-medium">{line.productName}</span>
              <span className="text-meta text-ink-faint">{line.receivedQuantity} arrived</span>
            </span>
            <Field label="Back on sale">{({ id }) => <Input id={id} inputMode="numeric" value={split.restock} onChange={(event) => set(line.id, { restock: digits(event.target.value) })} />}</Field>
            <Field label="Dispose">{({ id }) => <Input id={id} inputMode="numeric" value={split.dispose} onChange={(event) => set(line.id, { dispose: digits(event.target.value) })} />}</Field>
            <Field label="Donate">{({ id }) => <Input id={id} inputMode="numeric" value={split.donate} onChange={(event) => set(line.id, { donate: digits(event.target.value) })} />}</Field>
          </fieldset>
        );
      })}
      <div className="flex items-center justify-end gap-3">
        {!balanced ? <span className="text-meta text-danger">Each item&apos;s choices must add up to what arrived.</span> : null}
        <Button
          variant="yellow"
          loading={instruct.isPending}
          disabled={!balanced}
          onClick={() =>
            instruct.mutate({
              lines: arrived.map((line) => ({ lineId: line.id, restock: count(splits[line.id]!.restock), dispose: count(splits[line.id]!.dispose), donate: count(splits[line.id]!.donate) })),
            })
          }
        >
          Send instructions
        </Button>
      </div>
    </div>
  );
}

export function VendorReturnActions({ entry, canManage, locale }: { entry: VendorReturnView; canManage: boolean; locale: string }) {
  if (entry.status === "REQUESTED") {
    return <SendBack entry={entry} canManage={canManage} locale={locale} />;
  }
  return canManage && entry.status === "RECEIVED" ? <Instructions entry={entry} locale={locale} /> : null;
}
