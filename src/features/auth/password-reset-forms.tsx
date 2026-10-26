"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { emailOnlySchema, passwordSchema } from "@/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FormAlert, Input, PasswordInput } from "@/components/ui/form-controls";
import { apiRequest } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/forms";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<{ email: string }>({ resolver: zodResolver(emailOnlySchema) });

  async function onSubmit(values: { email: string }) {
    setFormError(null);
    try {
      await apiRequest("/v1/auth/forgot-password", { method: "POST", body: values, authenticated: false });
      setSent(true);
    } catch (error) {
      setFormError(applyServerErrors(error, setError, ["email"]));
    }
  }

  if (sent) {
    return <p className="rounded-card bg-lime/50 px-4 py-4 text-body text-cocoa">If there’s an account for that email, a reset link is on its way. It works for 30 minutes.</p>;
  }
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormAlert message={formError} />
      <Field label="Email" error={formState.errors.email?.message}>
        {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" aria-describedby={describedBy} aria-invalid={invalid} {...register("email")} />}
      </Field>
      <div className="flex items-center justify-between gap-4 border-t border-line pt-6">
        <Link href="/login" className="text-[13px] text-ink-soft">
          Back to sign in
        </Link>
        <Button type="submit" variant="yellow" size="lg" loading={formState.isSubmitting}>
          Send reset link →
        </Button>
      </div>
    </form>
  );
}

const newPasswordSchema = z.object({ password: passwordSchema, confirm: z.string() }).refine((value) => value.password === value.confirm, { path: ["confirm"], message: "The passwords don't match" });

export function ResetPasswordForm() {
  const [token, setToken] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<z.infer<typeof newPasswordSchema>>({ resolver: zodResolver(newPasswordSchema) });

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    setToken(fragment.get("token"));
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  async function onSubmit(values: z.infer<typeof newPasswordSchema>) {
    setFormError(null);
    try {
      await apiRequest("/v1/auth/reset-password", { method: "POST", body: { token, password: values.password }, authenticated: false });
      setDone(true);
    } catch (error) {
      setFormError(applyServerErrors(error, setError, ["password"]) ?? "That link has expired or was already used. Request a new one.");
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-start gap-5">
        <p className="rounded-card bg-lime/50 px-4 py-4 text-body text-cocoa">Your password is updated and every other session was signed out.</p>
        <ButtonLink href="/login" variant="yellow" size="lg">
          Sign in →
        </ButtonLink>
      </div>
    );
  }
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormAlert message={token === null ? null : formError} />
      <Field label="New password" hint="At least 12 characters." error={formState.errors.password?.message}>
        {({ id, describedBy, invalid }) => <PasswordInput id={id} autoComplete="new-password" aria-describedby={describedBy} aria-invalid={invalid} {...register("password")} />}
      </Field>
      <Field label="Confirm new password" error={formState.errors.confirm?.message}>
        {({ id, describedBy, invalid }) => <PasswordInput id={id} autoComplete="new-password" aria-describedby={describedBy} aria-invalid={invalid} {...register("confirm")} />}
      </Field>
      <div className="flex justify-end border-t border-line pt-6">
        <Button type="submit" variant="yellow" size="lg" loading={formState.isSubmitting} disabled={!token}>
          Save new password →
        </Button>
      </div>
    </form>
  );
}
