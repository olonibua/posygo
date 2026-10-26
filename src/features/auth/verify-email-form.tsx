"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type AuthenticatedResult, type VerifyEmailInput, verifyEmailSchema } from "@/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { CodeInput, Field, FormAlert, Input, PasswordInput } from "@/components/ui/form-controls";
import { apiRequest } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useSkipEmailCheck, useTestShortcuts } from "@/lib/auth/test-shortcuts";
import { homeFor } from "@/lib/auth/use-session-gate";
import { applyServerErrors } from "@/lib/forms";

export function VerifyEmailForm({ email = "", password }: { email?: string; password?: string }) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const shortcutsOn = useTestShortcuts();
  const skipCheck = useSkipEmailCheck();
  const { register, handleSubmit, setError, getValues, formState } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email, code: "", password: password ?? "" },
  });

  async function onSubmit(values: VerifyEmailInput) {
    setFormError(null);
    try {
      const result = await apiRequest<AuthenticatedResult>("/v1/auth/verify-email", { method: "POST", body: values, authenticated: false });
      signIn(result);
      router.replace(homeFor(result.user));
    } catch (error) {
      setFormError(applyServerErrors(error, setError, ["email", "code", "password"]));
    }
  }

  function skip() {
    setFormError(null);
    skipCheck.mutate(
      { email: getValues("email"), password: getValues("password") },
      {
        onSuccess: (result) => {
          signIn(result);
          router.replace(homeFor(result.user));
        },
        onError: (error) => setFormError(applyServerErrors(error, setError, ["email", "password"])),
      },
    );
  }

  async function resend() {
    setFormError(null);
    try {
      await apiRequest("/v1/auth/resend-verification", { method: "POST", body: { email: getValues("email") }, authenticated: false });
      setNotice("If that address is waiting for verification, a new code is on its way.");
    } catch (error) {
      setFormError(applyServerErrors(error, setError, ["email"]));
    }
  }

  const { errors, isSubmitting } = formState;
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormAlert message={formError} />
      {notice ? <p className="rounded-card bg-lime/50 px-4 py-3 text-small text-cocoa">{notice}</p> : null}
      <Field label="Email" error={errors.email?.message}>
        {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" aria-describedby={describedBy} aria-invalid={invalid} {...register("email")} />}
      </Field>
      {password === undefined ? (
        <Field label="Password" hint="The password you chose when you signed up." error={errors.password?.message}>
          {({ id, describedBy, invalid }) => <PasswordInput id={id} autoComplete="current-password" aria-describedby={describedBy} aria-invalid={invalid} {...register("password")} />}
        </Field>
      ) : null}
      <Field label="Verification code" hint="Check your inbox for an 8-digit code. It lasts 15 minutes." error={errors.code?.message}>
        {({ id, describedBy, invalid }) => <CodeInput id={id} length={8} aria-describedby={describedBy} aria-invalid={invalid} {...register("code")} />}
      </Field>
      <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-4">
          <button type="button" onClick={() => void resend()} className="text-[13px] text-ink-soft underline">
            Send a new code
          </button>
          {shortcutsOn ? (
            <button type="button" onClick={skip} disabled={skipCheck.isPending} className="text-[13px] text-ink-soft underline">
              Skip for testing
            </button>
          ) : null}
        </div>
        <Button type="submit" variant="yellow" size="lg" loading={isSubmitting}>
          Confirm email →
        </Button>
      </div>
    </form>
  );
}
