"use client";

import { useEffect, useRef, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { CheckMark } from "@/components/ui/check-mark";
import { FormAlert } from "@/components/ui/form-controls";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Paper } from "@/components/ui/surfaces";

import { useConfirmShopping } from "./use-shopping";

export function ConfirmShoppingPage() {
  const confirm = useConfirmShopping();
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
    confirm.mutate(token);
  }, [confirm]);

  if (missing || confirm.isError) {
    return (
      <div className="flex flex-col gap-4">
        <FormAlert message="This link has expired or has already been used. If your request isn't in your account, send it again." />
        <ButtonLink href="/shop-for-me" variant="ghost">
          Send a new request
        </ButtonLink>
      </div>
    );
  }
  if (!confirm.data) {
    return <PageSkeleton label="Confirming your request" />;
  }
  return (
    <Paper className="motion-rise flex flex-col items-start gap-4 px-6 py-8">
      <CheckMark />
      <h1 className="text-h2">Request {confirm.data.reference} confirmed</h1>
      <p className="text-ink-soft">
        We&apos;ll check each item and email you a price for everything, including our fee and delivery, usually within one working day. You pay nothing until you accept it.
      </p>
      <ButtonLink href="/account/sign-in">Sign in to follow it</ButtonLink>
    </Paper>
  );
}
