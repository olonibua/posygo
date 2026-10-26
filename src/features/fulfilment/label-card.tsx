"use client";

import type { OrderDetailView } from "@/shared";
import { useState } from "react";

import { Barcode } from "@/components/ui/barcode";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { countryName } from "@/features/orders/order-display";
import { errorMessage, fieldError } from "@/features/receiving/api-errors";
import { PhotoCollector } from "@/features/receiving/photo-collector";

const SHIPPED = ["HANDED_OFF", "IN_TRANSIT", "DELIVERED", "EXCEPTION", "RETURNED"];

interface LabelCardProps {
  order: OrderDetailView;
  busy: boolean;
  photoRequired: boolean;
  photoError: unknown;
  handOffError?: unknown;
  onHandOff?: (photoFileIds: string[], sealNumber: string | undefined) => void;
  onAddPhotos: (fileIds: string[]) => void;
}

export function LabelCard({ order, busy, photoRequired, photoError, handOffError, onHandOff, onAddPhotos }: LabelCardProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [seal, setSeal] = useState("");
  const label = order.label;
  if (!label) {
    return null;
  }
  const missingPhoto = SHIPPED.includes(order.status) && order.dispatchPhotoCount === 0;
  return (
    <Paper className="px-6 py-6">
      <Stamp>Label</Stamp>
      <p className="mt-2 text-small">
        {label.carrier} {label.service} · <span className="font-mono">{label.trackingNumber}</span>
      </p>
      {label.labelUrl ? (
        <a href={label.labelUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-small font-medium text-ink underline">
          Open the label to print
        </a>
      ) : (
        <div className="mt-4 rounded-card border-[1.5px] border-dashed border-line-strong px-5 py-4">
          <p className="text-meta uppercase tracking-[1px] text-ink-faint">Practice label · not valid for posting</p>
          <p className="mt-2 font-medium">{order.recipient.name}</p>
          <p className="text-small text-ink-soft">
            {order.recipient.line1}, {order.recipient.city} {order.recipient.postalCode}, {countryName(order.recipient.countryCode)}
          </p>
          <div className="mt-3 text-ink">
            <Barcode value={label.trackingNumber} height={56} />
          </div>
          <p className="mt-1 text-center font-mono text-meta">{label.trackingNumber}</p>
        </div>
      )}
      {onHandOff || missingPhoto ? (
        <div className="mt-5 flex flex-col gap-3">
          <FormAlert message={errorMessage(photoError)} />
          <PhotoCollector
            label="Photo of the sealed parcel"
            hint={photoRequired ? "Show the label clearly. Needed before you're paid for this order." : "Show the label clearly."}
            max={6}
            onChange={setPhotos}
          />
          {onHandOff && order.sealRequired ? (
            <Field label="Tamper seal number" hint="High-value parcel. Close it with a numbered seal and enter the number." error={fieldError(handOffError, "sealNumber")}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} spellCheck={false} aria-describedby={describedBy} aria-invalid={invalid} value={seal} onChange={(event) => setSeal(event.target.value)} />
              )}
            </Field>
          ) : null}
          {onHandOff ? (
            <Button
              variant="yellow"
              className="w-full"
              loading={busy}
              disabled={(photoRequired && photos.length === 0) || (order.sealRequired && seal.trim().length < 3)}
              onClick={() => onHandOff(photos, seal.trim() || undefined)}
            >
              Handed to the carrier
            </Button>
          ) : (
            <Button variant="lime" className="w-full" loading={busy} disabled={photos.length === 0} onClick={() => onAddPhotos(photos)}>
              Add dispatch photo
            </Button>
          )}
        </div>
      ) : order.dispatchPhotoCount > 0 ? (
        <p className="mt-4 text-small text-ink-soft">
          {order.dispatchPhotoCount === 1 ? "1 dispatch photo" : `${order.dispatchPhotoCount} dispatch photos`} on file.{order.sealNumber ? ` Seal ${order.sealNumber}.` : ""}
        </p>
      ) : null}
    </Paper>
  );
}
