"use client";

import type { PublicCountry } from "@/shared";
import { useId } from "react";

import { Select } from "@/components/ui/form-controls";
import { Icon } from "@/components/ui/icon";

import { countryFlag } from "./country-flag";

interface CountryPickerProps {
  countries: readonly PublicCountry[];
  chosen: readonly string[];
  onChange: (codes: string[]) => void;
  invalid?: boolean;
}

export function CountryPicker({ countries, chosen, onChange, invalid }: CountryPickerProps) {
  const selectId = useId();
  const byCode = new Map(countries.map((country) => [country.code, country]));
  const remaining = countries.filter((country) => !chosen.includes(country.code)).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-3">
      {chosen.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {chosen.map((code, index) => {
            const country = byCode.get(code);
            return (
              <li key={code} className="motion-rise flex items-center gap-3 rounded-control border-[1.5px] border-line bg-paper px-3.5 py-2.5">
                <span aria-hidden className="text-[20px] leading-none">
                  {countryFlag(code)}
                </span>
                <span className="min-w-0 flex-1 truncate text-small font-medium">
                  {country?.name ?? code} <span className="font-normal text-ink-faint">· {country?.currency}</span>
                </span>
                {index === 0 ? <span className="rounded-chip bg-lime px-2 py-0.5 text-label uppercase text-cocoa">Home</span> : null}
                <button
                  type="button"
                  onClick={() => onChange(chosen.filter((entry) => entry !== code))}
                  aria-label={`Remove ${country?.name ?? code}`}
                  className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-paper-sunk hover:text-ink"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {remaining.length > 0 ? (
        <div>
          <label htmlFor={selectId} className="sr-only">
            {chosen.length === 0 ? "Choose a country" : "Add another country"}
          </label>
          <Select
            id={selectId}
            value=""
            aria-invalid={invalid || undefined}
            onChange={(event) => {
              if (event.target.value) {
                onChange([...chosen, event.target.value]);
              }
            }}
          >
            <option value="">{chosen.length === 0 ? "Choose a country…" : "Add another country…"}</option>
            {remaining.map((country) => (
              <option key={country.code} value={country.code}>
                {countryFlag(country.code)} {country.name} ({country.currency})
              </option>
            ))}
          </Select>
        </div>
      ) : null}
    </div>
  );
}
