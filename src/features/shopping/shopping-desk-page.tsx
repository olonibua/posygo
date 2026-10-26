"use client";

import { hasPermission, SHOPPING_RULES, type ShoppingRequestView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRows } from "@/components/ui/skeleton";
import { errorMessage, fieldError, formError } from "@/features/receiving/api-errors";
import { PhotoCollector } from "@/features/receiving/photo-collector";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { localeFor } from "@/lib/format";

import { ShoppingCard } from "./shopping-card";
import { useShipShopping, useShoppingArrival, useShoppingDelivered, useStaffShopping } from "./use-shopping";

function ArrivalForm({ request }: { request: ShoppingRequestView }) {
  const bought = request.lines.filter((line) => line.status === "BOUGHT");
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const arrive = useShoppingArrival(request.id);
  const counted = bought.every((line) => (counts[line.id] ?? "") !== "");
  return (
    <div className="flex flex-col gap-4 border-t border-line pt-4">
      <p className="text-small font-medium">When every shop parcel for {request.reference} is here, count the items and photograph them together.</p>
      <FormAlert message={formError(arrive.error)} />
      <div className="grid gap-3 sm:grid-cols-2">
        {bought.map((line) => (
          <Field key={line.id} label={`${line.description}: how many arrived`} error={fieldError(arrive.error, `lines.${line.id}`)}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                value={counts[line.id] ?? ""}
                onChange={(event) => setCounts({ ...counts, [line.id]: event.target.value.replace(/\D/g, "").slice(0, 2) })}
              />
            )}
          </Field>
        ))}
      </div>
      <PhotoCollector
        label="Photo of the items"
        hint="Everything that arrived, out of the shop packaging."
        max={SHOPPING_RULES.maxPhotos}
        error={fieldError(arrive.error, "photoFileIds")}
        onChange={setPhotos}
      />
      <div className="flex justify-end">
        <Button
          variant="yellow"
          loading={arrive.isPending}
          disabled={!counted || photos.length === 0}
          onClick={() => arrive.mutate({ lines: bought.map((line) => ({ lineId: line.id, receivedQuantity: Number(counts[line.id]) || 0 })), photoFileIds: photos })}
        >
          Book it in
        </Button>
      </div>
    </div>
  );
}

function ShipAction({ request }: { request: ShoppingRequestView }) {
  const ship = useShipShopping(request.id);
  const delivered = useShoppingDelivered(request.id);
  const sent = request.status === "SHIPPED";
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      <FormAlert message={errorMessage(ship.error ?? delivered.error)} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-small text-ink-soft">{sent ? "Mark it delivered once the carrier confirms." : "Pack it in one box. Buying the label tells the buyer it's on its way."}</span>
        {sent ? (
          <Button variant="lime" loading={delivered.isPending} onClick={() => delivered.mutate()}>
            Mark delivered
          </Button>
        ) : (
          <Button variant="yellow" loading={ship.isPending} onClick={() => ship.mutate()}>
            Buy label and send
          </Button>
        )}
      </div>
    </div>
  );
}

export function ShoppingDeskPage() {
  const user = useCurrentUser();
  const requests = useStaffShopping("warehouse");
  const canReceive = hasPermission(user.role, "inbound.receive");
  const canShip = hasPermission(user.role, "orders.fulfil");
  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Operations" title="Shopping parcels" lead="Items we've bought for buyers arrive here from shops. Book them in with photos, then send them on in one parcel." />
      {requests.isLoading ? (
        <LoadingRows columns={2} />
      ) : (requests.data ?? []).length === 0 ? (
        <EmptyState title="Nothing expected" body="Requests appear here once staff have bought the items." />
      ) : (
        <ul className="stagger flex flex-col gap-4">
          {requests.data!.map((request) => {
            const waiting = request.lines.some((line) => line.status === "QUOTED");
            return (
              <li key={request.id}>
                <ShoppingCard request={request} locale={localeFor(request.countryCode)}>
                  {request.status === "BUYING" && waiting ? <p className="text-small text-ink-soft">Still being bought. Some shop parcels may arrive before the rest.</p> : null}
                  {canReceive && !request.disputeOpen && request.status === "BUYING" && !waiting ? <ArrivalForm request={request} /> : null}
                  {canShip && !request.disputeOpen && (request.status === "ARRIVED" || request.status === "SHIPPED") ? <ShipAction request={request} /> : null}
                </ShoppingCard>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
