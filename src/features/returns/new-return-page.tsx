"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { NotebookNote, Paper, Stamp } from "@/components/ui/surfaces";
import { errorMessage, fieldError, formError } from "@/features/receiving/api-errors";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate, formatMoney, localeFor } from "@/lib/format";

import { useOpenReturn, useReturnable } from "./use-returns";

export function NewReturnPage() {
  const user = useCurrentUser();
  const locale = localeFor(user.countryCode);
  const router = useRouter();
  const orderId = useSearchParams().get("order") ?? "";
  const returnable = useReturnable(orderId);
  const open = useOpenReturn();
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");
  const [tracking, setTracking] = useState({ carrier: "", trackingNumber: "" });

  const data = returnable.data;
  if (!data) {
    return returnable.isError ? (
      <EmptyState
        title="This order can't be returned"
        body={errorMessage(returnable.error) ?? "Open the order you want to return and choose Start a return."}
        action={<ButtonLink href="/orders">Back to orders</ButtonLink>}
      />
    ) : (
      <PageSkeleton />
    );
  }
  const lines = data.lines.map((line) => ({ lineId: line.lineId, quantity: Number(quantities[line.lineId] ?? 0) || 0 })).filter((line) => line.quantity > 0);
  const nothingLeft = data.lines.every((line) => line.returnableQuantity === 0);

  function submit(event: FormEvent) {
    event.preventDefault();
    open.mutate(
      { orderId: data!.orderId, reason: reason.trim(), lines, carrier: tracking.carrier.trim() || undefined, trackingNumber: tracking.trackingNumber.trim() || undefined },
      { onSuccess: (created) => router.push(`/returns?open=${created.id}`) },
    );
  }

  return (
    <form noValidate onSubmit={submit} className="flex max-w-[860px] flex-col gap-7">
      <PageHeader
        stamp={`Order ${data.orderReference}`}
        title="Start a return"
        lead={`Your customer sends the items back to the warehouse that shipped them. We count and photograph what arrives, then you tell us whether to put it back on sale, dispose of it or donate it.`}
      />
      <NotebookNote tone="sky" tilt="none">
        <p className="text-small">
          The handling fee is {formatMoney(data.feeMinor, data.currency, locale)}, taken from your wallet now and given back if you cancel or nothing arrives within 45 days. You can open returns on
          this order until {formatDate(data.returnableUntil, locale)}.
        </p>
      </NotebookNote>
      <FormAlert message={formError(open.error)} />
      <Paper className="motion-rise flex flex-col gap-4 px-6 py-6">
        <Stamp>What&apos;s coming back</Stamp>
        {nothingLeft ? <p className="text-small text-ink-soft">Everything on this order already has a return.</p> : null}
        <ul className="flex flex-col divide-y divide-line">
          {data.lines.map((line, index) => (
            <li key={line.lineId} className="grid items-end gap-3 py-3 sm:grid-cols-[1fr_140px]">
              <span>
                <span className="block font-medium">{line.productName}</span>
                <span className="text-meta font-normal text-ink-faint">
                  {line.productCode} · {line.shippedQuantity} sent · {line.returnableQuantity} can still come back
                </span>
              </span>
              <Field
                label={`${line.productName}: how many`}
                error={fieldError(open.error, `lines.${lines.findIndex((entry) => entry.lineId === line.lineId)}.quantity`) ?? (index === 0 ? fieldError(open.error, "lines") : undefined)}
              >
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    inputMode="numeric"
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    disabled={line.returnableQuantity === 0}
                    value={quantities[line.lineId] ?? ""}
                    placeholder="0"
                    onChange={(event) => setQuantities({ ...quantities, [line.lineId]: event.target.value.replace(/\D/g, "").slice(0, 4) })}
                  />
                )}
              </Field>
            </li>
          ))}
        </ul>
        <Field label="Why is it coming back?" hint="The warehouse sees this when the parcel arrives." error={fieldError(open.error, "reason")}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[80px]" maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} />
          )}
        </Field>
      </Paper>
      <Paper className="motion-rise flex flex-col gap-4 px-6 py-6">
        <Stamp>Tracking (optional)</Stamp>
        <p className="text-small text-ink-soft">If your customer has already sent it, add the tracking so the warehouse knows to expect it. You can add this later too.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Carrier" error={fieldError(open.error, "carrier")}>
            {({ id }) => <Input id={id} maxLength={60} value={tracking.carrier} onChange={(event) => setTracking({ ...tracking, carrier: event.target.value })} />}
          </Field>
          <Field label="Tracking number" error={fieldError(open.error, "trackingNumber")}>
            {({ id }) => <Input id={id} maxLength={64} value={tracking.trackingNumber} onChange={(event) => setTracking({ ...tracking, trackingNumber: event.target.value })} />}
          </Field>
        </div>
      </Paper>
      <div className="flex justify-end gap-2">
        <ButtonLink href={`/orders/${data.orderId}`} variant="ghost">
          Back to the order
        </ButtonLink>
        <Button type="submit" variant="yellow" loading={open.isPending} disabled={lines.length === 0 || reason.trim().length < 5}>
          Open the return
        </Button>
      </div>
    </form>
  );
}
