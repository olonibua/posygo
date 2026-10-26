"use client";

import type { ShoppingRequestView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { errorMessage, fieldError, formError } from "@/features/receiving/api-errors";

import { usePurchaseShopping, useShoppingPhoto, useStaffCancelShopping } from "./use-shopping";

export function PurchaseForm({ request }: { request: ShoppingRequestView }) {
  const open = request.lines.filter((line) => line.status === "QUOTED");
  const [choices, setChoices] = useState<Record<string, { bought: boolean | null; ref: string }>>({});
  const purchase = usePurchaseShopping(request.id);
  const decided = open.filter((line) => choices[line.id]?.bought !== undefined && choices[line.id]?.bought !== null);
  if (open.length === 0) {
    return null;
  }
  const set = (lineId: string, patch: Partial<{ bought: boolean | null; ref: string }>) => setChoices({ ...choices, [lineId]: { bought: null, ref: "", ...choices[lineId], ...patch } });
  return (
    <div className="flex flex-col gap-4 border-t border-line pt-4">
      <p className="text-small font-medium">Buy each item and record the shop&apos;s order number. Anything sold out is refunded to the buyer straight away, with its share of our fee.</p>
      <FormAlert message={formError(purchase.error)} />
      <ul className="flex flex-col gap-3">
        {open.map((line) => {
          const choice = choices[line.id];
          return (
            <li key={line.id} className="flex flex-col gap-3 rounded-[12px] border border-line p-4">
              <span className="text-small font-medium">
                {line.quantity} × {line.description}
              </span>
              <div className="flex flex-wrap gap-2" role="group" aria-label={`${line.description}: outcome`}>
                <Button variant={choice?.bought === true ? "lime" : "ghost"} aria-pressed={choice?.bought === true} onClick={() => set(line.id, { bought: true })}>
                  Bought
                </Button>
                <Button variant={choice?.bought === false ? "yellow" : "ghost"} aria-pressed={choice?.bought === false} onClick={() => set(line.id, { bought: false })}>
                  Sold out
                </Button>
              </div>
              {choice?.bought ? (
                <Field label="Shop's order number (optional)">{({ id }) => <Input id={id} maxLength={80} value={choice.ref} onChange={(event) => set(line.id, { ref: event.target.value })} />}</Field>
              ) : null}
            </li>
          );
        })}
      </ul>
      <div className="flex justify-end">
        <Button
          variant="yellow"
          loading={purchase.isPending}
          disabled={decided.length === 0}
          onClick={() =>
            purchase.mutate(
              { lines: decided.map((line) => ({ lineId: line.id, bought: choices[line.id]!.bought!, retailerOrderRef: choices[line.id]!.ref.trim() || undefined })) },
              { onSuccess: () => setChoices({}) },
            )
          }
        >
          Record {decided.length} {decided.length === 1 ? "item" : "items"}
        </Button>
      </div>
    </div>
  );
}

export function StaffCancel({ request }: { request: ShoppingRequestView }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const cancel = useStaffCancelShopping(request.id);
  const paid = request.status === "PAID" || request.status === "BUYING";
  if (!open) {
    return (
      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => setOpen(true)}>
          Cancel request
        </Button>
      </div>
    );
  }
  return (
    <div className="motion-rise flex flex-col gap-3 border-t border-line pt-4">
      <Field label="Reason the buyer will see" hint={paid ? "Everything not yet refunded goes back to their card." : undefined} error={fieldError(cancel.error, "reason")}>
        {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} maxLength={300} value={reason} onChange={(event) => setReason(event.target.value)} />}
      </Field>
      <FormAlert message={formError(cancel.error)} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Keep it
        </Button>
        <Button variant="yellow" loading={cancel.isPending} disabled={reason.trim().length < 5} onClick={() => cancel.mutate(reason.trim())}>
          {paid ? "Cancel and refund" : "Cancel request"}
        </Button>
      </div>
    </div>
  );
}

export function ArrivalPhotos({ request }: { request: ShoppingRequestView }) {
  const photo = useShoppingPhoto(request.id);
  if (request.arrivalPhotoFileIds.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {request.arrivalPhotoFileIds.map((fileId, index) => (
          <Button
            key={fileId}
            variant="ghost"
            loading={photo.isPending && photo.variables === fileId}
            onClick={() => photo.mutate(fileId, { onSuccess: (result) => window.open(result.url, "_blank", "noopener,noreferrer") })}
          >
            Arrival photo {index + 1}
          </Button>
        ))}
      </div>
      <FormAlert message={errorMessage(photo.error)} />
    </div>
  );
}
