"use client";

import { useEffect, useRef, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { ApiError, apiRequest } from "@/lib/api/client";

type Outcome = "CHECKING" | "CONFIRMED" | "FAILED";

export function ConfirmEmail() {
  const [outcome, setOutcome] = useState<Outcome>("CHECKING");
  const [message, setMessage] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    window.history.replaceState(null, "", window.location.pathname);
    if (!token) {
      setOutcome("FAILED");
      return;
    }
    apiRequest("/v1/account/email/confirm", { method: "POST", body: { token }, authenticated: false })
      .then(() => setOutcome("CONFIRMED"))
      .catch((error: unknown) => {
        setMessage(error instanceof ApiError ? error.message : null);
        setOutcome("FAILED");
      });
  }, []);

  if (outcome === "CHECKING") {
    return <p className="text-body text-ink-soft">Confirming your new email…</p>;
  }
  if (outcome === "FAILED") {
    return (
      <div className="flex flex-col items-start gap-5">
        <FormAlert message={message ?? "This link has expired or was already used. Ask for a new one from Sign-in & security."} />
        <ButtonLink href="/login" variant="ghost">
          Go to sign in
        </ButtonLink>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-5">
      <p className="rounded-card bg-lime/50 px-4 py-4 text-body text-cocoa">Your email is changed. Sign in with your new email.</p>
      <ButtonLink href="/login" variant="yellow" size="lg">
        Sign in →
      </ButtonLink>
    </div>
  );
}
