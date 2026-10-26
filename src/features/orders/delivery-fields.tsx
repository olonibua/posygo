"use client";

import type { DestinationView, ProductView } from "@/shared";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";

export interface LineDraft {
  key: string;
  productId: string;
  quantity: string;
}

export interface DeliveryDraft {
  key: string;
  externalReference: string;
  countryCode: string;
  name: string;
  company: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  phone: string;
  email: string;
  lines: LineDraft[];
}

interface DeliveryFieldsProps {
  index: number;
  delivery: DeliveryDraft;
  destinations: DestinationView[];
  products: ProductView[];
  errorFor: (field: string) => string | undefined;
  onChange: (next: DeliveryDraft) => void;
  onRemove?: () => void;
  newKey: () => string;
}

export function DeliveryFields({ index, delivery, destinations, products, errorFor, onChange, onRemove, newKey }: DeliveryFieldsProps) {
  const destination = destinations.find((entry) => entry.code === delivery.countryCode);
  const rules = destination?.address;
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
        <Stamp>Delivery {index + 1}</Stamp>
        {onRemove ? (
          <Button variant="ghost" onClick={onRemove}>
            Remove
          </Button>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Ship to"
          error={errorFor(`${prefix}.recipient.countryCode`)}
          hint={destination?.customsRequired ? "Crosses a border: needs HS codes and a phone number. The recipient pays import duties." : undefined}
        >
          {({ id, describedBy, invalid }) => (
            <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} value={delivery.countryCode} onChange={(event) => set({ countryCode: event.target.value, region: "" })}>
              {destinations.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {text("externalReference", "Your reference (optional)", { error: errorFor(`${prefix}.externalReference`), hint: "Your shop's order number, so you can find it later.", maxLength: 64 })}
        {text("name", "Recipient name", { autoComplete: "name" })}
        {text("company", "Company (optional)", { autoComplete: "organization" })}
        {text("line1", "Address", { autoComplete: "address-line1" })}
        {text("line2", "Address line 2 (optional)", { autoComplete: "address-line2" })}
        {text("city", "Town or city", { autoComplete: "address-level2", maxLength: 60 })}
        {rules && rules.regionCodes.length > 0 ? (
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
          text("region", `${rules?.regionLabel ?? "Region"}${rules?.regionRequired ? "" : " (optional)"}`, { autoComplete: "address-level1", maxLength: 40 })
        )}
        {text("postalCode", rules?.postalCodeLabel ?? "Postcode", { autoComplete: "postal-code", maxLength: 16 })}
        {text("phone", destination?.customsRequired ? "Phone" : "Phone (optional)", { autoComplete: "tel", type: "tel", maxLength: 20 })}
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
                  {products.map((product) => (
                    <option key={product.id} value={product.id} disabled={product.stock.available === 0}>
                      {product.name} · {product.code} · {product.stock.available} available
                    </option>
                  ))}
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
    </Paper>
  );
}
