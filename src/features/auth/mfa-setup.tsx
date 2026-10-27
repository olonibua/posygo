"use client";

import { type MfaEnrolmentComplete, type MfaEnrolmentStart, totpCodeSchema, verificationCodeSchema } from "@/shared";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CodeInput, Field, FormAlert } from "@/components/ui/form-controls";
import { NotebookNote, Paper, Stamp } from "@/components/ui/surfaces";
import { ApiError, apiRequest } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useSkipMfaSetup, useTestShortcuts } from "@/lib/auth/test-shortcuts";
import { homeFor } from "@/lib/auth/use-session-gate";

import { ResendCode } from "./resend-code";

export function MfaSetup() {
  const router = useRouter();
  const { signIn, state } = useAuth();
  const [code, setCode] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<MfaEnrolmentComplete | null>(null);

  const shortcutsOn = useTestShortcuts();
  const skip = useSkipMfaSetup();
  const start = useMutation({ mutationFn: () => apiRequest<MfaEnrolmentStart>("/v1/auth/mfa/enrolment", { method: "POST" }) });
  const confirm = useMutation({ mutationFn: (body: { code: string; emailCode?: string }) => apiRequest<MfaEnrolmentComplete>("/v1/auth/mfa/enrolment/confirm", { method: "POST", body }) });

  const { mutate: begin } = start;
  useEffect(() => {
    if (state.status === "anonymous") {
      router.replace("/login?next=/mfa/setup");
    } else if (state.status === "authenticated" && !state.user.mfaEnrolled) {
      begin();
    }
  }, [state.status, state.user?.mfaEnrolled, begin, router]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = totpCodeSchema.safeParse(code);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter the 6-digit code.");
      return;
    }
    const needsEmailCode = start.data?.emailCodeRequired ?? false;
    const parsedEmailCode = verificationCodeSchema.safeParse(emailCode);
    if (needsEmailCode && !parsedEmailCode.success) {
      setError("Enter the 8-digit code we emailed you.");
      return;
    }
    setError(null);
    confirm.mutate(
      { code: parsed.data, emailCode: needsEmailCode && parsedEmailCode.success ? parsedEmailCode.data : undefined },
      { onSuccess: setCompleted, onError: (caught) => setError(caught instanceof ApiError ? caught.message : "We couldn't reach the server.") },
    );
  }

  function skipSetup() {
    setError(null);
    skip.mutate(undefined, {
      onSuccess: (result) => {
        signIn(result);
        router.replace(homeFor(result.user));
      },
      onError: (caught) => setError(caught instanceof ApiError ? caught.message : "We couldn't reach the server."),
    });
  }

  function finish() {
    if (!completed) {
      return;
    }
    signIn({ status: "AUTHENTICATED", accessToken: completed.accessToken, user: completed.user });
    router.replace(homeFor(completed.user));
  }

  if (completed) {
    return (
      <div className="flex flex-col gap-6">
        <NotebookNote tone="yellow" tilt="none">
          <Stamp className="text-cocoa">Save these somewhere safe</Stamp>
          <p className="mt-2 text-small">Each recovery code signs you in once if you lose your phone. We won’t show them again.</p>
        </NotebookNote>
        <Paper className="grid grid-cols-2 gap-2 p-5 font-mono text-[15px] sm:grid-cols-2">
          {completed.recoveryCodes.map((recoveryCode) => (
            <span key={recoveryCode}>{recoveryCode}</span>
          ))}
        </Paper>
        <div className="flex justify-end border-t border-line pt-6">
          <Button variant="yellow" size="lg" onClick={finish}>
            I’ve saved them, continue →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <FormAlert message={error ?? (start.isError ? "We couldn't start set-up. Refresh to try again." : null)} />
      <Paper className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:items-start">
        {start.data ? (
          <img src={start.data.qrCodeDataUrl} alt="QR code for your authenticator app" className="h-[180px] w-[180px] rounded-card bg-white p-2" />
        ) : (
          <div className="h-[180px] w-[180px] animate-pulse rounded-card bg-paper-sunk" />
        )}
        <div className="min-w-0 text-small text-ink-soft">
          <p className="text-body text-ink">Scan this with an authenticator app such as 1Password, Google Authenticator or Authy.</p>
          <p className="mt-3">Can’t scan? Enter this key instead:</p>
          <code className="mt-1.5 block break-all rounded-chip bg-paper-sunk px-3 py-2 font-mono text-[13px] text-ink">{start.data?.secret ?? "…"}</code>
        </div>
      </Paper>
      {start.data?.emailCodeRequired ? (
        <div className="flex flex-col">
          <Field label="8-digit code from your email">
            {({ id }) => <CodeInput id={id} length={8} aria-describedby="email-code-note" value={emailCode} onChange={(event) => setEmailCode(event.target.value)} />}
          </Field>
          <p id="email-code-note" className="mt-1.5 text-meta text-ink-faint">
            We emailed you a code to prove this set-up is really you. <ResendCode send={() => apiRequest("/v1/auth/mfa/enrolment/resend-code", { method: "POST" })} />
          </p>
        </div>
      ) : null}
      <Field label="6-digit code from the app">{({ id }) => <CodeInput id={id} length={6} value={code} onChange={(event) => setCode(event.target.value)} />}</Field>
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-6">
        {shortcutsOn ? (
          <Button variant="ghost" loading={skip.isPending} onClick={skipSetup}>
            Skip for testing
          </Button>
        ) : null}
        <Button type="submit" variant="yellow" size="lg" loading={confirm.isPending} disabled={!start.data}>
          Turn on two-factor →
        </Button>
      </div>
    </form>
  );
}
