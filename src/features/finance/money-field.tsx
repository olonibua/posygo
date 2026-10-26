"use client";

import { Field, Input } from "@/components/ui/form-controls";

import { currencySymbol } from "./money-input";

export function MoneyField({
  label,
  currency,
  value,
  onChange,
  hint,
  error,
  placeholder,
}: {
  label: string;
  currency: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <span aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft">
            {currencySymbol(currency)}
          </span>
          <Input
            id={id}
            inputMode="decimal"
            autoComplete="off"
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            className="pl-12 tabular-nums"
          />
        </div>
      )}
    </Field>
  );
}
