"use client";

import type { PartnerDetailView } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { STAFF_ROLE_LABELS } from "@/features/staff/staff-display";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate, localeFor } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

import { usePartnerOverview, usePortalMutation } from "../use-partners";

type Member = PartnerDetailView["team"][number];
type Invitation = PartnerDetailView["pendingInvitations"][number];

export function PartnerTeamPage() {
  const user = useCurrentUser();
  const overview = usePartnerOverview();
  const [email, setEmail] = useState("");
  const invite = usePortalMutation((address: string) => ({ path: "/v1/partner/team/invitations", body: { email: address } }));
  const revoke = usePortalMutation((id: string) => ({ path: `/v1/partner/team/invitations/${id}`, method: "DELETE" }), "Invitation cancelled");
  const suspend = usePortalMutation((userId: string) => ({ path: `/v1/partner/team/members/${userId}/suspend` }), "Team member suspended");
  const partner = overview.data;
  const locale = localeFor(partner?.countryCode);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const address = email.trim();
    invite.mutate(address, {
      onSuccess: () => {
        toast.success("Invitation sent", address);
        setEmail("");
      },
    });
  }

  const members: Column<Member>[] = [
    { key: "email", header: "Email", render: (row) => row.email },
    { key: "role", header: "Role", render: (row) => STAFF_ROLE_LABELS[row.role] },
    { key: "status", header: "Status", render: (row) => <StatusPill tone={row.status === "ACTIVE" ? "lime" : "pink"}>{row.status === "ACTIVE" ? "Active" : "Suspended"}</StatusPill> },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (row) =>
        row.role === "PARTNER_STAFF" && row.status === "ACTIVE" && row.userId !== user.id ? (
          <Button variant="ghost" loading={suspend.isPending && suspend.variables === row.userId} onClick={() => suspend.mutate(row.userId)}>
            Suspend
          </Button>
        ) : null,
    },
  ];
  const invitations: Column<Invitation>[] = [
    { key: "email", header: "Email", render: (row) => row.email },
    { key: "expires", header: "Expires", render: (row) => <span className="text-ink-soft">{formatDate(row.expiresAt, locale)}</span> },
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
      <PageHeader stamp="Partner" title="Team" lead="People who help you at your hub. Team members can receive, store and pack, but can't change the partnership or see earnings." />
      <FormAlert message={formError(suspend.error) ?? formError(revoke.error)} />
      <DataTable caption="Team" columns={members} rows={partner?.team ?? []} rowKey={(row) => row.userId} loading={overview.isLoading} empty={"Nobody here yet."} />
      <section aria-labelledby="waiting-heading" className="flex flex-col gap-3">
        <h2 id="waiting-heading" className="text-h3">
          Waiting to join
        </h2>
        <DataTable caption="Pending invitations" columns={invitations} rows={partner?.pendingInvitations ?? []} rowKey={(row) => row.id} empty="No invitations waiting." />
      </section>
      <Paper className="px-6 py-6">
        <Stamp>Invite a team member</Stamp>
        <form noValidate onSubmit={onSubmit} className="mt-4 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <Field label="Email" hint="They'll set a password and two-factor sign-in." error={fieldError(invite.error, "email")}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="email" autoComplete="off" aria-describedby={describedBy} aria-invalid={invalid} value={email} onChange={(event) => setEmail(event.target.value)} />
              )}
            </Field>
          </div>
          <Button type="submit" variant="yellow" loading={invite.isPending}>
            Send invitation
          </Button>
        </form>
        <div className="mt-3">
          <FormAlert message={formError(invite.error)} />
        </div>
      </Paper>
    </div>
  );
}
