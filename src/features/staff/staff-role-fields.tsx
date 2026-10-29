"use client";

import { COUNTRY_BOUND_ROLES, INVITABLE_STAFF_ROLES, type InvitableStaffRole } from "@/shared";

import { Field, Select } from "@/components/ui/form-controls";
import { useAdminCountries } from "@/features/countries/admin-countries";

import { STAFF_ROLE_LABELS } from "./staff-display";

interface StaffRoleFieldsProps {
  role: InvitableStaffRole;
  countryCode: string;
  countryError?: string;
  onRole: (role: InvitableStaffRole) => void;
  onCountry: (countryCode: string) => void;
}

export function needsCountry(role: InvitableStaffRole): boolean {
  return COUNTRY_BOUND_ROLES.includes(role);
}

export function StaffRoleFields({ role, countryCode, countryError, onRole, onCountry }: StaffRoleFieldsProps) {
  const countries = useAdminCountries();
  return (
    <>
      <Field label="Role">
        {({ id }) => (
          <Select id={id} value={role} onChange={(event) => onRole(event.target.value as InvitableStaffRole)}>
            {INVITABLE_STAFF_ROLES.map((value) => (
              <option key={value} value={value}>
                {STAFF_ROLE_LABELS[value]}
              </option>
            ))}
          </Select>
        )}
      </Field>
      {needsCountry(role) ? (
        <Field label="Country" error={countryError}>
          {({ id, invalid }) => (
            <Select id={id} aria-invalid={invalid} value={countryCode} onChange={(event) => onCountry(event.target.value)}>
              <option value="">Choose a country</option>
              {(countries.data ?? []).map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      ) : (
        <p className="text-small text-ink-soft md:pt-9">This role covers every country.</p>
      )}
    </>
  );
}
