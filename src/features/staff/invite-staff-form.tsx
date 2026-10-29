"use client";

import type { InvitableStaffRole } from "@/shared";
import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

import { needsCountry, StaffRoleFields } from "./staff-role-fields";

export function InviteStaffForm({ onInvited }: { onInvited: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitableStaffRole>("WAREHOUSE_OPERATOR");
  const [countryCode, setCountryCode] = useState("");
  const invite = useMutation({
    mutationFn: () => apiRequest("/v1/admin/staff/invitations", { method: "POST", body: { email: email.trim(), role, countryCode: needsCountry(role) ? countryCode || undefined : undefined } }),
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
        <StaffRoleFields role={role} countryCode={countryCode} countryError={fieldError(invite.error, "countryCode")} onRole={setRole} onCountry={setCountryCode} />
        <div className="flex justify-end md:col-span-3">
          <Button type="submit" variant="yellow" loading={invite.isPending}>
            Send invitation
          </Button>
        </div>
      </form>
    </Paper>
  );
}
