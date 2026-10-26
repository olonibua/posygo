"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type AuthenticatedResult, type LoginInput, type LoginResult, loginSchema } from "@/shared";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, PasswordInput } from "@/components/ui/form-controls";
import { apiRequest } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { homeFor, safeNextPath } from "@/lib/auth/use-session-gate";
import { applyServerErrors } from "@/lib/forms";

import { MfaChallengeForm } from "./mfa-challenge-form";

export function LoginForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const { signIn } = useAuth();
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  function finish(result: AuthenticatedResult) {
    signIn(result);
    const home = homeFor(result.user);
    router.replace(result.user.mfaState === "ENROLMENT_REQUIRED" ? home : (next ?? home));
  }

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    try {
      const result = await apiRequest<LoginResult>("/v1/auth/login", { method: "POST", body: values, authenticated: false });
      if (result.status === "MFA_REQUIRED") {
        setChallengeToken(result.challengeToken);
        return;
      }
      finish(result);
    } catch (error) {
      setFormError(applyServerErrors(error, setError, ["email", "password"]));
    }
  }

  if (challengeToken) {
    return (
      <MfaChallengeForm
        challengeToken={challengeToken}
        onAuthenticated={finish}
        onRestart={(message) => {
          setChallengeToken(null);
          setFormError(message);
        }}
      />
    );
  }

  const { errors, isSubmitting } = formState;
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormAlert message={formError} />
      <Field label="Email" error={errors.email?.message}>
        {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="username" aria-describedby={describedBy} aria-invalid={invalid} {...register("email")} />}
      </Field>
      <Field label="Password" error={errors.password?.message}>
        {({ id, describedBy, invalid }) => <PasswordInput id={id} autoComplete="current-password" aria-describedby={describedBy} aria-invalid={invalid} {...register("password")} />}
      </Field>
      <Link href="/forgot-password" className="-mt-2 self-start text-[13px] text-ink-soft">
        Forgotten your password?
      </Link>
      <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
        <span className="text-[13px] text-ink-faint">
          New here? <Link href="/signup">Create an account</Link>
        </span>
        <Button type="submit" variant="yellow" size="lg" loading={isSubmitting}>
          Sign in →
        </Button>
      </div>
    </form>
  );
}
