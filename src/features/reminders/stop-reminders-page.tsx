"use client";

import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api/client";

export function StopRemindersPage() {
  const params = useSearchParams();
  const email = params.get("e") ?? "";
  const token = params.get("t") ?? "";
  const stop = useMutation({ mutationFn: () => apiRequest("/v1/public/reminders/stop", { method: "POST", body: { e: email, t: token }, authenticated: false }) });
  const { mutate } = stop;

  useEffect(() => {
    if (email && token) {
      mutate();
    }
  }, [email, token, mutate]);

  return (
    <main id="main" className="mx-auto flex max-w-[640px] flex-col gap-6 px-4 py-14 sm:px-8">
      {stop.isSuccess ? (
        <Outcome title="Reminders stopped" body="We won't send you any more reminder emails. You'll still get emails about your account, orders and payments." />
      ) : stop.isError || !email || !token ? (
        <Outcome title="We couldn't use that link" body="Open the link from the reminder email again. If it still doesn't work, reply to the email and we'll stop them for you." />
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
      <ButtonLink href="/">Back to Posygo</ButtonLink>
    </section>
  );
}
