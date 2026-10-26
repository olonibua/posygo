"use client";

import { COUNTRY_BOUND_ROLES, INVITABLE_STAFF_ROLES, type InvitableStaffRole } from "@/shared";
import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Select } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { useAdminCountries } from "@/features/countries/admin-countries";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

import { STAFF_ROLE_LABELS } from "./staff-display";

export function InviteStaffForm({ onInvited }: { onInvited: () => void }) {
  const countries = useAdminCountries();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitableStaffRole>("WAREHOUSE_OPERATOR");
  const [countryCode, setCountryCode] = useState("");
  const needsCountry = COUNTRY_BOUND_ROLES.includes(role);
  const invite = useMutation({
    mutationFn: () => apiRequest("/v1/admin/staff/invitations", { method: "POST", body: { email: email.trim(), role, countryCode: needsCountry ? countryCode || undefined : undefined } }),
    onSuccess: () => {
      toast.success("Invitation sent", email.trim());
      setEmail("");
      onInvited();
    },
  });
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    invite.mutate();
  }
  return (
    <Paper className="px-6 py-6">
      <Stamp>Invite someone</Stamp>
      <form noValidate onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-3 md:items-start">
        <div className="md:col-span-3">
          <FormAlert message={formError(invite.error)} />
        </div>
        <Field label="Email" error={fieldError(invite.error, "email")}>
          {({ id, invalid }) => <Input id={id} type="email" autoComplete="off" aria-invalid={invalid} value={email} onChange={(event) => setEmail(event.target.value)} />}
        </Field>
        <Field label="Role">
          {({ id }) => (
            <Select id={id} value={role} onChange={(event) => setRole(event.target.value as InvitableStaffRole)}>
              {INVITABLE_STAFF_ROLES.map((value) => (
                <option key={value} value={value}>
                  {STAFF_ROLE_LABELS[value]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {needsCountry ? (
          <Field label="Country" error={fieldError(invite.error, "countryCode")}>
            {({ id, invalid }) => (
              <Select id={id} aria-invalid={invalid} value={countryCode} onChange={(event) => setCountryCode(event.target.value)}>
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
        <div className="flex justify-end md:col-span-3">
          <Button type="submit" variant="yellow" loading={invite.isPending}>
            Send invitation
          </Button>
        </div>
      </form>
    </Paper>
  );
}
