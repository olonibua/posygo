"use client";

import type { RefereeInput } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
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

export function IdentityStep({ check, editable, locale }: StepProps) {
  const start = usePortalMutation<void, { url: string }>(() => ({ path: "/v1/partner/identity/session" }));
  const refresh = usePortalMutation(() => ({ path: "/v1/partner/identity/refresh" }));
  const begin = () => start.mutate(undefined, { onSuccess: (result) => window.location.assign(result.url) });
  return (
    <StepCard check={check} locale={locale}>
      <FormAlert message={errorMessage(start.error) ?? errorMessage(refresh.error)} />
      {check.status === "SUBMITTED" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-small text-ink-soft">
          <span>We&apos;re waiting for the result. This usually takes a few minutes.</span>
          <Button variant="ghost" loading={refresh.isPending} onClick={() => refresh.mutate(undefined)}>
            Check again
          </Button>
        </div>
      ) : null}
      {editable && (check.status === "NOT_STARTED" || check.status === "REJECTED") ? (
        <div className="flex justify-end">
          <Button variant="lime" loading={start.isPending} onClick={begin}>
            {check.status === "REJECTED" ? "Try again" : "Start identity check"}
          </Button>
        </div>
      ) : null}
    </StepCard>
  );
}
