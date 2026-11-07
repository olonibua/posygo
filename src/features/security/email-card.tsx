"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangeEmailInput, changeEmailSchema, type AccountView } from "@/shared";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Field, FormAlert, Input, PasswordInput } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { apiRequest } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/forms";
import { errorMessage } from "@/features/receiving/api-errors";

import { useAccount, useAccountCache, useCancelEmailChange } from "./use-account";

export function EmailCard() {
  const account = useAccount();
  const cancel = useCancelEmailChange();
  const [editing, setEditing] = useState(false);
  const current = account.data;

  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stamp>Email</Stamp>
        {current?.pendingEmail ? <StatusPill tone="yellow">Waiting for confirmation</StatusPill> : null}
      </div>
      {current ? <p className="text-small font-medium">{current.email}</p> : null}
      {current?.pendingEmail ? (
        <>
          <p className="text-small text-ink-soft">We sent a link to {current.pendingEmail}. Open it within an hour to switch. You&apos;ll sign in again afterwards.</p>
          <FormAlert message={errorMessage(cancel.error)} />
          <div className="flex justify-end">
            <Button variant="ghost" loading={cancel.isPending} onClick={() => cancel.mutate()}>
              Keep my current email
            </Button>
          </div>
        </>
      ) : editing ? (
        <EmailForm onDone={() => setEditing(false)} />
      ) : (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => setEditing(true)} disabled={!current}>
            Change email
          </Button>
        </div>
      )}
    </Paper>
  );
}

function EmailForm({ onDone }: { onDone: () => void }) {
  const remember = useAccountCache();
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<ChangeEmailInput>({ resolver: zodResolver(changeEmailSchema) });

  async function onSubmit(values: ChangeEmailInput) {
    setFormError(null);
    try {
      remember(await apiRequest<AccountView>("/v1/account/email", { method: "POST", body: values }));
      onDone();
    } catch (error) {
      setFormError(applyServerErrors(error, setError, ["email", "currentPassword"]));
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex max-w-[420px] flex-col gap-4">
      <FormAlert message={formError} />
      <Field label="New email" error={formState.errors.email?.message}>
        {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" aria-describedby={describedBy} aria-invalid={invalid} {...register("email")} />}
      </Field>
      <Field label="Current password" error={formState.errors.currentPassword?.message}>
        {({ id, describedBy, invalid }) => <PasswordInput id={id} autoComplete="current-password" aria-describedby={describedBy} aria-invalid={invalid} {...register("currentPassword")} />}
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="yellow" loading={formState.isSubmitting}>
          Send confirmation link
        </Button>
      </div>
    </form>
  );
}
