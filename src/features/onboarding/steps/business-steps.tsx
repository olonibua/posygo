"use client";

import { ISO_COUNTRY_CODES, type VerificationMarket } from "@/shared";

import { Field, Input, Select } from "@/components/ui/form-controls";

import { countryName } from "../display";
import { type FieldErrors, errorFor } from "../use-verification";
import type { WizardValues } from "./wizard-values";

export interface StepProps {
  values: WizardValues;
  set: (patch: Partial<WizardValues>) => void;
  errors: FieldErrors;
  market: VerificationMarket;
}

const SORTED_COUNTRIES = [...ISO_COUNTRY_CODES].map((code) => ({ code, name: countryName(code) })).sort((a, b) => a.name.localeCompare(b.name));

export function BusinessStep({ values, set, errors, market }: StepProps) {
  const domestic = values.registrationCountryCode === market.countryCode;
  const address = values.registeredAddress;
  const setAddress = (patch: Partial<WizardValues["registeredAddress"]>) => set({ registeredAddress: { ...address, ...patch } });
  return (
    <div className="flex flex-col gap-5">
      <Field label="Business type" error={errorFor(errors, "businessType")}>
        {({ id }) => (
          <Select id={id} value={values.businessType} onChange={(event) => set({ businessType: event.target.value })}>
            <option value="">Choose one</option>
            {market.kyc.businessTypes.map((type) => (
              <option key={type.code} value={type.code}>
                {type.label}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Legal business name" hint="Exactly as registered." error={errorFor(errors, "legalBusinessName")}>
        {({ id }) => <Input id={id} value={values.legalBusinessName} onChange={(event) => set({ legalBusinessName: event.target.value })} />}
      </Field>
      <Field label="Country of registration" error={errorFor(errors, "registrationCountryCode")}>
        {({ id }) => (
          <Select id={id} value={values.registrationCountryCode} onChange={(event) => set({ registrationCountryCode: event.target.value })}>
            <option value="">Choose a country</option>
            {SORTED_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={domestic ? market.kyc.companyNumber.label : "Company registration number"} error={errorFor(errors, "companyNumber")}>
          {({ id }) => <Input id={id} value={values.companyNumber} onChange={(event) => set({ companyNumber: event.target.value })} />}
        </Field>
        <Field label={domestic && market.kyc.taxNumber ? market.kyc.taxNumber.label : "Tax number (optional)"} error={errorFor(errors, "taxNumber")}>
          {({ id }) => <Input id={id} value={values.taxNumber} onChange={(event) => set({ taxNumber: event.target.value })} />}
        </Field>
      </div>
      <Field label="Registered address" error={errorFor(errors, "registeredAddress.line1")}>
        {({ id }) => <Input id={id} placeholder="Address line 1" value={address.line1} onChange={(event) => setAddress({ line1: event.target.value })} />}
      </Field>
      <Input aria-label="Address line 2" placeholder="Address line 2 (optional)" value={address.line2} onChange={(event) => setAddress({ line2: event.target.value })} />
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Town or city" error={errorFor(errors, "registeredAddress.city")}>
          {({ id }) => <Input id={id} value={address.city} onChange={(event) => setAddress({ city: event.target.value })} />}
        </Field>
        <Field label={domestic ? market.address.regionLabel : "Region"} error={errorFor(errors, "registeredAddress.region")}>
          {({ id }) => <Input id={id} value={address.region} onChange={(event) => setAddress({ region: event.target.value })} />}
        </Field>
        <Field label={domestic ? market.address.postalCodeLabel : "Postal code"} error={errorFor(errors, "registeredAddress.postalCode")}>
          {({ id }) => <Input id={id} value={address.postalCode} onChange={(event) => setAddress({ postalCode: event.target.value })} />}
        </Field>
      </div>
    </div>
  );
}

export function ContactStep({ values, set, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <Field label="Full name" hint="The person responsible for this account." error={errorFor(errors, "contactFullName")}>
        {({ id }) => <Input id={id} autoComplete="name" value={values.contactFullName} onChange={(event) => set({ contactFullName: event.target.value })} />}
      </Field>
      <Field label="Role" error={errorFor(errors, "contactRole")}>
        {({ id }) => <Input id={id} autoComplete="organization-title" placeholder="Director" value={values.contactRole} onChange={(event) => set({ contactRole: event.target.value })} />}
      </Field>
      <Field label="Phone" hint="International format, e.g. +447700900123." error={errorFor(errors, "contactPhone")}>
        {({ id }) => <Input id={id} type="tel" autoComplete="tel" value={values.contactPhone} onChange={(event) => set({ contactPhone: event.target.value })} />}
      </Field>
    </div>
  );
}
