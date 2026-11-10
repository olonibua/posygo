"use client";

import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api/client";

export function StopOutreachPage() {
  const params = useSearchParams();
  const contact = params.get("c") ?? "";
  const token = params.get("t") ?? "";
  const stop = useMutation({ mutationFn: () => apiRequest("/v1/public/outreach/stop", { method: "POST", body: { c: contact, t: token }, authenticated: false }) });
  const { mutate } = stop;

  useEffect(() => {
    if (contact && token) {
      mutate();
    }
  }, [contact, token, mutate]);

  return (
    <main id="main" className="mx-auto flex max-w-[640px] flex-col gap-6 px-4 py-14 sm:px-8">
      {stop.isSuccess ? (
        <Outcome title="You won't hear from us again" body="We've removed you from our partner emails. Sorry for the interruption." />
      ) : stop.isError || !contact || !token ? (
        <Outcome title="We couldn't use that link" body="Open the link from the email again. If it still doesn't work, reply to the email and we'll take you off the list." />
      ) : (
        <Skeleton className="h-[160px] w-full" />
      )}
    </main>
  );
}

function Outcome({ title, body }: { title: string; body: string }) {
  return (
    <section className="motion-rise flex flex-col items-start gap-3">
      <h1 className="text-h1">{title}</h1>
      <p className="text-body text-ink-soft">{body}</p>
      <ButtonLink href="/">Visit Posygo</ButtonLink>
    </section>
  );
}
