"use client";

import type { InvitableStaffRole, StaffMemberView } from "@/shared";
import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

import { needsCountry, StaffRoleFields } from "./staff-role-fields";

interface ChangeRoleFormProps {
  member: StaffMemberView & { role: InvitableStaffRole };
  onDone: () => void;
  onCancel: () => void;
}

export function ChangeRoleForm({ member, onDone, onCancel }: ChangeRoleFormProps) {
  const [role, setRole] = useState<InvitableStaffRole>(member.role);
  const [countryCode, setCountryCode] = useState(member.countryCode ?? "");
  const change = useMutation({
    mutationFn: () => apiRequest(`/v1/admin/staff/members/${member.userId}/role`, { method: "PUT", body: { role, countryCode: needsCountry(role) ? countryCode || undefined : undefined } }),
    onSuccess: () => {
      toast.success("Role changed", `${member.email} will sign in again to use it.`);
      onDone();
    },
  });
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    change.mutate();
  }
  return (
    <Paper className="px-6 py-6">
      <Stamp>Change role</Stamp>
      <p className="mt-1 text-small text-ink-soft">{member.email}</p>
      <form noValidate onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-3 md:items-start">
        <div className="md:col-span-3">
          <FormAlert message={formError(change.error)} />
        </div>
        <StaffRoleFields role={role} countryCode={countryCode} countryError={fieldError(change.error, "countryCode")} onRole={setRole} onCountry={setCountryCode} />
        <div className="flex justify-end gap-3 md:col-span-3">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={change.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="yellow" loading={change.isPending}>
            Save role
          </Button>
        </div>
      </form>
    </Paper>
  );
}
