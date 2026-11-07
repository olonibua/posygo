"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/shared";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, PasswordInput } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { apiRequest } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/forms";

const passwordFormSchema = changePasswordSchema.extend({ confirm: z.string() }).refine((value) => value.password === value.confirm, { path: ["confirm"], message: "The passwords don't match" });
type PasswordForm = z.infer<typeof passwordFormSchema>;

export function PasswordCard() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <Stamp>Password</Stamp>
      <p className="text-small text-ink-soft">{saved ? "Your password is updated. Every other device was signed out." : "Changing it signs out every other device straight away."}</p>
      {editing ? (
        <PasswordForm
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            setSaved(true);
          }}
        />
      ) : (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => setEditing(true)}>
            Change password
          </Button>
        </div>
      )}
    </Paper>
  );
}

function PasswordForm({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<PasswordForm>({ resolver: zodResolver(passwordFormSchema) });

  async function onSubmit({ currentPassword, password }: PasswordForm) {
    setFormError(null);
    try {
      await apiRequest("/v1/account/password", { method: "POST", body: { currentPassword, password } });
      onSaved();
    } catch (error) {
      setFormError(applyServerErrors(error, setError, ["currentPassword", "password"]));
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex max-w-[420px] flex-col gap-4">
      <FormAlert message={formError} />
      <Field label="Current password" error={formState.errors.currentPassword?.message}>
        {({ id, describedBy, invalid }) => <PasswordInput id={id} autoComplete="current-password" aria-describedby={describedBy} aria-invalid={invalid} {...register("currentPassword")} />}
      </Field>
      <Field label="New password" hint="At least 12 characters." error={formState.errors.password?.message}>
        {({ id, describedBy, invalid }) => <PasswordInput id={id} autoComplete="new-password" aria-describedby={describedBy} aria-invalid={invalid} {...register("password")} />}
      </Field>
      <Field label="Confirm new password" error={formState.errors.confirm?.message}>
        {({ id, describedBy, invalid }) => <PasswordInput id={id} autoComplete="new-password" aria-describedby={describedBy} aria-invalid={invalid} {...register("confirm")} />}
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="yellow" loading={formState.isSubmitting}>
          Save new password
        </Button>
      </div>
    </form>
  );
}
