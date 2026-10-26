"use client";

import type { DestinationView, ShipTo } from "@/shared";

import { Field, Input, Select } from "@/components/ui/form-controls";

export interface ShipToDraft {
  name: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
  phone: string;
}

export function blankShipTo(countryCode: string): ShipToDraft {
  return { name: "", line1: "", line2: "", city: "", region: "", postalCode: "", countryCode, phone: "" };
}

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function toShipTo(draft: ShipToDraft): ShipTo {
  return {
    name: draft.name.trim(),
    line1: draft.line1.trim(),
    line2: optional(draft.line2),
    city: draft.city.trim(),
    region: optional(draft.region),
    postalCode: draft.postalCode.trim().toUpperCase(),
    countryCode: draft.countryCode,
    phone: optional(draft.phone),
  };
}

interface ShipToFieldsProps {
  draft: ShipToDraft;
  destinations: DestinationView[];
  errorFor: (field: string) => string | undefined;
  onChange: (next: ShipToDraft) => void;
}

export function ShipToFields({ draft, destinations, errorFor, onChange }: ShipToFieldsProps) {
  const destination = destinations.find((entry) => entry.code === draft.countryCode);
  const rules = destination?.address;
  const set = (patch: Partial<ShipToDraft>) => onChange({ ...draft, ...patch });
  const text = (field: keyof ShipToDraft, label: string, options: { autoComplete: string; type?: string; maxLength?: number; hint?: string }) => (
    <Field label={label} hint={options.hint} error={errorFor(`shipTo.${field}`)}>
      {({ id, describedBy, invalid }) => (
        <Input
          id={id}
          type={options.type ?? "text"}
          autoComplete={`shipping ${options.autoComplete}`}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          maxLength={options.maxLength ?? 100}
          value={draft[field]}
          onChange={(event) => set({ [field]: event.target.value })}
        />
      )}
    </Field>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Country" error={errorFor("shipTo.countryCode")} hint={destination?.customsRequired ? "Crosses a border. You may pay import duties when it arrives." : undefined}>
        {({ id, describedBy, invalid }) => (
          <Select
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            autoComplete="shipping country"
            value={draft.countryCode}
            onChange={(event) => set({ countryCode: event.target.value, region: "" })}
          >
            {destinations.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      {text("name", "Full name", { autoComplete: "name" })}
      {text("line1", "Address", { autoComplete: "address-line1" })}
      {text("line2", "Address line 2 (optional)", { autoComplete: "address-line2" })}
      {text("city", "Town or city", { autoComplete: "address-level2", maxLength: 60 })}
      {rules && rules.regionCodes.length > 0 ? (
        <Field label={rules.regionLabel} error={errorFor("shipTo.region")}>
          {({ id, describedBy, invalid }) => (
            <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} autoComplete="shipping address-level1" value={draft.region} onChange={(event) => set({ region: event.target.value })}>
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
      {text("phone", destination?.customsRequired ? "Phone" : "Phone (optional)", { autoComplete: "tel", type: "tel", maxLength: 20, hint: "Only used by the courier if they can't find you." })}
    </div>
  );
}
