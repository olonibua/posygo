"use client";

import type { PublicCountry, ShoppingRequestInput } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { CheckMark } from "@/components/ui/check-mark";
import { Field, FormAlert, Input, Select, Textarea } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { blankShipTo, ShipToFields, type ShipToDraft, toShipTo } from "@/features/storefront/shop/ship-to-fields";

import { blankItem, type ItemDraft, ItemLinks } from "./item-links";
import { useSendShoppingRequest, useShoppingDestinations } from "./use-shopping";

function toInput(countryCode: string, buyer: { email: string; name: string }, shipTo: ShipToDraft, items: ItemDraft[], notes: string): ShoppingRequestInput {
  return {
    countryCode,
    buyerEmail: buyer.email.trim(),
    buyerName: buyer.name.trim() || shipTo.name.trim(),
    shipTo: toShipTo(shipTo),
    notes: notes.trim() || undefined,
    lines: items.map((item) => ({ url: item.url.trim(), description: item.description.trim(), quantity: Number(item.quantity) || 0 })),
  };
}

function Sent({ reference }: { reference: string }) {
  return (
    <Paper className="motion-rise flex flex-col items-start gap-4 px-6 py-8">
      <CheckMark />
      <h2 className="text-h2">Check your email to confirm {reference}</h2>
      <p className="text-ink-soft">
        We&apos;ve sent you a link. Open it within 48 hours and we&apos;ll start pricing your items. Nothing happens until you confirm, and you pay nothing until you accept our price.
      </p>
    </Paper>
  );
}

export function ShopForMePage({ countries }: { countries: PublicCountry[] }) {
  const [countryCode, setCountryCode] = useState(countries[0]?.code ?? "");
  const [items, setItems] = useState<ItemDraft[]>(() => [blankItem()]);
  const [buyer, setBuyer] = useState({ email: "", name: "" });
  const [shipTo, setShipTo] = useState<ShipToDraft>(() => blankShipTo(countries[0]?.code ?? ""));
  const [notes, setNotes] = useState("");
  const destinations = useShoppingDestinations(countryCode);
  const send = useSendShoppingRequest();
  const errorFor = (field: string) => fieldError(send.error, field);

  if (countries.length === 0) {
    return <EmptyState title="Not open yet" body="Personal shopping starts as soon as our first markets go live." />;
  }
  if (send.data) {
    return <Sent reference={send.data.reference} />;
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    send.mutate(toInput(countryCode, buyer, shipTo, items, notes));
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <PageHeader
        stamp="Personal shopping"
        title="We'll buy it for you"
        lead="Paste links to things you want from shops in one of our countries. We price everything up front, buy it once you've paid, and send it to you in one parcel."
      />
      <Paper className="motion-rise flex flex-col gap-5 px-6 py-6">
        <Stamp>What do you want?</Stamp>
        <Field label="Shops in" hint="We buy from shops in this country and send it on from our warehouse there." error={errorFor("countryCode")}>
          {({ id, describedBy, invalid }) => (
            <Select
              id={id}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={countryCode}
              onChange={(event) => {
                setCountryCode(event.target.value);
                setShipTo({ ...shipTo, countryCode: event.target.value, region: "" });
              }}
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <ItemLinks items={items} errorFor={errorFor} onChange={setItems} />
        <Field label="Anything else we should know? (optional)" error={errorFor("notes")}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[72px]" maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} />
          )}
        </Field>
      </Paper>
      <Paper className="motion-rise flex flex-col gap-5 px-6 py-6">
        <Stamp>Where should it go?</Stamp>
        <ShipToFields draft={shipTo} destinations={destinations.data ?? []} errorFor={errorFor} onChange={setShipTo} />
      </Paper>
      <Paper className="motion-rise flex flex-col gap-5 px-6 py-6">
        <Stamp>Your details</Stamp>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Email" hint="We send the price and updates here." error={errorFor("buyerEmail")}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="email"
                autoComplete="email"
                maxLength={254}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                value={buyer.email}
                onChange={(event) => setBuyer({ ...buyer, email: event.target.value })}
              />
            )}
          </Field>
          <Field label="Your name (optional)" hint="Leave blank to use the delivery name." error={errorFor("buyerName")}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                autoComplete="name"
                maxLength={120}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                value={buyer.name}
                onChange={(event) => setBuyer({ ...buyer, name: event.target.value })}
              />
            )}
          </Field>
        </div>
      </Paper>
      <FormAlert message={formError(send.error)} />
      <div className="flex justify-end">
        <Button type="submit" variant="yellow" size="lg" loading={send.isPending}>
          Ask for a price
        </Button>
      </div>
    </form>
  );
}
