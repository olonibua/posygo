"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { PageSkeleton } from "@/components/ui/skeleton";
import { NotebookNote, Paper, Stamp } from "@/components/ui/surfaces";
import { errorMessage, fieldError, formError } from "@/features/receiving/api-errors";

import { useSignInLink, useStartBuyerSession } from "./use-buyer";

export function BuyerSignInForm() {
  const [email, setEmail] = useState("");
  const link = useSignInLink();

  function submit(event: FormEvent) {
    event.preventDefault();
    link.mutate(email.trim());
  }

  if (link.isSuccess) {
    return (
      <NotebookNote tone="lime" tilt="none" className="motion-rise max-w-[520px]">
        <p className="font-medium">Check your inbox</p>
        <p className="mt-1 text-small">If {email.trim()} has ordered from a store here, a sign-in link is on its way. It works once and lasts 15 minutes.</p>
      </NotebookNote>
    );
  }
  return (
    <Paper className="motion-rise max-w-[520px] px-6 py-6">
      <Stamp>Your orders</Stamp>
      <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <p className="text-small text-ink-soft">No password needed. Enter the email you used at checkout and we&apos;ll send you a link.</p>
        <FormAlert message={formError(link.error)} />
        <Field label="Email" error={fieldError(link.error, "email")}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="email" autoComplete="email" maxLength={254} aria-describedby={describedBy} aria-invalid={invalid} value={email} onChange={(event) => setEmail(event.target.value)} />
          )}
        </Field>
        <Button type="submit" variant="yellow" loading={link.isPending} disabled={email.trim().length < 3}>
          Email me a sign-in link
        </Button>
      </form>
    </Paper>
  );
}

export function BuyerLinkLanding() {
  const router = useRouter();
  const start = useStartBuyerSession();
  const [missing, setMissing] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    window.history.replaceState(null, "", window.location.pathname);
    if (!token) {
      setMissing(true);
      return;
    }
    start.mutate(token, { onSuccess: () => router.replace("/account") });
  }, [start, router]);

  if (missing || start.isError) {
    return (
      <div className="flex max-w-[520px] flex-col gap-4">
        <FormAlert message={start.isError ? errorMessage(start.error) : "This sign-in link isn't complete. Ask for a new one."} />
        <ButtonLink href="/account" variant="ghost">
          Get a new link
        </ButtonLink>
      </div>
    );
  }
  return <PageSkeleton label="Signing you in" />;
}
