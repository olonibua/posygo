"use client";

import type { PublicTrackingView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Field, Input } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { countryName, TRACKING_STATUS_DISPLAY } from "@/features/orders/order-display";
import { ApiError, apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";

const STEPS = ["Being prepared", "Label created", "On its way", "Delivered"];
const TRACKING_NUMBER = /^[A-Za-z0-9-]{6,64}$/;

export function TrackingSearch({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [problem, setProblem] = useState<string | null>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!TRACKING_NUMBER.test(trimmed)) {
      setProblem("Enter the tracking number from your shipping email.");
      return;
    }
    router.push(`/track/${encodeURIComponent(trimmed)}`);
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Field label="Tracking number" error={problem ?? undefined}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={value}
              maxLength={64}
              autoComplete="off"
              onChange={(event) => setValue(event.target.value)}
              className="font-mono"
            />
          )}
        </Field>
      </div>
      <Button type="submit" variant="yellow" size="lg" className={problem ? "sm:mb-[22px]" : undefined}>
        Track
      </Button>
    </form>
  );
}

export function TrackingResult({ trackingNumber }: { trackingNumber: string }) {
  const tracking = useQuery({
    queryKey: ["public", "track", trackingNumber],
    queryFn: () => apiRequest<PublicTrackingView>(`/v1/track/${encodeURIComponent(trackingNumber)}`, { authenticated: false }),
    retry: false,
    refetchInterval: 120_000,
  });
  if (tracking.isLoading) {
    return <p className="text-ink-soft">Looking it up…</p>;
  }
  if (!tracking.data) {
    const missing = tracking.error instanceof ApiError && tracking.error.status === 404;
    return (
      <Paper className="px-6 py-6">
        <p className="font-medium">{missing ? "We can't find that tracking number." : "Tracking isn't available right now."}</p>
        <p className="mt-1 text-small text-ink-soft">{missing ? "Check it against your shipping email. New labels can take a few minutes to appear." : "Try again in a minute."}</p>
      </Paper>
    );
  }
  const data = tracking.data;
  const status = TRACKING_STATUS_DISPLAY[data.status];
  return (
    <div className="flex flex-col gap-5">
      <Paper className="px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Stamp>
              Parcel to {data.destination.city}, {countryName(data.destination.countryCode)}
            </Stamp>
            <p className="mt-2 text-[28px] font-medium tracking-[-0.8px]">{status.label}</p>
          </div>
          <StatusPill tone={status.tone}>{data.carrier ?? "Carrier to be confirmed"}</StatusPill>
        </div>
        {status.step > 0 ? (
          <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="Progress">
            {STEPS.map((label, index) => (
              <li key={label} className="flex flex-col gap-2">
                <span aria-hidden className={cn("h-2 rounded-full", index < status.step ? "bg-lime" : "bg-paper-sunk")} />
                <span className={cn("text-meta", index < status.step ? "text-ink" : "text-ink-faint")}>{label}</span>
              </li>
            ))}
          </ol>
        ) : null}
        {data.trackingUrl ? (
          <a href={data.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex text-small font-medium text-ink underline">
            Open on the carrier&rsquo;s site
          </a>
        ) : null}
      </Paper>
      <Paper className="px-6 py-5">
        <Stamp>Updates</Stamp>
        {data.events.length === 0 ? (
          <p className="mt-3 text-small text-ink-soft">No carrier updates yet. They appear here once the carrier scans the parcel.</p>
        ) : (
          <ol className="mt-3">
            {data.events.map((event) => (
              <li key={`${event.occurredAt}-${event.description}`} className="flex flex-col gap-0.5 border-t border-line py-3 first:border-t-0 sm:flex-row sm:justify-between sm:gap-6">
                <span className="text-small">
                  {event.description}
                  {event.location ? <span className="text-ink-soft"> · {event.location}</span> : null}
                </span>
                <span className="shrink-0 text-meta text-ink-faint">{formatDateTime(event.occurredAt, "en-GB")}</span>
              </li>
            ))}
          </ol>
        )}
      </Paper>
    </div>
  );
}
