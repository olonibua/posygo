"use client";

import type { DiscountCodeInput, DiscountCodeView, DiscountKind } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { toMinor } from "@/features/finance/money-input";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { formatDate, formatMoney } from "@/lib/format";

import { useCreateDiscount, useDiscountCodes, useToggleDiscount } from "../use-store-returns";

const EMPTY = { code: "", kind: "PERCENT" as DiscountKind, value: "", minimum: "", uses: "", ends: "" };

function toInput(form: typeof EMPTY, currency: string): DiscountCodeInput | null {
  const percent = Number(form.value);
  const amount = toMinor(form.value, currency);
  const minimum = form.minimum.trim() ? toMinor(form.minimum, currency) : 0;
  if ((form.kind === "PERCENT" && !(percent >= 1 && percent <= 90)) || (form.kind === "FIXED" && !amount) || minimum === null) {
    return null;
  }
  return {
    code: form.code.trim().toUpperCase(),
    kind: form.kind,
    ...(form.kind === "PERCENT" ? { percentBps: Math.round(percent * 100) } : { amountMinor: amount! }),
    minGoodsMinor: minimum,
    ...(form.uses.trim() ? { maxRedemptions: Number(form.uses) } : {}),
    ...(form.ends ? { endsAt: new Date(`${form.ends}T23:59:59`).toISOString() } : {}),
  };
}

function NewCodeForm({ currency }: { currency: string }) {
  const [form, setForm] = useState(EMPTY);
  const create = useCreateDiscount();
  const set = (patch: Partial<typeof EMPTY>) => setForm((current) => ({ ...current, ...patch }));
  const input = toInput(form, currency);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (input) {
      create.mutate(input, { onSuccess: () => setForm(EMPTY) });
    }
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <FormAlert message={formError(create.error)} />
      <div className="flex flex-wrap gap-2" role="group" aria-label="Discount type">
        <ChoiceChip selected={form.kind === "PERCENT"} tone="lime" onToggle={() => set({ kind: "PERCENT", value: "" })}>
          Percentage off
        </ChoiceChip>
        <ChoiceChip selected={form.kind === "FIXED"} tone="sky" onToggle={() => set({ kind: "FIXED", value: "" })}>
          Amount off
        </ChoiceChip>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Code" hint="Letters, numbers and hyphens." error={fieldError(create.error, "code")}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} className="uppercase" maxLength={40} aria-describedby={describedBy} aria-invalid={invalid} value={form.code} onChange={(event) => set({ code: event.target.value })} />
          )}
        </Field>
        <Field label={form.kind === "PERCENT" ? "Percent off" : `Amount off (${currency})`} hint={form.kind === "PERCENT" ? "Between 1 and 90." : undefined}>
          {({ id, describedBy }) => <Input id={id} inputMode="decimal" aria-describedby={describedBy} value={form.value} onChange={(event) => set({ value: event.target.value })} />}
        </Field>
        <Field label={`Minimum spend (${currency}, optional)`}>
          {({ id }) => <Input id={id} inputMode="decimal" value={form.minimum} onChange={(event) => set({ minimum: event.target.value })} />}
        </Field>
        <Field label="Times it can be used (optional)">
          {({ id }) => <Input id={id} inputMode="numeric" value={form.uses} onChange={(event) => set({ uses: event.target.value.replace(/\D/g, "") })} />}
        </Field>
        <Field label="Last day (optional)" error={fieldError(create.error, "endsAt")}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="date" aria-describedby={describedBy} aria-invalid={invalid} value={form.ends} onChange={(event) => set({ ends: event.target.value })} />
          )}
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="lime" loading={create.isPending} disabled={!input || form.code.trim().length < 3}>
          Create code
        </Button>
      </div>
    </form>
  );
}

export function DiscountCodesPanel({ currency, locale, editable }: { currency: string; locale: string; editable: boolean }) {
  const codes = useDiscountCodes();
  const toggle = useToggleDiscount();
  const columns: Column<DiscountCodeView>[] = [
    { key: "code", header: "Code", render: (row) => <span className="font-mono font-medium">{row.code}</span> },
    {
      key: "value",
      header: "Discount",
      render: (row) => (
        <span>
          {row.kind === "PERCENT" ? `${(row.percentBps ?? 0) / 100}% off` : `${formatMoney(row.amountMinor ?? 0, currency, locale)} off`}
          {row.minGoodsMinor > 0 ? <span className="block text-meta text-ink-faint">Spend {formatMoney(row.minGoodsMinor, currency, locale)} or more</span> : null}
        </span>
      ),
    },
    { key: "used", header: "Used", align: "right", render: (row) => <span className="tabular-nums">{row.maxRedemptions ? `${row.redemptions} of ${row.maxRedemptions}` : row.redemptions}</span> },
    { key: "ends", header: "Ends", render: (row) => <span className="text-ink-soft">{row.endsAt ? formatDate(row.endsAt, locale) : "No end date"}</span> },
    { key: "status", header: "", render: (row) => (row.active ? <StatusPill tone="lime">On</StatusPill> : <StatusPill tone="cocoa">Off</StatusPill>) },
    {
      key: "action",
      header: "",
      align: "right",
      render: (row) =>
        editable ? (
          <Button variant="ghost" disabled={toggle.isPending && toggle.variables?.id === row.id} onClick={() => toggle.mutate({ id: row.id, active: !row.active })}>
            {row.active ? "Switch off" : "Switch on"}
          </Button>
        ) : null,
    },
  ];
  return (
    <section aria-labelledby="discounts-heading" className="flex flex-col gap-3">
      <h2 id="discounts-heading" className="text-h3">
        Discount codes
      </h2>
      {editable ? (
        <Paper className="px-6 py-5">
          <Stamp>New code</Stamp>
          <div className="mt-4">
            <NewCodeForm currency={currency} />
          </div>
        </Paper>
      ) : null}
      <DataTable
        caption="Discount codes"
        columns={columns}
        rows={codes.data ?? []}
        rowKey={(row) => row.id}
        loading={codes.isLoading}
        empty={<EmptyState title="No codes yet" body="Create a code to share with your customers. Discounts come out of your share of the sale." />}
      />
    </section>
  );
}
