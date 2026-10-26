"use client";

import type { DeliverySpeed, ShoppingRequestView } from "@/shared";
import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { LoadingRows } from "@/components/ui/skeleton";
import { safeCheckoutUrl } from "@/features/finance/use-vendor-wallet";
import { errorMessage, formError } from "@/features/receiving/api-errors";
import { cn } from "@/lib/cn";
import { formatDate, formatMoney, localeFor } from "@/lib/format";

import { ShoppingCard } from "./shopping-card";
import { useBuyerShopping, useCancelShopping, useShoppingCheckout } from "./use-shopping";

function PayQuote({ request, locale }: { request: ShoppingRequestView; locale: string }) {
  const [speed, setSpeed] = useState<DeliverySpeed>(request.deliveryOptions[0]?.speed ?? "STANDARD");
  const checkout = useShoppingCheckout(request.id);
  const cancel = useCancelShopping(request.id);
  const chosen = request.deliveryOptions.find((option) => option.speed === speed) ?? request.deliveryOptions[0];
  if (!chosen) {
    return null;
  }
  const total = request.goodsMinor + request.commissionMinor + chosen.priceMinor;
  const pay = () =>
    checkout.mutate(
      { deliverySpeed: chosen.speed },
      {
        onSuccess: (started) => {
          const url = safeCheckoutUrl(started.redirectUrl);
          if (url) {
            window.location.assign(url);
          }
        },
      },
    );
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-small font-medium">Delivery</legend>
        {request.deliveryOptions.map((option) => (
          <label
            key={option.speed}
            className={cn(
              "motion-press flex cursor-pointer items-center justify-between gap-3 rounded-[12px] border px-4 py-3 text-small",
              option.speed === chosen.speed ? "border-ink bg-paper" : "border-line",
            )}
          >
            <span className="flex items-center gap-3">
              <input type="radio" name={`speed-${request.id}`} value={option.speed} checked={option.speed === chosen.speed} onChange={() => setSpeed(option.speed)} />
              <span>
                <span className="block font-medium">{option.label}</span>
                <span className="text-meta text-ink-faint">{option.window}</span>
              </span>
            </span>
            <span className="tabular-nums">{formatMoney(option.priceMinor, request.currency, locale)}</span>
          </label>
        ))}
      </fieldset>
      {request.quoteExpiresAt ? <p className="text-meta text-ink-faint">This price holds until {formatDate(request.quoteExpiresAt, locale)}.</p> : null}
      <FormAlert message={formError(checkout.error) ?? errorMessage(cancel.error)} />
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" loading={cancel.isPending} onClick={() => cancel.mutate()}>
          Cancel request
        </Button>
        <Button variant="yellow" size="lg" loading={checkout.isPending} onClick={pay}>
          Pay {formatMoney(total, request.currency, locale)}
        </Button>
      </div>
    </div>
  );
}

function CancelWaiting({ request }: { request: ShoppingRequestView }) {
  const cancel = useCancelShopping(request.id);
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      <FormAlert message={errorMessage(cancel.error)} />
      <div className="flex justify-end">
        <Button variant="ghost" loading={cancel.isPending} onClick={() => cancel.mutate()}>
          Cancel request
        </Button>
      </div>
    </div>
  );
}

export function BuyerShopping() {
  const requests = useBuyerShopping(true);
  if (requests.isLoading) {
    return <LoadingRows columns={2} />;
  }
  if (requests.isError) {
    return <FormAlert message={errorMessage(requests.error)} />;
  }
  if ((requests.data ?? []).length === 0) {
    return (
      <EmptyState
        title="No shopping requests"
        body="Send us links to things you want from any shop and we'll buy them and send them to you."
        action={<ButtonLink href="/shop-for-me">Ask us to shop for you</ButtonLink>}
      />
    );
  }
  return (
    <ul className="stagger flex flex-col gap-4">
      {requests.data!.map((request) => {
        const locale = localeFor(request.destinationCountryCode);
        return (
          <li key={request.id}>
            <ShoppingCard request={request} locale={locale} showHint>
              {request.status === "QUOTED" ? <PayQuote request={request} locale={locale} /> : null}
              {request.status === "REQUESTED" || request.status === "EXPIRED" ? <CancelWaiting request={request} /> : null}
            </ShoppingCard>
          </li>
        );
      })}
    </ul>
  );
}
