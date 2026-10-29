"use client";

import { DELIVERY_PREFERENCE_LABELS, DELIVERY_PREFERENCES, type DeliveryPreference, type ProductView, type VendorCountryView } from "@/shared";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";

import { countryFlag } from "@/features/seller-countries/country-flag";

export interface LineDraft {
  key: string;
  productId: string;
  quantity: string;
}

export interface DeliveryDraft {
  key: string;
  externalReference: string;
  name: string;
  company: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  phone: string;
  email: string;
  deliveryPreference?: DeliveryPreference;
  lines: LineDraft[];
}

interface DeliveryFieldsProps {
  index: number;
  delivery: DeliveryDraft;
  country: VendorCountryView;
  products: ProductView[];
  available: ReadonlyMap<string, number>;
  errorFor: (field: string) => string | undefined;
  onChange: (next: DeliveryDraft) => void;
  onRemove?: () => void;
  newKey: () => string;
  children?: ReactNode;
}

export function DeliveryFields({ index, delivery, country, products, available, errorFor, onChange, onRemove, newKey, children }: DeliveryFieldsProps) {
  const rules = country.address;
  const set = (patch: Partial<DeliveryDraft>) => onChange({ ...delivery, ...patch });
  const setLine = (key: string, patch: Partial<LineDraft>) => set({ lines: delivery.lines.map((line) => (line.key === key ? { ...line, ...patch } : line)) });
  const prefix = `deliveries.${index}`;
  const text = (field: keyof DeliveryDraft, label: string, options: { error?: string; autoComplete?: string; type?: string; hint?: string; maxLength?: number } = {}) => (
    <Field label={label} hint={options.hint} error={options.error ?? errorFor(`${prefix}.recipient.${field}`)}>
      {({ id, describedBy, invalid }) => (
        <Input
          id={id}
          type={options.type ?? "text"}
          autoComplete={options.autoComplete}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          maxLength={options.maxLength ?? 100}
          value={delivery[field] as string}
          onChange={(event) => set({ [field]: event.target.value })}
        />
      )}
    </Field>
  );

  return (
    <Paper className="flex flex-col gap-5 px-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <Stamp>
          Delivery {index + 1} · {countryFlag(country.code)} {country.name}
        </Stamp>
        {onRemove ? (
          <Button variant="ghost" onClick={onRemove}>
            Remove
          </Button>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {text("externalReference", "Your reference (optional)", { error: errorFor(`${prefix}.externalReference`), hint: "Your shop's order number, so you can find it later.", maxLength: 64 })}
        {text("name", "Recipient name", { autoComplete: "name" })}
        {text("company", "Company (optional)", { autoComplete: "organization" })}
        {text("line1", "Address", { autoComplete: "address-line1" })}
        {text("line2", "Address line 2 (optional)", { autoComplete: "address-line2" })}
        {text("city", "Town or city", { autoComplete: "address-level2", maxLength: 60 })}
        {rules.regionCodes.length > 0 ? (
          <Field label={rules.regionLabel} error={errorFor(`${prefix}.recipient.region`)}>
            {({ id, describedBy, invalid }) => (
              <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} value={delivery.region} onChange={(event) => set({ region: event.target.value })}>
                <option value="">Choose…</option>
                {rules.regionCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        ) : (
          text("region", `${rules.regionLabel}${rules.regionRequired ? "" : " (optional)"}`, { autoComplete: "address-level1", maxLength: 40 })
        )}
        {text("postalCode", rules.postalCodeLabel, { autoComplete: "postal-code", maxLength: 16 })}
        {text("phone", "Phone (optional)", { autoComplete: "tel", type: "tel", maxLength: 20 })}
        {text("email", "Email (optional)", { autoComplete: "email", type: "email", maxLength: 254 })}
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-small font-medium">Products</p>
        {errorFor(`${prefix}.lines`) ? (
          <p role="alert" className="text-meta text-danger">
            {errorFor(`${prefix}.lines`)}
          </p>
        ) : null}
        {delivery.lines.map((line, lineIndex) => (
          <div key={line.key} className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
            <Field label={`Product ${lineIndex + 1}`}>
              {({ id }) => (
                <Select id={id} value={line.productId} onChange={(event) => setLine(line.key, { productId: event.target.value })}>
                  <option value="">Choose a product</option>
                  {products.map((product) => {
                    const units = available.get(product.id) ?? 0;
                    return (
                      <option key={product.id} value={product.id} disabled={units === 0}>
                        {product.name} · {product.code} · {units} available
                      </option>
                    );
                  })}
                </Select>
              )}
            </Field>
            <Field label="Units">
              {({ id }) => <Input id={id} inputMode="numeric" value={line.quantity} onChange={(event) => setLine(line.key, { quantity: event.target.value.replace(/\D/g, "") })} />}
            </Field>
            <Button variant="ghost" disabled={delivery.lines.length === 1} onClick={() => set({ lines: delivery.lines.filter((entry) => entry.key !== line.key) })}>
              Remove
            </Button>
          </div>
        ))}
        <div>
          <Button variant="ghost" disabled={delivery.lines.length >= 50} onClick={() => set({ lines: [...delivery.lines, { key: newKey(), productId: "", quantity: "1" }] })}>
            Add another product
          </Button>
        </div>
      </div>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-small font-medium">Delivery</legend>
        <div className="flex flex-wrap gap-2.5">
          {DELIVERY_PREFERENCES.map((preference, preferenceIndex) => (
            <ChoiceChip key={preference} selected={(delivery.deliveryPreference ?? "CHEAPEST") === preference} tone={preferenceIndex === 0 ? "lime" : "sky"} onToggle={() => set({ deliveryPreference: preference })}>
              {DELIVERY_PREFERENCE_LABELS[preference].label}
              <span className="font-normal opacity-70">· {DELIVERY_PREFERENCE_LABELS[preference].hint}</span>
            </ChoiceChip>
          ))}
        </div>
      </fieldset>
      {children}
    </Paper>
  );
}
