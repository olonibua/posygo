"use client";

import type { DeliverySpeed, PublicStoreView, QuoteInput } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { safeCheckoutUrl } from "@/features/finance/use-vendor-wallet";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { formatMoney, localeFor } from "@/lib/format";

import { type BasketLine, useBasket } from "../basket-store";
import { useCheckout, usePublicStore, useQuote } from "../use-storefront";
import { BasketLines } from "./basket-lines";
import { DeliveryChoice } from "./delivery-choice";
import { blankShipTo, ShipToFields, type ShipToDraft, toShipTo } from "./ship-to-fields";
import { ShopFooter, ShopHeader } from "./shop-parts";

function quoteInput(lines: BasketLine[], shipTo: ShipToDraft, discountCode: string): QuoteInput {
  const code = discountCode.trim().toUpperCase();
  return { items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })), shipTo: toShipTo(shipTo), ...(code ? { discountCode: code } : {}) };
}

function CheckoutForm({ store }: { store: PublicStoreView }) {
  const lines = useBasket(store.slug);
  const quote = useQuote(store.slug);
  const checkout = useCheckout(store.slug);
  const locale = localeFor(store.countryCode);
  const [shipTo, setShipTo] = useState<ShipToDraft>(() => blankShipTo(store.countryCode));
  const [buyer, setBuyer] = useState({ email: "", name: "" });
  const [discountCode, setDiscountCode] = useState("");
  const [speed, setSpeed] = useState<DeliverySpeed>("STANDARD");
  const [quotedFor, setQuotedFor] = useState<string | null>(null);

  const input = quoteInput(lines, shipTo, discountCode);
  const signature = JSON.stringify(input);
  const current = quote.data && quotedFor === signature ? quote.data : null;
  const chosen = current?.options.find((option) => option.speed === speed) ?? current?.options[0];
  const error = checkout.error ?? quote.error;
  const errorFor = (field: string) => fieldError(error, field);

  function price(event: FormEvent) {
    event.preventDefault();
    checkout.reset();
    quote.mutate(input, { onSuccess: () => setQuotedFor(signature) });
  }

  function pay() {
    if (!chosen) {
      return;
    }
    checkout.mutate(
      { ...input, buyerEmail: buyer.email, buyerName: buyer.name.trim() || shipTo.name.trim(), deliverySpeed: chosen.speed },
      {
        onSuccess: (started) => {
          const url = safeCheckoutUrl(started.redirectUrl);
          if (url) {
            window.location.assign(url);
          }
        },
      },
    );
  }

  if (lines.length === 0) {
    return <EmptyState title="Your basket is empty" body="Add something you like, then come back here to pay." action={<ButtonLink href={`/store/${store.slug}`}>Back to the store</ButtonLink>} />;
  }

  return (
    <form onSubmit={price} noValidate className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="flex flex-col gap-5">
        <Paper className="motion-rise flex flex-col gap-2 px-6 py-6">
          <Stamp>Your basket</Stamp>
          <BasketLines slug={store.slug} lines={lines} currency={store.currency} locale={locale} />
        </Paper>
        <Paper className="motion-rise flex flex-col gap-5 px-6 py-6">
          <Stamp>Where should it go?</Stamp>
          <ShipToFields draft={shipTo} destinations={store.destinations} errorFor={errorFor} onChange={setShipTo} />
        </Paper>
        <Paper className="motion-rise flex flex-col gap-5 px-6 py-6">
          <Stamp>Your details</Stamp>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Email" hint="We send your receipt and tracking here." error={errorFor("buyerEmail")}>
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
            <Field label="Name on the order (optional)" hint="Leave blank to use the delivery name." error={errorFor("buyerName")}>
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
      </div>
      <Paper className="motion-rise flex flex-col gap-5 px-6 py-6 lg:sticky lg:top-6">
        <Stamp>Total</Stamp>
        <Field label="Discount code (optional)" error={errorFor("discountCode") ?? current?.discountProblem ?? undefined}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              autoComplete="off"
              maxLength={40}
              className="uppercase"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={discountCode}
              onChange={(event) => setDiscountCode(event.target.value)}
            />
          )}
        </Field>
        <FormAlert message={formError(error)} />
        {current ? <DeliveryChoice quote={current} speed={chosen?.speed ?? speed} locale={locale} onChange={setSpeed} /> : null}
        {current && chosen ? (
          <Button variant="yellow" size="lg" className="w-full" loading={checkout.isPending} onClick={pay}>
            Pay {formatMoney(chosen.totalMinor, current.currency, locale)}
          </Button>
        ) : (
          <Button type="submit" variant="lime" size="lg" className="w-full" loading={quote.isPending}>
            {quote.data ? "Update delivery and total" : "See delivery and total"}
          </Button>
        )}
        <p className="text-meta font-normal text-ink-faint">
          You pay on a secure card page. {store.returnsAllowed ? `Changed your mind? You can ask for a return for ${store.returnWindowDays} days after it's sent.` : "This store doesn't take returns."}
        </p>
      </Paper>
    </form>
  );
}

export function CheckoutPage({ slug }: { slug: string }) {
  const store = usePublicStore(slug);
  if (!store.data) {
    return (
      <main id="main" className="mx-auto max-w-[760px] px-4 py-20">
        {store.isError ? <EmptyState title="This store isn't open" body="Check the address, or come back later." /> : <PageSkeleton label="Opening checkout" />}
      </main>
    );
  }
  return (
    <>
      <ShopHeader slug={slug} name={store.data.displayName} />
      <main id="main" className="mx-auto flex max-w-container flex-col gap-6 px-4 pb-16 pt-4 sm:px-8">
        <h1 className="motion-rise text-h1">Checkout</h1>
        <CheckoutForm store={store.data} />
      </main>
      <ShopFooter name={store.data.displayName} />
    </>
  );
}
