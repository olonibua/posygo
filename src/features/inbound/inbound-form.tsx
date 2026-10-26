"use client";

import type { InboundDetailView, InboundInput, ProductView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { useFormErrors } from "@/features/catalogue/form-errors";
import { apiRequest } from "@/lib/api/client";

import { BoxFields, LineFields, TravelFields } from "./inbound-fields";
import { emptyInbound, inboundToValues, type InboundValues, valuesToInput } from "./inbound-values";

function Section({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <Paper className="flex flex-col gap-5 px-6 py-6">
      <div>
        <Stamp as="h2">{title}</Stamp>
        {lead ? <p className="mt-1.5 text-small text-ink-soft">{lead}</p> : null}
      </div>
      {children}
    </Paper>
  );
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function InboundForm({ inbound, onSave }: { inbound?: InboundDetailView; onSave: (input: InboundInput) => Promise<unknown> }) {
  const [values, setValues] = useState<InboundValues>(() => (inbound ? inboundToValues(inbound) : emptyInbound(todayIso())));
  const [saving, setSaving] = useState(false);
  const { formError, capture, reset, errorFor } = useFormErrors();
  const products = useQuery({ queryKey: ["vendor", "products", "list", "ACTIVE"], queryFn: () => apiRequest<ProductView[]>("/v1/vendor/products?status=ACTIVE") });
  const set = (patch: Partial<InboundValues>) => setValues((current) => ({ ...current, ...patch }));
  const fieldProps = { values, set, errorFor };

  async function submit(event: FormEvent) {
    event.preventDefault();
    reset();
    setSaving(true);
    try {
      await onSave(valuesToInput(values));
    } catch (error) {
      capture(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="flex max-w-[880px] flex-col gap-5" noValidate>
      <FormAlert message={errorFor("warehouseId") ?? formError} />
      <Section title="Getting there">
        <TravelFields {...fieldProps} />
      </Section>
      <Section title="What's inside" lead="Declare every product and how many units. The hub counts against this list.">
        <LineFields {...fieldProps} products={products.data ?? []} />
      </Section>
      <Section title="Boxes" lead="How many boxes of each size are coming. Each box is stored and charged separately.">
        <BoxFields {...fieldProps} />
      </Section>
      <Section title="Anything else?">
        <Field label="Notes for the hub" hint="Optional. Fragile items, unusual packaging, that sort of thing." error={errorFor("notes")}>
          {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} maxLength={1000} value={values.notes} onChange={(event) => set({ notes: event.target.value })} />}
        </Field>
      </Section>
      <div className="flex justify-end">
        <Button type="submit" variant="yellow" size="lg" loading={saving}>
          Save draft
        </Button>
      </div>
    </form>
  );
}
