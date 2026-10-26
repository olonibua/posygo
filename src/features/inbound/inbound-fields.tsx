"use client";

import { type ProductView, SHIPPING_MODES } from "@/shared";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { SHIPPING_MODE_LABELS, STORAGE_TIER_LABELS } from "@/features/stock/display";

import { type InboundValues, type LineRow, tiersFor } from "./inbound-values";

export interface InboundFieldProps {
  values: InboundValues;
  set: (patch: Partial<InboundValues>) => void;
  errorFor: (path: string) => string | undefined;
}

export function TravelFields({ values, set, errorFor }: InboundFieldProps) {
  return (
    <div className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-3 text-small font-medium">How is it travelling?</legend>
        <div className="flex flex-wrap gap-2.5">
          {SHIPPING_MODES.map((mode, index) => (
            <ChoiceChip key={mode} selected={values.shippingMode === mode} tone={index === 0 ? "sky" : "lime"} onToggle={() => set({ shippingMode: mode })}>
              {SHIPPING_MODE_LABELS[mode].label}
              <span className="font-normal opacity-70">· {SHIPPING_MODE_LABELS[mode].hint}</span>
            </ChoiceChip>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Expected arrival" error={errorFor("expectedArrivalDate")}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="date"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={values.expectedArrivalDate}
              onChange={(event) => set({ expectedArrivalDate: event.target.value })}
            />
          )}
        </Field>
        <Field label="Carrier" hint="Optional, for example Royal Mail." error={errorFor("carrier")}>
          {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.carrier} onChange={(event) => set({ carrier: event.target.value })} />}
        </Field>
        <Field label="Tracking number" hint="Optional." error={errorFor("trackingNumber")}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              className="font-mono"
              value={values.trackingNumber}
              onChange={(event) => set({ trackingNumber: event.target.value })}
            />
          )}
        </Field>
      </div>
    </div>
  );
}

export function BoxFields({ values, set, errorFor }: InboundFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {tiersFor(values.shippingMode).map((tier) => (
          <Field key={tier} label={STORAGE_TIER_LABELS[tier].label} hint={STORAGE_TIER_LABELS[tier].hint}>
            {({ id, describedBy }) => (
              <Input
                id={id}
                type="number"
                min={0}
                max={500}
                aria-describedby={describedBy}
                value={values.boxCounts[tier]}
                onChange={(event) => set({ boxCounts: { ...values.boxCounts, [tier]: event.target.value } })}
              />
            )}
          </Field>
        ))}
      </div>
      {errorFor("boxCounts") ? (
        <p role="alert" className="text-meta text-danger">
          {errorFor("boxCounts")}
        </p>
      ) : null}
    </div>
  );
}

export function LineFields({ values, set, errorFor, products }: InboundFieldProps & { products: readonly ProductView[] }) {
  const update = (index: number, patch: Partial<LineRow>) => set({ lines: values.lines.map((line, at) => (at === index ? { ...line, ...patch } : line)) });
  const chosen = new Set(values.lines.map((line) => line.productId));
  return (
    <div className="flex flex-col gap-3">
      {products.length === 0 ? <p className="text-small text-ink-soft">Add products to your catalogue first, then come back to declare them here.</p> : null}
      {values.lines.map((line, index) => (
        <div key={index} className="grid items-end gap-3 sm:grid-cols-[1fr_160px_auto]">
          <Field label={`Product ${index + 1}`} error={errorFor(`lines.${index}.productId`)}>
            {({ id, describedBy, invalid }) => (
              <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} value={line.productId} onChange={(event) => update(index, { productId: event.target.value })}>
                <option value="">Choose a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id} disabled={product.id !== line.productId && chosen.has(product.id)}>
                    {product.code} · {product.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Units" error={errorFor(`lines.${index}.quantity`)}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                min={1}
                max={100000}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                value={line.quantity}
                onChange={(event) => update(index, { quantity: event.target.value })}
              />
            )}
          </Field>
          <Button variant="ghost" disabled={values.lines.length === 1} onClick={() => set({ lines: values.lines.filter((_, at) => at !== index) })}>
            Remove
          </Button>
        </div>
      ))}
      {errorFor("lines") && !values.lines.some((_, index) => errorFor(`lines.${index}.productId`) ?? errorFor(`lines.${index}.quantity`)) ? (
        <p role="alert" className="text-meta text-danger">
          {errorFor("lines")}
        </p>
      ) : null}
      {values.lines.length < Math.min(products.length, 200) ? (
        <div>
          <Button variant="ghost" onClick={() => set({ lines: [...values.lines, { productId: "", quantity: "" }] })}>
            Add another product
          </Button>
        </div>
      ) : null}
    </div>
  );
}
