"use client";

import type { InboundDetailView, InboundInput, ProductView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { DraftStatus } from "@/components/ui/draft-status";
import { HintButton, StepHint } from "@/components/ui/step-hint";
import { Field, FormAlert, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { useFormErrors } from "@/features/catalogue/form-errors";
import { apiRequest } from "@/lib/api/client";
import { useFormDraft } from "@/lib/drafts/use-form-draft";

import { HubPicker } from "./hub-picker";
import { BoxFields, LineFields, TravelFields } from "./inbound-fields";
import { emptyInbound, inboundToValues, type InboundValues, valuesToInput } from "./inbound-values";

export const INBOUND_HINTS = {
  hub: {
    id: "inbound-hub",
    title: "What's a hub?",
    text: "A hub is a local storage space run by a checked Posygo partner. Your stock is kept there and your orders are packed and sent from it. Pick the one closest to most of your customers. You can send stock to more than one hub.",
  },
  boxes: {
    id: "inbound-boxes",
    title: "Why count boxes?",
    text: "The hub checks in and stores every box separately, and storage is charged per box. Tell us exactly how many of each size are coming.",
  },
} as const;

type Hint = (typeof INBOUND_HINTS)[keyof typeof INBOUND_HINTS];

function Section({ title, lead, hint, children }: { title: string; lead?: string; hint?: Hint; children: ReactNode }) {
  const heading = <Stamp as="h2">{title}</Stamp>;
  return (
    <Paper className="flex flex-col gap-5 px-6 py-6">
      <div>
        {hint ? (
          <StepHint {...hint} className="flex items-center justify-between gap-3">
            {heading}
            <HintButton id={hint.id} label={hint.title} />
          </StepHint>
        ) : (
          heading
        )}
        {lead ? <p className="mt-1.5 text-small text-ink-soft">{lead}</p> : null}
      </div>
      {children}
    </Paper>
  );
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface InboundFormProps {
  inbound?: InboundDetailView;
  draftKey?: string;
  onSave: (input: InboundInput) => Promise<unknown>;
}

export function InboundForm({ inbound, draftKey, onSave }: InboundFormProps) {
  const [values, setValues] = useState<InboundValues>(() => (inbound ? inboundToValues(inbound) : emptyInbound(todayIso())));
  const draft = useFormDraft({ key: draftKey ?? null, values, onRestore: setValues });
  const [saving, setSaving] = useState(false);
  const { formError, capture, reset, errorFor } = useFormErrors();
  const products = useQuery({ queryKey: ["vendor", "products", "list", "ACTIVE"], queryFn: () => apiRequest<ProductView[]>("/v1/vendor/products?status=ACTIVE") });
  const set = (patch: Partial<InboundValues>) => setValues((current) => ({ ...current, ...patch }));
  const chooseHub = useCallback((warehouseId: string) => setValues((current) => ({ ...current, warehouseId })), []);
  const fieldProps = { values, set, errorFor };

  async function submit(event: FormEvent) {
    event.preventDefault();
    reset();
    setSaving(true);
    try {
      await onSave(valuesToInput(values));
      await draft.clear();
    } catch (error) {
      capture(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="flex max-w-[880px] flex-col gap-5" noValidate>
      <DraftStatus draft={draft} />
      <FormAlert message={formError} />
      <Section title="Where it's going" lead="Choose the hub that will store this stock and send your orders." hint={INBOUND_HINTS.hub}>
        <HubPicker value={values.warehouseId} error={errorFor("warehouseId")} onChange={chooseHub} />
      </Section>
      <Section title="Getting there">
        <TravelFields {...fieldProps} />
      </Section>
      <Section title="What's inside" lead="Declare every product and how many units. The hub counts against this list.">
        <LineFields {...fieldProps} products={products.data ?? []} />
      </Section>
      <Section title="Boxes" lead="How many boxes of each size are coming." hint={INBOUND_HINTS.boxes}>
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
