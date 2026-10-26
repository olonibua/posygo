"use client";

import { type AuthenticatedResult, recoveryCodeSchema, totpCodeSchema } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { CodeInput, Field, FormAlert, Input } from "@/components/ui/form-controls";
import { ApiError, apiRequest } from "@/lib/api/client";

interface Props {
  challengeToken: string;
  onAuthenticated: (result: AuthenticatedResult) => void;
  onRestart: (message: string) => void;
}

export function MfaChallengeForm({ challengeToken, onAuthenticated, onRestart }: Props) {
  const [useRecovery, setUseRecovery] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = (useRecovery ? recoveryCodeSchema : totpCodeSchema).safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the code and try again.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body = useRecovery ? { challengeToken, recoveryCode: parsed.data } : { challengeToken, code: parsed.data };
      onAuthenticated(await apiRequest<AuthenticatedResult>("/v1/auth/mfa/challenge", { method: "POST", body, authenticated: false }));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        onRestart(caught.message);
        return;
      }
      setError(caught instanceof ApiError ? caught.message : "We couldn't reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-5">
      <FormAlert message={error} />
      {useRecovery ? (
        <Field label="Recovery code" hint="One of the codes you saved when you set up two-factor. Each works once.">
          {({ id, describedBy }) => (
            <Input id={id} autoComplete="off" aria-describedby={describedBy} value={value} onChange={(event) => setValue(event.target.value)} className="font-mono uppercase tracking-[0.2em]" />
          )}
        </Field>
      ) : (
        <Field label="Authenticator code" hint="Open your authenticator app and enter the 6-digit code.">
          {({ id, describedBy }) => <CodeInput id={id} length={6} aria-describedby={describedBy} value={value} onChange={(event) => setValue(event.target.value)} />}
        </Field>
      )}
      <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
        <button
          type="button"
          className="text-[13px] text-ink-soft underline"
          onClick={() => {
            setUseRecovery((current) => !current);
            setValue("");
            setError(null);
          }}
        >
          {useRecovery ? "Use my authenticator app" : "Use a recovery code instead"}
        </button>
        <Button type="submit" variant="yellow" size="lg" loading={submitting}>
          Verify →
        </Button>
      </div>
    </form>
  );
}
