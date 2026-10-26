"use client";

import { hasPermission, MANAGER_DECISIONS, type PartnerDecision, type PartnerDetailView, type Role, type WarehouseView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Select, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { MoneyField } from "@/features/finance/money-field";
import { toMajorText, toMinor } from "@/features/finance/money-input";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { formatMoney, localeFor } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

import { DECISION_DISPLAY, DECISION_DONE, TEAM_ROLE_LABELS } from "../partner-display";
import { useAdminPartnerMutation } from "../use-partners";

export function DecisionsPanel({ partner, role }: { partner: PartnerDetailView; role: Role }) {
  const [reason, setReason] = useState("");
  const decide = useAdminPartnerMutation(
    (decision: PartnerDecision) => ({ path: `/v1/admin/partners/${partner.id}/decisions/${decision}`, body: { reason } }),
    (decision) => DECISION_DONE[decision],
  );
  const allowed = partner.decisions.filter((decision) => hasPermission(role, MANAGER_DECISIONS.includes(decision) ? "partners.manage" : "partners.review"));
  if (allowed.length === 0) {
    return null;
  }
  return (
    <Paper className="flex flex-col gap-4 px-6 py-5">
      <Stamp>Decision</Stamp>
      <FormAlert message={formError(decide.error)} />
      <Field label="Reason" hint="At least 10 characters. The partner receives it by email." error={fieldError(decide.error, "reason")}>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[80px]" value={reason} onChange={(event) => setReason(event.target.value)} />
        )}
      </Field>
      <ul className="flex flex-col gap-2.5">
        {allowed.map((decision) => (
          <li key={decision} className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-small text-ink-soft">{DECISION_DISPLAY[decision].hint}</span>
            <Button
              variant={DECISION_DISPLAY[decision].variant}
              loading={decide.isPending && decide.variables === decision}
              disabled={decide.isPending}
              onClick={() => decide.mutate(decision, { onSuccess: () => setReason("") })}
            >
              {DECISION_DISPLAY[decision].label}
            </Button>
          </li>
        ))}
      </ul>
    </Paper>
  );
}

export function SetupPanel({ partner }: { partner: PartnerDetailView }) {
  const closing = ["OFFBOARDING", "TERMINATED", "REJECTED"].includes(partner.status);
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <TierPanel partner={partner} disabled={closing || partner.status !== "ACTIVE"} />
      <WarehousePanel partner={partner} disabled={closing} />
      <RequirementsPanel partner={partner} disabled={closing || partner.status === "ACTIVE"} />
      <LeadInvitePanel partner={partner} disabled={closing} />
    </div>
  );
}

function TierPanel({ partner, disabled }: { partner: PartnerDetailView; disabled: boolean }) {
  const [level, setLevel] = useState(String(partner.tierLevel));
  const [reason, setReason] = useState("");
  const save = useAdminPartnerMutation((input: { level: number; reason: string }) => ({ path: `/v1/admin/partners/${partner.id}/tier`, method: "PUT", body: input }), "Tier changed");
  const money = (amount: number) => formatMoney(amount, partner.currency, localeFor(partner.countryCode));
  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <Stamp>Tier</Stamp>
      <p className="text-small">
        {partner.tier.name}: stock up to {money(partner.tier.maxStockValueMinor)}, items up to {money(partner.tier.maxItemValueMinor)} each. Holding {money(partner.heldStockValueMinor)} now.
      </p>
      {disabled ? null : (
        <>
          <FormAlert message={formError(save.error)} />
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <Field label="Level" error={fieldError(save.error, "level")}>
              {({ id, invalid }) => <Input id={id} inputMode="numeric" aria-invalid={invalid} value={level} onChange={(event) => setLevel(event.target.value.replace(/\D/g, ""))} />}
            </Field>
            <Field label="Reason" error={fieldError(save.error, "reason")}>
              {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={reason} onChange={(event) => setReason(event.target.value)} />}
            </Field>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" loading={save.isPending} onClick={() => save.mutate({ level: Number(level), reason }, { onSuccess: () => setReason("") })}>
              Change tier
            </Button>
          </div>
        </>
      )}
    </Paper>
  );
}

function WarehousePanel({ partner, disabled }: { partner: PartnerDetailView; disabled: boolean }) {
  const [warehouseId, setWarehouseId] = useState("");
  const warehouses = useQuery({ queryKey: ["admin", "warehouses"], queryFn: () => apiRequest<WarehouseView[]>("/v1/warehouse/warehouses") });
  const assign = useAdminPartnerMutation((id: string) => ({ path: `/v1/admin/partners/${partner.id}/warehouses`, body: { warehouseId: id } }), "Hub assigned");
  const free = (warehouses.data ?? []).filter((warehouse) => warehouse.countryCode === partner.countryCode && !warehouse.partnerId);
  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <Stamp>Hub</Stamp>
      <p className="text-small">{partner.warehouses.length > 0 ? partner.warehouses.map((warehouse) => `${warehouse.name} (${warehouse.code})`).join(", ") : "None assigned yet."}</p>
      {disabled ? null : (
        <>
          <FormAlert message={formError(assign.error)} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Add another hub" hint="Approval creates the first hub from the storage address. Only unassigned hubs in the partner's country are listed.">
                {({ id, describedBy }) => (
                  <Select id={id} aria-describedby={describedBy} value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)}>
                    <option value="">Choose a hub</option>
                    {free.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
            <Button variant="lime" disabled={!warehouseId} loading={assign.isPending} onClick={() => assign.mutate(warehouseId, { onSuccess: () => setWarehouseId("") })}>
              Assign
            </Button>
          </div>
        </>
      )}
    </Paper>
  );
}

function RequirementsPanel({ partner, disabled }: { partner: PartnerDetailView; disabled: boolean }) {
  const [deposit, setDeposit] = useState(toMajorText(partner.requiredDepositMinor, partner.currency));
  const [insurance, setInsurance] = useState(toMajorText(partner.requiredInsuranceMinor, partner.currency));
  const save = useAdminPartnerMutation((input: { requiredDepositMinor: number; requiredInsuranceMinor: number }) => ({
    path: `/v1/admin/partners/${partner.id}/requirements`,
    method: "PUT",
    body: input,
  }));

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    save.mutate({ requiredDepositMinor: toMinor(deposit, partner.currency) ?? -1, requiredInsuranceMinor: toMinor(insurance, partner.currency) ?? -1 });
  }

  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <Stamp>Optional safeguards</Stamp>
      <p className="text-meta text-ink-faint">Leave at zero unless this partner should hold a deposit or their own insurance before approval.</p>
      <form noValidate onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormAlert message={formError(save.error)} />
        </div>
        <MoneyField label="Deposit to hold" currency={partner.currency} value={deposit} onChange={setDeposit} error={fieldError(save.error, "requiredDepositMinor")} />
        <MoneyField label="Insurance cover" currency={partner.currency} value={insurance} onChange={setInsurance} error={fieldError(save.error, "requiredInsuranceMinor")} />
        {disabled ? (
          <p className="text-meta text-ink-faint sm:col-span-2">Requirements are fixed while the partner is operating.</p>
        ) : (
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" variant="lime" loading={save.isPending}>
              Save requirements
            </Button>
          </div>
        )}
      </form>
    </Paper>
  );
}

function LeadInvitePanel({ partner, disabled }: { partner: PartnerDetailView; disabled: boolean }) {
  const [email, setEmail] = useState("");
  const invite = useAdminPartnerMutation((address: string) => ({ path: `/v1/admin/partners/${partner.id}/lead-invitations`, body: { email: address } }));
  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <Stamp>Team</Stamp>
      <ul className="text-small">
        {partner.team.map((member) => (
          <li key={member.userId}>
            {member.email} · {TEAM_ROLE_LABELS[member.role]}
            {member.status === "ACTIVE" ? "" : " · suspended"}
          </li>
        ))}
        {partner.pendingInvitations.map((invitation) => (
          <li key={invitation.id} className="text-ink-faint">
            {invitation.email} · invited
          </li>
        ))}
        {partner.team.length + partner.pendingInvitations.length === 0 ? <li className="text-ink-faint">Nobody yet.</li> : null}
      </ul>
      {disabled ? null : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Add another partner login" hint="For a co-host who shares the partnership." error={fieldError(invite.error, "email")}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  type="email"
                  autoComplete="off"
                  aria-invalid={invalid}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                  }}
                />
              )}
            </Field>
          </div>
          <Button
            variant="ghost"
            loading={invite.isPending}
            onClick={() =>
              invite.mutate(email.trim(), {
                onSuccess: () => {
                  toast.success("Invitation sent");
                  setEmail("");
                },
              })
            }
          >
            Invite
          </Button>
        </div>
      )}
      <FormAlert message={formError(invite.error)} />
    </Paper>
  );
}
