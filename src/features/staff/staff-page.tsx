"use client";

import { INVITABLE_STAFF_ROLES, type InvitableStaffRole, type StaffDirectoryView, type StaffInvitationView, type StaffMemberView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { FormAlert } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { countryName } from "@/features/onboarding/display";
import { errorMessage } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate } from "@/lib/format";

import { ChangeRoleForm } from "./change-role-form";
import { InviteStaffForm } from "./invite-staff-form";
import { STAFF_ROLE_LABELS } from "./staff-display";

const KEY = ["admin", "staff"];

type ChangeableMember = StaffMemberView & { role: InvitableStaffRole };

function isChangeable(member: StaffMemberView): member is ChangeableMember {
  return (INVITABLE_STAFF_ROLES as readonly string[]).includes(member.role);
}

export function StaffPage() {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const [changing, setChanging] = useState<ChangeableMember | null>(null);
  const directory = useQuery({ queryKey: KEY, queryFn: () => apiRequest<StaffDirectoryView>("/v1/admin/staff") });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: KEY });
  const suspend = useMutation({ mutationFn: (userId: string) => apiRequest(`/v1/admin/staff/members/${userId}/suspend`, { method: "POST" }), onSuccess: refresh });
  const revoke = useMutation({ mutationFn: (id: string) => apiRequest(`/v1/admin/staff/invitations/${id}`, { method: "DELETE" }), onSuccess: refresh });

  const memberColumns: Column<StaffMemberView>[] = [
    { key: "email", header: "Email", render: (row) => row.email },
    { key: "role", header: "Role", render: (row) => STAFF_ROLE_LABELS[row.role] },
    { key: "country", header: "Country", render: (row) => (row.countryCode ? countryName(row.countryCode) : "Every country") },
    { key: "mfa", header: "Two-factor", render: (row) => <StatusPill tone={row.mfaEnrolled ? "lime" : "yellow"}>{row.mfaEnrolled ? "Set up" : "Not yet"}</StatusPill> },
    { key: "status", header: "Status", render: (row) => <StatusPill tone={row.status === "ACTIVE" ? "lime" : "pink"}>{row.status === "ACTIVE" ? "Active" : "Suspended"}</StatusPill> },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (row) =>
        isChangeable(row) && row.status === "ACTIVE" && row.userId !== user.id ? (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setChanging(row)}>
              Change role
            </Button>
            <Button variant="ghost" onClick={() => suspend.mutate(row.userId)}>
              Suspend
            </Button>
          </div>
        ) : null,
    },
  ];
  const invitationColumns: Column<StaffInvitationView>[] = [
    { key: "email", header: "Email", render: (row) => row.email },
    { key: "role", header: "Role", render: (row) => STAFF_ROLE_LABELS[row.role] },
    { key: "country", header: "Country", render: (row) => (row.countryCode ? countryName(row.countryCode) : "Every country") },
    { key: "expires", header: "Expires", render: (row) => <span className="text-ink-soft">{formatDate(row.expiresAt, "en-GB")}</span> },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (row) => (
        <Button variant="ghost" onClick={() => revoke.mutate(row.id)}>
          Revoke
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Platform" title="Staff" lead="Everyone with access to the platform console. New staff set up two-factor sign-in before they can do anything." />
      <FormAlert message={errorMessage(suspend.error) ?? errorMessage(revoke.error)} />
      {changing ? (
        <ChangeRoleForm
          key={changing.userId}
          member={changing}
          onCancel={() => setChanging(null)}
          onDone={() => {
            setChanging(null);
            refresh();
          }}
        />
      ) : null}
      <DataTable caption="Staff" columns={memberColumns} rows={directory.data?.members ?? []} rowKey={(row) => row.userId} loading={directory.isLoading} empty={"No staff yet."} />
      <section aria-labelledby="pending-heading" className="flex flex-col gap-3">
        <h2 id="pending-heading" className="text-h3">
          Waiting to join
        </h2>
        <DataTable caption="Pending invitations" columns={invitationColumns} rows={directory.data?.invitations ?? []} rowKey={(row) => row.id} empty="No invitations waiting." />
      </section>
      <InviteStaffForm onInvited={refresh} />
    </div>
  );
}
