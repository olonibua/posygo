"use client";

import { BARCODE_SYMBOLOGIES, type BarcodeSymbology, ISO_COUNTRY_CODES, STORAGE_TIERS, type StorageTier } from "@/shared";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { Field, Input, Select } from "@/components/ui/form-controls";
import type { Tone } from "@/components/ui/tone";
import { countryName } from "@/features/onboarding/display";
import { STORAGE_TIER_LABELS } from "@/features/stock/display";

import type { BarcodeRow, ProductValues } from "./product-values";

export interface ProductFieldProps {
  values: ProductValues;
  set: (patch: Partial<ProductValues>) => void;
  errorFor: (path: string) => string | undefined;
  readOnly: boolean;
}

const SYMBOLOGY_LABELS: Record<BarcodeSymbology, string> = { EAN13: "EAN-13", UPC_A: "UPC-A", GTIN14: "GTIN-14", CODE128: "Code 128 (your own)" };
const TIER_TONES: readonly Tone[] = ["yellow", "lime", "sky", "pink", "orange"];
const ORIGIN_CODES = [...ISO_COUNTRY_CODES].sort((a, b) => countryName(a).localeCompare(countryName(b)));

export function IdentityFields({ values, set, errorFor, readOnly }: ProductFieldProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Product name" error={errorFor("name")}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.name} disabled={readOnly} onChange={(event) => set({ name: event.target.value })} />
        )}
      </Field>
      <Field label="Product code" hint="Your own code, like WIG-BW-16. Letters, numbers and dashes." error={errorFor("code")}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className="font-mono uppercase"
            value={values.code}
            disabled={readOnly}
            onChange={(event) => set({ code: event.target.value.toUpperCase() })}
          />
        )}
      </Field>
      <Field label="Variant" hint="Optional, for example “16 inch, natural black”." error={errorFor("variantLabel")}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.variantLabel} disabled={readOnly} onChange={(event) => set({ variantLabel: event.target.value })} />
        )}
      </Field>
      <Field label="Made in" error={errorFor("countryOfOrigin")}>
        {({ id, describedBy, invalid }) => (
          <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.countryOfOrigin} disabled={readOnly} onChange={(event) => set({ countryOfOrigin: event.target.value })}>
            {ORIGIN_CODES.map((code) => (
              <option key={code} value={code}>
                {countryName(code)}
              </option>
            ))}
          </Select>
        )}
      </Field>
    </div>
  );
}

export function CustomsFields({ values, set, errorFor, readOnly, currency }: ProductFieldProps & { currency: string }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label={`Value per unit (${currency})`} hint="What one unit is worth, for customs and insurance." error={errorFor("declaredValueMinor")}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            inputMode="decimal"
            value={values.declaredValue}
            disabled={readOnly}
            onChange={(event) => set({ declaredValue: event.target.value })}
          />
        )}
      </Field>
      <Field label="Tariff code" hint="Optional. The 6–10 digit HS code, for customs when you send stock in." error={errorFor("hsCode")}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            inputMode="numeric"
            value={values.hsCode}
            disabled={readOnly}
            onChange={(event) => set({ hsCode: event.target.value })}
          />
        )}
      </Field>
    </div>
  );
}

export function SizeFields({ values, set, errorFor, readOnly, units }: ProductFieldProps & { units: { weight: string; length: string } }) {
  const dimension = (key: "length" | "width" | "height", label: string) => (
    <Field label={`${label} (${units.length})`} error={errorFor(`${key}Mm`)}>
      {({ id, describedBy, invalid }) => (
        <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} inputMode="decimal" value={values[key]} disabled={readOnly} onChange={(event) => set({ [key]: event.target.value })} />
      )}
    </Field>
  );
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-4">
        <Field label={`Weight (${units.weight})`} error={errorFor("weightGrams")}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              inputMode="decimal"
              value={values.weight}
              disabled={readOnly}
              onChange={(event) => set({ weight: event.target.value })}
            />
          )}
        </Field>
        {dimension("length", "Length")}
        {dimension("width", "Width")}
        {dimension("height", "Height")}
      </div>
      <fieldset>
        <legend className="mb-3 text-small font-medium">Storage size</legend>
        <div className="flex flex-wrap gap-2.5">
          {STORAGE_TIERS.map((tier: StorageTier, index) => (
            <ChoiceChip key={tier} selected={values.storageTier === tier} tone={TIER_TONES[index % TIER_TONES.length]!} onToggle={() => !readOnly && set({ storageTier: tier })}>
              {STORAGE_TIER_LABELS[tier].label}
              <span className="font-normal opacity-70">· {STORAGE_TIER_LABELS[tier].hint}</span>
            </ChoiceChip>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export function BarcodeFields({ values, set, errorFor, readOnly }: ProductFieldProps) {
  const update = (index: number, patch: Partial<BarcodeRow>) => set({ barcodes: values.barcodes.map((row, at) => (at === index ? { ...row, ...patch } : row)) });
  return (
    <div className="flex flex-col gap-3">
      {values.barcodes.length === 0 ? <p className="text-small text-ink-soft">No barcodes yet. We can print labels from your product code instead.</p> : null}
      {values.barcodes.map((row, index) => (
        <div key={index} className="grid items-end gap-3 sm:grid-cols-[1fr_220px_auto]">
          <Field label={`Barcode ${index + 1}`} error={errorFor(`barcodes.${index}.value`)}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                className="font-mono"
                value={row.value}
                disabled={readOnly}
                onChange={(event) => update(index, { value: event.target.value })}
              />
            )}
          </Field>
          <Field label="Type">
            {({ id }) => (
              <Select id={id} value={row.symbology} disabled={readOnly} onChange={(event) => update(index, { symbology: event.target.value as BarcodeSymbology })}>
                {BARCODE_SYMBOLOGIES.map((symbology) => (
                  <option key={symbology} value={symbology}>
                    {SYMBOLOGY_LABELS[symbology]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          {readOnly ? null : (
            <Button variant="ghost" onClick={() => set({ barcodes: values.barcodes.filter((_, at) => at !== index) })}>
              Remove
            </Button>
          )}
        </div>
      ))}
      {errorFor("barcodes") && !values.barcodes.some((_, index) => errorFor(`barcodes.${index}.value`)) ? (
        <p role="alert" className="text-meta text-danger">
          {errorFor("barcodes")}
        </p>
      ) : null}
      {readOnly || values.barcodes.length >= 10 ? null : (
        <div>
          <Button variant="ghost" onClick={() => set({ barcodes: [...values.barcodes, { value: "", symbology: "EAN13" }] })}>
            Add a barcode
          </Button>
        </div>
      )}
    </div>
  );
}
