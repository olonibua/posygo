"use client";

import { type CreateTaxObligationInput, TAX_CADENCE_LABELS, TAX_CADENCES, type TaxCadence } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Select, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { toast } from "@/lib/toast/toast-store";

import { useTaxChange } from "./tax-api";

const EMPTY = { title: "", authority: "", description: "", cadence: "YEARLY" as TaxCadence, dueRule: "", guidanceUrl: "", owner: "", firstDueOn: "" };

export function AddObligationForm({ countryCode, onClose }: { countryCode: string; onClose: () => void }) {
  const [form, setForm] = useState(EMPTY);
  const add = useTaxChange<CreateTaxObligationInput>(() => ({ path: `/v1/admin/tax/countries/${countryCode}/obligations`, method: "POST" }), () => {
    toast.success("Obligation added", form.title);
    onClose();
  });
  const set = (key: keyof typeof EMPTY) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const optional = (value: string) => value.trim() || undefined;
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    add.mutate({ ...form, guidanceUrl: optional(form.guidanceUrl), owner: optional(form.owner), firstDueOn: optional(form.firstDueOn) });
  }
  const text = (key: keyof typeof EMPTY, label: string, hint?: string) => (
    <Field label={label} hint={hint} error={fieldError(add.error, key)}>
      {(control) => <Input id={control.id} aria-describedby={control.describedBy} aria-invalid={control.invalid} value={form[key]} onChange={set(key)} />}
    </Field>
  );

  return (
    <Paper className="px-6 py-6">
      <Stamp>Add an obligation</Stamp>
      <form noValidate onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2 md:items-start">
        <div className="md:col-span-2">
          <FormAlert message={formError(add.error)} />
        </div>
        {text("title", "Title")}
        {text("authority", "Authority", "Who you file with")}
        <div className="md:col-span-2">
          <Field label="What it is" error={fieldError(add.error, "description")}>
            {(control) => <Textarea id={control.id} aria-describedby={control.describedBy} aria-invalid={control.invalid} value={form.description} onChange={set("description")} />}
          </Field>
        </div>
        <Field label="How often" error={fieldError(add.error, "cadence")}>
          {(control) => (
            <Select id={control.id} aria-describedby={control.describedBy} value={form.cadence} onChange={set("cadence")}>
              {TAX_CADENCES.map((cadence) => (
                <option key={cadence} value={cadence}>
                  {TAX_CADENCE_LABELS[cadence]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {text("dueRule", "When it's due", "For example, 9 months after the year end")}
        <Field label="First due date" hint="Optional" error={fieldError(add.error, "firstDueOn")}>
          {(control) => <Input type="date" id={control.id} aria-describedby={control.describedBy} aria-invalid={control.invalid} value={form.firstDueOn} onChange={set("firstDueOn")} />}
        </Field>
        {text("owner", "Owner", "Optional")}
        <div className="md:col-span-2">{text("guidanceUrl", "Guidance link", "Optional")}</div>
        <div className="flex justify-end gap-3 md:col-span-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={add.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="yellow" loading={add.isPending}>
            Add obligation
          </Button>
        </div>
      </form>
    </Paper>
  );
}
