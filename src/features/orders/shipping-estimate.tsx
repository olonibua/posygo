"use client";

import { DELIVERY_PREFERENCE_LABELS, type DeliveryInput, type RateTag, type ShippingEstimateView } from "@/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";

import { StatusPill } from "@/components/ui/chip";
import { errorMessage } from "@/features/receiving/api-errors";
import { useCountryScope } from "@/features/seller-countries/selected-country";
import { apiRequest } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";

const SETTLE_MS = 700;
const SHOWN_RATES = 4;
const TAG_TONES: Record<RateTag, "lime" | "sky"> = { CHEAPEST: "lime", FASTEST: "sky" };

function readyToPrice(delivery: DeliveryInput): boolean {
  const { recipient, lines } = delivery;
  return Boolean(recipient.name && recipient.line1 && recipient.city && recipient.postalCode) && lines.some((line) => line.quantity > 0);
}

function useSettled<T>(value: T): T {
  const [settled, setSettled] = useState(value);
  const key = JSON.stringify(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(JSON.parse(key) as T), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [key]);
  return settled;
}

function days(estimatedDays: number | null): string {
  return estimatedDays ? `About ${estimatedDays} ${estimatedDays === 1 ? "day" : "days"}` : "Delivery time not given";
}

export function ShippingEstimate({ delivery, locale }: { delivery: DeliveryInput; locale: string }) {
  const { path, ready, code } = useCountryScope();
  const body = useSettled({ recipient: delivery.recipient, lines: delivery.lines.filter((line) => line.quantity > 0), deliveryPreference: delivery.deliveryPreference });
  const enabled = ready && readyToPrice(body);
  const estimate = useQuery({
    queryKey: ["vendor", "orders", "shipping-estimate", code, body],
    queryFn: () => apiRequest<ShippingEstimateView>(path("/v1/vendor/orders/shipping-estimate"), { method: "POST", body, quiet: true }),
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });

  return (
    <section aria-label="Estimated delivery" className="flex flex-col gap-3 rounded-card bg-paper-sunk px-4 py-4">
      <p className="text-small font-medium">Estimated delivery</p>
      {!enabled ? <p className="text-small text-ink-soft">Add the address and products to see delivery prices.</p> : null}
      {enabled && estimate.isLoading ? <p className="text-small text-ink-soft">Getting prices from couriers…</p> : null}
      {enabled && estimate.isError ? <p className="text-small text-ink-soft">{errorMessage(estimate.error)}</p> : null}
      {enabled && estimate.data ? <EstimateRates estimate={estimate.data} locale={locale} preference={delivery.deliveryPreference ?? "CHEAPEST"} /> : null}
    </section>
  );
}

function EstimateRates({ estimate, locale, preference }: { estimate: ShippingEstimateView; locale: string; preference: keyof typeof DELIVERY_PREFERENCE_LABELS }) {
  if (estimate.rates.length === 0) {
    return <p className="text-small text-ink-soft">No courier offered a price for this address yet.</p>;
  }
  return (
    <>
      <ul className="flex flex-col divide-y divide-line">
        {estimate.rates.slice(0, SHOWN_RATES).map((rate) => (
          <li key={rate.id} className="flex items-center justify-between gap-4 py-2.5">
            <span>
              <span className="block text-small font-medium">
                {rate.carrier} {rate.service}
              </span>
              <span className="text-meta text-ink-soft">{days(rate.estimatedDays)}</span>
              {rate.preferred || rate.tags.length > 0 ? (
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  {rate.preferred ? <StatusPill tone="orange">Your choice</StatusPill> : null}
                  {rate.tags.map((tag) => (
                    <StatusPill key={tag} tone={TAG_TONES[tag]}>
                      {DELIVERY_PREFERENCE_LABELS[tag].label}
                    </StatusPill>
                  ))}
                </span>
              ) : null}
            </span>
            <span className="font-semibold tabular-nums">{formatMoney(rate.chargeMinor, estimate.currency, locale)}</span>
          </li>
        ))}
      </ul>
      <p className="text-meta text-ink-soft">
        {`Estimated for a ${estimate.boxLabel.toLowerCase()}, sent ${DELIVERY_PREFERENCE_LABELS[preference].label.toLowerCase()}. The final price is set when the hub weighs the packed parcel, and is taken from your wallet then.`}
      </p>
      {estimate.productsWithoutSize.length > 0 ? (
        <p className="text-meta">
          For a closer estimate, add the size of {estimate.productsWithoutSize.join(", ")} on{" "}
          <Link href="/products" className="font-medium">
            Products
          </Link>
          .
        </p>
      ) : null}
    </>
  );
}
