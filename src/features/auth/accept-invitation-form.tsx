"use client";

import { type AuthenticatedResult, type InvitationPreview, passwordSchema } from "@/shared";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, PasswordInput } from "@/components/ui/form-controls";
import { ApiError, apiRequest } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";

export function AcceptInvitationForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get("token");
    window.history.replaceState(null, "", window.location.pathname);
    setToken(value);
    if (!value) {
      setError("This invitation link is incomplete. Open it again from your email.");
      return;
    }
    apiRequest<InvitationPreview>("/v1/invitations/preview", { method: "POST", body: { token: value }, authenticated: false })
      .then(setPreview)
      .catch(() => setError("This invitation has expired or was already used. Ask for a new one."));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Choose a longer password.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await apiRequest<AuthenticatedResult>("/v1/invitations/accept", { method: "POST", body: { token, password }, authenticated: false });
      signIn(result);
      router.replace("/overview");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "We couldn't reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-5">
      <FormAlert message={error} />
      {preview ? (
        <p className="text-[17px] leading-[26px] text-ink-soft">
          <b className="font-medium text-ink">{preview.businessName}</b> invited <b className="font-medium text-ink">{preview.email}</b>. Choose a password to join.
        </p>
      ) : null}
      <Field label="Password" hint="At least 12 characters.">
        {({ id, describedBy }) => (
          <PasswordInput id={id} autoComplete="new-password" aria-describedby={describedBy} value={password} onChange={(event) => setPassword(event.target.value)} disabled={!preview} />
        )}
      </Field>
      <div className="flex justify-end border-t border-line pt-6">
        <Button type="submit" variant="yellow" size="lg" loading={submitting} disabled={!preview}>
          Join the team →
        </Button>
      </div>
    </form>
  );
}
