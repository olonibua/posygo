"use client";

import type { IdentitySessionView, PartnerCheckView, RefereeInput } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { IdentityHandoff } from "@/features/identity/identity-handoff";
import type { IdentityState } from "@/features/identity/identity-state";
import { errorMessage, fieldError, formError } from "@/features/receiving/api-errors";

import { usePortalMutation } from "../use-partners";
import { Replace, StepCard, type StepProps } from "./step-card";

export function RefereeStep({ check, editable, locale }: StepProps) {
  const details = check.details as Partial<Record<keyof RefereeInput, string>>;
  const [form, setForm] = useState<RefereeInput>({ name: details.name ?? "", contact: details.contact ?? "", relationship: details.relationship ?? "" });
  const [editing, setEditing] = useState(false);
  const save = usePortalMutation((input: RefereeInput) => ({ path: "/v1/partner/referee", method: "PUT", body: input }), "Referee saved");
  const set = (patch: Partial<RefereeInput>) => setForm((current) => ({ ...current, ...patch }));

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    save.mutate(form, { onSuccess: () => setEditing(false) });
  }

  const summary = <p className="text-small">{details.name ? `${details.name} · ${details.relationship ?? ""} · ${details.contact ?? ""}` : "No referee yet."}</p>;
  if (!editable || !editing) {
    return (
      <StepCard check={check} locale={locale} extra={summary}>
        {editable && check.status !== "ACCEPTED" ? <Replace onClick={() => setEditing(true)} /> : null}
      </StepCard>
    );
  }
  return (
    <StepCard check={check} locale={locale}>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
        <FormAlert message={formError(save.error)} />
        <Field label="Their name" error={fieldError(save.error, "name")}>
          {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={form.name} onChange={(event) => set({ name: event.target.value })} />}
        </Field>
        <Field label="Email or phone" error={fieldError(save.error, "contact")}>
          {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={form.contact} onChange={(event) => set({ contact: event.target.value })} />}
        </Field>
        <Field label="How they know you" error={fieldError(save.error, "relationship")}>
          {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={form.relationship} onChange={(event) => set({ relationship: event.target.value })} />}
        </Field>
        <div className="flex justify-end">
          <Button type="submit" variant="lime" loading={save.isPending}>
            Save referee
          </Button>
        </div>
      </form>
    </StepCard>
  );
}

const CHECK_IDENTITY_STATES: Record<PartnerCheckView["status"], IdentityState> = { NOT_STARTED: "NOT_STARTED", SUBMITTED: "WAITING", ACCEPTED: "VERIFIED", REJECTED: "DECLINED" };

function partnerIdentityState(check: PartnerCheckView): IdentityState {
  return check.status === "SUBMITTED" && (check.details as { inReview?: boolean }).inReview ? "IN_REVIEW" : CHECK_IDENTITY_STATES[check.status];
}

export function IdentityStep({ check, editable, locale }: StepProps) {
  const start = usePortalMutation<void, IdentitySessionView>(() => ({ path: "/v1/partner/identity/session" }));
  const refresh = usePortalMutation(() => ({ path: "/v1/partner/identity/refresh" }));
  return (
    <StepCard check={check} locale={locale}>
      <IdentityHandoff
        state={partnerIdentityState(check)}
        editable={editable}
        error={errorMessage(start.error) ?? errorMessage(refresh.error)}
        starting={start.isPending}
        checking={refresh.isPending}
        onStart={() => start.mutateAsync(undefined)}
        onCheck={() => refresh.mutate(undefined)}
      />
    </StepCard>
  );
}
