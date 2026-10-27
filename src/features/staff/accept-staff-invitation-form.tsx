"use client";

import { type AuthenticatedResult, passwordSchema, type StaffInvitationPreview } from "@/shared";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { AuthHeading } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, PasswordInput } from "@/components/ui/form-controls";
import { countryName } from "@/features/onboarding/display";
import { ApiError, apiRequest } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { homeFor } from "@/lib/auth/use-session-gate";

import { STAFF_ROLE_LABELS } from "./staff-display";

export function AcceptStaffInvitationForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [preview, setPreview] = useState<StaffInvitationPreview | null>(null);
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
    apiRequest<StaffInvitationPreview>("/v1/staff-invitations/preview", { method: "POST", body: { token: value }, authenticated: false })
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
      const result = await apiRequest<AuthenticatedResult>("/v1/staff-invitations/accept", { method: "POST", body: { token, password }, authenticated: false });
      signIn(result);
      router.replace(homeFor(result.user));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "We couldn't reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-5">
      <InvitationHeading preview={preview} />
      <FormAlert message={error} />
      <Field label="Password" hint="At least 12 characters.">
        {({ id, describedBy }) => (
          <PasswordInput id={id} autoComplete="new-password" aria-describedby={describedBy} value={password} onChange={(event) => setPassword(event.target.value)} disabled={!preview} />
        )}
      </Field>
      <div className="flex justify-end border-t border-line pt-6">
        <Button type="submit" variant="yellow" size="lg" loading={submitting} disabled={!preview}>
          Continue →
        </Button>
      </div>
    </form>
  );
}

function InvitationHeading({ preview }: { preview: StaffInvitationPreview | null }) {
  if (!preview) {
    return <AuthHeading title="Set up your account" />;
  }
  const you = <b className="font-medium text-ink">{preview.email}</b>;
  if (preview.purpose === "PARTNER_APPLICATION") {
    return <AuthHeading title="Set up your partner account" lead={<>Choose a password for {you}, then set up two-factor sign-in. After that you&apos;ll finish your partner checks.</>} />;
  }
  const where = preview.countryCode ? ` for ${countryName(preview.countryCode)}` : "";
  return (
    <AuthHeading
      title={preview.partnerName ? `Join ${preview.partnerName}` : "Join the platform team"}
      lead={
        <>
          You&apos;re joining as <b className="font-medium text-ink">{STAFF_ROLE_LABELS[preview.role]}</b>
          {where}, signing in as {you}. Choose a password, then set up two-factor sign-in.
        </>
      }
    />
  );
}
