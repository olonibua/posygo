"use client";

import { hasPermission, type TeamInvitationView, type TeamMemberView, type TeamView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper } from "@/components/ui/surfaces";
import { ApiError, apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

const KEY = ["vendor", "team"];

export function TeamPage() {
  const user = useCurrentUser();
  const canManage = hasPermission(user.role, "vendor.team.manage");
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const team = useQuery({ queryKey: KEY, queryFn: () => apiRequest<TeamView>("/v1/vendor/team") });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: KEY });

  const invite = useMutation({
    mutationFn: (address: string) => apiRequest("/v1/vendor/team/invitations", { method: "POST", body: { email: address } }),
    onSuccess: (_result, address) => {
      toast.success("Invitation sent", address);
      setEmail("");
      refresh();
    },
  });
  const revoke = useMutation({ mutationFn: (id: string) => apiRequest(`/v1/vendor/team/invitations/${id}`, { method: "DELETE" }), onSuccess: refresh });
  const remove = useMutation({ mutationFn: (id: string) => apiRequest(`/v1/vendor/team/members/${id}`, { method: "DELETE" }), onSuccess: refresh });

  function onInvite(event: FormEvent) {
    event.preventDefault();
    invite.mutate(email.trim());
  }

  const memberColumns: Column<TeamMemberView>[] = [
    { key: "email", header: "Email", render: (row) => row.email },
    { key: "role", header: "Role", render: (row) => <StatusPill tone={row.role === "VENDOR_OWNER" ? "sky" : "yellow"}>{row.role === "VENDOR_OWNER" ? "Owner" : "Member"}</StatusPill> },
    { key: "status", header: "Status", render: (row) => (row.status === "ACTIVE" ? <StatusPill tone="lime">Active</StatusPill> : <StatusPill tone="pink">Removed</StatusPill>) },
    { key: "joined", header: "Joined", render: (row) => <span className="text-ink-soft">{formatDate(row.joinedAt, "en-GB")}</span> },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (row) =>
        canManage && row.role === "VENDOR_MEMBER" && row.status === "ACTIVE" ? (
          <Button variant="ghost" onClick={() => remove.mutate(row.userId)}>
            Remove
          </Button>
        ) : null,
    },
  ];
  const invitationColumns: Column<TeamInvitationView>[] = [
    { key: "email", header: "Email", render: (row) => row.email },
    { key: "status", header: "Status", render: (row) => <StatusPill tone={row.status === "PENDING" ? "sky" : "pink"}>{row.status === "PENDING" ? "Waiting" : "Expired"}</StatusPill> },
    { key: "expires", header: "Expires", render: (row) => <span className="text-ink-soft">{formatDate(row.expiresAt, "en-GB")}</span> },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (row) =>
        canManage ? (
          <Button variant="ghost" onClick={() => revoke.mutate(row.id)}>
            Revoke
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Team" title="Your team" lead="Members can see stock and orders. Only the owner can verify the business, accept agreements and manage the team." />
      {canManage ? (
        <Paper className="px-6 py-5">
          <form onSubmit={onInvite} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Invite by email">{({ id }) => <Input id={id} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />}</Field>
            </div>
            <Button type="submit" variant="yellow" size="lg" loading={invite.isPending}>
              Send invite →
            </Button>
          </form>
          <div className="mt-3">
            <FormAlert message={invite.error instanceof ApiError ? invite.error.message : null} />
          </div>
        </Paper>
      ) : null}
      <DataTable caption="Team members" columns={memberColumns} rows={team.data?.members ?? []} rowKey={(row) => row.userId} loading={team.isLoading} empty={"No members yet."} />
      {team.data?.invitations.length ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-h3">Pending invitations</h2>
          <DataTable caption="Pending invitations" columns={invitationColumns} rows={team.data.invitations} rowKey={(row) => row.id} />
        </section>
      ) : null}
    </div>
  );
}
